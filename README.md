# AI 巨头订单与债务关系图 · AI Orders & Debt Map

静态站点 + 自刷新监控。`index.html` / `app.js` / `style.css` 读取 `data/graph.json`；`monitor/` 里是监控脚本与边表的发布副本，`.github/workflows/refresh-and-publish.yml` 每 3 小时抓新闻与 SEC 申报、重算 `graph.json` 并部署到 GitHub Pages。

- 实时图：`index.html`；历史某日：`index.html?snapshot=YYYY-MM-DD`；直达公司：`index.html#n-openai`
- 数据：`data/graph.json`（当前），`data/archive/YYYY-MM-DD.json`（每日快照）
- 判断：`monitor/commentary.json`（条件式提示，随每次 TRIAGE 人工更新，带日期）
- 边表与实体表由主仓库的 ai-deal-graph skill 维护，`publish_site.sh` 推送到这里

部署：Settings → Pages → Source 选 GitHub Actions；Settings → Secrets 添加 `SEC_UA`（格式 `机构名 联系邮箱`，SEC EDGAR 强制）。

仅作描述，不构成投资建议。Descriptive only, not investment advice.
