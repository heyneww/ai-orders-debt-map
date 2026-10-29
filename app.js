/* AI 巨头订单与债务关系图 · 前端 */
(() => {
const I18N = {
  zh: {eyebrow:"实时数据 · AI 资本流向", title:"AI 巨头订单与债务关系图", subtitle:"谁欠谁：订单、股权、债务与担保。每笔交易可追溯到来源，标题口径与已约束口径并列，不做估值判断。",
    search:"搜公司或交易（例如 NVDA、Beignet、残值担保）", sector:"板块", minsize:"最小金额", period:"期间", status:"状态", basis:"口径", any:"不限", alldates:"全部",
    last90:"近 90 天", last12m:"近 12 个月", st_active:"有效（含传闻/意向）", st_firm:"仅已约束", st_all:"全部（含已修订/取消）", b_headline:"标题口径", b_firm:"已约束口径",
    collapse:"SPV 折叠到发起人", layered:"按板块分区", v_graph:"关系图", v_table:"表格", v_cycles:"资金闭环", v_maturity:"到期墙", v_conc:"集中度", v_gaps:"数据缺口", v_recent:"近期公告", all:"全部",
    replay:"回放至", csv:"复制 CSV", rank_title:"最大敞口", rank_total:"合计", rank_borrowed:"借入", rank_orders:"订单支出", rank_guar:"担保敞口",
    rank_hint:"点击公司查看它欠谁、谁欠它、下了哪些订单。条形 = 边类型构成。", rank_note:"占位对手方（公募债投资者、未披露贷款人、未拆分银团）不参与排名。",
    latest_title:"监控最新动态", latest_hint:"这里是监控的进水口：抓到的新闻标题与申报列表，每 3 小时刷新，未经抽取，多数不会成为交易。确认过的交易在上方「近期公告」。", news:"新闻", filings:"SEC 申报", method_title:"口径说明",
    m1:"四类交易：订单（买方→供应方）、债务（出借方→借款方）、股权（投资方→被投方）、担保（担保方→被担保主体）。图中每条连线是一笔交易，箭头方向 = 资金方向。",
    m2:"标题口径 = 媒体标题金额（含 \"up to\"、多年总额）；已约束口径 = 已签约/已提款部分。两者并列，不互相替代。",
    m3:"修订不覆盖旧记录：统计只计最新版本。公告引起的修订（金额上调、意向变签约等）在表格与详情里写出变了什么；我们核对时的修正不显示。传闻/意向灰显，只有公告或申报才记为已约束。",
    m4:"SPV 是独立节点：项目债记在 SPV，承租人只以租约（订单）和残值担保（担保）出现。勾选\"折叠\"可把 SPV 并回发起人。",
    m5:"每笔只计一次、不做净额；供应链两端都计。资金闭环只是拓扑事实，不代表任何风险结论。",
    disc:"仅供参考，不构成投资建议：本站只描述交易，不做评价。金额为公司公告或具名媒体披露的名义美元；每笔交易附来源链接与来源等级（1 申报 / 2 新闻稿 / 3 通讯社 / 4 其他）。",
    built:"数据来自公开申报与新闻。监控按计划运行；本页每 5 分钟自检一次。",
    ORDER:"订单", DEBT:"债务", EQUITY:"股权", GUARANTEE:"担保", undisclosed:"未披露", more_undisc:"另 {n} 笔未披露金额", mix:"四类交易占比", deals:"{d} 笔交易 · {c} 家公司",
    countnote:"每笔只计一次，不做净额（OpenAI→Oracle 与 Oracle→NVIDIA 都计）；修订过的交易只计最新版本。当前口径：{b}。",
    sectors:{all:"全部板块",hyperscalers:"超大规模云",labs:"模型实验室",chips:"芯片与存储",neoclouds:"Neocloud",datacenters:"数据中心开发商",energy:"电力",financiers:"资金方",spvs:"SPV / 合资",other:"其他"},
    status_:{rumored:"传闻",loi:"意向",definitive:"已签约",amended:"已修订",drawn:"已提款",completed:"已完成",cancelled:"已取消"},
    tier:{"1_filing":"申报","2_press_release":"新闻稿","3_wire":"通讯社","4_other":"其他来源"},
    money_in:"资金流入", money_out:"资金流出", deals_n:"交易数", firm_of:"其中已约束", orders_out:"订单支出（承诺采购）", orders_in:"订单收入（在手合同）", debt_in:"借入", debt_out:"出借",
    eq_in:"股权流入", eq_out:"股权流出", guar_out:"担保敞口（提供担保）", guar_in:"获得担保", in_cycles:"所在资金闭环", none:"无",
    col_date:"日期", col_type:"类型", col_deal:"交易", col_amt:"金额（标题 / 已约束）", col_status:"状态", col_src:"来源", showing:"显示 {n} 笔 · {c} 家",
    cyc_firm:"已约束口径的闭环", cyc_soft:"含传闻/意向的闭环", cyc_note:"闭环 = 资金方向上的闭合路径（A 投/借给 B，B 向 C 采购，C 向 A 采购……）。只是结构事实，不代表任何风险结论。按全部有效交易计算，不随上方筛选变化。点击可在关系图中高亮。",
    bottleneck:"瓶颈额", headline_only:"含标题口径", mat_title:"债务到期墙（按到期年，当前口径）", mat_unknown:"未披露到期", mix_title:"融资结构 × 评级（债务边计数）",
    conc_title:"供应方按买方集中度（订单流入）", conc_sup:"供应方", conc_total:"合计", conc_top:"前三买方", gaps_title:"数据缺口 Top 10", gaps_edges:"逐笔缺口（当前筛选）",
    rc_title:"近期新公告（按公告日期）", rc_days:"近 {n} 天", rc_note:"截至 {d}（数据生成日），按交易公告日期倒序。这里是监控的出水口：只列已抽取、已确认进图的交易；下方「监控最新动态」是未经抽取的原始新闻与申报，新交易会先出现在那里，经本地抽取后才进这里。内部修订与历史补录不算新公告。受上方筛选影响（期间除外）。", rc_firm:"其中已约束 {n} 笔", rc_none:"该窗口内没有新公告。", rev_label:"公告修订", rev_was:"原公告", rev_amount:"金额", rev_firm:"已约束", revised_by:"已被修订（旧版本）", rebuilt:"数据重建于", next_check:"下次自检", edges_n:"交易 / 公司", feed_n:"新闻 / 申报",
    ago_min:"{n} 分钟前", ago_h:"{n} 小时前", just:"刚刚", view_src:"来源", confidence:"置信度", basis_:{total_contract:"合同总额",annual:"年度",facility_size:"额度",drawn:"已提款"},
     lg_lines:"连线", lg_circles:"圆圈", lg_thin:"最细 = 未披露或低于 $1B", lg_pool:"虚线圆 = 占位对手方 / SPV", lg_arrow:"箭头指向收钱方：买方→供应方、投资方→公司、出借方→借款方", lg_undisc:"虚线 = 金额未披露", lg_soft:"点线 = 传闻 / 意向",
    tl_title:"月度节奏", tl_amt:"金额", tl_count:"笔数", tl_cum:"累计", tl_hint:"柱 = 当月公告的交易（按类型堆叠，当前口径）；下方折线 = 累计。点击某月只看该月，再点取消；随上方筛选变化（期间除外）。", tl_sum:"峰值月 {m}：{a}（{n} 笔）· 最近 3 个月 {b}（{k} 笔），占累计 {p}%。",
    v_flow:"板块流向", flow_title:"钱从哪个板块流向哪个板块", flow_note:"行 = 付钱方板块，列 = 收钱方板块；格内为金额与笔数，颜色深浅 = 金额相对大小（当前筛选与口径）。担保是或有敞口，不计入。净流入 = 流入 − 流出，只是方向事实，不代表任何风险结论。", flow_from:"付钱方", flow_to:"收钱方", flow_out:"流出合计", flow_in:"流入合计", flow_net:"净流入", flow_top:"最大流向",
    n_deals:"{n} 笔", gp_title:"读者要知道的四类缺口", gp_note:"这四类缺口会改变对图的解读，按当前筛选与口径计算。核对员的内部待办（评级未核对、GPU 数量等）收在最下方的维护记录里。",
    gp1:"金额未披露", gp1_stat:"{a} 笔完全没有金额；另 {b} 笔只有标题金额、没有已约束金额，标题合计 {h}。", gp1_impact:"影响：已约束合计是下限，不是全部。只有标题的交易主要落在：{top}。看这些公司的在手合同时，切到已约束口径会归零，不代表没有合同。",
    gp2:"到期日未知", gp2_stat:"{m} 笔债务里 {n} 笔没有到期日，金额 {h}，占债务总额 {p}%。", gp2_impact:"影响：到期墙只画了有到期日的部分，\"未披露到期\"那一截是这里的钱。到期墙能信几成，取决于这个比例。",
    gp3:"贷款人 / 对手方未披露", gp3_stat:"{n} 笔交易的资金来源是未披露对手方或未拆分的银团，金额 {h}。", gp3_impact:"影响：这些钱在图上从占位节点出发，资金方那一列和最大敞口排行都不含它们；真正的出借人可能是已经在图上的某家银行或基金。",
    gp4:"担保条款不全", gp4_stat:"{m} 笔担保里 {n} 笔没有金额或上限（有金额的合计 {h}）。", gp4_impact:"影响：这些担保在图上有线、算不了敞口。担保敞口排行和本期判断里的担保数字都只包含有上限的部分。",
    gp_show:"查看涉及的 {n} 笔交易", gp_maint:"数据维护记录（内部核对项，不影响读者结论）", in_graph:"在图中高亮", snapshot:"快照", v_title:"本期判断", v_where:"在图上哪里看（点击可跳转）", v_chain:"若资金不到位，会怎样", v_flip:"什么会改变这个判断", v_watch:"触发条件与关注点", v_if:"若", v_then:"则", v_watchk:"关注", v_more:"展开触发条件与数据依据", v_less:"收起", term:"期限", years:"年", capacity:"容量", coupon:"票息", maturity:"到期", rating:"评级", collateral:"抵押", structure:"结构", cap:"上限", trigger:"触发条件", linked:"关联的订单", covered:"被担保的交易"},
  en: {eyebrow:"LIVE DATA · AI CAPITAL FLOWS", title:"AI Orders & Debt Map", subtitle:"Who owes whom: orders, equity, debt and guarantees. Every deal links to a source; headline and firm amounts shown side by side; no valuation calls.",
    search:"Find a company or deal (e.g. NVDA, Beignet, residual value)", sector:"Sector", minsize:"Min size", period:"Period", status:"Status", basis:"Basis", any:"Any", alldates:"All dates",
    last90:"Last 90 days", last12m:"Last 12 months", st_active:"Active (incl. rumored/LOI)", st_firm:"Firm only", st_all:"All (incl. superseded/cancelled)", b_headline:"Headline", b_firm:"Firm",
    collapse:"Collapse SPVs into sponsors", layered:"Cluster by sector", v_graph:"Graph", v_table:"Table", v_cycles:"Funding loops", v_maturity:"Maturity wall", v_conc:"Concentration", v_gaps:"Data gaps", v_recent:"Recent deals", all:"All",
    replay:"Replay to", csv:"Copy CSV", rank_title:"Largest exposures", rank_total:"Total", rank_borrowed:"Borrowed", rank_orders:"Orders placed", rank_guar:"Guarantees given",
    rank_hint:"Click a company to see who it owes, who owes it, and every order. Bar = mix of edge types.", rank_note:"Pooled counterparties (bond investors, undisclosed lenders, unsplit syndicates) are not ranked.",
    latest_title:"Latest from the monitor", latest_hint:"This is the monitor's intake: news headlines and filing lists as fetched, refreshed every 3 hours, not yet extracted; most will never become deals. Confirmed deals are in \"Recent deals\" above.", news:"News", filings:"SEC filings", method_title:"Methodology",
    m1:"Four deal kinds: ORDER (buyer→supplier), DEBT (lender→borrower), EQUITY (investor→investee), GUARANTEE (guarantor→obligor). Arrow = direction of money.",
    m2:"Headline = the reported amount (incl. \"up to\", multi-year totals); firm = signed / drawn portion. Both shown, never substituted.",
    m3:"Revisions never overwrite: only the latest version is counted. Amendments driven by a new announcement (amount raised, LOI to signed, etc.) are spelled out in the table and detail; our own verification fixes are not shown. Rumors/LOIs are greyed; only announcements or filings count as firm.",
    m4:"SPVs are nodes: project debt sits on the SPV; the tenant appears only via lease (ORDER) and residual-value guarantee. Tick \"collapse\" to fold SPVs into sponsors.",
    m5:"Each deal counted once, not netted; both ends of a supply chain count. Funding loops are topology, not a risk verdict.",
    disc:"For information only, not investment advice: this site describes deals and does not rate them. Amounts are nominal USD as disclosed by companies or named outlets; every edge carries a source link and tier (1 filing / 2 press release / 3 wire / 4 other).",
    built:"Built from public filings and news. The monitor runs on a schedule; this page re-checks every 5 minutes.",
    ORDER:"Order", DEBT:"Debt", EQUITY:"Equity", GUARANTEE:"Guarantee", undisclosed:"Undisclosed", more_undisc:"+{n} with no disclosed amount", mix:"Mix by deal type", deals:"{d} deals · {c} companies",
    countnote:"Each deal counted once, not netted (OpenAI→Oracle and Oracle→NVIDIA both count); revised deals count only their latest version. Basis: {b}.",
    sectors:{all:"All sectors",hyperscalers:"Hyperscalers",labs:"AI labs",chips:"Chips & memory",neoclouds:"Neoclouds",datacenters:"Data centers",energy:"Energy",financiers:"Financiers",spvs:"SPVs & JVs",other:"Other"},
    status_:{rumored:"Rumored",loi:"LOI",definitive:"Signed",amended:"Amended",drawn:"Drawn",completed:"Completed",cancelled:"Cancelled"},
    tier:{"1_filing":"Filing","2_press_release":"Press release","3_wire":"Wire","4_other":"Other"},
    money_in:"Money in", money_out:"Money out", deals_n:"Deals", firm_of:"of which firm", orders_out:"Orders placed", orders_in:"Orders received", debt_in:"Borrowed", debt_out:"Lent",
    eq_in:"Investment received", eq_out:"Investments made", guar_out:"Guarantees given", guar_in:"Guarantees received", in_cycles:"Funding loops through this node", none:"None",
    col_date:"Date", col_type:"Type", col_deal:"Deal", col_amt:"Amount (headline / firm)", col_status:"Status", col_src:"Sources", showing:"{n} deals · {c} companies",
    cyc_firm:"Loops on firm edges", cyc_soft:"Loops incl. rumored/LOI", cyc_note:"A loop is a closed path in the direction of money (A invests in B, B orders from C, C orders from A…). Topology only, not a risk verdict. Computed on all active edges, independent of the filters above. Click to highlight in the graph.",
    bottleneck:"Bottleneck", headline_only:"headline amounts", mat_title:"Debt maturity wall (by year, current basis)", mat_unknown:"Undisclosed maturity", mix_title:"Structure × rating (debt edge count)",
    conc_title:"Supplier concentration by buyer (order inflow)", conc_sup:"Supplier", conc_total:"Total", conc_top:"Top 3 buyers", gaps_title:"Top 10 data gaps", gaps_edges:"Gaps by deal (current filter)",
    rc_title:"Recent announcements (by announcement date)", rc_days:"Last {n} days", rc_note:"As of {d} (data build date), newest first by announcement date. This is the monitor's output: only deals that have been extracted and confirmed onto the map. \"Latest from the monitor\" below is the raw intake of news and filings; a new deal shows up there first and reaches this list after extraction. Internal revisions and backfills are not news. Follows the filters above (except period).", rc_firm:"{n} firm", rc_none:"No announcements in this window.", rev_label:"Amended by announcement", rev_was:"originally", rev_amount:"amount", rev_firm:"firm", revised_by:"superseded (old version)", rebuilt:"Data rebuilt", next_check:"Next check", edges_n:"Deals / companies", feed_n:"News / filings",
    ago_min:"{n} min ago", ago_h:"{n} h ago", just:"just now", view_src:"source", confidence:"Confidence", basis_:{total_contract:"total contract",annual:"annual",facility_size:"facility size",drawn:"drawn"},
     lg_lines:"Lines", lg_circles:"Circles", lg_thin:"Thinnest = undisclosed or under $1B", lg_pool:"Dashed circle = pooled counterparty / SPV", lg_arrow:"Arrow points to who receives the money: buyer → seller, investor → company, lender → borrower", lg_undisc:"Dashed line = amount undisclosed", lg_soft:"Dotted line = rumored / LOI",
    tl_title:"Monthly pace", tl_amt:"Amount", tl_count:"Count", tl_cum:"Cumulative", tl_hint:"Columns = deals announced that month (stacked by type, current basis); line below = cumulative. Click a month to filter to it, click again to clear; follows the filters above (except period).", tl_sum:"Peak month {m}: {a} ({n} deals) · last 3 months {b} ({k} deals), {p}% of the cumulative total.",
    v_flow:"Sector flows", flow_title:"Which sector pays which sector", flow_note:"Rows = paying sector, columns = receiving sector; each cell shows amount and deal count, shade = relative size (current filters and basis). Guarantees are contingent and excluded. Net inflow = inflow − outflow: a direction fact, not a risk verdict.", flow_from:"Payer", flow_to:"Receiver", flow_out:"Total out", flow_in:"Total in", flow_net:"Net inflow", flow_top:"Largest flows",
    n_deals:"{n} deals", gp_title:"Four gaps readers should know about", gp_note:"These four gaps change how the map should be read; computed on the current filters and basis. Internal to-dos for checkers (ratings not verified, GPU counts, etc.) are kept in the maintenance log at the bottom.",
    gp1:"Amount undisclosed", gp1_stat:"{a} deals have no amount at all; another {b} have a headline but no firm amount, headline total {h}.", gp1_impact:"Impact: the firm total is a floor, not the whole picture. Headline-only deals sit mainly with: {top}. On the firm basis these backlogs drop to zero, which does not mean there is no contract.",
    gp2:"Maturity unknown", gp2_stat:"{n} of {m} debt deals have no maturity date, {h}, or {p}% of all debt.", gp2_impact:"Impact: the maturity wall only draws what has a date; the \"undisclosed maturity\" bar is this money. How much to trust the wall depends on this share.",
    gp3:"Lender / counterparty undisclosed", gp3_stat:"{n} deals are funded by an undisclosed counterparty or an unsplit syndicate, {h}.", gp3_impact:"Impact: this money starts from a placeholder node; the financier column and the exposure ranking exclude it, and the real lender may be a bank or fund already on the map.",
    gp4:"Guarantee terms incomplete", gp4_stat:"{n} of {m} guarantees have no amount or cap (those with amounts total {h}).", gp4_impact:"Impact: these guarantees are drawn but cannot be sized. The guarantee ranking and the guarantee figures in the current call include only the capped ones.",
    gp_show:"Show the {n} deals", gp_maint:"Maintenance log (internal checks, no effect on reader conclusions)", in_graph:"Highlight in graph", snapshot:"snapshot", v_title:"Current call", v_where:"Where to see it on the map (click to jump)", v_chain:"If the money does not arrive", v_flip:"What would change this call", v_watch:"Triggers and what to watch", v_if:"If", v_then:"then", v_watchk:"Watch", v_more:"Show triggers and data basis", v_less:"Collapse", term:"Term", years:"yr", capacity:"Capacity", coupon:"Coupon", maturity:"Maturity", rating:"Rating", collateral:"Collateral", structure:"Structure", cap:"Cap", trigger:"Trigger", linked:"Linked order", covered:"Covered deal"}
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

const S = {recentDays:30, tlMode:"amt", lang:"zh", newsLang:"all", basis:"headline", kinds:new Set(KINDS), sector:"all", min:0, period:"all", status:"active", collapse:false, topn:50, layered:true, view:"graph", replay:1, q:"", sel:null, hl:new Set(), rank:"total", sort:["announced_date",-1]};
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
  if(/^\d{4}(-\d{2})?$/.test(S.period)) return d.startsWith(S.period);
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
    if(!opts.ignorePeriod && !periodOk(e)) return false;
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
    ${D.monitor.filings_stale?`<div><span>${S.lang==="zh"?"SEC 申报沿用":"SEC filings as of"}</span><b>${(D.monitor.filings_fetched_at||"").slice(0,16).replace("T"," ")} UTC</b></div>`:""}
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
/* 画法照 helajo：公司 = 中性墨色圆（大小 = 敞口），颜色只给钱（线 = 交易类型），板块 = 位置 + 文字 */
const RING = ["chips","labs","hyperscalers","neoclouds","datacenters","energy","spvs","financiers","other"];
const G = {nodes:new Map(), k:1, fitK:1, tr:null, key:""};
function anchorFor(sector, W, H){
  let i = RING.indexOf(sector); if(i<0) i = RING.length-1;
  const ang = (i/RING.length)*Math.PI*2 - Math.PI/2, portrait = H > W*1.1;
  const rx = W*(portrait?.3:.4), ry = H*(portrait?.4:.36);
  return {x: W/2 + Math.cos(ang)*rx, y: H/2 + Math.sin(ang)*ry};
}
/* 线宽：$100M → 1px，$300B → 5.6px（对数） */
const widthScale = musd => { if(!musd) return 1; const v = (Math.log10(musd*1e6)-8)/(Math.log10(3e11)-8); return 1 + Math.max(0,Math.min(1,v))*4.6; };
function edgeGeometry(l, w){
  const s=l.source, tg=l.target; const dx=tg.x-s.x, dy=tg.y-s.y, dist=Math.hypot(dx,dy)||1;
  let nx=-dy/dist, ny=dx/dist; if(l.flip){ nx=-nx; ny=-ny; }
  const off = l.offset*2; const cx=(s.x+tg.x)/2+nx*off, cy=(s.y+tg.y)/2+ny*off;
  const sdx=cx-s.x, sdy=cy-s.y, sl=Math.hypot(sdx,sdy)||1; const edx=tg.x-cx, edy=tg.y-cy, el=Math.hypot(edx,edy)||1; const ux=edx/el, uy=edy/el;
  const head = 5 + (w||l.w)*1.3;
  const x1=s.x+(sdx/sl)*(s.r+2), y1=s.y+(sdy/sl)*(s.r+2);
  const tipX=tg.x-ux*(tg.r+3), tipY=tg.y-uy*(tg.r+3);
  const x2=tipX-ux*head*.85, y2=tipY-uy*head*.85;
  const line = Math.abs(off)<.5 ? `M${x1},${y1}L${x2},${y2}` : `M${x1},${y1}Q${cx},${cy} ${x2},${y2}`;
  const bx=tipX-ux*head, by=tipY-uy*head, hw=head*.55;
  return {line, arrow:`M${tipX},${tipY}L${bx-uy*hw},${by+ux*hw}L${bx+uy*hw},${by-ux*hw}Z`};
}
/* 共用的小提示框（关系图与月度图都借用） */
const tip = () => $("#gtip");
function showTipIn(ev, host, html){ const el=tip(); if(!el) return; if(el.parentNode!==host) host.appendChild(el); el.innerHTML=html; el.hidden=false; moveTipIn(ev,host); }
function moveTipIn(ev, host){ const el=tip(); if(!el||el.hidden) return; const box=host.getBoundingClientRect(); let x=ev.clientX-box.left+14, y=ev.clientY-box.top+14; const tw=el.offsetWidth, th=el.offsetHeight; if(x+tw>box.width-8) x=Math.max(8,ev.clientX-box.left-tw-14); if(y+th>box.height-8) y=Math.max(8,ev.clientY-box.top-th-14); el.style.left=x+"px"; el.style.top=y+"px"; }
function hideTip(){ const el=tip(); if(el) el.hidden=true; }
const titleOf = e => esc(S.lang==="zh"?e.title_zh:e.title_en);

function renderGraph(edges){
  const svg = d3.select("#svg"); const W = svg.node().clientWidth, H = svg.node().clientHeight; const host = $("#v_graph");
  svg.selectAll("*").remove(); svg.attr("data-lang",S.lang);
  const root = svg.append("g");
  const layers = {sector:root.append("g"), edge:root.append("g"), hot:root.append("g"), node:root.append("g"), label:root.append("g")};
  zoom = d3.zoom().scaleExtent([.25,5]).extent([[0,0],[W,H]]).translateExtent([[-4000,-4000],[4000+W,4000+H]])
    .on("zoom",ev=>{ root.attr("transform",ev.transform); G.k=ev.transform.k; G.tr=ev.transform; updateSectorVis(); clearTimeout(G.lt); G.lt=setTimeout(declutter,120); });
  svg.call(zoom).on("dblclick.zoom",null);
  const tot = nodeTotals(edges);
  let ids = Object.keys(tot); if(S.topn>0) ids = ids.sort((a,b)=>tot[b]-tot[a]).slice(0,S.topn);
  const idset = new Set(ids);
  const es = edges.filter(e=>idset.has(endpoint(e.from))&&idset.has(endpoint(e.to)));
  const maxTot = Math.max(1, ...ids.map(id=>tot[id]||0));
  const rScale = d3.scaleSqrt().domain([0,maxTot]).range([6, W<600?24:32]);
  const deals = {}; es.forEach(e=>{ for(const id of [endpoint(e.from),endpoint(e.to)]) deals[id]=(deals[id]||0)+1; });
  const nodes = ids.map(id=>{ const ent = E[id]||{name:id,sector:"other"}; const a = anchorFor(ent.sector||"other",W,H); let n = G.nodes.get(id);
    if(!n){ n = {id, x:a.x+(Math.random()-.5)*60, y:a.y+(Math.random()-.5)*60}; G.nodes.set(id,n); }
    n.ent=ent; n.sector=ent.sector||"other"; n.tot=tot[id]||0; n.r=rScale(n.tot); n.deals=deals[id]||0; n.pool=POOLED.has(id)||ent.type==="spv"; return n; });
  const byId = new Map(nodes.map(n=>[n.id,n]));
  /* 同一对公司、同一类型的多笔合并成一条线（宽度 = 合计）；不同类型 / 反向的线彼此错开 */
  const bundles = new Map();
  es.forEach(e=>{ const k=`${endpoint(e.from)}|${endpoint(e.to)}|${e.kind}`; if(!bundles.has(k)) bundles.set(k,[]); bundles.get(k).push(e); });
  const pairs = new Map(), links = [];
  bundles.forEach((arr,bk)=>{ arr.sort((a,b)=>(amt(b)||0)-(amt(a)||0)); const e=arr[0]; const from=endpoint(e.from), to=endpoint(e.to);
    const sum = arr.reduce((s,x)=>s+(amt(x)||0),0); const firm = arr.some(x=>x.firm); const undisclosed = arr.every(x=>amt(x)==null);
    const key = from<to ? from+"|"+to : to+"|"+from;
    const l = {id:bk, e, edges:arr, from, to, kind:e.kind, source:byId.get(from), target:byId.get(to), key, w:widthScale(sum), sum, firm, undisclosed, flip:from>to, offset:0};
    if(!pairs.has(key)) pairs.set(key,[]); pairs.get(key).push(l); links.push(l); });
  pairs.forEach(arr=>{ arr.sort((a,b)=>(b.sum||0)-(a.sum||0)); const k=arr.length; arr.forEach((l,i)=>{ l.offset = k===1?0:(i-(k-1)/2)*16; }); });
  links.sort((a,b)=>b.w-a.w);
  $("#viewcount").textContent = t("showing",{n:es.length,c:nodes.length});
  let hover = null, hotSet = null;

  /* 连线：底衬 + 线 + 箭头 + 透明命中带 */
  const eg = layers.edge.selectAll("g").data(links).join("g").attr("class","edge-g").style("--c",l=>KCOL[l.kind]).style("--wh",l=>Math.max(l.w,2.5)+"px")
    .classed("is-soft",l=>!l.firm).classed("is-undisclosed",l=>l.undisclosed);
  eg.append("path").attr("class","edge-casing").style("stroke-width",l=>(Math.max(l.w,2.5)+4)+"px");
  eg.append("path").attr("class","edge").style("stroke-width",l=>l.w+"px");
  eg.append("path").attr("class","arrow");
  eg.append("path").attr("class","edge-hit").attr("stroke-width",l=>Math.max(12,l.w+8))
    .on("pointerenter",(ev,l)=>{ hover={type:"edge",l}; restyle(); showTipIn(ev,host,tipEdge(l)); }).on("pointermove",ev=>moveTipIn(ev,host)).on("pointerleave",()=>{ hover=null; hideTip(); restyle(); })
    .on("click",(ev,l)=>{ ev.stopPropagation(); hideTip(); openEdge(l.e); });
  /* 节点：外环（选中态）+ 圆 + 命中圆 */
  const node = layers.node.selectAll("g").data(nodes).join("g").attr("class",d=>"node"+(d.pool?" node--pool":""))
    .call(d3.drag().clickDistance(4).on("start",(ev,d)=>{ if(!ev.active) sim.alphaTarget(.25).restart(); d.fx=d.x; d.fy=d.y; hideTip(); }).on("drag",(ev,d)=>{ d.fx=ev.x; d.fy=ev.y; }).on("end",(ev,d)=>{ if(!ev.active) sim.alphaTarget(0); d.fx=null; d.fy=null; }))
    .on("click",(ev,d)=>{ ev.stopPropagation(); hideTip(); selectNode(d.id); })
    .on("pointerenter",(ev,d)=>{ hover={type:"node",id:d.id}; restyle(); showTipIn(ev,host,tipNode(d)); }).on("pointermove",ev=>moveTipIn(ev,host)).on("pointerleave",()=>{ hover=null; hideTip(); restyle(); });
  node.append("circle").attr("class","node__ring").attr("r",d=>d.r+4);
  node.append("circle").attr("class","node__c").attr("r",d=>d.r);
  node.append("circle").attr("class","node__hit").attr("r",d=>Math.max(d.r+3,12));
  /* 标签单独一层，压在所有圆上面 */
  const bigR = d3.quantile(nodes.map(n=>n.r).sort(d3.ascending), .55) || 10;
  const short = id => { const s=nm(id); return s.length>22 ? s.slice(0,20)+"…" : s; };
  const label = layers.label.selectAll("text").data(nodes).join("text").attr("class",d=>"node__label"+(d.r>=bigR?" node__label--big":"")).attr("text-anchor","middle").text(d=>short(d.id))
    .on("pointerenter",(ev,d)=>{ hover={type:"node",id:d.id}; restyle(); showTipIn(ev,host,tipNode(d)); }).on("pointerleave",()=>{ hover=null; hideTip(); restyle(); }).on("click",(ev,d)=>{ ev.stopPropagation(); hideTip(); selectNode(d.id); });

  const tipNode = d => `<span class="tooltip__v">${fmt(d.tot)}</span><span class="tooltip__t">${esc(nm(d.id))}${d.ent.ticker?" · "+esc(d.ent.ticker):""}</span><span class="tooltip__m">${t("sectors")[d.sector]||d.sector} · ${t("n_deals",{n:d.deals})}</span>`;
  const tipEdge = l => { const e=l.e; const one=l.edges.length===1;
    return (one ? `<span class="tooltip__v">${fmt(amt(e))}</span><span class="tooltip__t">${titleOf(e)}</span>` : `<span class="tooltip__v">${fmt(l.sum)}</span><span class="tooltip__t">${t("n_deals",{n:l.edges.length})} · ${esc(nm(l.from))} → ${esc(nm(l.to))}</span>`)
      + `<span class="tooltip__m"><i class="key" style="--c:${KCOL[l.kind]}"></i>${t(l.kind)} · ${esc(nm(l.from))} → ${esc(nm(l.to))}</span>`
      + (one ? `<span class="tooltip__m">${e.announced_date||""} · ${t("status_")[e.status]||e.status}</span>` : l.edges.slice(0,4).map(x=>`<span class="tooltip__m">${fmt(amt(x))} · ${titleOf(x)}</span>`).join("") + (l.edges.length>4?`<span class="tooltip__m">+${l.edges.length-4}</span>`:"")); };

  /* 焦点：悬停 / 选中的公司及其邻居；闭环高亮时点亮闭环上的公司 */
  function lit(){
    const f = hover || (S.sel ? {type:"node",id:S.sel} : null);
    const hl = S.hl.size ? new Set(links.filter(l=>l.edges.some(e=>S.hl.has(e.edge_id))).map(l=>l.id)) : null;
    let nodesOn=null, edgesOn=null, focusId=null;
    if(f && f.type==="node"){ focusId=f.id; nodesOn=new Set([f.id]); edgesOn=new Set(); links.forEach(l=>{ if(l.from===f.id||l.to===f.id){ edgesOn.add(l.id); nodesOn.add(l.from); nodesOn.add(l.to); } }); }
    else if(f){ nodesOn=new Set([f.l.from,f.l.to]); edgesOn=new Set([f.l.id]); }
    else if(hl){ nodesOn=new Set(); edgesOn=hl; links.forEach(l=>{ if(hl.has(l.id)){ nodesOn.add(l.from); nodesOn.add(l.to); } }); }
    return {nodesOn, edgesOn, focusId, hl};
  }
  function restyle(){
    const {nodesOn, edgesOn, hl} = lit(); const hotNode = hover&&hover.type==="node" ? hover.id : null;
    const dim = d => nodesOn ? !nodesOn.has(d.id) : false, nbr = d => nodesOn ? nodesOn.has(d.id) : false, isSel = d => d.id===S.sel;
    node.classed("is-dim",dim).classed("is-nbr",nbr).classed("is-sel",isSel).classed("is-hot",d=>d.id===hotNode);
    label.classed("is-dim",dim).classed("is-nbr",nbr).classed("is-sel",isSel);
    eg.classed("is-dim",l=>edgesOn?!edgesOn.has(l.id):false).classed("is-hot",l=>edgesOn?edgesOn.has(l.id):false).classed("is-loop",l=>hl?hl.has(l.id):false);
    /* 选中公司的线、闭环的线抬到圆上面 */
    const lift = S.sel ? new Set(links.filter(l=>l.from===S.sel||l.to===S.sel).map(l=>l.id)) : hl;
    eg.each(function(l){ const want = lift&&lift.has(l.id) ? layers.hot.node() : layers.edge.node(); if(this.parentNode!==want) want.appendChild(this); });
    const changed = !!(hotSet||edgesOn); hotSet=edgesOn; if(changed) drawPositions();
    updateSectorVis(); clearTimeout(G.dt); G.dt=setTimeout(declutter,60);
  }
  function drawPositions(){
    eg.each(function(l){ const hot = hotSet&&hotSet.has(l.id); const geo=edgeGeometry(l, hot?Math.max(l.w,2.5):l.w); const g=d3.select(this);
      g.select(".edge").attr("d",geo.line); g.select(".edge-casing").attr("d",geo.line); g.select(".edge-hit").attr("d",geo.line); g.select(".arrow").attr("d",geo.arrow); });
    node.attr("transform",d=>`translate(${d.x},${d.y})`); label.attr("transform",d=>`translate(${d.x},${d.y})`);
  }
  /* 标签：能放几个放几个。无焦点时按敞口大的先放（有上限）；有焦点时只放焦点和邻居。每个标签在圆周围试 4 个位置，全被占才隐藏 */
  function declutter(){
    const k=G.k||1, pad=2.5/k; const {nodesOn, focusId}=lit();
    const items=[];
    label.each(function(d){ this.classList.remove("is-hidden"); this.setAttribute("x",0); this.setAttribute("y",d.r+13); this.setAttribute("text-anchor","middle"); });
    label.each(function(d){ if(nodesOn&&!nodesOn.has(d.id)){ this.classList.add("is-hidden"); return; } let b; try{ b=this.getBBox(); }catch(e){ return; } items.push({el:this,d,w:b.width,h:b.height,asc:(d.r+13)-b.y}); });
    if(nodesOn){ const am={}; links.forEach(l=>{ if(l.from===focusId) am[l.to]=(am[l.to]||0)+l.sum; else if(l.to===focusId) am[l.from]=(am[l.from]||0)+l.sum; });
      items.sort((a,b)=> a.d.id===focusId ? -1 : b.d.id===focusId ? 1 : ((am[b.d.id]||0)-(am[a.d.id]||0)) || (b.d.r-a.d.r)); }
    else items.sort((a,b)=>(b.d.r-a.d.r)||(b.d.tot-a.d.tot));
    const narrow=W<600; const cap = (nodesOn || k>(G.fitK||1)*1.4) ? Infinity : (narrow?14:28); const always = narrow?5:8;
    const placed=[]; const circles = nodes.filter(n=>!nodesOn||nodesOn.has(n.id));
    const tr=d3.zoomTransform(svg.node()); const vx0=(4-tr.x)/tr.k, vy0=(4-tr.y)/tr.k, vx1=(W-4-tr.x)/tr.k, vy1=(H-4-tr.y)/tr.k;
    const free=(it,x0,y0,loose)=>{ let x1=x0+it.w, y1=y0+it.h; if(x0<vx0||x1>vx1||y0<vy0||y1>vy1) return null; x0-=pad; y0-=pad; x1+=pad; y1+=pad;
      if(placed.some(p=>x0<p.x1&&x1>p.x0&&y0<p.y1&&y1>p.y0)) return null;
      const hit=circles.some(c=>{ if(c.id===it.d.id) return false; if(loose ? c.r<=it.d.r : c.r<it.d.r*.6) return false; const cx=Math.max(x0,Math.min(c.x,x1)), cy=Math.max(y0,Math.min(c.y,y1)); return (cx-c.x)**2+(cy-c.y)**2 < c.r*c.r; });
      return hit ? null : {x0,y0,x1,y1}; };
    let shown=0;
    items.forEach((it,rank)=>{ if(shown>=cap){ it.el.classList.add("is-hidden"); return; } const d=it.d, r=d.r, gap=4;
      const opts=[{x:0,y:r+13,a:"middle",bx:d.x-it.w/2,by:d.y+r+13-it.asc},{x:0,y:-(r+gap+it.h-it.asc),a:"middle",bx:d.x-it.w/2,by:d.y-r-gap-it.h},{x:r+gap,y:it.asc-it.h/2,a:"start",bx:d.x+r+gap,by:d.y-it.h/2},{x:-(r+gap),y:it.asc-it.h/2,a:"end",bx:d.x-r-gap-it.w,by:d.y-it.h/2}];
      if(nodesOn) [14,-14].forEach(dy=>{ opts.push({x:r+gap,y:it.asc-it.h/2+dy,a:"start",bx:d.x+r+gap,by:d.y-it.h/2+dy}); opts.push({x:-(r+gap),y:it.asc-it.h/2+dy,a:"end",bx:d.x-r-gap-it.w,by:d.y-it.h/2+dy}); });
      const passes = nodesOn ? ((d.id===focusId||!focusId)?2:1) : (rank<always?2:1);
      for(let pass=0;pass<passes;pass++) for(const o of opts){ const box=free(it,o.bx,o.by,pass===1); if(box){ it.el.setAttribute("x",o.x); it.el.setAttribute("y",o.y); it.el.setAttribute("text-anchor",o.a); placed.push(box); shown++; return; } }
      it.el.classList.add("is-hidden"); });
    G.boxes=placed; G.circles=circles; fitSectorLabels();
  }
  /* 板块名：淡淡地写在每个 ≥3 家的板块簇外侧；挤到公司名就挪开，挪不开就不画 */
  function placeSectorLabels(){
    const groups={}; nodes.forEach(n=>(groups[n.sector]??=[]).push(n)); const data=[];
    for(const [g,arr] of Object.entries(groups)){ if(arr.length<3) continue; const mx=d3.mean(arr,n=>n.x), my=d3.mean(arr,n=>n.y); const dx=mx-W/2, dy=my-H/2, dd=Math.hypot(dx,dy)||1; data.push({g,mx,my,ux:dx/dd,uy:dy/dd,x:mx+dx/dd*60,y:my+dy/dd*60}); }
    layers.sector.selectAll("text").data(data,d=>d.g).join("text").attr("class","sector-label").attr("text-anchor","middle").attr("x",d=>d.x).attr("y",d=>d.y).text(d=>t("sectors")[d.g]||d.g);
    updateSectorVis(); fitSectorLabels();
  }
  function updateSectorVis(){ const hide = (G.k||1) > 2*(G.fitK||1) || !!hover || !!S.sel || S.hl.size>0; layers.sector.selectAll("text").classed("is-hidden",hide); }
  function fitSectorLabels(){
    const boxes=G.boxes||[], circles=G.circles||[], k=G.k||1, pad=3/k; const mine=[];
    const tr=d3.zoomTransform(svg.node()); const inset=W<600?44:8; const vx0=(8-tr.x)/tr.k, vy0=(inset-tr.y)/tr.k, vx1=(W-inset-tr.x)/tr.k, vy1=(H-8-tr.y)/tr.k;
    layers.sector.selectAll("text").each(function(d){ if(this.classList.contains("is-hidden")) return; this.classList.remove("is-clash"); this.setAttribute("x",d.x); this.setAttribute("y",d.y);
      let b; try{ b=this.getBBox(); }catch(e){ return; } if(!b.width) return; const w=b.width, hgt=b.height, ox=b.x-d.x, oy=b.y-d.y;
      const tries=[[60,0],[90,0],[120,0],[36,0],[60,-18],[60,18],[90,-18],[90,18]];
      for(const [dist,dy] of tries){ const x=d.mx+d.ux*dist, y=d.my+d.uy*dist+dy/k; const x0=x+ox-pad, y0=y+oy-pad, x1=x0+w+2*pad, y1=y0+hgt+2*pad;
        if(x0<vx0||x1>vx1||y0<vy0||y1>vy1) continue;
        const clash = boxes.concat(mine).some(p=>x0<p.x1&&x1>p.x0&&y0<p.y1&&y1>p.y0) || circles.some(c=>{ const cx=Math.max(x0,Math.min(c.x,x1)), cy=Math.max(y0,Math.min(c.y,y1)); return (cx-c.x)**2+(cy-c.y)**2 < c.r*c.r; });
        if(!clash){ this.setAttribute("x",x); this.setAttribute("y",y); mine.push({x0,y0,x1,y1}); return; } }
      this.classList.add("is-clash"); });
  }
  function fitView(animate){
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity; nodes.forEach(n=>{ x0=Math.min(x0,n.x-n.r-40); x1=Math.max(x1,n.x+n.r+40); y0=Math.min(y0,n.y-n.r-10); y1=Math.max(y1,n.y+n.r+26); });
    if(!Number.isFinite(x0)||!Number.isFinite(x1)) return; const k=Math.min(1.7,.96*Math.min(W/(x1-x0),H/(y1-y0))); if(!(k>0)) return; G.fitK=k;
    const tr=d3.zoomIdentity.translate(W/2-k*(x0+x1)/2, H/2-k*(y0+y1)/2).scale(k); (animate?svg.transition().duration(400):svg).call(zoom.transform,tr);
  }

  /* 力导向：板块各有锚点（椭圆上均布），弱力拉向锚点；关系线拉近，圆之间互斥 */
  if(sim){ sim.stop(); sim.on("tick",null).on("end",null); }
  const sc = Math.max(.42, Math.min(1, W/900)), portrait = H>W*1.1;
  const forceLinks = [...pairs.keys()].map(key=>{ const [a,b]=key.split("|"); return {source:a,target:b}; });
  sim = d3.forceSimulation(nodes).alphaDecay(.035).velocityDecay(.38)
    .force("link", d3.forceLink(forceLinks).id(d=>d.id).distance(l=>70*sc+l.source.r+l.target.r).strength(l=>.5/Math.max(1,Math.min(l.source.deals||1,l.target.deals||1))))
    .force("charge", d3.forceManyBody().strength(d=>(-200-d.r*9)*sc).distanceMax(420*sc))
    .force("collide", d3.forceCollide().radius(d=>d.r+14*sc).iterations(2));
  if(S.layered) sim.force("x", d3.forceX(d=>anchorFor(d.sector,W,H).x).strength(d=>(portrait?.16:.07)*(d.deals<=1?1.8:1))).force("y", d3.forceY(d=>anchorFor(d.sector,W,H).y).strength(d=>(portrait?.06:.08)*(d.deals<=1?1.8:1)));
  else sim.force("x", d3.forceX(W/2).strength(.05)).force("y", d3.forceY(H/2).strength(.07));
  sim.on("tick",drawPositions).on("end",()=>{ declutter(); placeSectorLabels(); });
  const key = `${S.layered?1:0}|${W}x${H}|${ids.slice().sort().join(",")}`;
  if(key===G.key && G.tr){ /* 同一批公司：保留位置与视角，不重新布局 */
    sim.stop(); drawPositions(); svg.call(zoom.transform, G.tr); placeSectorLabels(); declutter();
  } else {
    G.key=key; sim.stop(); sim.alpha(1); for(let i=0;i<320;i++) sim.tick(); drawPositions(); fitView(false); placeSectorLabels(); declutter(); sim.alpha(0).restart();
  }
  restyle();
  svg.on("click",()=>{ if(S.sel){ S.sel=null; $("#detail").classList.add("hidden"); renderGraph(filtered()); } else if(S.hl.size){ S.hl=new Set(); restyle(); } });
  /* 图例：照 helajo，连线一行、圆圈一行、注释一行 */
  const present = new Set(links.map(l=>l.kind));
  const kindsHtml = KINDS.filter(k=>present.has(k)).map(k=>`<span class="lk-kind" style="--c:${KCOL[k]}"><i></i>${t(k)}</span>`).join("");
  const widthsHtml = [1000,10000,100000].map(x=>`<span class="lk-w"><i style="height:${widthScale(x).toFixed(1)}px"></i>${fmt(x)}${x===100000?"+":""}</span>`).join("")+`<span class="legend__hint">${t("lg_thin")}</span>`;
  const vals=[10000,100000].filter(v=>v<maxTot*.8).concat([maxTot]);
  const circlesHtml = vals.map(v=>{ const r=Math.min(18,rScale(v)), s=Math.ceil(r*2+3); return `<span class="legend__key"><svg class="lk-c" width="${s}" height="${s}"><circle cx="${s/2}" cy="${s/2}" r="${r.toFixed(1)}"/></svg><span>${fmt(v)}</span></span>`; }).join("")
    +`<span class="legend__key"><svg width="16" height="16"><circle cx="8" cy="8" r="6" class="lk-pool"/></svg><span>${t("lg_pool")}</span></span>`;
  $("#legend").innerHTML = `<div class="legend__row"><span class="legend__h">${t("lg_lines")}</span><span class="legend__kinds">${kindsHtml}</span><span class="legend__widths">${widthsHtml}</span></div>
    <div class="legend__row"><span class="legend__h">${t("lg_circles")}</span><span class="legend__circles">${circlesHtml}</span></div>
    <div class="legend__row"><span class="legend__key"><svg width="26" height="10"><line x1="1" y1="5" x2="20" y2="5" class="lk-line"/><path d="M19 1 L25 5 L19 9 Z" class="lk-head"/></svg><span>${t("lg_arrow")}</span></span><span class="legend__key"><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" class="lk-line" stroke-dasharray="4 3"/></svg><span>${t("lg_undisc")}</span></span><span class="legend__key"><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" class="lk-line" stroke-dasharray="2 3" opacity=".6"/></svg><span>${t("lg_soft")}</span></span></div>`;
  $("#zin").onclick=()=>svg.transition().call(zoom.scaleBy,1.4); $("#zout").onclick=()=>svg.transition().call(zoom.scaleBy,.7); $("#zfit").onclick=()=>fitView(true);
}

/* ---------- 月度节奏（照 helajo 的 timeline：按月柱 + 累计线） ---------- */
function monthLabel(ym, short){
  const [y,m]=ym.split("-").map(Number); if(!y||!m) return ym;
  if(S.lang==="zh") return short ? `${m}月` : `${y}年${m}月`;
  const en=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]; return short ? en : `${en} ${y}`;
}
function setMonth(m){
  S.period = S.period===m ? "all" : m; const sel=$("#f_period");
  if(S.period!=="all" && ![...sel.options].some(o=>o.value===S.period)){ const o=document.createElement("option"); o.value=S.period; o.textContent=monthLabel(S.period); sel.appendChild(o); }
  sel.value=S.period; renderAll();
}
function renderTimeline(){
  const sec=$("#timeline"); if(!sec) return; const edges=filtered({ignorePeriod:true}).filter(e=>/^\d{4}-\d{2}/.test(e.announced_date||""));
  if(edges.length<2){ sec.classList.add("hidden"); return; } sec.classList.remove("hidden");
  const ym=d=>d.slice(0,7); const months=[]; const a=ym(d3.min(edges,e=>e.announced_date)), b=ym(d3.max(edges,e=>e.announced_date));
  for(let [y,m]=a.split("-").map(Number), i=0; i<160; i++){ const cur=`${y}-${String(m).padStart(2,"0")}`; months.push(cur); if(cur===b) break; m++; if(m>12){ m=1; y++; } }
  const rows=months.map(month=>({month,usd:0,count:0,by:{},undisc:0})); const idx=Object.fromEntries(rows.map((r,i)=>[r.month,i]));
  edges.forEach(e=>{ const r=rows[idx[ym(e.announced_date)]]; if(!r) return; const v=amt(e); r.count++; if(v==null) r.undisc++; else { r.usd+=v; r.by[e.kind]=(r.by[e.kind]||0)+v; } });
  let ca=0, cc=0; rows.forEach(r=>{ ca+=r.usd; cc+=r.count; r.cumA=ca; r.cumC=cc; });
  const mode=S.tlMode; const val=r=>mode==="count"?r.count:r.usd; const cum=r=>mode==="count"?r.cumC:r.cumA; const fv=v=>mode==="count"?String(v):fmt(v);
  $$("#tlmode button").forEach(x=>x.classList.toggle("on",x.dataset.m===mode));
  const svg=d3.select("#tl-svg"); const W=Math.max(320,sec.clientWidth-28), narrow=W<600;
  const M={l:4,r:narrow?52:64,t:6,b:18}, H1=narrow?64:84, H2=narrow?30:40, gap=8, H=M.t+H1+gap+H2+M.b;
  svg.attr("viewBox",`0 0 ${W} ${H}`).attr("width",W).attr("height",H); svg.selectAll("*").remove();
  const x=d3.scaleBand().domain(months).range([M.l,W-M.r]).paddingInner(.25);
  const y1=d3.scaleLinear().domain([0,d3.max(rows,val)||1]).nice().range([M.t+H1,M.t]);
  const y2=d3.scaleLinear().domain([0,d3.max(rows,cum)||1]).range([M.t+H1+gap+H2,M.t+H1+gap]);
  const g=svg.append("g").attr("class","tl"); const ticks=y1.ticks(2);
  g.append("g").attr("class","tl__grid").selectAll("line").data(ticks).join("line").attr("x1",M.l).attr("x2",W-M.r).attr("y1",y1).attr("y2",y1);
  g.append("g").attr("class","tl__ticks").selectAll("text").data(ticks).join("text").attr("x",W-M.r+6).attr("y",d=>y1(d)+4).text(d=>d?fv(d):"0");
  const inPeriod=r=>periodOk({announced_date:r.month+"-15"});
  const tipMonth=r=>`<span class="tooltip__v">${fmt(r.usd)}</span><span class="tooltip__t">${monthLabel(r.month)} · ${t("n_deals",{n:r.count})}${r.undisc?` · ${t("more_undisc",{n:r.undisc})}`:""}</span>`
    +KINDS.filter(k=>r.by[k]).map(k=>`<span class="tooltip__m"><i class="key" style="--c:${KCOL[k]}"></i>${t(k)} ${fmt(r.by[k])}</span>`).join("")+`<span class="tooltip__m">${t("tl_cum")} ${fmt(r.cumA)} · ${t("n_deals",{n:r.cumC})}</span>`;
  const cols=g.append("g").selectAll("g").data(rows).join("g").attr("class",r=>"tl__col"+(inPeriod(r)?"":" is-out")+(S.period===r.month?" is-on":"")).attr("transform",r=>`translate(${x(r.month)},0)`)
    .on("click",(ev,r)=>setMonth(r.month)).on("pointerenter",(ev,r)=>showTipIn(ev,sec,tipMonth(r))).on("pointermove",ev=>moveTipIn(ev,sec)).on("pointerleave",hideTip);
  const bw=Math.max(2,Math.min(24,x.bandwidth()));
  cols.each(function(r){ const cg=d3.select(this); cg.append("rect").attr("class","tl__hit").attr("x",-x.step()*.125).attr("y",M.t).attr("width",x.step()).attr("height",H1+gap+H2);
    if(mode==="count"){ const top=y1(r.count); cg.append("rect").attr("class","tl__seg").attr("x",0).attr("width",bw).attr("y",top).attr("height",Math.max(0,y1(0)-top)).style("fill",cssVar("--ink2")); return; }
    let yy=y1(0); KINDS.forEach(k=>{ const v=r.by[k]; if(!v) return; const top=y1(y1.invert(yy)+v); const hgt=Math.max(0,yy-top-(yy===y1(0)?0:2)); cg.append("rect").attr("class","tl__seg").attr("x",0).attr("width",bw).attr("y",top).attr("height",hgt).style("fill",KCOL[k]); yy=top; }); });
  const line=d3.line().x(r=>x(r.month)+x.bandwidth()/2).y(r=>y2(cum(r)));
  g.append("path").attr("class","tl__cum").attr("d",line(rows));
  const last=rows[rows.length-1];
  g.append("circle").attr("class","tl__dot").attr("r",4).attr("cx",x(last.month)+x.bandwidth()/2).attr("cy",y2(cum(last)));
  g.append("text").attr("class","tl__ticks").attr("x",W-M.r+6).attr("y",y2(cum(last))+4).text(fv(cum(last)));
  g.append("text").attr("class","tl__panel").attr("x",M.l).attr("y",M.t+H1+gap+10).text(t("tl_cum"));
  const every=Math.max(1,Math.ceil(months.length/Math.max(1,Math.floor((W-M.l-M.r)/(narrow?56:72)))));
  g.append("g").attr("class","tl__axis").selectAll("text").data(rows.filter((r,i)=>i%every===0)).join("text").attr("x",(r,i)=>i===0?M.l:x(r.month)+x.bandwidth()/2).attr("y",H-4).attr("text-anchor",(r,i)=>i===0?"start":"middle")
    .text((r,i)=>(every>=12||r.month.slice(5)==="01"||i===0)?monthLabel(r.month):monthLabel(r.month,true));
  /* 一句话摘要：峰值月 + 最近 3 个月占累计比例（只描述，不评价） */
  const peak=rows.slice().sort((p,q)=>q.usd-p.usd)[0]; const last3=rows.slice(-3); const l3=last3.reduce((s,r)=>s+r.usd,0);
  $("#tlsum").textContent = t("tl_sum",{m:monthLabel(peak.month), a:fmt(peak.usd), n:peak.count, b:fmt(l3), p:ca?Math.round(100*l3/ca):0, k:last3.reduce((s,r)=>s+r.count,0)});
}

/* ---------- 板块流向矩阵：钱从哪个板块流到哪个板块 ---------- */
function renderFlow(edges){
  const secs=Object.keys(t("sectors")).filter(k=>k!=="all"); const SN=t("sectors");
  const M={}, cnt={}, rowT={}, colT={}; let mx=0;
  edges.filter(e=>e.kind!=="GUARANTEE").forEach(e=>{ const a=E[endpoint(e.from)]?.sector||"other", b=E[endpoint(e.to)]?.sector||"other"; const v=amt(e)||0; const k=a+"|"+b; M[k]=(M[k]||0)+v; cnt[k]=(cnt[k]||0)+1; rowT[a]=(rowT[a]||0)+v; colT[b]=(colT[b]||0)+v; });
  Object.values(M).forEach(v=>{ if(v>mx) mx=v; });
  const used=secs.filter(s=>rowT[s]||colT[s]); const total=Object.values(M).reduce((s,v)=>s+v,0);
  if(!total){ $("#v_flow").innerHTML=`<div class="pad fine">${t("none")}</div>`; return; }
  const cell=(a,b)=>{ const k=a+"|"+b, v=M[k]||0; if(!cnt[k]) return `<td class="fc"></td>`; const al=v?Math.sqrt(v/mx):0;
    return `<td class="fc" style="--a:${al.toFixed(3)}" title="${esc(SN[a])} → ${esc(SN[b])}: ${fmt(v)} · ${t("n_deals",{n:cnt[k]})}"><b>${v?fmt(v):"—"}</b><small>${cnt[k]}</small></td>`; };
  const top=Object.entries(M).filter(([,v])=>v>0).sort((p,q)=>q[1]-p[1]).slice(0,8);
  $("#v_flow").innerHTML = `<div class="pad"><h3>${t("flow_title")}</h3><p class="fine">${t("flow_note")}</p>
    <div class="flowwrap"><table class="tbl flow"><thead><tr><th>${t("flow_from")} ↓ &nbsp;/&nbsp; ${t("flow_to")} →</th>${used.map(s=>`<th>${SN[s]}</th>`).join("")}<th class="amt">${t("flow_out")}</th></tr></thead>
    <tbody>${used.map(a=>`<tr><th>${SN[a]}</th>${used.map(b=>cell(a,b)).join("")}<td class="amt">${fmt(rowT[a]||0)}</td></tr>`).join("")}
    <tr class="sumrow"><th>${t("flow_in")}</th>${used.map(b=>`<td class="amt">${fmt(colT[b]||0)}</td>`).join("")}<td class="amt">${fmt(total)}</td></tr>
    <tr class="sumrow"><th>${t("flow_net")}</th>${used.map(b=>{ const n=(colT[b]||0)-(rowT[b]||0); return `<td class="amt ${n<0?"neg":"pos"}">${n<0?"−":"+"}${fmt(Math.abs(n))}</td>`; }).join("")}<td></td></tr></tbody></table></div>
    <h3>${t("flow_top")}</h3><ol class="flows">${top.map(([k,v])=>{ const [a,b]=k.split("|"); return `<li><span>${SN[a]} → ${SN[b]}<small>${t("n_deals",{n:cnt[k]})}</small></span><div class="bar" style="--c:var(--accent)"><i style="width:${(100*v/top[0][1]).toFixed(1)}%"></i></div><b>${fmt(v)}<small>${Math.round(100*v/total)}%</small></b></li>`; }).join("")}</ol></div>`;
}

/* ---------- table ---------- */
/* 修订链：只把"公告修订"（scout 依据新公告记的 supersedes）讲给读者，核对修正（notes 带 [spot_check]）不显示 */
const byEdgeId = id => D && D.edges.find(x=>x.edge_id===id);
function revInfo(e){
  if(!e||!e.supersedes) return null;
  /* 跳过我们自己的核对修正，找到最近一次由公告引起的修订；拿它修订前的记录与当前记录比 */
  let cur=e; while(cur&&cur.supersedes&&/\[spot_check/.test(cur.notes||"")) cur=byEdgeId(cur.supersedes);
  if(!cur||!cur.supersedes) return null; const p=byEdgeId(cur.supersedes); if(!p) return null;
  const ch=[]; const st=t("status_");
  if(p.amount_headline_musd!==e.amount_headline_musd) ch.push(`${t("rev_amount")} ${fmt(p.amount_headline_musd)} → ${fmt(e.amount_headline_musd)}`);
  if(p.amount_firm_musd!==e.amount_firm_musd && (p.amount_firm_musd!=null||e.amount_firm_musd!=null)) ch.push(`${t("rev_firm")} ${fmt(p.amount_firm_musd)} → ${fmt(e.amount_firm_musd)}`);
  if(p.status!==e.status && !(e.status==="amended" && FIRM.has(p.status))) ch.push(`${t("col_status")} ${st[p.status]||p.status} → ${st[e.status]||e.status}`);
  if(!ch.length) return null;
  return {prev:p, changes:ch, text:`${t("rev_label")}（${cur.announced_date||""}，${t("rev_was")} ${p.announced_date||""}）：${ch.join(" · ")}`};
}
function revChain(e){ /* 只含公告修订的可读链：日期 金额 状态 → … */
  const steps=[]; let cur=e; while(cur&&cur.supersedes){ const p=byEdgeId(cur.supersedes); if(!p) break; if(!/\[spot_check/.test(cur.notes||"")) steps.unshift(p); cur=p; }
  if(!steps.length) return []; steps.push(e); return steps;
}
function dealRow(e){
  const h=e.amount_headline_musd, f=e.amount_firm_musd; const bar = h? Math.min(100, 100*(f||0)/h) : 0;
  return `<tr><td class="mono">${e.announced_date||""}</td><td><span style="color:${KCOL[e.kind]};font-weight:600">${t(e.kind)}</span></td>
    <td class="deal-cell" data-id="${e.edge_id}"><b>${esc(S.lang==="zh"?e.title_zh:e.title_en)}</b><div class="mono">${esc(nm(e.from))} → ${esc(nm(e.to))}${e.superseded_by?` · ${t("revised_by")}`:""}</div>${(r=>r?`<div class="rev">${r.text}</div>`:"")(revInfo(e))}</td>
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
  /* 读者要知道的四类缺口：各给金额、笔数、影响哪个结论；内部核对项收进"数据维护记录" */
  const SN=t("sectors"); const sumH=L=>L.reduce((x,e)=>x+(e.amount_headline_musd||0),0);
  const noAmt=edges.filter(e=>e.amount_headline_musd==null), headOnly=edges.filter(e=>e.amount_headline_musd!=null&&e.amount_firm_musd==null);
  const debt=edges.filter(e=>e.kind==="DEBT"), noMat=debt.filter(e=>!(e.debt||{}).maturity_date);
  const pooled=edges.filter(e=>e.from==="undisclosed_counterparty"||e.from==="syndicate");
  const guar=edges.filter(e=>e.kind==="GUARANTEE"), guarNo=guar.filter(e=>e.amount_headline_musd==null&&(e.guarantee||{}).cap_musd==null);
  const byTo={}; headOnly.forEach(e=>{ const k=endpoint(e.to); byTo[k]=(byTo[k]||0)+(e.amount_headline_musd||0); });
  const topTo=Object.entries(byTo).sort((x,y)=>y[1]-x[1]).slice(0,4).map(([k,v])=>`${esc(nm(k))} ${fmt(v)}`).join("、");
  const pct=(x,y)=>y?Math.round(100*x/y):0;
  const block=(title,stat,impact,list)=>`<section class="gp"><h3>${title}</h3><p class="gpstat">${stat}</p><p class="fine">${impact}</p>${list.length?`<details><summary class="fine">${t("gp_show",{n:list.length})}</summary><table class="tbl"><tbody>${list.sort((x,y)=>(y.amount_headline_musd||0)-(x.amount_headline_musd||0)).map(dealRow).join("")}</tbody></table></details>`:""}</section>`;
  const G=D.metrics.data_gaps_summary||[];
  $("#v_gaps").innerHTML = `<div class="pad"><h3>${t("gp_title")}</h3><p class="fine">${t("gp_note")}</p>
    ${block(t("gp1"), t("gp1_stat",{a:noAmt.length,b:headOnly.length,h:fmt(sumH(headOnly))}), t("gp1_impact",{top:topTo||t("none")}), noAmt.concat(headOnly))}
    ${block(t("gp2"), t("gp2_stat",{n:noMat.length,m:debt.length,h:fmt(sumH(noMat)),p:pct(sumH(noMat),sumH(debt))}), t("gp2_impact"), noMat)}
    ${block(t("gp3"), t("gp3_stat",{n:pooled.length,h:fmt(sumH(pooled))}), t("gp3_impact"), pooled)}
    ${block(t("gp4"), t("gp4_stat",{n:guarNo.length,m:guar.length,h:fmt(sumH(guar))}), t("gp4_impact"), guarNo)}
    <details class="maint"><summary class="fine">${t("gp_maint")}</summary><table class="tbl"><tbody>${G.map(([g,n])=>`<tr><td class="gap">${esc(g)}</td><td class="amt">${n}</td></tr>`).join("")}</tbody></table>
    <table class="tbl"><tbody>${edges.filter(e=>(e.data_gaps||[]).length).map(e=>`<tr><td class="deal-cell" data-id="${e.edge_id}"><b>${esc(S.lang==="zh"?e.title_zh:e.title_en)}</b></td><td class="gap">${e.data_gaps.map(esc).join("；")}</td></tr>`).join("")}</tbody></table></details></div>`;
  $$("#v_gaps .deal-cell").forEach(c=>c.onclick=()=>openEdge(D.edges.find(e=>e.edge_id===c.dataset.id)));
}
function renderRecent(){
  /* 按公告日期的近期新公告：截止 = 数据生成日；修订记录沿用原公告日期，历史补录按其本来日期落位，所以内部动作不会冒充"新闻" */
  const asof=(D.generated_at||"").slice(0,10)||new Date().toISOString().slice(0,10); const days=S.recentDays;
  const lim=new Date(new Date(asof).getTime()-days*864e5).toISOString().slice(0,10);
  const es=filtered({ignorePeriod:true}).filter(e=>e.announced_date && e.announced_date>lim && e.announced_date<=asof)
    .sort((a,b)=>b.announced_date.localeCompare(a.announced_date)||(amt(b)||0)-(amt(a)||0));
  const sum={}; KINDS.forEach(k=>sum[k]=0); let und=0; es.forEach(e=>{ const v=amt(e); if(v==null) und++; else sum[e.kind]+=v; });
  const firm=es.filter(e=>e.firm).length;
  const byId=Object.fromEntries(es.map(e=>[e.edge_id,e]));
  $("#v_recent").innerHTML = `<div class="pad"><div class="boxhead"><h3>${t("rc_title")}</h3><div class="tabs small" id="rcdays">${[7,30,90].map(d=>`<button data-d="${d}" class="${d===days?"on":""}">${t("rc_days",{n:d})}</button>`).join("")}</div></div>
    <p class="fine">${t("rc_note",{d:asof})}</p>
    <div class="rcsum">${KINDS.filter(k=>sum[k]).map(k=>`<span><i style="background:${KCOL[k]}"></i>${t(k)} ${fmt(sum[k])}</span>`).join("")}<span>${t("n_deals",{n:es.length})} · ${t("rc_firm",{n:firm})}${und?` · ${t("more_undisc",{n:und})}`:""}</span></div>
    ${es.length?`<table class="tbl"><thead><tr><th>${t("col_date")}</th><th>${t("col_type")}</th><th>${t("col_deal")}</th><th>${t("col_amt")}</th><th>${t("col_status")}</th><th>${t("col_src")}</th></tr></thead><tbody>${es.map(dealRow).join("")}</tbody></table>`:`<p class="fine">${t("rc_none")}</p>`}</div>`;
  $$("#rcdays button").forEach(b=>b.onclick=()=>{ S.recentDays=+b.dataset.d; renderRecent(); });
  $$("#v_recent .deal-cell").forEach(c=>c.onclick=()=>openEdge(byId[c.dataset.id]));
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
const ITEMS_ZH={"1.01":"签订重大协议","1.02":"终止重大协议","2.01":"完成收购或处置","2.02":"业绩公告","2.03":"新增债务/表外安排","3.02":"非公开发行股权","5.02":"高管变动","7.01":"Reg FD 披露","8.01":"其他事项","9.01":"附件"};
const ITEMS_EN={"1.01":"Material agreement","1.02":"Agreement terminated","2.01":"Acquisition/disposition","2.02":"Results","2.03":"Direct financial obligation","3.02":"Unregistered equity sale","5.02":"Officer change","7.01":"Reg FD","8.01":"Other events","9.01":"Exhibits"};
const FORMS_ZH={"8-K":"8-K 重大事项","8-K/A":"8-K 修正","6-K":"6-K 境外发行人报告","424B2":"424B2 发行条款","424B5":"424B5 招股书补充","FWP":"FWP 自由书面招股","10-Q":"10-Q 季报","10-K":"10-K 年报","D":"Form D 私募发行"};
function rel(iso){ if(!iso) return ""; const ms=Date.now()-new Date(iso).getTime(); if(!(ms>=0)) return ""; const h=ms/36e5; if(h<1){ const m=Math.max(1,Math.round(ms/6e4)); return S.lang==="zh"?`${m} 分钟前`:`${m} min ago`; } if(h<24) return S.lang==="zh"?`${Math.round(h)} 小时前`:`${Math.round(h)} h ago`; return ""; }
function renderFeeds(){
  const newsList = (D.news||[]).filter(n=>S.newsLang==="all"||n.lang===S.newsLang);
  $("#newslang").innerHTML = ["all","zh","en"].map(k=>`<button data-l="${k}" class="${S.newsLang===k?"on":""}">${k==="all"?(S.lang==="zh"?"全部":"All"):k==="zh"?"中文":"English"}</button>`).join("");
  $$("#newslang button").forEach(b=>b.onclick=()=>{S.newsLang=b.dataset.l; renderFeeds();});
  $("#news").innerHTML = newsList.slice(0,150).map(n=>{const r=rel(n.published); return `<li><a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a><div class="m">${r?`<b style="color:var(--equity)">${r}</b>`:`<span>${n.date||""}</span>`}<span>· ${esc(n.publisher||"")}</span>${n.lang==="zh"?'<span class="tag">中</span>':""}${(n.entities||[]).map(id=>`<span class="tag">${nm(id)}</span>`).join("")}</div></li>`}).join("");
  $("#filings").innerHTML = (D.filings||[]).map(f=>{const items=(f.items||[]).filter(i=>i!=="9.01"); const lab=items.map(i=>(S.lang==="zh"?ITEMS_ZH:ITEMS_EN)[i]||`Item ${i}`).join("、"); const formLab=S.lang==="zh"?(FORMS_ZH[f.form]||f.form):f.form; const seq=f.seq_total>1?(S.lang==="zh"?`（当日第 ${f.seq} 份）`:` (#${f.seq} that day)`):"";
    return `<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(nm(f.entity)||f.company)} · ${esc(formLab)}${lab?`：${esc(lab)}`:""}${seq}</a><div class="m"><span class="tag">${esc(f.form)}</span>${items.length?`<span>Item ${items.join(", ")}</span>`:""}<span>${f.filed}</span></div></li>`}).join("");
}

/* ---------- detail & modal ---------- */
function dealItem(e,other){
  return `<div class="deal" data-id="${e.edge_id}"><div class="h"><span>${esc(nm(other))}</span><span class="amt" style="color:${KCOL[e.kind]}">${fmt(amt(e))}</span></div><div class="t">${esc(S.lang==="zh"?e.title_zh:e.title_en)}</div>
    <div class="m"><span>${e.announced_date||""}</span>${tagStatus(e.status)}${tagTier(e.source_tier)}${e.amount_firm_musd!=null&&S.basis==="headline"?`<span>${t("firm_of")} ${fmt(e.amount_firm_musd)}</span>`:""}</div>${(r=>r?`<div class="rev">${r.text}</div>`:"")(revInfo(e))}
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
  const chain=revChain(e);
  $("#mbody").innerHTML = `<span class="tag" style="background:${KCOL[e.kind]};color:var(--halo)">${t(e.kind)}</span><h2 style="margin:6px 0">${esc(S.lang==="zh"?e.title_zh:e.title_en)}</h2><dl class="kv">${kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
    ${(e.data_gaps||[]).length?`<p class="gap">⚠ ${e.data_gaps.map(esc).join("；")}</p>`:""}${e.notes?`<p class="fine">${esc(e.notes.replace(/\s*\[spot_check[^\]]*\]/g,""))}</p>`:""}
    ${chain.length?`<div class="chain">${t("rev_label")}：${chain.map(x=>`${x.edge_id===e.edge_id?"<b>":""}${x.announced_date||""} ${fmt(x.amount_headline_musd)} ${t("status_")[x.status]||x.status}${x.edge_id===e.edge_id?"</b>":""}`).join(" → ")}</div>`:""}
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
  const where=(v.where||[]).map(w=>`<li>${w.node?`<a class="vlink" data-node="${esc(w.node)}">`:w.view?`<a class="vlink" data-view="${esc(w.view)}">`:""}${esc(w.text)}${(w.node||w.view)?"</a>":""}</li>`).join("");
  el.innerHTML=`<div class="vh"><span class="tag" style="background:var(--debt);color:var(--halo)">${t("v_title")}</span><h2>${esc(v.stance)}</h2><span class="fine">${c.asof}</span></div>
    <p class="vt">${esc(v.verdict)}</p>
    <div class="vg"><div><h3>${t("v_where")}</h3><ul class="where">${where}</ul></div>
    <div><h3>${esc(v.chain_title||t("v_chain"))}</h3><ol class="chain">${(v.chain||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div></div>
    <details><summary>${t("v_more")}</summary>
    <h3>${t("v_watch")}</h3><ul class="w">${(v.watch||[]).map(w=>`<li><span class="k">${t("v_if")}</span>${esc(w.if)}<br><span class="k">${t("v_then")}</span><b>${esc(w.then)}</b><br><span class="k">${t("v_watchk")}</span>${esc(w.watch)}</li>`).join("")}</ul>
    ${v.flip?`<h3>${t("v_flip")}</h3><p class="vt">${esc(v.flip)}</p>`:""}
    <p class="fine" style="margin:8px 0 0">${esc(S.lang==="zh"?c.basis:c.basis_en)} ${esc(v.note||"")}</p></details>`;
  el.classList.remove("hidden");
  $$("#verdict .vlink").forEach(a=>a.onclick=()=>{ const vw=a.dataset.view, nd=a.dataset.node;
    if(nd){ S.view="graph"; selectNode(nd); } else if(vw==="basis"){ S.basis=S.basis==="headline"?"firm":"headline"; $("#f_basis").value=S.basis; renderAll(); } else if(vw){ S.view=vw; renderAll(); }
    window.scrollTo({top:$(".panel").offsetTop-10,behavior:"smooth"}); });
}
function renderAll(){
  refreshColors(); applyI18n(); renderLive(); renderVerdict();
  const edges=filtered();
  renderCards(edges); renderChips();
  $$("#views button").forEach(b=>b.classList.toggle("on",b.dataset.view===S.view));
  $$(".view").forEach(v=>v.classList.toggle("hidden",v.id!=="v_"+S.view));
  $("#replaydate").textContent=replayDate();
  if(S.view==="graph") renderGraph(edges); else if(S.view==="table") renderTable(edges); else if(S.view==="cycles") renderCycles(); else if(S.view==="maturity") renderMaturity(edges); else if(S.view==="conc") renderConc(); else if(S.view==="gaps") renderGaps(edges); else if(S.view==="recent") renderRecent(); else if(S.view==="flow") renderFlow(edges);
  renderTimeline();
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
  $("#f_basis").onchange=ev=>{S.basis=ev.target.value; renderAll();}; $("#f_layered").onchange=ev=>{S.layered=ev.target.checked; renderAll();}; $("#f_collapse").onchange=ev=>{S.collapse=ev.target.checked; S.sel=null; $("#detail").classList.add("hidden"); renderAll();};
  $$("#views button").forEach(b=>b.onclick=()=>{S.view=b.dataset.view; if(S.view!=="graph") S.hl=new Set(); renderAll();});
  $$("#topn button").forEach(b=>b.onclick=()=>{S.topn=+b.dataset.n; $$("#topn button").forEach(x=>x.classList.toggle("on",x===b)); renderAll();});
  $$("#rankmode button").forEach(b=>b.onclick=()=>{S.rank=b.dataset.m; $$("#rankmode button").forEach(x=>x.classList.toggle("on",x===b)); renderRank(filtered());});
  $("#replay").oninput=ev=>{S.replay=+ev.target.value/100; renderAll();};
  $("#csv").onclick=()=>csv(filtered());
  $("#mclose").onclick=()=>$("#modal").classList.add("hidden"); $("#modal").onclick=ev=>{if(ev.target.id==="modal") $("#modal").classList.add("hidden");};
  document.addEventListener("keydown",ev=>{if(ev.key==="Escape"){$("#modal").classList.add("hidden"); $("#livepop").classList.add("hidden");}});
  window.addEventListener("resize",()=>{ if(S.view==="graph") renderGraph(filtered()); renderTimeline(); });
  $$("#tlmode button").forEach(b=>b.onclick=()=>{ S.tlMode=b.dataset.m; renderTimeline(); });
  if(window.matchMedia){ window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>renderAll()); }
  new MutationObserver(()=>renderAll()).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
}
(async function init(){
  try{ S.lang = localStorage.getItem("lang") || "zh"; }catch(_){ S.lang = "zh"; }
  bind();
  try{ await load(true); const qv=new URLSearchParams(location.search).get("view"); if(qv && $("#v_"+qv)) S.view=qv; renderAll(); const h=location.hash.replace("#n-",""); if(h&&E[h]) selectNode(h); }
  catch(err){ $("#cards").innerHTML=`<div class="card"><div class="k">error</div><div class="s">${esc(err.message)}</div></div>`; }
  setInterval(async()=>{ nextCheck=Date.now()+300000; try{ if(await load(false)) renderAll(); else renderLive(); }catch(_){} }, 300000);
  setInterval(()=>{ if(D) renderLive(); }, 60000);
})();
})();
