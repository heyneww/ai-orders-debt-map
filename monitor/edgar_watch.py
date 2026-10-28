#!/usr/bin/env python3
"""edgar_watch.py — WATCH 通道：轮询 SEC EDGAR，产出候选事件 JSONL。

两条抓法：
  1) submissions API：对 entities 里有 ticker 的主体，拉最近 filings，按 form + 8-K item 过滤
  2) 全文检索（--fts）：对私营主体 / SPV / 未知对手方，按短语搜 8-K 全文

用法：
  export SEC_UA="<你的机构名> <联系邮箱>"     # SEC 强制要求，缺失则退出
  python3 edgar_watch.py --entities data/deal_graph/entities.json \
      --since 2026-10-20 --out data/deal_graph/inbox/2026-10-27T0800/candidates.jsonl \
      [--forms 8-K,424B2,424B5,FWP,D] [--items 1.01,1.02,2.03,3.02,8.01] \
      [--fts '"compute capacity" AND ("OpenAI" OR "Anthropic")' --fts '"residual value guarantee"']

输出每行一个 candidate：{candidate_id, source, entity_id, ticker, cik, form, items, filed, url, title, display_names}
只做采集，不做判断；TRIAGE（deal-scout agent）负责抽取成边。
"""
import argparse, hashlib, json, os, sys, time, urllib.parse, urllib.request
from datetime import date

UA = os.environ.get("SEC_UA")
TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
SUBMISSIONS = "https://data.sec.gov/submissions/CIK{cik:010d}.json"
FTS = "https://efts.sec.gov/LATEST/search-index"
ARCHIVE = "https://www.sec.gov/Archives/edgar/data/{cik}/{acc}/{doc}"
MIN_INTERVAL = 0.12  # SEC: ≤10 req/s


def get_json(url, retries=2):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "gzip, deflate"})
    for i in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                raw = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    import gzip; raw = gzip.decompress(raw)
                time.sleep(MIN_INTERVAL)
                return json.loads(raw)
        except Exception as e:  # noqa
            if i == retries:
                print(f"[warn] GET failed {url}: {e}", file=sys.stderr)
                return None
            time.sleep(1.5)


def resolve_ciks(entities, cache_path):
    cache = {}
    if os.path.exists(cache_path):
        cache = json.load(open(cache_path))
    need = [e["ticker"] for e in entities if e.get("ticker") and e["ticker"] not in cache]
    if need:
        table = get_json(TICKERS_URL) or {}
        by_ticker = {v["ticker"].upper(): int(v["cik_str"]) for v in table.values()}
        for t in need:
            if t.upper() in by_ticker:
                cache[t] = by_ticker[t.upper()]
            else:
                print(f"[warn] ticker {t} not in SEC company_tickers.json (非美股或 ADR 需手填 cik)", file=sys.stderr)
        os.makedirs(os.path.dirname(cache_path) or ".", exist_ok=True)
        json.dump(cache, open(cache_path, "w"), indent=1)
    return cache


def cid(*parts):
    return hashlib.sha1("|".join(str(p) for p in parts).encode()).hexdigest()[:12]


def scan_submissions(entities, ciks, since, forms, items):
    out = []
    for e in entities:
        t = e.get("ticker")
        if not t or t not in ciks:
            continue
        cik = ciks[t]
        # 资金方/银行自身的 424B/FWP 是其日常发债与结构化票据（JPM 两周 ~800 条），不是 AI 交易；
        # 它们参与的 AI 融资会出现在借款方的 8-K 2.03 里，所以资金方只看 8-K。
        ent_forms = ["8-K"] if e.get("type") in ("financier", "sovereign") else forms
        sub = get_json(SUBMISSIONS.format(cik=cik))
        if not sub:
            continue
        rec = sub.get("filings", {}).get("recent", {})
        n = len(rec.get("accessionNumber", []))
        for i in range(n):
            filed = rec["filingDate"][i]
            form = rec["form"][i]
            if filed < since or form not in ent_forms:
                continue
            f_items = [s.strip() for s in (rec.get("items", [""] * n)[i] or "").split(",") if s.strip()]
            if form == "8-K" and items and not (set(f_items) & set(items)):
                continue
            acc = rec["accessionNumber"][i]
            doc = rec["primaryDocument"][i]
            url = ARCHIVE.format(cik=cik, acc=acc.replace("-", ""), doc=doc)
            out.append({
                "candidate_id": cid("sub", url), "source": "edgar_submissions",
                "entity_id": e["id"], "ticker": t, "cik": cik, "form": form, "items": f_items,
                "filed": filed, "url": url, "title": rec.get("primaryDocDescription", [""] * n)[i],
                "display_names": [e["name"]],
            })
    return out


def scan_fts(phrases, since, until, forms):
    out = []
    for q in phrases:
        params = {"q": q, "dateRange": "custom", "startdt": since, "enddt": until, "forms": ",".join(forms)}
        res = get_json(FTS + "?" + urllib.parse.urlencode(params))
        if not res:
            continue
        for h in res.get("hits", {}).get("hits", []):
            src = h.get("_source", {})
            acc, _, doc = h.get("_id", "").partition(":")
            ciks = src.get("ciks") or []
            cik = int(ciks[0]) if ciks else None
            url = ARCHIVE.format(cik=cik, acc=acc.replace("-", ""), doc=doc) if cik else None
            out.append({
                "candidate_id": cid("fts", url or h.get("_id")), "source": "edgar_fts", "query": q,
                "entity_id": None, "ticker": None, "cik": cik, "form": src.get("form"),
                "items": src.get("items") or [], "filed": src.get("file_date"), "url": url,
                "title": src.get("file_description") or "", "display_names": src.get("display_names") or [],
            })
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--entities", required=True)
    ap.add_argument("--since", required=True, help="YYYY-MM-DD，含")
    ap.add_argument("--until", default=date.today().isoformat())
    ap.add_argument("--out", required=True)
    ap.add_argument("--forms", default="8-K,424B2,424B5,FWP,D")
    ap.add_argument("--items", default="1.01,1.02,2.03,3.02,7.01,8.01")
    ap.add_argument("--fts", action="append", default=[], help="可重复；EDGAR 全文检索短语")
    ap.add_argument("--cik-cache", default="data/deal_graph/cik_cache.json")
    a = ap.parse_args()
    if not UA:
        sys.exit("SEC_UA 未设置。SEC 要求 User-Agent 含机构名与联系方式，例如：export SEC_UA='MyFirm research@myfirm.com'")

    ents = json.load(open(a.entities))["entities"]
    forms = [f.strip() for f in a.forms.split(",") if f.strip()]
    items = [i.strip() for i in a.items.split(",") if i.strip()]
    ciks = resolve_ciks(ents, a.cik_cache)
    cands = scan_submissions(ents, ciks, a.since, forms, items)
    if a.fts:
        cands += scan_fts(a.fts, a.since, a.until, ["8-K"])
    seen, uniq = set(), []
    for c in cands:
        k = c["url"] or c["candidate_id"]
        if k in seen:
            continue
        seen.add(k); uniq.append(c)
    uniq.sort(key=lambda c: (c["filed"] or "", c["form"] or ""), reverse=True)
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    with open(a.out, "w") as f:
        for c in uniq:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")
    by_form = {}
    for c in uniq:
        by_form[c["form"]] = by_form.get(c["form"], 0) + 1
    print(f"candidates: {len(uniq)}  by_form={by_form}  -> {a.out}")


if __name__ == "__main__":
    main()
