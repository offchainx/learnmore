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
| Findings 完整性 | 审阅 `spec.md` / `tasks.md` | 包含严重级别、定位、建议 |  |  |
| RLS 策略覆盖 | 执行迁移并核对策略表 | 启用 RLS 表均有策略 |  |  |
| Practice 定向测试 | `pnpm vitest --run src/actions/practice/__tests__/data-service.test.ts` | 全部通过 |  |  |
| 门禁可执行性 | 分层执行 `pnpm lint` | 至少可识别新增问题 |  |  |

## 发布检查
- [ ] Findings 与修复优先级经用户确认
- [ ] RLS 发布链路风险已收敛
- [ ] Practice 回归测试通过
- [ ] lint 门禁具备执行路径
- [ ] 本地与预发证据完整
