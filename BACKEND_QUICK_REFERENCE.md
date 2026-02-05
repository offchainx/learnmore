# 后端实现快速参考指南

## 核心文件速查表

### 数据库与ORM

| 文件 | 行数 | 用途 | 关键内容 |
|------|------|------|---------|
| `prisma/schema.prisma` | 1057 | Prisma Schema定义 | 42个数据表、关系、索引 |
| `src/lib/prisma.ts` | 16 | Prisma客户端单例 | 生产安全的连接管理 |
| `prisma/seed.ts` | 330 | 数据库种子脚本 | 初始化演示数据 |

### 认证与授权

| 文件 | 行数 | 功能 |
|------|------|------|
| `src/actions/auth.ts` | 354 | 注册、登录、登出、自动同步 |
| `src/lib/supabase/server.ts` | 57 | 服务端Supabase客户端 + 会话管理 |
| `src/lib/supabase/client.ts` | 14 | 浏览器端Supabase客户端 |
| `src/lib/jwt.ts` | 109 | 伪装登录JWT签发/验证 |
| `src/lib/permissions/` | - | 权限引擎 (getEffectiveTier等) |

### 核心业务逻辑

| 模块 | 文件 | 行数 | 核心功能 |
|------|------|------|---------|
| 课程体系 | `src/actions/subject.ts` | 202 | 科目、章节、课程数据 |
| 学习进度 | `src/actions/progress.ts` | 76 | 视频进度追踪 |
| 测验系统 | `src/actions/quiz.ts` | 172 | 评分引擎 + 事务处理 |
| 用户资料 | `src/actions/profile.ts` | 131 | 资料更新 + Zod验证 |
| 社区互动 | `src/actions/community.ts` | 404 | 帖子、评论、点赞 |
| 排行榜 | `src/actions/leaderboard.ts` | 46 | 排序和排名 |
| 游戏化 | `src/actions/gamification.ts` | 93 | 任务、XP、条纹 |
| 通知系统 | `src/actions/notification.ts` | 205 | 站内通知 + 偏好管理 |
| 反馈系统 | `src/actions/feedback.ts` | 73 | 用户反馈（支持匿名） |

### 高级模块

| 模块 | 路径 | 说明 |
|------|------|------|
| 内容流水线 | `src/actions/content-pipeline/` | OCR + AI结构化 + 审核 |
| 练习中心 | `src/actions/practice/` | 智能推荐、错题本、配额管理 |
| 用户管理后台 | `src/actions/admin/` | 权限覆写、伪装登录 |
| 支付集成 | `src/actions/stripe-actions.ts` | Stripe支付处理 |
| 邮件服务 | `src/lib/email.ts` | Resend邮件发送 |

### API Routes

| 路由 | 说明 | 认证 |
|------|------|------|
| `/api/cron/cleanup-leaderboard` | 清理旧排行榜 | Bearer token |
| `/api/cron/trial-expiry` | 处理试用期到期 | Bearer token |
| `/api/webhook/stripe` | 支付回调 | Stripe签名 |
| `/api/auth/impersonate` | 伪装登录入口 | Token参数 |
| `/api/ai-tutor` | AI辅导API | Supabase auth |

---

## 常用代码片段

### 1. 获取当前用户

```typescript
import { getCurrentUser } from '@/actions/auth'

const user = await getCurrentUser()
if (!user) {
  return { success: false, error: 'Unauthorized' }
}
```

### 2. 数据库查询

```typescript
import prisma from '@/lib/prisma'

// 查找用户
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { settings: true }
})

// 创建记录
await prisma.post.create({
  data: { title, content, authorId: user.id }
})
```

### 3. 事务处理

```typescript
await prisma.$transaction(async (tx) => {
  await tx.user.update({ where: { id }, data: { xp: { increment: 10 } } })
  await tx.dailyTask.update({ where: { id: taskId }, data: { isClaimed: true } })
})
```

### 4. Zod验证

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const result = schema.safeParse(data)
if (!result.success) {
  return { error: result.error.issues[0].message }
}
```

### 5. 权限检查

```typescript
import { getEffectiveTier } from '@/lib/permissions/engine'

const tier = getEffectiveTier(user)
if (tier !== 'PREMIER') {
  return { error: 'Permission denied' }
}
```

### 6. 排行榜更新

```typescript
import { updateLeaderboardScore } from '@/actions/leaderboard'

await updateLeaderboardScore(userId, points)
```

### 7. 通知创建

```typescript
import { createInAppNotification } from '@/actions/notification'

await createInAppNotification({
  userId,
  type: 'ACHIEVEMENT',
  title: '成就达成',
  content: '你已解锁新成就',
  metadata: { achievementId }
})
```

---

## 开发工作流

### 启动开发环境

```bash
# 1. 安装依赖
pnpm install

# 2. 设置环境变量
cp .env.example .env.local

# 3. 推送Prisma Schema到数据库
npx prisma db push

# 4. 加载种子数据
pnpm db:seed

# 5. 启动开发服务器
pnpm dev
```

### 修改数据库Schema

```bash
# 1. 修改 prisma/schema.prisma

# 2. 本地测试
npx prisma db push

# 3. 生成Prisma Client
npx prisma generate

# 4. 生产环境迁移
npx prisma migrate dev --name description
npx prisma migrate deploy
```

### 添加新的Server Action

```bash
# 1. 创建文件：src/actions/my-feature.ts
# 2. 添加 'use server' 指令
# 3. 导入 prisma 和 getCurrentUser
# 4. 实现业务逻辑
# 5. 添加Zod验证
# 6. 从Client Component导入调用
```

### 质量检查

```bash
# 类型检查
pnpm tsc --noEmit

# 代码审查
pnpm lint
pnpm lint:fix

# 单元测试
pnpm test

# 完整构建
pnpm build
```

---

## 数据流向图

### 用户注册流

```
Frontend Form
    ↓ signupAction()
Zod验证 → Referral验证 → Supabase Auth
    ↓
Auth Trigger
    ↓
public.users (自动创建)
    ↓
Upsert补救 → UserSettings → Notification + Email
    ↓
/dashboard
```

### 测验提交流

```
Frontend submitQuiz()
    ↓
权限检查 → Zod验证
    ↓
查询题目 → 评分
    ↓
事务处理
  ├─ ExamRecord (创建)
  ├─ UserAttempt[] (创建)
  └─ ErrorBook (更新)
    ↓
排行榜更新 → 游戏化触发
    ↓
返回结果
```

### 支付回调流

```
Stripe webhook
    ↓
签名验证
    ↓
User.subscriptionTier + 期限更新
    ↓
发送收据通知
    ↓
查找Referral
    ↓
发放推荐奖励
```

---

## 常见问题与解决方案

### Q: 如何追踪用户进度丢失问题?

A: 检查三个地方：
1. `UserProgress` 表 (UPDATE时间戳)
2. `ExamRecord` 表 (submitQuiz时的记录)
3. `SecurityLog` 表 (用户操作审计)

### Q: 如何调试权限拒绝?

A: 
```typescript
// 1. 检查用户状态
const user = await getCurrentUser()
console.log('User tier:', user?.subscriptionTier)

// 2. 检查权限覆写
const overrides = user?.permissionOverrides
console.log('Overrides:', overrides)

// 3. 检查有效期
const tier = getEffectiveTier(user)
console.log('Effective tier:', tier)
```

### Q: 如何实现分布式事务?

A: 使用Prisma事务（当前）:
```typescript
await prisma.$transaction(async (tx) => { ... })
```

后期: 使用消息队列 (RabbitMQ) 或 Saga模式

### Q: 如何处理并发问题?

A: 对于高并发场景，使用：
- 乐观锁：version字段
- 版本控制：Content表的version字段
- 或迁移到Redis（V2.0+）

---

## 部署检查清单

- [ ] 所有环境变量已设置
- [ ] 数据库迁移已部署 (`npx prisma migrate deploy`)
- [ ] Cron jobs已配置在vercel.json
- [ ] Stripe Webhook已注册
- [ ] 邮件模板已配置
- [ ] CORS策略已检查
- [ ] 环境日志已启用
- [ ] 备份计划已确认
- [ ] SSL证书已安装
- [ ] 性能监控已部署

---

## 关键指标监控

### 数据库性能

```sql
-- 检查慢查询
SELECT * FROM pg_stat_statements WHERE mean_exec_time > 100;

-- 检查表大小
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables;
```

### API响应时间

- Server Actions: Target P95 < 200ms
- 数据库查询: Target < 50ms
- 页面加载: FCP < 1s, TTI < 3s

### 用户活跃度

- DAU (Daily Active Users)
- 错题本利用率
- 排行榜参与率
- 通知打开率

---

## 相关文档

- 完整调查报告: `BACKEND_INVESTIGATION_REPORT.md`
- 产品需求文档: `docs/PRD.md`
- 技术栈指南: `docs/TECH_STACK.md`
- 故事库索引: `docs/stories/README.md`

---

生成: 2026-02-05 | 项目: LearnMore
