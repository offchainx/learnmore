# Stories 快速启动指南

**适用人群**: 项目开发者
**更新时间**: 2025-12-09

---

## 🚀 5分钟快速了解

### 项目现状

✅ **20个Story已全部优化完成**
✅ **符合BMAD-METHOD标准**
✅ **可直接用于开发**

### 文档结构

```
docs/stories/
├── README.md                   # 总览 + 依赖关系图 ⭐ 先看这个
├── RETROSPECTIVE.md            # 回顾会议模板
├── OPTIMIZATION_SUMMARY.md     # 优化报告
├── QUICK_START.md             # 本文档
├── backlog/                   # 待办Story (20个)
├── active/                    # 进行中 (最多3个)
└── completed/                 # 已完成
```

---

## 📋 开始第一个Story

### Step 1: 选择Story

打开 `README.md`,查看依赖关系图,选择:

- **没有前置依赖** 的Story (如Story-001)
- 或**前置依赖已完成** 的Story

### Step 2: 阅读Story文档

```bash
cd docs/stories/backlog
open story-001-infra.md  # macOS
# 或
cat story-001-infra.md   # Linux
```

### Step 3: 创建开发分支

```bash
git checkout -b feature/story-001-infra
```

### Step 4: 将Story移至active

```bash
mv docs/stories/backlog/story-001-infra.md docs/stories/active/
git add .
git commit -m "chore: start Story-001"
```

### Step 5: 开发

按照Story的"2. Tech Plan"章节执行:

```bash
# 例如 Story-001 的步骤:
pnpm create next-app@latest . --typescript --tailwind --eslint
npx shadcn-ui@latest init
pnpm add @prisma/client @supabase/ssr zod zustand
# ...
```

### Step 6: 验证

勾选"3. Verification"中的所有checkbox:

```markdown
- [x] 运行 `pnpm dev`,应用启动成功
- [x] 访问首页,无控制台错误
- [x] 页面显示 Shadcn Button,样式正确
```

### Step 7: 完成检查

确保"5. Definition of Done"的所有项目都完成:

```bash
pnpm lint        # 代码质量
pnpm tsc --noEmit  # 类型检查
pnpm test        # 测试
pnpm build       # 构建
```

### Step 8: 提交代码

```bash
git add .
git commit -m "feat: implement Infrastructure Initialization

Story-001: Infrastructure Initialization
- Next.js 14+ (App Router) 项目初始化成功
- Tailwind CSS + Shadcn/ui 配置完成
- 环境变量配置完成

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin feature/story-001-infra
```

### Step 9: 完成Story

```bash
# 移动到completed
mv docs/stories/active/story-001-infra.md docs/stories/completed/

# 更新状态标记
sed -i '' 's/Backlog ⚪/Completed ✅/g' docs/stories/completed/story-001-infra.md

git add .
git commit -m "chore: complete Story-001"
```

### Step 10: 填写开发日志

在Story的"8. Notes & Learnings"中记录:

```markdown
### 遇到的坑

- Shadcn init时选择了错误的颜色,需要重新运行

### 解决方案

- 删除 components.json 后重新运行 shadcn-ui init

### 实际时间

- 预估时间: 1.5-2 hours
- 实际时间: 2.5 hours
- 偏差分析: Supabase配置比预期复杂
```

---

## 🎯 关键Story注意事项

### Story-002 (Database Schema) 🔴 高风险

**必读**:

- 仔细Review Prisma Schema
- 先在Dev环境测试Auth Trigger
- 执行Migration前备份数据库

**验证重点**:

```sql
-- 验证Auth Trigger是否工作
SELECT a.id, a.email, u.id as user_id
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.id
LIMIT 5;
```

### Story-003 (Authentication) 🔴 高风险

**必读**:

- 测试所有认证场景 (登录/注册/登出)
- 验证路由保护正常工作
- 检查Session管理

**安全检查清单**:

```markdown
- [ ] 密码不在客户端明文传输 ✅ (HTTPS)
- [ ] Session Token存储在HttpOnly Cookie ✅
- [ ] 没有SQL注入风险 ✅ (Prisma)
- [ ] 没有XSS风险 ✅ (React自动转义)
```

### Story-012 (Grading Engine) 🔴 高风险

**必读**:

- 单元测试覆盖率 > 90%
- 测试所有题型 (单选/多选/填空/简答)
- 测试边缘情况 (空答案、格式错误等)

**测试用例示例**:

```typescript
// 单选题正确答案
expect(
  gradeQuestion({
    type: 'SINGLE_CHOICE',
    answer: 'A',
    userAnswer: 'A',
  })
).toBe(true)

// 多选题部分正确
expect(
  gradeQuestion({
    type: 'MULTIPLE_CHOICE',
    answer: ['A', 'C'],
    userAnswer: ['A', 'B'],
  })
).toBe(false)
```

### Story-019 (Leaderboard) ⚠️ 已变更

**重要**:

- 从Redis方案改为PostgreSQL
- 注意性能监控
- 达到触发条件时迁移Redis

**性能监控**:

```bash
# 检查查询性能
EXPLAIN ANALYZE
SELECT * FROM leaderboard_entries
WHERE period = 'WEEKLY'
ORDER BY score DESC
LIMIT 100;

# 预期: < 200ms
```

---

## 📊 Story优先级

### 立即开始 (Week 1)

1. **Story-001** (Infrastructure) - 2h
2. **Story-002** (Database Schema) - 4-6h

### 尽快完成 (Week 1-2)

3. **Story-003** (Authentication) - 6-8h
4. **Story-004** (Layout) - 4-6h
5. **Story-005** (Seed Data) - 2-3h

### 核心功能 (Week 2-3)

6. **Story-006** (Course Tree) - 6-8h
7. **Story-010** (Question UI) - 6-8h

### 高风险优先 (Week 3-4)

12. **Story-012** (Grading Engine) - 6-8h

### 其他Story

按依赖关系和团队容量安排

详见: `README.md` 的依赖关系图

---

## 🛠 常用命令

### 开发环境

```bash
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器
```

### 代码质量

```bash
pnpm lint             # ESLint检查
pnpm lint:fix         # 自动修复
pnpm tsc --noEmit     # TypeScript类型检查
pnpm format           # Prettier格式化
```

### 数据库

```bash
npx prisma generate   # 生成Prisma Client
npx prisma db push    # 同步Schema (Dev)
npx prisma migrate dev  # 创建Migration
npx prisma migrate deploy  # 应用Migration (Prod)
npx prisma studio     # 可视化管理界面
pnpm db:seed          # 运行种子数据
```

### 测试

```bash
pnpm test             # 运行所有测试
pnpm test:watch       # 监听模式
pnpm test:coverage    # 覆盖率报告
```

### 部署

```bash
vercel                # 部署到Vercel (Preview)
vercel --prod         # 部署到生产环境
```

---

## 📞 常见问题

### Q: Story的Tech Plan太简略怎么办?

**A**:

1. 查看同类型Story的实现 (如Story-003的完整代码)
2. 参考项目的技术文档 (TECH_STACK.md, PRD.md)
3. 在开发过程中补充细节到Story文档

### Q: 发现Story的技术方案不合理?

**A**:

1. 先在团队内讨论
2. 提Issue说明问题和建议方案
3. 提PR修改Story文档
4. Approved后再改代码

### Q: Story开发超时怎么办?

**A**:

1. 在"Notes & Learnings"记录原因
2. 更新后续Story的时间预估
3. 在Retrospective会议中讨论

### Q: 如何处理Story之间的冲突?

**A**:

1. 检查依赖关系图,确认前置Story已完成
2. 如果确实有冲突,提Issue讨论
3. 必要时拆分或合并Story

### Q: 批量优化的Story质量如何保证?

**A**:

1. 脚本保证了结构一致性
2. 关键Story (001-003, 019) 已手动优化
3. 开发时根据实际情况微调内容
4. Code Review时重点检查

---

## 🎓 最佳实践

### 开发流程

1. ✅ **先读Story,后动手** (不要跳过Tech Plan)
2. ✅ **小步提交** (每完成一个Objective就commit)
3. ✅ **及时测试** (不要积累到最后统一测试)
4. ✅ **记录问题** (在Notes & Learnings记录遇到的坑)

### 代码规范

1. ✅ **遵循Tech Stack** (不要擅自引入新技术)
2. ✅ **类型安全** (启用TypeScript strict模式)
3. ✅ **组件复用** (提取公共组件到 `components/ui`)
4. ✅ **避免硬编码** (使用环境变量和配置文件)

### 测试规范

1. ✅ **关键路径必测** (如认证、支付、判卷等)
2. ✅ **边缘情况必测** (空数据、错误输入、网络失败等)
3. ✅ **性能必测** (按Story的性能指标验证)
4. ✅ **回归必测** (修改旧代码时运行相关测试)

### 文档规范

1. ✅ **代码注释** (复杂逻辑必须有注释)
2. ✅ **README更新** (新功能必须更新README)
3. ✅ **API文档** (新接口必须有文档)
4. ✅ **Story更新** (发现问题及时更新Story文档)

---

## 📚 相关资源

### 项目文档

- [PRD.md](../PRD.md) - 产品需求文档
- [TECH_STACK.md](../TECH_STACK.md) - 技术架构文档
- [CLAUDE.md](../../CLAUDE.md) - AI开发指南

### Story文档

- [README.md](./README.md) - Stories总览 ⭐
- [RETROSPECTIVE.md](./RETROSPECTIVE.md) - 回顾模板
- [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) - 优化报告

### 外部资源

- [Next.js文档](https://nextjs.org/docs)
- [Prisma文档](https://www.prisma.io/docs)
- [Supabase文档](https://supabase.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)

---

## ✅ 检查清单

在开始开发前,确认:

- [ ] 已阅读 `README.md` 了解项目全貌
- [ ] 已查看依赖关系图,确认Story可以开始
- [ ] 已阅读完整Story文档 (不要只看Objectives)
- [ ] 已配置本地开发环境 (Node.js, pnpm, Git)
- [ ] 已获取必要的环境变量 (Supabase密钥等)

在提交代码前,确认:

- [ ] 所有Verification测试通过
- [ ] 所有DoD检查项完成
- [ ] 代码已格式化 (`pnpm format`)
- [ ] Git Commit Message符合规范
- [ ] Story文档的"Notes & Learnings"已填写

---

**祝开发顺利! 🚀**

如有问题,请查看 `OPTIMIZATION_SUMMARY.md` 或提Issue讨论。
