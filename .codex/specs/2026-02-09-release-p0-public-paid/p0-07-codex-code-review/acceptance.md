# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：P0-07 已固定 findings 列表
  当：按优先级执行修复
  则：P1/P2 风险均有对应验证证据。
- 给定：RLS 已启用
  当：执行策略覆盖检查
  则：业务表不存在“启用 RLS 但无可用策略”的状态。
- 给定：Practice 数据服务回归修复完成
  当：执行定向测试
  则：`data-service` 相关测试全部通过。

## 验证矩阵（本地 + 预发）
| 检查项 | 命令/动作 | 预期结果 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|
| Findings 完整性 | 审阅 `spec.md` / `tasks.md` | 包含严重级别、定位、建议 | pass | 2026-03-09：P0-07 文档含 P1/P2 风险、修复策略与任务状态 |
| RLS 策略覆盖 | `node scripts/verify-rls-migration-guard.mjs` | 启用 RLS 表均有策略 | pass | 输出：`009...` 与 `010...` 满足发布链路要求 |
| Practice 定向测试 | `pnpm vitest --run src/actions/practice/__tests__/data-service.test.ts` | 全部通过 | pass | 输出：`3 passed (3)` |
| 门禁可执行性 | `git add -A && pnpm codex:check`（含 staged 代码） | 能识别并拦截问题，修复后可通过 | pass | 首次拦截 `data-service.ts no-explicit-any`；修复后门禁通过 |
| Vercel 慢响应诊断（T-009） | `curl -w` 对比 `learnmorev10.vercel.app` / preview / localhost + 响应头分析 | 明确瓶颈并给出修复 | pass | 生产首页 TTFB 约 2.70~2.93s 且 `x-vercel-cache: MISS` + `cache-control: private,no-store`；`x-vercel-id` 显示 `sin1::iad1`（跨区执行）；已落地 `preferredRegion='sin1'` + stats 缓存 + 移除首页服务端 `getSession()` 并启用 `dynamic='force-static'` 与 `revalidate=300`；本地生产模式验证 `/` 为静态 ISR，响应头 `Cache-Control: s-maxage=300`、`x-nextjs-cache: HIT` |

## 发布检查
- [x] Findings 与修复优先级经用户确认
- [x] RLS 发布链路风险已收敛
- [x] Practice 回归测试通过
- [x] lint 门禁具备执行路径
- [x] 本地与预发证据完整
