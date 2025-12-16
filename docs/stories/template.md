# Story-[ID]: [标题]

## 1. 目标 (Objectives)
- [ ] **核心问题**: (一句话描述本 Story 解决的核心痛点)
- [ ] **功能范围**: 
    - 页面: (例如: `/course/[id]`)
    - 组件: (例如: `VideoPlayer`, `QuizCard`)
    - 逻辑: (例如: 完成视频后自动解锁下一节)

## 2. 技术方案 (Technical Plan)
- **架构设计**:
    - [ ] 前端组件拆分策略
    - [ ] 数据流向 (Server Component -> Client Component)
    - [ ] 状态管理 (URL State / Zustand / Local State)
- **后端支持**:
    - [ ] Server Actions (例如: `updateProgress`, `getCourseDetails`)
    - [ ] Database Schema 变更 (如需)
- **关键依赖**: (是否引入新库? 版本号?)

## 3. 测试验收 (Test & Acceptance)
- [ ] **单元测试 (Unit Tests)**:
    - `test_function_a`: (预期行为)
    - `test_function_b`: (预期行为)
- [ ] **手动测试 (Manual Steps)**:
    1. 登录 -> 点击 A -> 期望看到 B
    2. 断网情况下的表现
    3. 错误输入的表现

## 4. 交付物 (Deliverables)
- [ ] 修改的文件列表 (关键路径)
- [ ] 新增的组件/API
- [ ] 数据库迁移文件 (如有)

## 5. 完成标准 (Definition of Done)
- [ ] 代码通过 ESLint 检查 (`npm run lint`)
- [ ] 项目成功构建 (`npm run build`)
- [ ] 所有新老测试用例通过 (`npm run test`)
- [ ] UI 在移动端和桌面端表现符合预期
- [ ] 无明显的 TypeScript `any` 类型使用

## 6. 回滚预案 (Rollback Plan)
- [ ] **代码回滚**: `git revert <commit-hash>`
- [ ] **数据回滚**: (如有数据库变更，提供回滚 SQL 或 Prisma Down 脚本)
- [ ] **功能开关**: (是否可以通过 Feature Flag 关闭?)

## 7. 完成后行动 (Post-Completion)
- [ ] 更新 `docs/memory-bank/active_context.md`
- [ ] 更新 `docs/memory-bank/progress.md`
- [ ] 通知相关人员 (模拟)

## 8. 遇到的坑 (Pitfalls & Notes)
- *(开发过程中实时记录)*
- [ ] 坑 1: ... (解决方案: ...)
- [ ] 坑 2: ... (解决方案: ...)
