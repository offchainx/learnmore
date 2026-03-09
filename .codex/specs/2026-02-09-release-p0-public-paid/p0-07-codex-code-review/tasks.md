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

## 备注
- 已完成 T-004 ~ T-009 代码与验证闭环，`pnpm lint` 已清零，已落地首页性能优化。
