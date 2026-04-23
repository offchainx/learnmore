# Memory Sync Checklist

## 回写目标
- [`docs/memory-bank/active_context.md`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/docs/memory-bank/active_context.md)
- [`docs/memory-bank/progress.md`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/docs/memory-bank/progress.md)

## 触发条件
- [ ] 冻结了新的稳定边界或设计方向
- [ ] 完成了一个工作流主线 spec（`ws-*`）
- [ ] 完成了一个页面域 rollout 或阶段性收口
- [ ] 发现了会影响后续对话质量的新规则或新风险

## 执行清单
- [ ] 先更新对应 root / 子 spec 的 `spec.md` 或 `tasks.md`
- [ ] 再在 `harness/conversation-ledger.md` 记录本轮有效回合结论
- [ ] 若属于长期记忆，回写 `active_context.md`
- [ ] 若属于阶段进度，回写 `progress.md`
- [ ] 若涉及 v0 方法论或 prompt 习得，补到 `v0-prompt-ledger.md`

## 说明
- `harness/` 负责任务内追踪，不替代 memory-bank
- memory-bank 只保存跨会话仍需要长期保留的关键信息
