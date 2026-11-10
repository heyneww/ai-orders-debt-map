#!/usr/bin/env python3
"""minsky_watch.py — 明斯基时刻监控：把美国企业杠杆与实际股价的三年变化，对照 GHSS/德银"红区"双门槛。

框架：Greenwood–Hanson–Shleifer–Sørensen (2022, J. Finance) "Predictable Financial Crises" 的 business R-zone，
德意志银行 2025-11 报告沿用：非金融企业信贷/GDP 三年升幅 > 9 pp 且 实际股价三年涨幅 > 26% → 未来三年危机概率约 45%。

数据（全部 FRED 公开序列，无需 key；FRED 对部分浏览器 UA 会超时，这里用 urllib 默认 UA）：
  TBSDODNS    Fed Z.1：非金融企业（公司制+非公司制）债券+贷款（百万美元，季度）
              ÷ 近四季度名义 GDP 均值 = 按 BIS 方法的同源复算                 ← 债务轴主读数（比 BIS 早两个季度左右）
  QUSNAM770A  BIS：美国非金融企业信贷/GDP（%，季度，全部来源）    ← 官方参照（与 GHSS 同源，滞后约三个季度）
  BCNSDODNS   Fed Z.1：非金融公司企业 债券+贷款（百万美元，季度）  ← 备用口径（只含公司制）
  GDP         名义 GDP（十亿美元，季度，SAAR）
  TOTCI / CREACBW027SBOG  H.8 周频：全部商业银行工商贷款 / 商业地产贷款（十亿美元）← 高频旁证，只并列不折算
  SP500       标普 500（日，FRED 只给近 10 年）← 当前值与 2016-11 之后的历史
  CPIAUCSL    CPI（月）
  ^GSPC       Yahoo Finance 月线（1985 起，只用于 2016-11 之前的季末历史；抓不到则历史从 2019 年起）

用法：python3 minsky_watch.py --out data/deal_graph/minsky.json [--prev data/deal_graph/minsky.json]
TBSDODNS 或 H.8 抓不到 → 主读数退回 BIS / 旁证留空；其余任一序列抓取失败 → 若有 --prev 则原样保留上一版并标 stale，不编数；否则退出 1。
"""
import argparse, csv, io, json, sys, urllib.request
from datetime import datetime, timezone

FRED = "https://fred.stlouisfed.org/graph/fredgraph.csv?id={}"
THRESH = {"debt_pp": 9.0, "equity_pct": 26.0, "window_years": 3, "crisis_prob_3y_pct": 45}


def fetch(series):
    raw = urllib.request.urlopen(urllib.request.Request(FRED.format(series)), timeout=40).read().decode()
    out = {}
    for r in csv.DictReader(io.StringIO(raw)):
        k = list(r.keys()); v = r[k[1]]
        if v not in ("", "."):
            out[r[k[0]]] = float(v)
    if not out:
        raise RuntimeError(f"{series}: empty")
    return out


def fetch_yahoo_monthly():
    """返回 {"YYYY-MM": 月末收盘}，1985-01 至 2017-01；失败返回 {}。"""
    try:
        url = "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1mo&period1=473385600&period2=1483228800"
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=40).read().decode()
        r = json.loads(raw)["chart"]["result"][0]; ts = r["timestamp"]; cl = r["indicators"]["quote"][0]["close"]
        out = {}
        for t_, c in zip(ts, cl):
            if c is not None:
                out[datetime.fromtimestamp(t_, timezone.utc).strftime("%Y-%m")] = float(c)
        return out
    except Exception as ex:
        print(f"[minsky] yahoo history unavailable ({ex}); equity history will start where FRED SP500 starts", file=sys.stderr)
        return {}


def fetch_yahoo_recent():
    """返回 {"YYYY-MM-DD": 收盘}，近一个月日线，只用于补 FRED SP500 尚未更新的最近几个交易日；失败返回 {}。"""
    try:
        url = "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1mo"
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=40).read().decode()
        r = json.loads(raw)["chart"]["result"][0]; ts = r["timestamp"]; cl = r["indicators"]["quote"][0]["close"]
        off = r["meta"].get("gmtoffset", 0); reg_end = (r["meta"].get("currentTradingPeriod") or {}).get("regular", {}).get("end")
        nowts = datetime.now(timezone.utc).timestamp(); out = {}
        for t_, c in zip(ts, cl):
            if c is None: continue
            day = datetime.fromtimestamp(t_ + off, timezone.utc).strftime("%Y-%m-%d")
            # 盘中的当日不是收盘价：只有当日常规交易已结束才收
            if reg_end and t_ >= reg_end - 6.5 * 3600 and nowts < reg_end: continue
            out[day] = float(c)
        return out
    except Exception as ex:
        print(f"[minsky] yahoo recent closes unavailable ({ex})", file=sys.stderr)
        return {}


def shift_years(d, n):
    return f"{int(d[:4]) - n}{d[4:]}"


def latest_on_or_before(d, target):
    ks = [k for k in d if k <= target]
    return max(ks) if ks else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True); ap.add_argument("--prev", default=None); ap.add_argument("--since", default="1985-01-01")
    a = ap.parse_args()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        bis = fetch("QUSNAM770A"); corp = fetch("BCNSDODNS"); gdp = fetch("GDP"); sp = fetch("SP500"); cpi = fetch("CPIAUCSL")
        yh = fetch_yahoo_monthly()
        fred_last = max(sp); yall = fetch_yahoo_recent(); yr = {k: v for k, v in yall.items() if k > fred_last}
        # 重叠日校验：Yahoo 与 FRED 在 FRED 最后一日的收盘相差 >0.1% 就不采用
        chk = yall.get(fred_last) if yr else None
        if yr and chk and abs(chk / sp[fred_last] - 1) < 0.001: sp.update(yr); sp_patch = sorted(yr)
        else: sp_patch = []
        try: tb = fetch("TBSDODNS")
        except Exception as ex2: tb = {}; print(f"[minsky] TBSDODNS unavailable ({ex2}); debt axis falls back to BIS", file=sys.stderr)
        hf_raw = {}
        for sid in ("TOTCI", "CREACBW027SBOG"):
            try: hf_raw[sid] = fetch(sid)
            except Exception as ex2: print(f"[minsky] {sid} unavailable ({ex2})", file=sys.stderr)
    except Exception as ex:
        print(f"[minsky] fetch failed: {ex}", file=sys.stderr)
        if a.prev:
            try:
                prev = json.load(open(a.prev)); prev["stale"] = True; prev["stale_since"] = prev.get("fetched_at"); prev["fetch_error"] = str(ex)
                json.dump(prev, open(a.out, "w"), ensure_ascii=False); print(f"[minsky] kept previous ({prev.get('fetched_at')})"); return
            except Exception:
                pass
        sys.exit(1)

    W = THRESH["window_years"]
    # ---- 债务轴（季度）：BIS 口径三年变化；Z.1 口径并列 ----
    debt_hist = []
    for q in sorted(bis):
        if q < a.since: continue
        p = shift_years(q, W)
        if p in bis:
            debt_hist.append({"date": q, "level": round(bis[q], 1), "chg_3y": round(bis[q] - bis[p], 1)})
    # 同源复算：Z.1 非金融企业债务 ÷ 近四季度名义 GDP 均值（BIS 的做法）；与 BIS 逐季比对后才作主读数
    gq = sorted(gdp); g4 = {q: sum(gdp[x] for x in gq[i - 3:i + 1]) / 4 for i, q in enumerate(gq) if i >= 3}
    repl = {q: tb[q] / 1000 / g4[q] * 100 for q in tb if q in g4}
    rep_hist = [{"date": q, "level": round(repl[q], 1), "chg_3y": round(repl[q] - repl[shift_years(q, W)], 1)} for q in sorted(repl) if q >= a.since and shift_years(q, W) in repl]
    bis_by = {d["date"]: d for d in debt_hist}
    common = [(r["chg_3y"] - bis_by[r["date"]]["chg_3y"]) for r in rep_hist if r["date"] in bis_by]
    fit = {"n": len(common), "mean_abs_diff_pp": round(sum(abs(x) for x in common) / len(common), 2), "max_abs_diff_pp": round(max(abs(x) for x in common), 1)} if common else None
    red_q = lambda h: {d["date"] for d in h if d["chg_3y"] > THRESH["debt_pp"]}
    if fit: fit["same_red_quarters"] = ({q for q in red_q(rep_hist) if q in bis_by} == red_q(debt_hist))
    use_rep = bool(rep_hist) and rep_hist[-1]["date"] > debt_hist[-1]["date"] and fit and fit["mean_abs_diff_pp"] <= 1.0
    z1 = {q: corp[q] / 1000 / gdp[q] * 100 for q in corp if q in gdp}
    z1_hist = [{"date": q, "level": round(z1[q], 1), "chg_3y": round(z1[q] - z1[shift_years(q, W)], 1)} for q in sorted(z1) if q >= a.since and shift_years(q, W) in z1]

    # ---- 股价轴（季度末取样 + 最新日）：标普 500 / CPI 的三年实际涨幅 ----
    first_fred = min(sp)
    def px(day):
        """(日期, 收盘)：FRED 日线覆盖期内取 ≤day 的最近交易日；之前取 Yahoo 该月月末收盘（day 均为季末）。"""
        if day >= first_fred:
            k = latest_on_or_before(sp, day); return (k, sp[k]) if k else (None, None)
        m = day[:7]
        return (m + "-EOM", yh[m]) if m in yh else (None, None)
    def real_chg(end_day):
        e, pe = px(end_day); s, ps = px(shift_years(end_day, W))
        ce = latest_on_or_before(cpi, end_day); cs = latest_on_or_before(cpi, shift_years(end_day, W))
        if not (e and s and ce and cs): return None
        nom = pe / ps - 1; infl = cpi[ce] / cpi[cs] - 1
        return {"date": end_day, "sp_start": round(ps, 2), "sp_end": round(pe, 2), "sp_start_date": s, "sp_end_date": e,
                "nominal_pct": round(nom * 100, 1), "cpi_pct": round(infl * 100, 1), "cpi_start_date": cs, "cpi_end_date": ce,
                "real_pct": round(((1 + nom) / (1 + infl) - 1) * 100, 1)}
    eq_hist = []
    for q in sorted({d["date"] for d in debt_hist} | {d["date"] for d in rep_hist} | {max(z1)}):
        qe = {"01": "03-31", "04": "06-30", "07": "09-30", "10": "12-31"}[q[5:7]]
        end = f"{q[:4]}-{qe}"
        r = real_chg(end)
        if r and r not in eq_hist: eq_hist.append(r)
    eq_now = real_chg(max(sp))

    cur_bis = debt_hist[-1]; cur_z1 = z1_hist[-1]
    official = {"series": "QUSNAM770A", "series_label": "BIS: US non-financial corporations credit / GDP, all sectors (%)", "asof": cur_bis["date"], "level": cur_bis["level"],
                "start_level": round(bis[shift_years(cur_bis["date"], W)], 1), "chg_3y": cur_bis["chg_3y"]}
    bis_hist = debt_hist
    if use_rep:
        same = next((r for r in rep_hist if r["date"] == cur_bis["date"]), None)
        official["replica_chg_3y_same_quarter"] = same["chg_3y"] if same else None
        debt_hist = rep_hist; cur_bis = rep_hist[-1]; main_level = repl; main_series = "TBSDODNS / 4-quarter GDP"
        main_label = "Fed Z.1: nonfinancial business (corporate + noncorporate) debt securities + loans / 4-quarter nominal GDP (%), BIS-method replica"
    else:
        main_level = bis; main_series = "QUSNAM770A"; main_label = official["series_label"]
    # 高频旁证：银行贷款三年增幅 vs 名义 GDP 三年增幅（只并列，不折算成比率）
    hf = None
    try:
        gl = max(gdp); items = []
        for sid, lab in (("TOTCI", "Commercial and industrial loans, all commercial banks (H.8, weekly, SA)"), ("CREACBW027SBOG", "Commercial real estate loans, all commercial banks (H.8, weekly, SA)")):
            d = hf_raw.get(sid)
            if not d: continue
            e = max(d); s0 = latest_on_or_before(d, shift_years(e, W))
            items.append({"series": sid, "series_label": lab, "asof": e, "value_busd": round(d[e], 1), "start_date": s0, "start_busd": round(d[s0], 1), "chg_3y_pct": round((d[e] / d[s0] - 1) * 100, 1)})
        if items: hf = {"items": items, "gdp_asof": gl, "gdp_chg_3y_pct": round((gdp[gl] / gdp[shift_years(gl, W)] - 1) * 100, 1)}
    except Exception as ex2:
        print(f"[minsky] hf block skipped ({ex2})", file=sys.stderr)
    red_debt = cur_bis["chg_3y"] > THRESH["debt_pp"]; red_eq = eq_now["real_pct"] > THRESH["equity_pct"]
    # 历史上双红区的季度（BIS 口径 + 季末实际股价）
    eq_by_q = {r["date"][:7]: r["real_pct"] for r in eq_hist}
    both = [d["date"] for d in debt_hist if d["chg_3y"] > THRESH["debt_pp"] and eq_by_q.get({"01": d["date"][:5] + "03", "04": d["date"][:5] + "06", "07": d["date"][:5] + "09", "10": d["date"][:5] + "12"}[d["date"][5:7]], -1e9) > THRESH["equity_pct"]]
    doc = {
        "fetched_at": now, "stale": False,
        "framework": {"name": "GHSS business R-zone (Greenwood–Hanson–Shleifer–Sørensen 2022) / Deutsche Bank 2025-11", "thresholds": THRESH,
                      "sector": "all nonfinancial business (corporate + noncorporate), all credit sources; excludes financials, households, government",
                      "refs": ["https://www.nber.org/system/files/working_papers/w27396/w27396.pdf", "https://wallstreetcn.com/articles/3785328"]},
        "scale": {"gdp_asof": max(gdp), "gdp_busd": round(gdp[max(gdp)], 1),
                  "nonfin_business_debt_asof": (max(tb) if tb else None), "nonfin_business_debt_busd": (round(tb[max(tb)] / 1000, 1) if tb else None)},
        "debt": {"series": main_series, "series_label": main_label, "basis": "z1_replica" if use_rep else "bis", "official": official, "replica_fit": fit, "hf": hf,
                 "asof": cur_bis["date"], "level": cur_bis["level"], "start_date": shift_years(cur_bis["date"], W), "start_level": round(main_level[shift_years(cur_bis["date"], W)], 1),
                 "chg_3y": cur_bis["chg_3y"], "threshold": THRESH["debt_pp"], "in_red": red_debt, "gap_to_red": round(THRESH["debt_pp"] - cur_bis["chg_3y"], 1),
                 "level_needed": round(main_level[shift_years(cur_bis["date"], W)] + THRESH["debt_pp"], 1),
                 "alt": {"series": "BCNSDODNS/GDP", "series_label": "Fed Z.1: nonfinancial corporate debt securities + loans / GDP (%)", "asof": cur_z1["date"], "level": cur_z1["level"], "chg_3y": cur_z1["chg_3y"]},
                 "history": debt_hist, "history_official": bis_hist[-80:], "history_alt": z1_hist[-60:]},
        "equity": {"series": "SP500 / CPIAUCSL" + (" (+Yahoo ^GSPC monthly before %s)" % first_fred if yh else ""), "series_label": "S&P 500 deflated by CPI, 3-year real change (%)", "yahoo_patched_days": sp_patch, **eq_now,
                   "threshold": THRESH["equity_pct"], "in_red": red_eq, "history": eq_hist},
        "status": {"both_red": red_debt and red_eq, "debt_red": red_debt, "equity_red": red_eq,
                   "history_both_red_quarters": both},
    }
    json.dump(doc, open(a.out, "w"), ensure_ascii=False, indent=1)
    print(f"[minsky] debt[{'z1_replica' if use_rep else 'bis'}] {cur_bis['date']}: {cur_bis['level']}% (3y {cur_bis['chg_3y']:+} pp, red={red_debt}); BIS {official['asof']} {official['chg_3y']:+} pp; fit {fit}; "
          f"equity {eq_now['sp_end_date']}: real 3y {eq_now['real_pct']:+}% (red={red_eq}); both-red history: {both[-4:] if both else 'none'}")


if __name__ == "__main__":
    main()
