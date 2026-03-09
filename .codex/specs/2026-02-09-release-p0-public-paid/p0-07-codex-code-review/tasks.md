# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 重写 P0-07 Codex Code Review 与风险收敛 的 spec.md 与 plan.md | codex | done |  |
| T-002 | 输出完整 findings（排除 `.env`）并按严重级别排序 | codex | done |  |
| T-003 | 用户确认修复优先级与执行顺序 | user | done |  |
| T-004 | 修复 RLS 发布链路门禁（009/010 绑定校验） | codex | done |  |
| T-005 | 修复 Practice `data-service` 单测回归 | codex | done |  |
| T-006 | 建立 lint 分层治理与增量门禁 | codex | done |  |
| T-007 | 本地验证 + 预发复测并回填 acceptance 证据 | codex | done |  |
| T-008 | 一次性清零 `pnpm lint` 的 errors/warnings（策略收敛） | codex | done |  |
| T-009 | 排查 Vercel 部署慢响应并落地首页首屏性能优化 | codex | done |  |
| T-010 | 登录态 Dashboard 性能专项优化（区域固定、接口拆分、首屏轻量化、超时降级） | codex | doing |  |

## 备注
- 已完成 T-004 ~ T-009 代码与验证闭环，`pnpm lint` 已清零，已落地首页性能优化。
- T-010 待办清单：
  1. 给 `dashboard` 路由组与慢 API（`/api/leaderboard/summary`、`/api/practice/bootstrap`）增加 `preferredRegion='sin1'`。
  2. 将 leaderboard / practice bootstrap 拆为“可缓存部分 + 用户私有部分”，减少重复实时查询。
  3. 将 `getDashboardStats()` 调整为首屏轻量数据路径，重计算从首屏阻塞链路移出。
  4. 前端数据请求增加超时与降级兜底（保留旧数据或展示轻量错误态），避免长时间白屏加载。
