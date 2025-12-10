# Story-005-seed-data: Seed Data & Admin Tools

**Phase**: Phase 1: Foundation
**Goal**: 预置系统基础数据,确保开发时有内容可展示
**预估时间**: 2-3 Hours
**Story Points**: 3
**前置依赖**: Story-002
**负责人**: _待分配_

---

## 1. Objectives (实现目标)

- [ ] 编写 `prisma/seed.ts` 脚本。
- [ ] 生成 6 大学科 (Subjects) 数据。
- [ ] 生成层级章节数据 (Chapters) - 至少 3 层嵌套。
- [ ] 生成部分示例题目 (Questions) 和 视频课时 (Lessons)。
- [ ] 配置 `package.json` 中的 `prisma seed` 命令。

---

## 2. Tech Plan (技术方案)

- Prisma Client: `prisma.subject.create`, `prisma.chapter.create`。
- Faker.js (可选): 生成随机文本。
- Transaction: 确保数据插入原子性。

---

## 3. Verification (测试验收)

### 功能性测试

- [ ] 数据播种脚本可重复执行 (幂等性)
- [ ] 数据关联关系正确
- [ ] 数据格式符合Schema定义

### 数据质量测试

- [ ] 必填字段都有值
- [ ] 枚举值在允许范围内
- [ ] 日期/时间格式统一

### 性能测试

- [ ] 播种脚本执行时间 < 30s
- [ ] 数据库查询有正确索引
- [ ] 大批量插入使用事务

---

## 4. Deliverables (交付物)

- ✅ 完整的功能实现
- ✅ 相关测试代码 (单元测试/集成测试)
- ✅ Git Commit: `"feat: implement seed data & admin tools"`
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

- 数据播种错误导致数据损坏
- 数据迁移失败

**回滚步骤**:

```bash
# 1. 从备份恢复数据库
# Supabase Dashboard -> Backups -> Restore

# 2. 或手动删除错误数据
DELETE FROM table_name WHERE created_at > '2025-12-09';

# 3. 重新运行修复后的脚本
pnpm db:seed
```

**预防措施**:

- 播种前自动备份数据库
- 使用事务确保原子性
- 在Dev环境先测试

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

_(开发时填写)_

### 解决方案

_(开发时填写)_

### 可复用的代码片段

_(开发时填写)_

### 时间记录

- **预估时间**: 2-3 Hours
- **实际时间**: \_\_\_ hours
- **偏差分析**: \_\_\_

---

**创建时间**: 2025-12-09
**最后更新**: 2025-12-09
**状态**: Backlog ⚪
**风险等级**: 🟢 低
