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
| T-010 | 登录态 Dashboard 性能专项优化（区域固定、接口拆分、首屏轻量化、超时降级） | codex | done |  |
| T-011 | 登录态 Dashboard 二轮提速（鉴权快路径、重复鉴权去重、请求链路减载） | codex | done | `1bf157d` |

## 备注
- 已完成 T-004 ~ T-009 代码与验证闭环，`pnpm lint` 已清零，已落地首页性能优化。
- T-010 待办清单：
  1. 给 `dashboard` 路由组与慢 API（`/api/leaderboard/summary`、`/api/practice/bootstrap`）增加 `preferredRegion='sin1'`。
  2. 将 leaderboard / practice bootstrap 拆为“可缓存部分 + 用户私有部分”，减少重复实时查询。
  3. 将 `getDashboardStats()` 调整为首屏轻量数据路径，重计算从首屏阻塞链路移出。
  4. 前端数据请求增加超时与降级兜底（保留旧数据或展示轻量错误态），避免长时间白屏加载。
- T-010 执行结果（2026-03-09）：
  1. 已完成 4 项改造并部署到 `dpl_CXvF7F6yi7gWCdGcuZQzsKXdJ917`。
  2. 已登录 Sidebar 跳转 `urlChanged` 从约 `5~8s` 降至约 `0.75~0.86s`（`courses/practice/leaderboard/community`）。
- T-011 目标（2026-03-09）：
  1. 解决 Dashboard 路由仍有约 `4s+` 响应延迟的问题。
  2. 优先优化“同一请求链重复远程鉴权”导致的额外耗时。
- T-011 执行结果（2026-03-09）：
  1. 已提交 `1bf157d` 并部署 `dpl_4hbqXerqBa4y8JiAPXskt8jwCzwu`（`learnmorev10.vercel.app` 已切流）。
  2. 已落地改造：
     - middleware 注入内部鉴权上下文 `x-lm-auth-user-id`；
     - `getCurrentUser` 增加 header 快路径与请求级缓存，避免同请求链重复远程鉴权；
     - dashboard 子页面切换到 `getDashboardShellProfile`，减少重复查库。
  3. 登录态复测（生产）：
     - 全页 `domcontentloaded`：`/dashboard/courses` 约 `6.0s -> 2.8s`、`/dashboard/practice` 约 `4.6s -> 1.9s`、`/dashboard/leaderboard` 约 `4.7s -> 2.1s`、`/dashboard/community` 约 `4.5s -> 2.1s`；
     - `/dashboard` 仍约 `10.7s` 级别，仍是主瓶颈。
