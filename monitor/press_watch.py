#!/usr/bin/env python3
"""press_watch.py — WATCH 通道：IR 新闻稿 RSS / 页面变更监控，产出候选 JSONL。

feeds.txt 每行：<entity_id>|rss:<url>   或   <entity_id>|html:<url>
  rss  → 解析 RSS2.0/Atom，取 since 之后且标题/摘要命中关键词的条目
  html → 抓页面文本做哈希，与 state 比较，变化则产出一条 page_changed 候选（由 TRIAGE 去读）

用法：
  python3 press_watch.py --feeds .claude/skills/ai-deal-graph/references/feeds.txt \
      --since 2026-10-20 --out data/deal_graph/inbox/<run_id>/press_candidates.jsonl \
      [--state data/deal_graph/press_state.json]
"""
import argparse, hashlib, json, os, re, sys, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone

KEYWORDS = re.compile(r"agreement|deal|commit|capacity|gigawatt|\bGW\b|GPU|financ|bond|notes|loan|credit|facility|"
                      r"invest|stake|equity|guarantee|backstop|lease|take-or-pay|partnership|supply", re.I)
UA = os.environ.get("PRESS_UA", "ai-deal-graph-watch/0.1")


def fetch(url):
    url = urllib.parse.quote(url, safe=":/?&=+%,()")  # 非 ASCII 查询词（中文）需百分号编码
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def parse_date(s):
    if not s:
        return None
    try:
        return parsedate_to_datetime(s).astimezone(timezone.utc)
    except Exception:
        pass
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)
    except Exception:
        return None


def rss_items(raw):
    root = ET.fromstring(raw)
    ns = {"a": "http://www.w3.org/2005/Atom"}
    for it in root.iter("item"):  # RSS 2.0
        yield {"title": it.findtext("title") or "", "link": it.findtext("link") or "",
               "summary": it.findtext("description") or "", "date": parse_date(it.findtext("pubDate")),
               "publisher": it.findtext("source") or ""}
    for en in root.findall(".//a:entry", ns):  # Atom
        link = en.find("a:link", ns)
        yield {"title": en.findtext("a:title", default="", namespaces=ns),
               "link": link.get("href") if link is not None else "",
               "summary": en.findtext("a:summary", default="", namespaces=ns),
               "date": parse_date(en.findtext("a:updated", default="", namespaces=ns) or en.findtext("a:published", default="", namespaces=ns))}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--feeds", required=True)
    ap.add_argument("--since", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--state", default="data/deal_graph/press_state.json")
    a = ap.parse_args()
    since = datetime.fromisoformat(a.since).replace(tzinfo=timezone.utc)
    state = json.load(open(a.state)) if os.path.exists(a.state) else {}
    out = []
    for line in open(a.feeds):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        ent, _, spec = line.partition("|")
        kind, _, url = spec.partition(":")
        try:
            raw = fetch(url)
        except Exception as e:
            print(f"[warn] {ent} {url}: {e}", file=sys.stderr); continue
        if kind == "rss":
            for it in rss_items(raw):
                if it["date"] and it["date"] < since:
                    continue
                if not KEYWORDS.search(it["title"] + " " + it["summary"]):
                    continue
                out.append({"candidate_id": hashlib.sha1(it["link"].encode()).hexdigest()[:12], "source": "press_rss",
                            "entity_id": ent, "filed": it["date"].date().isoformat() if it["date"] else None,
                            "url": it["link"], "title": it["title"], "publisher": it.get("publisher") or "",
                            "summary": re.sub(r"<[^>]+>", "", it["summary"]).replace("&nbsp;", " ")[:500]})
        elif kind == "html":
            text = re.sub(r"<script.*?</script>|<style.*?</style>|<[^>]+>", " ", raw.decode("utf-8", "ignore"), flags=re.S)
            h = hashlib.sha1(re.sub(r"\s+", " ", text).encode()).hexdigest()
            if state.get(url) != h:
                out.append({"candidate_id": h[:12], "source": "press_page_changed", "entity_id": ent,
                            "filed": None, "url": url, "title": f"page changed: {url}", "summary": ""})
                state[url] = h
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    with open(a.out, "w") as f:
        for c in out:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")
    os.makedirs(os.path.dirname(a.state) or ".", exist_ok=True)
    json.dump(state, open(a.state, "w"), indent=1)
    print(f"press candidates: {len(out)} -> {a.out}")


if __name__ == "__main__":
    main()
