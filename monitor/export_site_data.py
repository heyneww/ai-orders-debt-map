#!/usr/bin/env python3
"""export_site_data.py — 把 entities/edges/metrics + 新闻/申报流导出为站点用的 site/data/graph.json。

用法：
  python3 export_site_data.py --entities data/deal_graph/entities.json --edges data/deal_graph/edges.jsonl \
      --metrics reports/deal_graph/metrics_<date>.json --news site/data/news_raw.jsonl \
      --filings data/deal_graph/inbox/<run>/candidates.jsonl --out site/data/graph.json [--archive site/data/archive]
"""
import argparse, json, os, re, shutil
from collections import defaultdict
from datetime import datetime, timezone

SECTOR = {"lab": "labs", "hyperscaler": "hyperscalers", "chip": "chips", "memory": "chips", "neocloud": "neoclouds",
          "dc_developer": "datacenters", "spv": "spvs", "financier": "financiers", "sovereign": "financiers", "power": "energy"}
NAME_ZH = {"openai": "OpenAI", "anthropic": "Anthropic", "xai": "xAI", "msft": "微软", "googl": "Alphabet / 谷歌", "amzn": "亚马逊 / AWS", "meta": "Meta", "orcl": "甲骨文 Oracle", "crwv": "CoreWeave", "nbis": "Nebius", "crusoe": "Crusoe", "lambda": "Lambda", "nscale": "Nscale", "iren": "IREN", "nvda": "英伟达 NVIDIA", "amd": "AMD", "avgo": "博通 Broadcom", "mu": "美光 Micron", "skhynix": "SK 海力士", "samsung": "三星电子", "vantage": "Vantage 数据中心", "related": "Related Digital", "owl": "Blue Owl", "apo": "Apollo", "bx": "黑石 Blackstone", "pimco": "PIMCO", "jpm": "摩根大通", "mufg": "三菱日联", "brookfield": "Brookfield", "softbank": "软银集团", "mgx": "MGX", "ceg": "Constellation 能源", "vst": "Vistra", "public_bondholders": "公募债投资者", "public_equity_investors": "公开市场股权投资者", "undisclosed_counterparty": "未披露对手方", "syndicate": "未拆分的投资/贷款团", "spacex": "SpaceX", "stargate_jv": "Stargate 合资公司", "beignet": "Beignet SPV（Meta Hyperion）", "sopaipilla": "Sopaipilla SPV（Meta El Paso）", "dell": "戴尔", "cerebras": "Cerebras", "fluidstack": "Fluidstack", "scale_ai": "Scale AI", "goldman": "高盛", "morgan_stanley": "摩根士丹利", "citi": "花旗", "deutsche_bank": "德意志银行", "berkshire": "伯克希尔", "blackrock": "贝莱德 (GIP/HPS)", "mubadala": "穆巴达拉", "apld": "Applied Digital", "corz": "Core Scientific", "hut8": "Hut 8", "cipher": "Cipher Mining", "glxy": "Galaxy Digital", "aip": "AI 基础设施合作伙伴 AIP", "aligned": "Aligned 数据中心", "valor": "Valor", "jane_street": "Jane Street", "pnc": "PNC 银行", "tsmc": "台积电 TSMC", "intc": "英特尔 Intel", "tencent": "腾讯", "alibaba": "阿里巴巴 / 阿里云", "bytedance": "字节跳动", "airtrunk": "AirTrunk（澳洲数据中心）", "eqix": "Equinix", "dlr": "Digital Realty", "tesla": "特斯拉", "apple": "苹果", "bofa": "美国银行", "sb_energy": "SB Energy（软银）", "humain": "Humain（沙特）", "g42": "G42（阿联酋）", "kkr": "KKR", "xai_colossus2_spv": "xAI Colossus 2 GPU 融资 SPV", "crusoe_abilene_jv": "Crusoe / Blue Owl Abilene 合资", "vantage_frontier_tx": "Vantage Frontier 园区（德州）", "vantage_lighthouse_wi": "Vantage Lighthouse 园区（威州）", "related_saline_mi": "Related Digital 密歇根园区", "project_jupiter_nm": "Project Jupiter（新墨西哥）", "googl_bx_tpu_jv": "黑石–谷歌 TPU 合资", "anthropic_tpu_spv": "Anthropic TPU 租赁 SPV", "valor_compute": "Valor 算力基础设施 SPV", "stack": "STACK Infrastructure（Blue Owl）", "firmus": "Firmus", "aker": "Aker", "twg_global": "TWG Global", "apld_computeco": "APLD ComputeCo（Applied Digital SPV）", "apld_computeco2": "APLD ComputeCo 2", "apld_computeco3": "APLD ComputeCo 3", "beacon_point_dc": "Beacon Point DC（Hut 8 SPV）", "black_pearl_compute": "Black Pearl Compute（Cipher SPV）", "cipher_compute": "Cipher Compute SPV", "corz_finance_i": "Core Scientific Finance I", "crwv_ccac_iv": "CoreWeave 算力收购公司 IV", "crwv_ccac_vii": "CoreWeave 算力收购公司 VII", "crwv_ccac_viii": "CoreWeave 算力收购公司 VIII", "crwv_ddtl_v": "CoreWeave DDTL V 融资载体", "crwv_ddtl_vv": "CoreWeave DDTL V-V 融资载体", "galaxy_helios_ii": "Galaxy Helios II（数据中心 SPV）", "hut8_dc": "Hut 8 DC SPV", "iren_hardware3": "IREN Hardware 3 SPV", "us_doc": "美国商务部", "intel_fab34_jv": "Intel Fab 34 合资（爱尔兰）", "gic": "新加坡 GIC", "cpp": "加拿大养老金 CPP", "eqix_xscale_us_jv": "Equinix xScale 美国合资", "dlr_carver_jv": "Digital Realty 北弗吉尼亚合资", "dlr_hyperscale_fund": "Digital Realty 超大规模基金", "qcom": "高通", "helix": "Helix 数据中心（KKR）", "stt_gdc": "ST Telemedia 数据中心", "gtr": "GTR 数据中心（KKR）", "aolani": "Aolani"}
ITEM_ZH = {"compute_capacity": "算力容量", "gpu_purchase": "GPU 采购", "cloud_commit": "云服务承诺", "dc_lease": "数据中心租约", "power_ppa": "购电协议",
           "memory_lta": "存储长协", "network_equipment": "网络设备"}
INSTR_ZH = {"bond_144a": "144A 债券", "bond_public": "公募债券", "term_loan": "定期贷款", "revolver": "循环贷", "private_credit": "私募信贷", "abs_gpu": "GPU ABS",
            "lease_backed": "租赁抵押融资", "vendor_financing": "供应商融资", "convertible": "可转债", "construction_loan": "建设贷款"}
FORM_ZH = {"residual_value": "残值担保", "capacity_backstop": "容量兜底", "completion": "完工担保", "keepwell": "维好协议", "parent_guarantee": "母公司担保"}
EQ_ZH = {"cash": "现金投资", "compute_credits": "算力抵股权", "in_kind_gpu": "GPU 实物换股权", "warrant": "认股权证", "convertible_pref": "可转优先股"}
FIRM = {"definitive", "amended", "drawn", "completed"}


def fmt(v):
    if v is None: return None
    return f"${v/1000:.1f}B" if v >= 1000 else f"${v:.0f}M"


def title(e, name, name_zh=None):
    name_zh = name_zh or name
    f, t, k = name_zh(e["from"]), name_zh(e["to"]), e["kind"]
    fe, te = name(e["from"]), name(e["to"])
    amt = fmt(e.get("amount_headline_musd")); a_zh = amt or "金额未披露"; a_en = amt or "undisclosed"
    if k == "ORDER":
        it = (e.get("order") or {}).get("item") or "compute_capacity"
        return (f"{f} 向 {t} 采购{ITEM_ZH.get(it, it)}，{a_zh}", f"{fe} orders {it.replace('_', ' ')} from {te} ({a_en})")
    if k == "DEBT":
        ins = (e.get("debt") or {}).get("instrument") or "term_loan"
        return (f"{f} 向 {t} 提供{INSTR_ZH.get(ins, ins)}，{a_zh}", f"{fe} lends to {te} via {ins.replace('_', ' ')} ({a_en})")
    if k == "EQUITY":
        fm = (e.get("equity") or {}).get("form") or "cash"
        return (f"{f} 投资 {t}（{EQ_ZH.get(fm, fm)}），{a_zh}", f"{fe} invests in {te} ({fm.replace('_', ' ')}, {a_en})")
    fm = (e.get("guarantee") or {}).get("form") or "parent_guarantee"
    return (f"{f} 为 {t} 提供{FORM_ZH.get(fm, fm)}，{a_zh}", f"{fe} guarantees {te} ({fm.replace('_', ' ')}, {a_en})")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--entities", required=True); ap.add_argument("--edges", required=True); ap.add_argument("--metrics", required=True)
    ap.add_argument("--news", default=None); ap.add_argument("--filings", default=None); ap.add_argument("--out", required=True)
    ap.add_argument("--archive", default=None); ap.add_argument("--monitor-note", default=""); ap.add_argument("--commentary", default=None); ap.add_argument("--fallback", default=None, help="上一版 graph.json：新闻/申报抓取为空时沿用其列表并标记 stale")
    a = ap.parse_args()
    ents = json.load(open(a.entities))["entities"]
    edges = [json.loads(l) for l in open(a.edges) if l.strip()]
    m = json.load(open(a.metrics))
    by_id = {e["id"]: e for e in ents}
    name = lambda i: "Undisclosed counterparty" if i == "undisclosed_counterparty" else by_id.get(i, {}).get("name", i)
    name_zh = lambda i: NAME_ZH.get(i, by_id.get(i, {}).get("name", i))
    superseded_by = {e["supersedes"]: e["edge_id"] for e in edges if e.get("supersedes")}
    out_edges = []
    for e in edges:
        active = e["edge_id"] not in superseded_by and e.get("status") != "cancelled"
        zh, en = title(e, name, name_zh)
        out_edges.append({**{k: e.get(k) for k in ("edge_id", "kind", "from", "to", "announced_date", "effective_date", "end_date", "amount_headline_musd",
                                                     "amount_firm_musd", "amount_basis", "status", "supersedes", "source_url", "source_tier", "confidence",
                                                     "data_gaps", "notes", "order", "debt", "equity", "guarantee")},
                          "superseded_by": superseded_by.get(e["edge_id"]), "active": active, "firm": e.get("status") in FIRM,
                          "title_zh": zh, "title_en": en})
    # entity stats on active edges
    stats = defaultdict(lambda: {"in": defaultdict(float), "out": defaultdict(float), "in_firm": 0.0, "out_firm": 0.0, "deals": 0, "cps": set(), "undisclosed": 0})
    for e in out_edges:
        if not e["active"]: continue
        h = e.get("amount_headline_musd") or 0; f = e.get("amount_firm_musd") or 0
        s_from, s_to = stats[e["from"]], stats[e["to"]]
        s_from["out"][e["kind"]] += h; s_from["out_firm"] += f; s_to["in"][e["kind"]] += h; s_to["in_firm"] += f
        for s in (s_from, s_to):
            s["deals"] += 1
            if e.get("amount_headline_musd") is None: s["undisclosed"] += 1
        s_from["cps"].add(e["to"]); s_to["cps"].add(e["from"])
    out_ents = []
    for x in ents:
        s = stats.get(x["id"])
        en_name = "Undisclosed counterparty" if x["id"] == "undisclosed_counterparty" else x["name"]
        out_ents.append({"id": x["id"], "name": en_name, "name_zh": NAME_ZH.get(x["id"], x["name"]), "type": x["type"], "sector": SECTOR.get(x["type"], "other"),
                         "ticker": x.get("ticker"), "parent": x.get("parent"), "aliases": x.get("aliases") or [],
                         "stats": {"in": dict(s["in"]) if s else {}, "out": dict(s["out"]) if s else {}, "in_firm": s["in_firm"] if s else 0, "out_firm": s["out_firm"] if s else 0,
                                   "in_total": sum(s["in"].values()) if s else 0, "out_total": sum(s["out"].values()) if s else 0,
                                   "deals": s["deals"] if s else 0, "counterparties": len(s["cps"]) if s else 0, "undisclosed": s["undisclosed"] if s else 0}})
    # news
    news = []
    alias_map = []
    for x in ents:
        for al in [x["name"]] + (x.get("aliases") or []):
            if len(al) >= 3: alias_map.append((al.lower(), x["id"]))
    if a.news and os.path.exists(a.news):
        seen = set()
        for l in open(a.news):
            if not l.strip(): continue
            n = json.loads(l)
            if n.get("source") != "press_rss": continue
            t = n.get("title") or ""
            key = re.sub(r"\W+", "", t.lower())[:80]
            if key in seen: continue
            seen.add(key)
            pub = n.get("publisher") or (t.rsplit(" - ", 1)[1] if " - " in t else "")
            tl = t.lower()
            tagged = sorted({eid for al, eid in alias_map if al in tl} | ({n.get("entity_id")} if n.get("entity_id") in by_id else set()))
            news.append({"title": t.rsplit(" - ", 1)[0] if pub and t.endswith(pub) else t, "publisher": pub, "url": n.get("url"), "date": n.get("filed"),
                         "lang": "zh" if re.search(r"[一-鿿]", t) else "en", "entities": tagged[:4], "entity_feed": n.get("entity_id"), "published": n.get("published")})
        news.sort(key=lambda n: (n.get("published") or n.get("date") or ""), reverse=True)
        zh = [n for n in news if n["lang"] == "zh"][:250]; en = [n for n in news if n["lang"] != "zh"][:800 - len(zh)]
        news = sorted(zh + en, key=lambda n: (n.get("published") or n.get("date") or ""), reverse=True)
    filings = []
    if a.filings and os.path.exists(a.filings):
        for l in open(a.filings):
            if not l.strip(): continue
            c = json.loads(l)
            if c.get("source") != "edgar_submissions": continue
            filings.append({"entity": c.get("entity_id"), "company": name(c.get("entity_id")), "form": c.get("form"), "items": c.get("items") or [],
                            "filed": c.get("filed"), "url": c.get("url"), "title": c.get("title") or ""})
        filings.sort(key=lambda f: f.get("filed") or "", reverse=True); filings = filings[:120]
        seen_day = {}
        for f in filings:  # 同一主体同日多份同类文件：加序号，避免看起来像重复
            k = (f["entity"], f["form"], tuple(f["items"]), f["filed"]); seen_day[k] = seen_day.get(k, 0) + 1; f["seq"] = seen_day[k]
        for f in filings:
            k = (f["entity"], f["form"], tuple(f["items"]), f["filed"]); f["seq_total"] = seen_day[k]
    stale = {}
    if a.fallback and os.path.exists(a.fallback):
        try:
            prev = json.load(open(a.fallback))
            if not filings and prev.get("filings"):
                filings = prev["filings"]; stale["filings"] = (prev.get("monitor") or {}).get("filings_fetched_at") or prev.get("generated_at")
            if not news and prev.get("news"):
                news = prev["news"]; stale["news"] = (prev.get("monitor") or {}).get("news_fetched_at") or prev.get("generated_at")
        except Exception as ex:  # noqa
            print(f"[warn] fallback unreadable: {ex}")
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    doc = {"generated_at": now, "asof": m.get("asof"), "monitor": {"edges": len(out_edges), "edges_active": sum(e["active"] for e in out_edges), "entities": len(out_ents),
                                                                 "news_items": len(news), "sec_items": len(filings), "note": a.monitor_note,
                                                                 "filings_fetched_at": stale.get("filings") or now, "news_fetched_at": stale.get("news") or now,
                                                                 "filings_stale": bool(stale.get("filings")), "news_stale": bool(stale.get("news"))},
           "entities": out_ents, "edges": out_edges,
           "metrics": {k: m.get(k) for k in ("cycles", "cycles_soft", "concentration", "maturity_ladder", "structure_mix", "delta", "data_gaps_summary", "n_firm", "n_soft")},
           "news": news, "filings": filings,
           "commentary": json.load(open(a.commentary)) if a.commentary and os.path.exists(a.commentary) else None}
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    json.dump(doc, open(a.out, "w"), ensure_ascii=False)
    if a.archive:
        os.makedirs(a.archive, exist_ok=True); shutil.copy(a.out, os.path.join(a.archive, f"{now[:10]}.json"))
    print(f"site data: {a.out}  edges={len(out_edges)} entities={len(out_ents)} news={len(news)} filings={len(filings)}")


if __name__ == "__main__":
    main()
