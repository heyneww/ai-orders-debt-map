/* AI 巨头订单与债务关系图 · 前端 */
(() => {
const I18N = {
  zh: {eyebrow:"实时数据 · AI 资本流向", title:"AI 巨头订单与债务关系图", subtitle:"谁欠谁：订单、股权、债务与担保。每条边可追溯到来源，标题口径与已约束口径并列，不做估值判断。",
    search:"搜公司或交易（例如 NVDA、Beignet、残值担保）", sector:"板块", minsize:"最小金额", period:"期间", status:"状态", basis:"口径", any:"不限", alldates:"全部",
    last90:"近 90 天", last12m:"近 12 个月", st_active:"有效（含传闻/意向）", st_firm:"仅已约束", st_all:"全部（含已修订/取消）", b_headline:"标题口径", b_firm:"已约束口径",
    collapse:"SPV 折叠到发起人", v_graph:"关系图", v_table:"表格", v_cycles:"资金闭环", v_maturity:"到期墙", v_conc:"集中度", v_gaps:"数据缺口", v_delta:"本次变动", all:"全部",
    replay:"回放至", csv:"复制 CSV", rank_title:"最大敞口", rank_total:"合计", rank_borrowed:"借入", rank_orders:"订单支出", rank_guar:"担保敞口",
    rank_hint:"点击公司查看它欠谁、谁欠它、下了哪些订单。条形 = 边类型构成。", rank_note:"占位对手方（公募债投资者、未披露贷款人、未拆分银团）不参与排名。",
    latest_title:"监控最新动态", news:"新闻", filings:"SEC 申报", method_title:"口径说明",
    m1:"四类边：订单（买方→供应方）、债务（出借方→借款方）、股权（投资方→被投方）、担保（担保方→被担保主体）。箭头方向 = 资金方向。",
    m2:"标题口径 = 媒体标题金额（含 \"up to\"、多年总额）；已约束口径 = 已签约/已提款部分。两者并列，不互相替代。",
    m3:"修订不覆盖旧边：新边带 supersedes 指向旧边，统计只计最新版本。传闻/意向灰显，只有公告或申报才记为已约束。",
    m4:"SPV 是独立节点：项目债记在 SPV，承租人只以租约（订单）和残值担保（担保）出现。勾选\"折叠\"可把 SPV 并回发起人。",
    m5:"每笔只计一次、不做净额；供应链两端都计。资金闭环只是拓扑事实，不代表任何风险结论。",
    disc:"仅供参考，不构成投资建议：本站只描述交易，不做评价。金额为公司公告或具名媒体披露的名义美元；每条边附来源链接与来源等级（1 申报 / 2 新闻稿 / 3 通讯社 / 4 其他）。",
    built:"数据来自公开申报与新闻。监控按计划运行；本页每 5 分钟自检一次。",
    ORDER:"订单", DEBT:"债务", EQUITY:"股权", GUARANTEE:"担保", undisclosed:"未披露", more_undisc:"另 {n} 笔未披露金额", mix:"边类型构成", deals:"{d} 笔 · {c} 家",
    countnote:"每笔只计一次，不做净额（OpenAI→Oracle 与 Oracle→NVIDIA 都计）；修订过的交易只计最新版本。当前口径：{b}。",
    sectors:{all:"全部板块",hyperscalers:"超大规模云",labs:"模型实验室",chips:"芯片与存储",neoclouds:"Neocloud",datacenters:"数据中心开发商",energy:"电力",financiers:"资金方",spvs:"SPV / 合资",other:"其他"},
    status_:{rumored:"传闻",loi:"意向",definitive:"已签约",amended:"已修订",drawn:"已提款",completed:"已完成",cancelled:"已取消"},
    tier:{"1_filing":"申报","2_press_release":"新闻稿","3_wire":"通讯社","4_other":"其他来源"},
    money_in:"资金流入", money_out:"资金流出", deals_n:"交易数", firm_of:"其中已约束", orders_out:"订单支出（承诺采购）", orders_in:"订单收入（在手合同）", debt_in:"借入", debt_out:"出借",
    eq_in:"股权流入", eq_out:"股权流出", guar_out:"担保敞口（提供担保）", guar_in:"获得担保", in_cycles:"所在资金闭环", none:"无",
    col_date:"日期", col_type:"类型", col_deal:"交易", col_amt:"金额（标题 / 已约束）", col_status:"状态", col_src:"来源", showing:"显示 {n} 笔 · {c} 家",
    cyc_firm:"已约束口径的闭环", cyc_soft:"含传闻/意向的闭环", cyc_note:"闭环 = 资金方向上的闭合路径（A 投/借给 B，B 向 C 采购，C 向 A 采购……）。只是拓扑事实，不代表任何风险结论。按全部有效边计算，不随上方筛选变化。点击可在关系图中高亮。",
    bottleneck:"瓶颈额", headline_only:"含标题口径", mat_title:"债务到期墙（按到期年，当前口径）", mat_unknown:"未披露到期", mix_title:"融资结构 × 评级（债务边计数）",
    conc_title:"供应方按买方集中度（订单流入）", conc_sup:"供应方", conc_total:"合计", conc_top:"前三买方", gaps_title:"数据缺口 Top 10", gaps_edges:"逐边缺口（当前筛选）",
    delta_new:"新增边", delta_status:"状态变更", delta_amt:"金额修订", revised_from:"修订自", revised_by:"已被修订为", rebuilt:"数据重建于", next_check:"下次自检", edges_n:"边 / 节点", feed_n:"新闻 / 申报",
    ago_min:"{n} 分钟前", ago_h:"{n} 小时前", just:"刚刚", view_src:"来源", confidence:"置信度", basis_:{total_contract:"合同总额",annual:"年度",facility_size:"额度",drawn:"已提款"},
    in_graph:"在图中高亮", snapshot:"快照", v_title:"本期判断", v_evidence:"依据（图中可核）", v_watch:"触发条件与关注点", v_if:"若", v_then:"则", v_watchk:"关注", v_more:"展开依据与触发条件", v_less:"收起", term:"期限", years:"年", capacity:"容量", coupon:"票息", maturity:"到期", rating:"评级", collateral:"抵押", structure:"结构", cap:"上限", trigger:"触发条件", linked:"关联订单边", covered:"被担保边"},
  en: {eyebrow:"LIVE DATA · AI CAPITAL FLOWS", title:"AI Orders & Debt Map", subtitle:"Who owes whom: orders, equity, debt and guarantees. Every edge links to a source; headline and firm amounts shown side by side; no valuation calls.",
    search:"Find a company or deal (e.g. NVDA, Beignet, residual value)", sector:"Sector", minsize:"Min size", period:"Period", status:"Status", basis:"Basis", any:"Any", alldates:"All dates",
    last90:"Last 90 days", last12m:"Last 12 months", st_active:"Active (incl. rumored/LOI)", st_firm:"Firm only", st_all:"All (incl. superseded/cancelled)", b_headline:"Headline", b_firm:"Firm",
    collapse:"Collapse SPVs into sponsors", v_graph:"Graph", v_table:"Table", v_cycles:"Funding loops", v_maturity:"Maturity wall", v_conc:"Concentration", v_gaps:"Data gaps", v_delta:"Latest changes", all:"All",
    replay:"Replay to", csv:"Copy CSV", rank_title:"Largest exposures", rank_total:"Total", rank_borrowed:"Borrowed", rank_orders:"Orders placed", rank_guar:"Guarantees given",
    rank_hint:"Click a company to see who it owes, who owes it, and every order. Bar = mix of edge types.", rank_note:"Pooled counterparties (bond investors, undisclosed lenders, unsplit syndicates) are not ranked.",
    latest_title:"Latest from the monitor", news:"News", filings:"SEC filings", method_title:"Methodology",
    m1:"Four edge kinds: ORDER (buyer→supplier), DEBT (lender→borrower), EQUITY (investor→investee), GUARANTEE (guarantor→obligor). Arrow = direction of money.",
    m2:"Headline = the reported amount (incl. \"up to\", multi-year totals); firm = signed / drawn portion. Both shown, never substituted.",
    m3:"Revisions never overwrite: a new edge supersedes the old one and only the latest version is counted. Rumors/LOIs are greyed; only announcements or filings count as firm.",
    m4:"SPVs are nodes: project debt sits on the SPV; the tenant appears only via lease (ORDER) and residual-value guarantee. Tick \"collapse\" to fold SPVs into sponsors.",
    m5:"Each deal counted once, not netted; both ends of a supply chain count. Funding loops are topology, not a risk verdict.",
    disc:"For information only, not investment advice: this site describes deals and does not rate them. Amounts are nominal USD as disclosed by companies or named outlets; every edge carries a source link and tier (1 filing / 2 press release / 3 wire / 4 other).",
    built:"Built from public filings and news. The monitor runs on a schedule; this page re-checks every 5 minutes.",
    ORDER:"Order", DEBT:"Debt", EQUITY:"Equity", GUARANTEE:"Guarantee", undisclosed:"Undisclosed", more_undisc:"+{n} with no disclosed amount", mix:"Mix by edge type", deals:"{d} deals · {c} companies",
    countnote:"Each deal counted once, not netted (OpenAI→Oracle and Oracle→NVIDIA both count); revised deals count only their latest version. Basis: {b}.",
    sectors:{all:"All sectors",hyperscalers:"Hyperscalers",labs:"AI labs",chips:"Chips & memory",neoclouds:"Neoclouds",datacenters:"Data centers",energy:"Energy",financiers:"Financiers",spvs:"SPVs & JVs",other:"Other"},
    status_:{rumored:"Rumored",loi:"LOI",definitive:"Signed",amended:"Amended",drawn:"Drawn",completed:"Completed",cancelled:"Cancelled"},
    tier:{"1_filing":"Filing","2_press_release":"Press release","3_wire":"Wire","4_other":"Other"},
    money_in:"Money in", money_out:"Money out", deals_n:"Deals", firm_of:"of which firm", orders_out:"Orders placed", orders_in:"Orders received", debt_in:"Borrowed", debt_out:"Lent",
    eq_in:"Investment received", eq_out:"Investments made", guar_out:"Guarantees given", guar_in:"Guarantees received", in_cycles:"Funding loops through this node", none:"None",
    col_date:"Date", col_type:"Type", col_deal:"Deal", col_amt:"Amount (headline / firm)", col_status:"Status", col_src:"Sources", showing:"{n} deals · {c} companies",
    cyc_firm:"Loops on firm edges", cyc_soft:"Loops incl. rumored/LOI", cyc_note:"A loop is a closed path in the direction of money (A invests in B, B orders from C, C orders from A…). Topology only, not a risk verdict. Computed on all active edges, independent of the filters above. Click to highlight in the graph.",
    bottleneck:"Bottleneck", headline_only:"headline amounts", mat_title:"Debt maturity wall (by year, current basis)", mat_unknown:"Undisclosed maturity", mix_title:"Structure × rating (debt edge count)",
    conc_title:"Supplier concentration by buyer (order inflow)", conc_sup:"Supplier", conc_total:"Total", conc_top:"Top 3 buyers", gaps_title:"Top 10 data gaps", gaps_edges:"Gaps by edge (current filter)",
    delta_new:"New edges", delta_status:"Status changes", delta_amt:"Amount revisions", revised_from:"Revised from", revised_by:"Superseded by", rebuilt:"Data rebuilt", next_check:"Next check", edges_n:"Edges / nodes", feed_n:"News / filings",
    ago_min:"{n} min ago", ago_h:"{n} h ago", just:"just now", view_src:"source", confidence:"Confidence", basis_:{total_contract:"total contract",annual:"annual",facility_size:"facility size",drawn:"drawn"},
    in_graph:"Highlight in graph", snapshot:"snapshot", v_title:"Current call", v_evidence:"Evidence (verifiable on the map)", v_watch:"Triggers and what to watch", v_if:"If", v_then:"then", v_watchk:"Watch", v_more:"Show evidence and triggers", v_less:"Collapse", term:"Term", years:"yr", capacity:"Capacity", coupon:"Coupon", maturity:"Maturity", rating:"Rating", collateral:"Collateral", structure:"Structure", cap:"Cap", trigger:"Trigger", linked:"Linked order edge", covered:"Covered edge"}
};
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const KCOL = {}, SCOL = {};
function refreshColors(){
  Object.assign(KCOL,{ORDER:cssVar("--order"), DEBT:cssVar("--debt"), EQUITY:cssVar("--equity"), GUARANTEE:cssVar("--guar")});
  Object.assign(SCOL,{labs:cssVar("--s-labs"), hyperscalers:cssVar("--s-hyper"), neoclouds:cssVar("--s-neo"), chips:cssVar("--s-chips"), datacenters:cssVar("--s-dc"), spvs:cssVar("--s-spv"), financiers:cssVar("--s-fin"), energy:cssVar("--s-energy"), other:cssVar("--s-other")});
}
const KINDS = ["ORDER","DEBT","EQUITY","GUARANTEE"];
const FIRM = new Set(["definitive","amended","drawn","completed"]);
const POOLED = new Set(["public_bondholders","public_equity_investors","undisclosed_counterparty","syndicate"]);

const S = {lang:"zh", basis:"headline", kinds:new Set(KINDS), sector:"all", min:0, period:"all", status:"active", collapse:false, topn:0, view:"graph", replay:1, q:"", sel:null, hl:new Set(), rank:"total", sort:["announced_date",-1]};
let D = null, E = {}, sim = null, zoom = null, lastGen = null, nextCheck = Date.now()+300000;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const t = (k, v={}) => { let s = (I18N[S.lang][k] ?? I18N.zh[k] ?? k); if (typeof s !== "string") return s; return s.replace(/\{(\w+)\}/g,(_,x)=>v[x]); };
const nm = id => { const e = E[id]; return e ? (S.lang==="zh" ? (e.name_zh||e.name) : e.name) : id; };
const fmt = v => v==null ? t("undisclosed") : v>=1e6 ? `$${(v/1e6).toFixed(2)}T` : v>=1000 ? `$${(v/1000).toFixed(v>=100000?0:1)}B` : `$${Math.round(v)}M`;
const amt = e => S.basis==="headline" ? e.amount_headline_musd : e.amount_firm_musd;
const esc = s => String(s??"").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const tierCls = tr => "tag t"+(tr||"4_other")[0];
const tagStatus = st => `<span class="tag st_${st}">${t("status_")[st]||st}</span>`;
const tagTier = tr => `<span class="${tierCls(tr)}">${t("tier")[tr]||tr}</span>`;

/* ---------- data ---------- */
async function load(force){
  const snap = new URLSearchParams(location.search).get("snapshot");
  const url = snap ? `data/archive/${snap}.json` : `data/graph.json?t=${Date.now()}`;
  const r = await fetch(url); if(!r.ok) throw new Error(url);
  const d = await r.json();
  if(!force && lastGen === d.generated_at) return false;
  D = d; lastGen = d.generated_at; E = Object.fromEntries(d.entities.map(e=>[e.id,e]));
  const dates = d.edges.map(e=>e.announced_date).filter(Boolean).sort(); S.dmin = dates[0]; S.dmax = d.asof || dates[dates.length-1];
  return true;
}
function endpoint(id){ if(!S.collapse) return id; const e=E[id]; return (e && e.type==="spv" && e.parent && E[e.parent]) ? e.parent : id; }
function baseEdges(){
  return D.edges.filter(e => S.status==="all" ? true : S.status==="firm" ? (e.active && e.firm) : e.active);
}
function periodOk(e){
  const d = e.announced_date||""; if(S.period==="all") return true;
  if(/^\d{4}$/.test(S.period)) return d.startsWith(S.period);
  const days = S.period==="90d"?90:365; const lim = new Date(Date.now()-days*864e5).toISOString().slice(0,10); return d>=lim;
}
function replayDate(){ const a=new Date(S.dmin).getTime(), b=new Date(S.dmax).getTime(); return new Date(a+(b-a)*S.replay).toISOString().slice(0,10); }
function matchQ(e){
  if(!S.q) return true; const q=S.q.toLowerCase();
  const names = [e.from,e.to].flatMap(id=>{const x=E[id]; return x?[x.name,x.name_zh,x.ticker,...(x.aliases||[])]:[id]});
  return [...names, e.title_zh, e.title_en, e.edge_id, e.notes].some(s=>s && String(s).toLowerCase().includes(q));
}
function filtered(opts={}){
  const rd = replayDate();
  return baseEdges().filter(e=>{
    if(!opts.ignoreKind && !S.kinds.has(e.kind)) return false;
    if(S.sector!=="all"){ const sf=E[endpoint(e.from)]?.sector, st=E[endpoint(e.to)]?.sector; if(sf!==S.sector && st!==S.sector) return false; }
    const a = amt(e); if(S.min>0 && !(a>=S.min)) return false;
    if(!periodOk(e)) return false;
    if(e.announced_date && e.announced_date>rd) return false;
    if(S.collapse && endpoint(e.from)===endpoint(e.to)) return false;
    return matchQ(e);
  });
}
function nodeTotals(edges){
  const tot = {};
  for(const e of edges){ const a=amt(e)||0; for(const id of [endpoint(e.from),endpoint(e.to)]){ tot[id]=(tot[id]||0)+a; } }
  return tot;
}

/* ---------- i18n & chrome ---------- */
function applyI18n(){
  document.documentElement.lang = S.lang;
  $$("[data-i18n]").forEach(el=>{ const k=el.dataset.i18n; const v=t(k); if(typeof v==="string") el.textContent=v; });
  $$("[data-i18n-ph]").forEach(el=>el.placeholder=t(el.dataset.i18nPh));
  $$(".lang button").forEach(b=>b.classList.toggle("on",b.dataset.lang===S.lang));
  const sec=$("#f_sector"); const cur=sec.value||"all"; sec.innerHTML=Object.entries(t("sectors")).map(([k,v])=>`<option value="${k}">${v}</option>`).join(""); sec.value=cur;
  document.title = t("title");
}
function ago(iso){ const m=Math.round((Date.now()-new Date(iso).getTime())/60000); return m<1?t("just"):m<60?t("ago_min",{n:m}):t("ago_h",{n:Math.round(m/60)}); }
function renderLive(){
  $("#livetext").textContent = `${S.lang==="zh"?"更新于":"Updated"} ${ago(D.generated_at)}`;
  const snap = new URLSearchParams(location.search).get("snapshot");
  $("#livepop").innerHTML = `<div><span>${t("rebuilt")}</span><b>${D.generated_at.replace("T"," ").replace("Z"," UTC")}</b></div>
    <div><span>${t("edges_n")}</span><b>${D.monitor.edges_active} / ${D.monitor.entities}</b></div>
    <div><span>${t("feed_n")}</span><b>${D.monitor.news_items} / ${D.monitor.sec_items}</b></div>
    <div><span>${t("next_check")}</span><b id="nextchk">${Math.max(0,Math.round((nextCheck-Date.now())/60000))} min</b></div>
    ${snap?`<div><span>${t("snapshot")}</span><b>${snap}</b></div>`:""}`;
}

/* ---------- cards & chips ---------- */
function renderCards(edges){
  const sum={}, und={}; for(const k of KINDS){sum[k]=0;und[k]=0;}
  for(const e of edges){ const a=amt(e); if(a==null) und[e.kind]++; else sum[e.kind]+=a; }
  const total = KINDS.reduce((s,k)=>s+sum[k],0)||1;
  const ids = new Set(edges.flatMap(e=>[endpoint(e.from),endpoint(e.to)]));
  $("#cards").innerHTML = KINDS.map(k=>`<div class="card" style="--c:${KCOL[k]}"><div class="k">${t(k)}</div><div class="v">${fmt(sum[k])}</div><div class="s">${t("more_undisc",{n:und[k]})}</div></div>`).join("")+
    `<div class="card" style="--c:#999"><div class="k">${t("mix")}</div><div class="mix">${KINDS.map(k=>`<i style="width:${100*sum[k]/total}%;background:${KCOL[k]}"></i>`).join("")}</div>
     <div class="mixleg">${KINDS.map(k=>`<span><i style="background:${KCOL[k]}"></i>${t(k)} ${Math.round(100*sum[k]/total)}%</span>`).join("")}</div><div class="s" style="margin-top:4px">${t("deals",{d:edges.length,c:ids.size})}</div></div>`;
  $("#countnote").textContent = t("countnote",{b:t(S.basis==="headline"?"b_headline":"b_firm")});
}
function renderChips(){
  const all = filtered({ignoreKind:true}); const cnt={}; KINDS.forEach(k=>cnt[k]=0); all.forEach(e=>cnt[e.kind]++);
  $("#kindchips").innerHTML = KINDS.map(k=>`<button class="chip ${S.kinds.has(k)?"":"off"}" data-k="${k}" style="--c:${KCOL[k]}"><i></i>${t(k)} <b>${cnt[k]}</b></button>`).join("");
  $$("#kindchips .chip").forEach(b=>b.onclick=()=>{ const k=b.dataset.k; S.kinds.has(k)?S.kinds.delete(k):S.kinds.add(k); renderAll(); });
}

/* ---------- graph ---------- */
function renderGraph(edges){
  const svg = d3.select("#svg"); const W = svg.node().clientWidth, H = svg.node().clientHeight;
  svg.selectAll("*").remove();
  const g = svg.append("g");
  // svg 无 width/height 属性时 d3-zoom 的默认 extent 为 0×0，过渡插值会产生 NaN；显式给 extent
  zoom = d3.zoom().scaleExtent([.25,5]).extent([[0,0],[W,H]]).translateExtent([[-4000,-4000],[4000+W,4000+H]]).on("zoom",ev=>g.attr("transform",ev.transform)); svg.call(zoom);
  const defs = svg.append("defs");
  for(const [k,c] of Object.entries({...KCOL, soft:cssVar("--soft"), hl:cssVar("--hl")})) defs.append("marker").attr("id","arr_"+k).attr("viewBox","0 -5 10 10").attr("refX",14).attr("markerWidth",5).attr("markerHeight",5).attr("orient","auto").append("path").attr("d","M0,-5L10,0L0,5").attr("fill",c);
  const tot = nodeTotals(edges);
  let ids = Object.keys(tot); if(S.topn>0) ids = ids.sort((a,b)=>tot[b]-tot[a]).slice(0,S.topn);
  const idset = new Set(ids);
  const es = edges.filter(e=>idset.has(endpoint(e.from))&&idset.has(endpoint(e.to)));
  const nodes = ids.map(id=>({id, ...(E[id]||{name:id,sector:"other"}), tot:tot[id]||0}));
  const nm_ = Object.fromEntries(nodes.map(n=>[n.id,n]));
  const links = es.map(e=>({source:nm_[endpoint(e.from)], target:nm_[endpoint(e.to)], e}));
  $("#viewcount").textContent = t("showing",{n:es.length,c:nodes.length});
  const r = n => 5 + Math.sqrt((n.tot||0)/1000)*1.6;
  const link = g.append("g").selectAll("path").data(links).join("path").attr("fill","none")
    .attr("stroke",l=>S.hl.size? (S.hl.has(l.e.edge_id)?cssVar("--hl"):cssVar("--track")) : (l.e.firm?KCOL[l.e.kind]:cssVar("--soft")))
    .attr("stroke-width",l=>Math.max(1,Math.log10((amt(l.e)||1)+1)*1.1))
    .attr("stroke-dasharray",l=>l.e.firm?null:"4,4").attr("opacity",l=>S.hl.size&&!S.hl.has(l.e.edge_id)?.25:.8)
    .attr("marker-end",l=>`url(#arr_${S.hl.size?(S.hl.has(l.e.edge_id)?"hl":"soft"):(l.e.firm?l.e.kind:"soft")})`)
    .style("cursor","pointer").on("click",(ev,l)=>openEdge(l.e));
  link.append("title").text(l=>`${S.lang==="zh"?l.e.title_zh:l.e.title_en}\n${t("status_")[l.e.status]} · ${l.e.announced_date}`);
  const node = g.append("g").selectAll("g").data(nodes).join("g").style("cursor","pointer")
    .call(d3.drag().on("start",(ev,d)=>{if(!ev.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y}).on("drag",(ev,d)=>{d.fx=ev.x;d.fy=ev.y}).on("end",(ev,d)=>{if(!ev.active)sim.alphaTarget(0);d.fx=null;d.fy=null}))
    .on("click",(ev,d)=>{ev.stopPropagation(); selectNode(d.id);});
  node.append("circle").attr("r",r).attr("fill",d=>SCOL[d.sector]||cssVar("--muted")).attr("stroke",d=>d.id===S.sel?cssVar("--hl"):cssVar("--halo")).attr("stroke-width",d=>d.id===S.sel?3:1.5).attr("opacity",d=>S.sel&&d.id!==S.sel&&!links.some(l=>(l.source.id===S.sel&&l.target.id===d.id)||(l.target.id===S.sel&&l.source.id===d.id))?.35:1);
  const big = nodes.slice().sort((a,b)=>b.tot-a.tot).slice(0,40).map(n=>n.id);
  const short = id => { const s=nm(id); return s.length>26 ? s.slice(0,24)+"…" : s; };
  node.append("text").text(d=>short(d.id)).attr("dy",d=>-r(d)-3).attr("text-anchor","middle").style("font-size",d=>big.includes(d.id)?"11px":"9px").style("fill",d=>big.includes(d.id)?cssVar("--fg"):cssVar("--muted")).style("paint-order","stroke").style("stroke",cssVar("--halo")).style("stroke-width","3px");
  node.append("title").text(d=>`${nm(d.id)} · ${fmt(d.tot)}`);
  if(sim){ sim.stop(); sim.on("tick",null).on("end",null); }
  sim = d3.forceSimulation(nodes).force("link",d3.forceLink(links).distance(l=>70+Math.min(60,(amt(l.e)||0)/5000)).strength(.35))
    .force("charge",d3.forceManyBody().strength(-260)).force("center",d3.forceCenter(W/2,H/2)).force("x",d3.forceX(W/2).strength(.05)).force("y",d3.forceY(H/2).strength(.07)).force("col",d3.forceCollide(d=>r(d)+6))
    .on("tick",()=>{ link.attr("d",l=>{const dx=l.target.x-l.source.x,dy=l.target.y-l.source.y,dr=Math.hypot(dx,dy)*1.7;return `M${l.source.x},${l.source.y}A${dr},${dr} 0 0,1 ${l.target.x},${l.target.y}`}); node.attr("transform",d=>`translate(${d.x},${d.y})`); })
    .on("end",function(){ if(this!==sim || !nodes.length || !W || !H) return; const xs=nodes.map(n=>n.x), ys=nodes.map(n=>n.y); if(!xs.every(Number.isFinite)||!ys.every(Number.isFinite)) return;
      const x0=Math.min(...xs)-40,x1=Math.max(...xs)+40,y0=Math.min(...ys)-40,y1=Math.max(...ys)+40; const k=Math.min(1.6,.95/Math.max((x1-x0)/W,(y1-y0)/H,1e-6)); if(!Number.isFinite(k)) return;
      svg.transition().duration(500).call(zoom.transform,d3.zoomIdentity.translate(W/2,H/2).scale(k).translate(-(x0+x1)/2,-(y0+y1)/2)); });
  svg.on("click",()=>{ if(S.sel){S.sel=null; $("#detail").classList.add("hidden"); renderGraph(filtered());} });
  $("#legend").innerHTML = Object.entries(t("sectors")).filter(([k])=>k!=="all").map(([k,v])=>`<span><i style="background:${SCOL[k]}"></i>${v}</span>`).join("")+
    KINDS.map(k=>`<span><i style="border-radius:0;height:2px;width:14px;background:${KCOL[k]}"></i>${t(k)}</span>`).join("")+`<span><i style="border-radius:0;height:2px;width:14px;background:${cssVar("--soft")}"></i>${t("status_").rumored}/${t("status_").loi}</span>`;
  $("#zin").onclick=()=>svg.transition().call(zoom.scaleBy,1.4); $("#zout").onclick=()=>svg.transition().call(zoom.scaleBy,.7); $("#zfit").onclick=()=>svg.transition().call(zoom.transform,d3.zoomIdentity);
}

/* ---------- table ---------- */
function dealRow(e){
  const h=e.amount_headline_musd, f=e.amount_firm_musd; const bar = h? Math.min(100, 100*(f||0)/h) : 0;
  return `<tr><td class="mono">${e.announced_date||""}</td><td><span style="color:${KCOL[e.kind]};font-weight:600">${t(e.kind)}</span></td>
    <td class="deal-cell" data-id="${e.edge_id}"><b>${esc(S.lang==="zh"?e.title_zh:e.title_en)}</b><div class="mono">${esc(nm(e.from))} → ${esc(nm(e.to))}${e.supersedes?` · ${t("revised_from")} ${e.supersedes}`:""}${e.superseded_by?` · ${t("revised_by")} ${e.superseded_by}`:""}</div></td>
    <td class="amt">${fmt(h)}<small>${f==null?t("undisclosed"):fmt(f)}</small><div class="bar" style="--c:${KCOL[e.kind]}"><i style="width:${bar}%"></i></div></td>
    <td>${tagStatus(e.status)}<br>${tagTier(e.source_tier)}</td><td><a href="${esc(e.source_url)}" target="_blank" rel="noopener">${t("view_src")} ↗</a>${(e.data_gaps||[]).length?`<div class="gap">⚠ ${e.data_gaps.length}</div>`:""}</td></tr>`;
}
function renderTable(edges){
  const [k,dir]=S.sort; const val=e=>k==="amount"?(amt(e)??-1):k==="kind"?e.kind:k==="status"?e.status:(e[k]||"");
  const rows = edges.slice().sort((a,b)=>(val(a)>val(b)?1:val(a)<val(b)?-1:0)*dir);
  const th=(key,label)=>`<th data-k="${key}">${label} ${S.sort[0]===key?(dir>0?"▲":"▼"):"↕"}</th>`;
  $("#v_table").innerHTML = `<table class="tbl"><thead><tr>${th("announced_date",t("col_date"))}${th("kind",t("col_type"))}<th>${t("col_deal")}</th>${th("amount",t("col_amt"))}${th("status",t("col_status"))}<th>${t("col_src")}</th></tr></thead><tbody>${rows.map(dealRow).join("")}</tbody></table>`;
  $$("#v_table th[data-k]").forEach(h=>h.onclick=()=>{ const key=h.dataset.k; S.sort=[key, S.sort[0]===key?-S.sort[1]:-1]; renderTable(filtered()); });
  $$("#v_table .deal-cell").forEach(c=>c.onclick=()=>openEdge(D.edges.find(e=>e.edge_id===c.dataset.id)));
  $("#viewcount").textContent = t("showing",{n:rows.length,c:new Set(rows.flatMap(e=>[endpoint(e.from),endpoint(e.to)])).size});
}

/* ---------- side views ---------- */
function cycHtml(c,i,soft){ return `<div class="cyc" data-i="${i}" data-s="${soft?1:0}"><div><div class="path">${c.nodes.map(nm).join(" → ")}</div><div class="kinds">${c.kinds.map(k=>t(k)).join(" / ")}${c.has_headline_only?` · ${t("headline_only")}`:""}</div></div><div><b>${t("bottleneck")} ${c.bottleneck_musd>0?fmt(c.bottleneck_musd):t("undisclosed")}</b></div></div>`; }
function renderCycles(){
  const M=D.metrics; const firm=M.cycles||[], soft=(M.cycles_soft||[]).filter(c=>!firm.some(f=>f.edges.join()===c.edges.join()));
  $("#v_cycles").innerHTML = `<div class="pad"><p class="fine">${t("cyc_note")}</p><h3>${t("cyc_firm")}（${firm.length}）</h3>${firm.map((c,i)=>cycHtml(c,i,false)).join("")||`<p class="fine">${t("none")}</p>`}<h3>${t("cyc_soft")}（${soft.length}）</h3>${soft.map((c,i)=>cycHtml(c,i,true)).join("")}</div>`;
  $$("#v_cycles .cyc").forEach(el=>el.onclick=()=>{ const c=(el.dataset.s==="1"?soft:firm)[+el.dataset.i]; S.hl=new Set(c.edges); S.view="graph"; S.sel=null; renderAll(); });
}
function renderMaturity(edges){
  const lad={}; let unk=0; for(const e of edges){ if(e.kind!=="DEBT") continue; if(e.end_date && e.end_date < (D.asof||"")) continue; /* 已偿还/已到期的不进到期墙 */ const y=(e.debt?.maturity_date||"").slice(0,4); const a=amt(e)||0; if(!y){unk+=a;continue;} lad[y]=(lad[y]||0)+a; }
  const ys=Object.keys(lad).sort(); const mx=Math.max(1,...Object.values(lad));
  const mix=D.metrics.structure_mix||{};
  $("#v_maturity").innerHTML = `<div class="pad"><h3>${t("mat_title")}</h3><svg width="100%" height="260" viewBox="0 0 900 260">${ys.map((y,i)=>{const w=900/Math.max(ys.length,1); const h=200*lad[y]/mx; return `<g transform="translate(${i*w},0)"><rect x="4" y="${220-h}" width="${w-8}" height="${h}" fill="${KCOL.DEBT}" opacity=".85"><title>${y}: ${fmt(lad[y])}</title></rect><text x="${w/2}" y="236" text-anchor="middle" font-size="10" fill="currentColor">${y}</text><text x="${w/2}" y="${215-h}" text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">${fmt(lad[y])}</text></g>`}).join("")}</svg>
    <p class="fine">${t("mat_unknown")}: ${fmt(unk)}</p><h3>${t("mix_title")}</h3><table class="tbl"><tbody>${Object.entries(mix).sort().map(([k,v])=>`<tr><td>${k.replace("|"," · ")}</td><td class="amt">${v}</td></tr>`).join("")}</tbody></table></div>`;
}
function renderConc(){
  const C=D.metrics.concentration||{};
  $("#v_conc").innerHTML = `<div class="pad"><h3>${t("conc_title")}</h3><table class="tbl"><thead><tr><th>${t("conc_sup")}</th><th>${t("conc_total")}</th><th>HHI</th><th>${t("conc_top")}</th></tr></thead><tbody>${Object.entries(C).filter(([,v])=>v.total_musd).sort((a,b)=>b[1].total_musd-a[1].total_musd).map(([s,v])=>`<tr><td><b>${nm(s)}</b></td><td>${fmt(v.total_musd)}</td><td>${v.hhi??"n/a"}</td><td>${v.top3.map(x=>`${nm(x.buyer)} ${x.share==null?"n/a":Math.round(x.share*100)+"%"}`).join("<br>")}</td></tr>`).join("")}</tbody></table></div>`;
}
function renderGaps(edges){
  const G=D.metrics.data_gaps_summary||[];
  $("#v_gaps").innerHTML = `<div class="pad"><h3>${t("gaps_title")}</h3><table class="tbl"><tbody>${G.map(([g,n])=>`<tr><td class="gap">${esc(g)}</td><td class="amt">${n}</td></tr>`).join("")}</tbody></table>
    <h3>${t("gaps_edges")}</h3><table class="tbl"><tbody>${edges.filter(e=>(e.data_gaps||[]).length).map(e=>`<tr><td class="deal-cell" data-id="${e.edge_id}"><b>${esc(S.lang==="zh"?e.title_zh:e.title_en)}</b></td><td class="gap">${e.data_gaps.map(esc).join("；")}</td></tr>`).join("")}</tbody></table></div>`;
  $$("#v_gaps .deal-cell").forEach(c=>c.onclick=()=>openEdge(D.edges.find(e=>e.edge_id===c.dataset.id)));
}
function renderDelta(){
  const d=D.metrics.delta||{new:[],status_changed:[],amount_changed:[]}; const byId=Object.fromEntries(D.edges.map(e=>[e.edge_id,e]));
  const sec=(k,lab)=>`<h3>${lab}（${d[k].length}）</h3><table class="tbl"><tbody>${d[k].map(id=>byId[id]).filter(Boolean).map(dealRow).join("")}</tbody></table>`;
  $("#v_delta").innerHTML = `<div class="pad">${sec("new",t("delta_new"))}${sec("status_changed",t("delta_status"))}${sec("amount_changed",t("delta_amt"))}</div>`;
  $$("#v_delta .deal-cell").forEach(c=>c.onclick=()=>openEdge(byId[c.dataset.id]));
}

/* ---------- rank & feeds ---------- */
function renderRank(edges){
  const acc={};
  for(const e of edges){ const a=amt(e)||0; const f=endpoint(e.from), to=endpoint(e.to);
    for(const id of [f,to]){ acc[id] ??= {total:0,debt_in:0,order_out:0,guar:0,mix:{ORDER:0,DEBT:0,EQUITY:0,GUARANTEE:0}}; acc[id].total+=a; acc[id].mix[e.kind]+=a; }
    if(e.kind==="DEBT") acc[to].debt_in+=a; if(e.kind==="ORDER") acc[f].order_out+=a; if(e.kind==="GUARANTEE") acc[f].guar+=a; }
  const rows=Object.entries(acc).filter(([id])=>!POOLED.has(id)).sort((a,b)=>b[1][S.rank]-a[1][S.rank]).slice(0,12);
  $("#rank").innerHTML = rows.map(([id,v],i)=>{const m=v.mix, tot=v.total||1; return `<li data-id="${id}"><span class="n">${i+1}</span><div><div class="nm">${nm(id)}</div><div class="stack">${KINDS.map(k=>`<i style="width:${100*m[k]/tot}%;background:${KCOL[k]}"></i>`).join("")}</div></div><div class="v">${fmt(v[S.rank])}<small>${E[id]?.ticker||""}</small></div></li>`}).join("");
  $$("#rank li").forEach(li=>li.onclick=()=>{ S.view="graph"; selectNode(li.dataset.id); window.scrollTo({top:$(".panel").offsetTop-10,behavior:"smooth"}); });
}
function renderFeeds(){
  $("#news").innerHTML = (D.news||[]).slice(0,120).map(n=>`<li><a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a><div class="m"><span>${n.date||""}</span><span>· ${esc(n.publisher||"")}</span>${n.lang==="zh"?'<span class="tag">中</span>':""}${(n.entities||[]).map(id=>`<span class="tag">${nm(id)}</span>`).join("")}</div></li>`).join("");
  $("#filings").innerHTML = (D.filings||[]).map(f=>`<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.company)} ${esc(f.form)}${f.title&&f.title!==f.form?`: ${esc(f.title)}`:""}</a><div class="m"><span class="tag">${esc(f.form)}</span>${(f.items||[]).length?`<span>Item ${f.items.join(", ")}</span>`:""}<span>${f.filed}</span></div></li>`).join("");
}

/* ---------- detail & modal ---------- */
function dealItem(e,other){
  return `<div class="deal" data-id="${e.edge_id}"><div class="h"><span>${esc(nm(other))}</span><span class="amt" style="color:${KCOL[e.kind]}">${fmt(amt(e))}</span></div><div class="t">${esc(S.lang==="zh"?e.title_zh:e.title_en)}</div>
    <div class="m"><span>${e.announced_date||""}</span>${tagStatus(e.status)}${tagTier(e.source_tier)}${e.amount_firm_musd!=null&&S.basis==="headline"?`<span>${t("firm_of")} ${fmt(e.amount_firm_musd)}</span>`:""}${e.supersedes?`<span class="tag">${t("revised_from")} ${e.supersedes}</span>`:""}</div>
    ${(e.data_gaps||[]).length?`<div class="gap">⚠ ${e.data_gaps.map(esc).join("；")}</div>`:""}</div>`;
}
function selectNode(id){
  S.sel=id; const all=baseEdges().filter(e=>endpoint(e.from)===id||endpoint(e.to)===id);
  const x=E[id]||{name:id}; const inS=all.filter(e=>endpoint(e.to)===id), outS=all.filter(e=>endpoint(e.from)===id);
  const sum=l=>l.reduce((s,e)=>s+(amt(e)||0),0); const sumF=l=>l.reduce((s,e)=>s+(e.amount_firm_musd||0),0);
  const sec=(lab,k,list,otherKey)=>list.length?`<div class="sec" style="--c:${KCOL[k]}"><span><i></i>${lab}</span><span>${fmt(sum(list))}</span></div>${list.sort((a,b)=>(amt(b)||0)-(amt(a)||0)).map(e=>dealItem(e,otherKey==="from"?e.from:e.to)).join("")}`:"";
  const cyc=(D.metrics.cycles||[]).filter(c=>c.nodes.includes(id));
  $("#detail").innerHTML = `<button class="close" id="dclose">×</button><span class="tag">${t("sectors")[x.sector]||x.sector||""}</span><h2>${esc(nm(id))}</h2><p class="fine">${x.ticker?x.ticker+" · ":""}${esc(x.name)}${x.parent?` · ← ${esc(nm(x.parent))}`:""}</p>
    <div class="kpis"><div class="kpi" style="--c:#1e8a5a"><div class="k">${t("money_in")}</div><div class="v">${fmt(sum(inS))}</div><div class="s">${t("firm_of")} ${fmt(sumF(inS))}</div></div><div class="kpi" style="--c:#d2552b"><div class="k">${t("money_out")}</div><div class="v">${fmt(sum(outS))}</div><div class="s">${t("firm_of")} ${fmt(sumF(outS))}</div></div><div class="kpi"><div class="k">${t("deals_n")}</div><div class="v">${all.length}</div><div class="s">${new Set(all.map(e=>endpoint(e.from)===id?endpoint(e.to):endpoint(e.from))).size} ${S.lang==="zh"?"家对手方":"counterparties"}</div></div></div>
    ${sec(t("orders_out"),"ORDER",outS.filter(e=>e.kind==="ORDER"),"to")}${sec(t("debt_in"),"DEBT",inS.filter(e=>e.kind==="DEBT"),"from")}${sec(t("eq_in"),"EQUITY",inS.filter(e=>e.kind==="EQUITY"),"from")}${sec(t("guar_in"),"GUARANTEE",inS.filter(e=>e.kind==="GUARANTEE"),"from")}
    ${sec(t("orders_in"),"ORDER",inS.filter(e=>e.kind==="ORDER"),"from")}${sec(t("debt_out"),"DEBT",outS.filter(e=>e.kind==="DEBT"),"to")}${sec(t("eq_out"),"EQUITY",outS.filter(e=>e.kind==="EQUITY"),"to")}${sec(t("guar_out"),"GUARANTEE",outS.filter(e=>e.kind==="GUARANTEE"),"to")}
    <div class="sec"><span>${t("in_cycles")}</span><span>${cyc.length}</span></div>${cyc.map((c,i)=>`<div class="cyc" data-i="${i}"><div class="path">${c.nodes.map(nm).join(" → ")}</div><b>${c.bottleneck_musd>0?fmt(c.bottleneck_musd):t("undisclosed")}</b></div>`).join("")||`<p class="fine">${t("none")}</p>`}`;
  $("#detail").classList.remove("hidden"); $("#dclose").onclick=()=>{S.sel=null;$("#detail").classList.add("hidden");renderGraph(filtered());};
  $$("#detail .deal").forEach(d=>d.onclick=()=>openEdge(D.edges.find(e=>e.edge_id===d.dataset.id)));
  $$("#detail .cyc").forEach(el=>el.onclick=()=>{S.hl=new Set(cyc[+el.dataset.i].edges); S.view="graph"; renderAll();});
  if(S.view==="graph") renderGraph(filtered());
}
function openEdge(e){
  if(!e) return; const sub=e.order||e.debt||e.equity||e.guarantee||{};
  const kv=[[t("col_type"),t(e.kind)],["ID",e.edge_id],[S.lang==="zh"?"方向":"Direction",`${nm(e.from)} → ${nm(e.to)}`],[t("b_headline"),`${fmt(e.amount_headline_musd)} (${t("basis_")[e.amount_basis]||e.amount_basis||""})`],[t("b_firm"),fmt(e.amount_firm_musd)],
    [t("col_status"),tagStatus(e.status)],[t("confidence"),e.confidence||""],[t("col_date"),`${e.announced_date||""}${e.effective_date?` · eff. ${e.effective_date}`:""}${e.end_date?` · → ${e.end_date}`:""}`],[t("col_src"),`${tagTier(e.source_tier)} <a href="${esc(e.source_url)}" target="_blank" rel="noopener">${esc(e.source_url)}</a>`]];
  if(e.order){ if(e.order.term_years) kv.push([t("term"),`${e.order.term_years} ${t("years")}`]); if(e.order.capacity_gw) kv.push([t("capacity"),`${e.order.capacity_gw} ${e.order.capacity_units||"GW"}`]); }
  if(e.debt){ kv.push([t("structure"),`${e.debt.instrument||""} · ${e.debt.structure_type||""}`]); if(e.debt.coupon_pct!=null) kv.push([t("coupon"),`${e.debt.coupon_pct}%`]); if(e.debt.maturity_date) kv.push([t("maturity"),e.debt.maturity_date]); if(e.debt.rating?.grade) kv.push([t("rating"),`${e.debt.rating.agency||""} ${e.debt.rating.grade}`]); if(e.debt.collateral) kv.push([t("collateral"),e.debt.collateral]); }
  if(e.equity){ kv.push([t("structure"),e.equity.form||""]); if(e.equity.linked_order_edge) kv.push([t("linked"),e.equity.linked_order_edge]); }
  if(e.guarantee){ kv.push([t("structure"),e.guarantee.form||""]); if(e.guarantee.cap_musd!=null) kv.push([t("cap"),fmt(e.guarantee.cap_musd)]); if(e.guarantee.trigger) kv.push([t("trigger"),e.guarantee.trigger]); if(e.guarantee.covered_edge) kv.push([t("covered"),e.guarantee.covered_edge]); }
  const chain=[]; let cur=e; while(cur&&cur.supersedes){ const p=D.edges.find(x=>x.edge_id===cur.supersedes); if(!p) break; chain.unshift(p); cur=p; } let nx=e; while(nx&&nx.superseded_by){ const n=D.edges.find(x=>x.edge_id===nx.superseded_by); if(!n) break; chain.push(n); nx=n; }
  $("#mbody").innerHTML = `<span class="tag" style="background:${KCOL[e.kind]};color:var(--halo)">${t(e.kind)}</span><h2 style="margin:6px 0">${esc(S.lang==="zh"?e.title_zh:e.title_en)}</h2><dl class="kv">${kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
    ${(e.data_gaps||[]).length?`<p class="gap">⚠ ${e.data_gaps.map(esc).join("；")}</p>`:""}${e.notes?`<p class="fine">${esc(e.notes)}</p>`:""}
    ${chain.length?`<div class="chain">${S.lang==="zh"?"修订链":"Revision chain"}：${chain.map(x=>`${x.edge_id===e.edge_id?"<b>":""}${x.edge_id} (${x.announced_date}, ${fmt(x.amount_headline_musd)}, ${t("status_")[x.status]})${x.edge_id===e.edge_id?"</b>":""}`).join(" → ")}</div>`:""}
    <p><button class="btn" id="mhl">${t("in_graph")}</button></p>`;
  $("#modal").classList.remove("hidden"); $("#mhl").onclick=()=>{ S.hl=new Set([e.edge_id]); S.view="graph"; $("#modal").classList.add("hidden"); renderAll(); };
}

/* ---------- csv ---------- */
function csv(edges){
  const cols=["edge_id","kind","from","to","announced_date","effective_date","end_date","amount_headline_musd","amount_firm_musd","amount_basis","status","supersedes","superseded_by","source_tier","source_url","confidence","data_gaps","title_zh","title_en"];
  const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  const body=[cols.join(",")].concat(edges.map(e=>cols.map(c=>q(Array.isArray(e[c])?e[c].join("; "):e[c])).join(","))).join("\n");
  const done=()=>toast(S.lang==="zh"?`已复制 ${edges.length} 行 CSV，可直接粘贴到 Excel`:`Copied ${edges.length} rows of CSV; paste into Excel`);
  const fallback=()=>{ const ta=document.createElement("textarea"); ta.value=body; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); done(); }catch(_){ toast("copy failed"); } ta.remove(); };
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(body).then(done).catch(fallback); } else fallback();
}
function toast(msg){ const el=document.createElement("div"); el.className="toast"; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2600); }

/* ---------- orchestration ---------- */
function renderVerdict(){
  const c=D.commentary; const el=$("#verdict"); if(!c||!c[S.lang]){ el.classList.add("hidden"); return; }
  const v=c[S.lang];
  el.innerHTML=`<div class="vh"><span class="tag" style="background:var(--debt);color:var(--halo)">${t("v_title")}</span><h2>${esc(v.stance)}</h2><span class="fine">${c.asof}</span></div>
    <p class="vt">${esc(v.verdict)}</p>
    <details><summary>${t("v_more")}</summary><div class="vg" style="margin-top:8px"><div><h3>${t("v_evidence")}</h3><ul>${(v.evidence||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
    <div><h3>${t("v_watch")}</h3><ul class="w">${(v.watch||[]).map(w=>`<li><span class="k">${t("v_if")}</span>${esc(w.if)}<br><span class="k">${t("v_then")}</span><b>${esc(w.then)}</b><br><span class="k">${t("v_watchk")}</span>${esc(w.watch)}</li>`).join("")}</ul></div></div>
    <p class="fine" style="margin:8px 0 0">${esc(S.lang==="zh"?c.basis:c.basis_en)} ${esc(v.note||"")}</p></details>`;
  el.classList.remove("hidden");
}
function renderAll(){
  refreshColors(); applyI18n(); renderLive(); renderVerdict();
  const edges=filtered();
  renderCards(edges); renderChips();
  $$("#views button").forEach(b=>b.classList.toggle("on",b.dataset.view===S.view));
  $$(".view").forEach(v=>v.classList.toggle("hidden",v.id!=="v_"+S.view));
  $("#replaydate").textContent=replayDate();
  if(S.view==="graph") renderGraph(edges); else if(S.view==="table") renderTable(edges); else if(S.view==="cycles") renderCycles(); else if(S.view==="maturity") renderMaturity(edges); else if(S.view==="conc") renderConc(); else if(S.view==="gaps") renderGaps(edges); else if(S.view==="delta") renderDelta();
  if(S.view!=="graph"&&S.view!=="table") $("#viewcount").textContent="";
  renderRank(edges); renderFeeds();
  if(S.sel && !$("#detail").classList.contains("hidden")) selectNode(S.sel);
  $("#csv").textContent=`${t("csv")} (${edges.length})`;
}
function bind(){
  $$(".lang button").forEach(b=>b.onclick=()=>{S.lang=b.dataset.lang; try{localStorage.setItem("lang",S.lang);}catch(_){} renderAll();});
  $("#livebtn").onclick=()=>$("#livepop").classList.toggle("hidden");
  $("#search").oninput=ev=>{S.q=ev.target.value.trim(); S.hl=new Set(); renderAll();};
  $("#f_sector").onchange=ev=>{S.sector=ev.target.value; renderAll();}; $("#f_min").onchange=ev=>{S.min=+ev.target.value; renderAll();};
  $("#f_period").onchange=ev=>{S.period=ev.target.value; renderAll();}; $("#f_status").onchange=ev=>{S.status=ev.target.value; renderAll();};
  $("#f_basis").onchange=ev=>{S.basis=ev.target.value; renderAll();}; $("#f_collapse").onchange=ev=>{S.collapse=ev.target.checked; S.sel=null; $("#detail").classList.add("hidden"); renderAll();};
  $$("#views button").forEach(b=>b.onclick=()=>{S.view=b.dataset.view; if(S.view!=="graph") S.hl=new Set(); renderAll();});
  $$("#topn button").forEach(b=>b.onclick=()=>{S.topn=+b.dataset.n; $$("#topn button").forEach(x=>x.classList.toggle("on",x===b)); renderAll();});
  $$("#rankmode button").forEach(b=>b.onclick=()=>{S.rank=b.dataset.m; $$("#rankmode button").forEach(x=>x.classList.toggle("on",x===b)); renderRank(filtered());});
  $("#replay").oninput=ev=>{S.replay=+ev.target.value/100; renderAll();};
  $("#csv").onclick=()=>csv(filtered());
  $("#mclose").onclick=()=>$("#modal").classList.add("hidden"); $("#modal").onclick=ev=>{if(ev.target.id==="modal") $("#modal").classList.add("hidden");};
  document.addEventListener("keydown",ev=>{if(ev.key==="Escape"){$("#modal").classList.add("hidden"); $("#livepop").classList.add("hidden");}});
  window.addEventListener("resize",()=>{ if(S.view==="graph") renderGraph(filtered()); });
  if(window.matchMedia){ window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>renderAll()); }
  new MutationObserver(()=>renderAll()).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
}
(async function init(){
  try{ S.lang = localStorage.getItem("lang") || "zh"; }catch(_){ S.lang = "zh"; }
  bind();
  try{ await load(true); renderAll(); const h=location.hash.replace("#n-",""); if(h&&E[h]) selectNode(h); }
  catch(err){ $("#cards").innerHTML=`<div class="card"><div class="k">error</div><div class="s">${esc(err.message)}</div></div>`; }
  setInterval(async()=>{ nextCheck=Date.now()+300000; try{ if(await load(false)) renderAll(); else renderLive(); }catch(_){} }, 300000);
  setInterval(()=>{ if(D) renderLive(); }, 60000);
})();
})();
