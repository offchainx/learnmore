# Story-011-quiz-mode: Quiz Mode Logic

**Phase**: Phase 3: Question Bank
**Goal**: 实现完整的答题流程控制
**预估时间**: 6-8 Hours
**Story Points**: 8
**前置依赖**: Story-010
**负责人**: _待分配_

---

## 1. Objectives (实现目标)

- [ ] 实现题目分页/切换 (上一题/下一题)。
- [ ] 实现答题倒计时 (Timer)。
- [ ] 实现答题卡 (Grid View) 快速跳转。
- [ ] 管理 `currentAnswers` 临时状态。

---

## 2. Tech Plan (技术方案)

- State: Zustand Store (`quiz-store`) 管理答题会话。
- Storage: `localStorage` 暂存防止刷新丢失 (可选)。

---

## 3. Verification (测试验收)

### 功能性测试

- [ ] 核心业务逻辑正确执行
- [ ] 边缘情况处理正常 (空数据、错误输入等)
- [ ] 错误提示清晰友好

### 单元测试

- [ ] 关键函数有单元测试覆盖 (覆盖率 > 80%)
- [ ] 测试用例包含正常流程和异常流程
- [ ] Mock 外部依赖 (数据库、API等)

### 性能测试

- [ ] 核心函数执行时间 < 50ms
- [ ] 批量操作性能可接受 (如批量判卷)
- [ ] 无内存泄漏

---

## 4. Deliverables (交付物)

- ✅ 完整的功能实现
- ✅ 相关测试代码 (单元测试/集成测试)
- ✅ Git Commit: `"feat: implement quiz mode logic"`
- ✅ Preview URL (Vercel自动部署)

---

## 5. Definition of Done (完成标准)

### 代码质量

- [ ] 通过 ESLint 检查 (0 errors, 0 warnings)
- [ ] 通过 TypeScript 类型检查 (`pnpm tsc --noEmit`)
- [ ] 代码复杂度在合理范围 (关键函数 < 15行)
- [ ] 有必要的代码注释

### 测试覆盖

- [ ] 关键功能有测试覆盖
- [ ] 测试通过 (`pnpm test`)
- [ ] 手动测试所有验收标准

### 文档完整

- [ ] README 更新 (如有新功能需说明)
- [ ] API文档更新 (如有新接口)
- [ ] 代码中的 TODO 已处理或转为Issue

### 部署就绪

- [ ] Staging环境验证通过
- [ ] Performance检查通过 (Lighthouse/Web Vitals)
- [ ] 无安全漏洞 (运行 `pnpm audit`)

---

## 6. Rollback Plan (回滚预案)

**触发条件**:

- 业务逻辑错误导致数据不一致
- 性能严重下降影响用户

**回滚步骤**:

```bash
# 1. 立即回滚代码
git revert <commit-hash>
vercel --prod

# 2. 检查数据一致性
# 运行数据修复脚本 (如适用)

# 3. 通知受影响用户
```

**预防措施**:

- 关键逻辑有完整单元测试
- Code Review重点关注边缘情况
- 分阶段发布 (金丝雀部署)

---

## 7. Post-Completion Actions (完成后行动)

### 立即执行

- [ ] 将此文件从 `backlog/` 移至 `completed/`
- [ ] 更新项目进度 (README.md)
- [ ] 通知团队成员

### 可选执行

- [ ] 录制功能演示视频
- [ ] 写开发日志 (遇到的问题和解决方案)
- [ ] 提取可复用组件到组件库

### 监控设置

- [ ] 在 Sentry 设置错误追踪
- [ ] 在 Vercel Analytics 查看性能指标
- [ ] 记录基线数据 (用于后续对比)

---

## 8. Notes & Learnings (开发过程中填写)

### 遇到的坑

- `setInterval` 在 React 组件中配合 Zustand Store 更新时，如果直接使用 `setTimer(prev => prev - 1)` 这种函数式更新，需要确保 Store 的 Action 支持函数参数。
- shadcn/ui 的 `Button` 组件在 `variant="secondary"` 时有特定样式，可能与自定义的背景色冲突。

### 解决方案

- 在 Zustand Store 中新增 `decrementTimer` Action，将倒计时逻辑移入 Store 内部，组件只负责定时触发。
- 使用 `variant="outline"` 配合条件类名来处理答题卡样式，通过 `!isCurrent && isAnswered` 确保样式优先级正确。

### 可复用的代码片段

- `QuizTimer` 组件可以作为通用的倒计时组件，只需传入不同的 Store Action 即可。

### 时间记录

- **预估时间**: 6-8 Hours
- **实际时间**: 2 hours
- **偏差分析**: 核心逻辑较为清晰，且复用了现有的 QuestionCard 组件，节省了大量时间。

---

**创建时间**: 2025-12-09
**最后更新**: 2025-12-11
**状态**: Completed ✅
**风险等级**: 🟡 中
