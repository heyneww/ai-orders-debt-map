#!/usr/bin/env python3
"""minsky_watch.py — 明斯基时刻监控：把美国企业杠杆与实际股价的三年变化，对照 GHSS/德银"红区"双门槛。

框架：Greenwood–Hanson–Shleifer–Sørensen (2022, J. Finance) "Predictable Financial Crises" 的 business R-zone，
德意志银行 2025-11 报告沿用：非金融企业信贷/GDP 三年升幅 > 9 pp 且 实际股价三年涨幅 > 26% → 未来三年危机概率约 45%。

数据（全部 FRED 公开序列，无需 key；FRED 对部分浏览器 UA 会超时，这里用 urllib 默认 UA）：
  QUSNAM770A  BIS：美国非金融企业信贷/GDP（%，季度，全部来源）    ← 债务轴主口径（与 GHSS 同源）
  BCNSDODNS   Fed Z.1：非金融公司企业 债券+贷款（百万美元，季度）  ← 债务轴备用口径（只含公司制）
  GDP         名义 GDP（十亿美元，季度，SAAR）
  SP500       标普 500（日，FRED 只给近 10 年）← 当前值与 2016-11 之后的历史
  CPIAUCSL    CPI（月）
  ^GSPC       Yahoo Finance 月线（1985 起，只用于 2016-11 之前的季末历史；抓不到则历史从 2019 年起）

用法：python3 minsky_watch.py --out data/deal_graph/minsky.json [--prev data/deal_graph/minsky.json]
任一序列抓取失败 → 若有 --prev 则原样保留上一版并标 stale，不编数；否则退出 1。
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
    for q in [d["date"] for d in debt_hist] + [max(z1)]:
        qe = {"01": "03-31", "04": "06-30", "07": "09-30", "10": "12-31"}[q[5:7]]
        end = f"{q[:4]}-{qe}"
        r = real_chg(end)
        if r and r not in eq_hist: eq_hist.append(r)
    eq_now = real_chg(max(sp))

    cur_bis = debt_hist[-1]; cur_z1 = z1_hist[-1]
    red_debt = cur_bis["chg_3y"] > THRESH["debt_pp"]; red_eq = eq_now["real_pct"] > THRESH["equity_pct"]
    # 历史上双红区的季度（BIS 口径 + 季末实际股价）
    eq_by_q = {r["date"][:7]: r["real_pct"] for r in eq_hist}
    both = [d["date"] for d in debt_hist if d["chg_3y"] > THRESH["debt_pp"] and eq_by_q.get({"01": d["date"][:5] + "03", "04": d["date"][:5] + "06", "07": d["date"][:5] + "09", "10": d["date"][:5] + "12"}[d["date"][5:7]], -1e9) > THRESH["equity_pct"]]
    doc = {
        "fetched_at": now, "stale": False,
        "framework": {"name": "GHSS business R-zone (Greenwood–Hanson–Shleifer–Sørensen 2022) / Deutsche Bank 2025-11", "thresholds": THRESH,
                      "sector": "all nonfinancial business (corporate + noncorporate), all credit sources; excludes financials, households, government",
                      "refs": ["https://www.nber.org/system/files/working_papers/w27396/w27396.pdf", "https://wallstreetcn.com/articles/3785328"]},
        "debt": {"series": "QUSNAM770A", "series_label": "BIS: US non-financial corporations credit / GDP, all sectors (%)",
                 "asof": cur_bis["date"], "level": cur_bis["level"], "start_date": shift_years(cur_bis["date"], W), "start_level": round(bis[shift_years(cur_bis["date"], W)], 1),
                 "chg_3y": cur_bis["chg_3y"], "threshold": THRESH["debt_pp"], "in_red": red_debt, "gap_to_red": round(THRESH["debt_pp"] - cur_bis["chg_3y"], 1),
                 "level_needed": round(bis[shift_years(cur_bis["date"], W)] + THRESH["debt_pp"], 1),
                 "alt": {"series": "BCNSDODNS/GDP", "series_label": "Fed Z.1: nonfinancial corporate debt securities + loans / GDP (%)", "asof": cur_z1["date"], "level": cur_z1["level"], "chg_3y": cur_z1["chg_3y"]},
                 "history": debt_hist, "history_alt": z1_hist[-60:]},
        "equity": {"series": "SP500 / CPIAUCSL" + (" (+Yahoo ^GSPC monthly before %s)" % first_fred if yh else ""), "series_label": "S&P 500 deflated by CPI, 3-year real change (%)", **eq_now,
                   "threshold": THRESH["equity_pct"], "in_red": red_eq, "history": eq_hist},
        "status": {"both_red": red_debt and red_eq, "debt_red": red_debt, "equity_red": red_eq,
                   "history_both_red_quarters": both},
    }
    json.dump(doc, open(a.out, "w"), ensure_ascii=False, indent=1)
    print(f"[minsky] debt {cur_bis['date']}: {cur_bis['level']}% (3y {cur_bis['chg_3y']:+} pp, red={red_debt}); "
          f"equity {eq_now['sp_end_date']}: real 3y {eq_now['real_pct']:+}% (red={red_eq}); both-red history: {both[-4:] if both else 'none'}")


if __name__ == "__main__":
    main()
