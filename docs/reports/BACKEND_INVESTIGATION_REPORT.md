# 学习应用（LearnMore）数据库和后端实现状态深度调查报告

生成时间：2026-02-05
项目位置：/Users/victorsim/Desktop/Projects/learn_more_v1.0

---

## 执行摘要

本项目是一个**Next.js全栈应用**，采用 **BFF（Backend for Frontend）** 架构模式。
- **数据库**：PostgreSQL（通过Supabase）
- **ORM**：Prisma（实施强隔离）
- **后端**：Next.js Server Actions + API Routes
- **认证**：Supabase Auth + 自定义用户表同步
- **状态**：✅ **生产级别实现**（已完成 Story-001 至 Story-047）

---

## 1. 数据库架构分析

### 1.1 Prisma Schema 概览

**位置**：`/Users/victorsim/Desktop/Projects/learn_more_v1.0/prisma/schema.prisma`

**数据库类型**：PostgreSQL via Supabase

**主要模块**：

| 模块 | 表数量 | 说明 |
|------|--------|------|
| 用户系统 | 6个 | User, UserSettings, ParentStudent, InviteCode, UserBadge, Badge |
| 课程体系 | 3个 | Subject, Chapter, ChapterPrerequisite |
| 学习内容 | 2个 | Lesson, BlogPost |
| 学习进度 | 1个 | UserProgress |
| 题库系统 | 4个 | Question, UserAttempt, ExamRecord, ErrorBook |
| 游戏化 | 1个 | DailyTask |
| 社区互动 | 3个 | Post, Comment, PostLike |
| 排行榜 | 1个 | LeaderboardEntry |
| 推荐系统 | 2个 | Referral, Subscriber |
| 内容管道 | 7个 | SourceFile, QuestionGroup, QuestionTag, QuestionTagRelation, KnowledgePoint, KnowledgePointRelation, ContentReviewLog, QuestionReport |
| 用户管理后台 | 4个 | AdminNote, SecurityLog, ImpersonationSession, UserPermissionOverride |
| 通知与反馈 | 3个 | Notification, NotificationPreference, UserFeedback, ContactSubmission |

**总计**：42 个表格

### 1.2 关键设计特性

#### A. 认证同步机制（Auth Trigger）
```
Supabase auth.users ←→ PostgreSQL trigger ←→ public.users
```
- 自动同步：新注册用户通过触发器自动创建到 `public.users`
- 备用同步：Server Action 中的 upsert 逻辑确保数据一致性
- 文件：`signupAction()` 和 `getCurrentUser()` 在 `/src/actions/auth.ts`

#### B. 数据隔离原则（Prisma Isolation）
✅ 所有数据库操作**必须**通过 Prisma（禁止原生SQL）
- Server Actions 中确保导入：`import prisma from '@/lib/prisma'`
- 禁止在 Client Components 中导入 Prisma（'use client' 强制隔离）

#### C. 级联删除配置
```prisma
@relation(..., onDelete: Cascade)  // 大多数关联
@relation(..., onDelete: SetNull)   // 某些引用（如 Chapter.parent）
```
示例：删除User自动删除其所有Posts、Comments、UserProgress等

#### D. 索引优化
关键字段已建立索引以支持高频查询：
- `User.id`, `User.email` (unique索引)
- `Question.chapterId`, `Question.difficulty`, `Question.status`
- `UserAttempt.userId`, `UserAttempt.createdAt` (复合索引用于配额检查)
- `LeaderboardEntry.period, weekStart, score` (排序索引)

### 1.3 核心枚举类型

```typescript
// 用户角色
enum UserRole { STUDENT, PARENT, TEACHER, ADMIN }

// 用户账户状态
enum UserAccountStatus { ACTIVE, BANNED, PAUSED }

// 订阅层级
enum SubscriptionTier { STARTER, STANDARD, SMART_PLUS, PREMIER }

// 题目类型
enum QuestionType { 
  SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_BLANK, ESSAY, TRUE_FALSE 
}

// 内容状态（流水线）
enum ContentStatus {
  DRAFT, OCR_PROCESSING, OCR_COMPLETED, STRUCTURING,
  REVIEW_PENDING, REVIEW_REJECTED, VERIFIED, PUBLISHED, ARCHIVED
}

// 题库模式
enum PracticeMode {
  SMART_DRILL, ERROR_WIPER, MOCK_EXAM, CHAPTER_DRILL, PAST_PAPER
}

// 排行榜周期
enum LeaderboardPeriod { WEEKLY, MONTHLY, ALL_TIME }
```

---

## 2. 后端实现状态

### 2.1 Prisma 客户端配置

**文件**：`/src/lib/prisma.ts`

```typescript
// 单例模式 + 全局挂载（防止热重载重复创建）
const prismaClientSingleton = () => new PrismaClient()
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}
const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') 
  globalThis.prisma = prisma
```

**特点**：
- ✅ 生产环境安全（避免连接池溢出）
- ✅ 开发环境热重载友好

### 2.2 Server Actions 全景

**总数**：39个Server Actions（所有文件都有 'use server' 指令）

**按模块分类**：

#### 核心认证模块 (`src/actions/auth.ts`)
```typescript
// 公开函数
- signupAction(formData)          // 用户注册 + 推荐码支持
- loginAction(formData)            // 用户登录
- logoutAction()                   // 用户登出
- getCurrentUser()                 // 获取当前登录用户 ✅ 自动同步
- syncCurrentUserToDatabase()      // 手动同步（修复不一致）

// 特性
+ 推荐码验证（8位大小写字母+数字）
+ 试用期自动授予（STANDARD 7天）
+ 用户级别权限验证
```

#### 课程体系模块 (`src/actions/subject.ts`)
```typescript
- getAllSubjects()                 // 获取所有科目
- getSubjectDetails(subjectId)     // 获取课程树（章节+课程）
- getLessonData(lessonId)          // 获取课程详情 + 题库（限制非付费）

// 特性
+ 用户进度数据填充
+ 权限检查（full_question_bank访问限制）
+ 下一课程自动计算
```

#### 学习进度模块 (`src/actions/progress.ts`)
```typescript
- updateUserLessonProgress(lessonId, progressInSeconds)

// 特性
+ 百分比计算 (progress / duration * 100)
+ 90% 自动完成触发
+ 自动条纹检查和日常任务追踪
+ 30秒防抖（隐含：客户端实现）
```

#### 测验提交模块 (`src/actions/quiz.ts`)
```typescript
- submitQuiz(data: { answers, chapterId, duration })

// 核心逻辑
✅ Grading Engine（支持4种题型）
  - SINGLE_CHOICE: 字符串直接比较
  - MULTIPLE_CHOICE: 排序后数组比较
  - FILL_BLANK: trim() + includes() 支持多个答案
  - ESSAY: 不支持（自动 false）

✅ 事务处理：ExamRecord + UserAttempt + ErrorBook（原子操作）
✅ 排行榜更新：correctCount * 10 积分
✅ 游戏化触发：条纹刷新 + 日常任务追踪
```

#### 用户资料模块 (`src/actions/profile.ts`)
```typescript
- getProfile()                     // 获取完整资料 + 成就 + 统计
- updateProfile(formData)          // 更新资料 + 设置

// 特性
+ Zod 验证 (username/grade/avatar/语言/主题)
+ 用户名唯一性检查
+ 事务处理（同时更新 User 和 UserSettings）
```

#### 社区互动模块 (`src/actions/community.ts`)
```typescript
- getPosts(params)                 // 分页查询 (搜索/过滤)
- createPost(title, content, ...)  // 创建帖子
- getPostById(postId)              // 获取帖子详情 + 评论
- createComment(postId, content)   // 创建评论 + 社交通知
- toggleLike(postId)               // 点赞/取消点赞（事务）

// 特性
+ 多条件查询 (subjectId, category, 未解决)
+ 已读状态追踪 (userLiked)
+ 评论自动通知发布者
```

#### 排行榜模块 (`src/actions/leaderboard.ts`)
```typescript
- updateLeaderboardScore(userId, points)
- getLeaderboard(period, limit=100)
- getUserRank(userId, period)

// 适配器模式：使用 PostgreSQL 适配器
类 PgAdapter 负责具体实现（可后期替换为 Redis）
```

#### 游戏化模块 (`src/actions/gamification.ts`)
```typescript
- completeOnboardingTask(type)     // 标记入门任务完成
- claimTaskReward(taskId)          // 领取任务奖励 + XP更新

// 支持 DailyTaskType:
LOGIN, COMPLETE_LESSON, FIX_ERROR, QUIZ_SCORE,
ONBOARDING_PROFILE, ONBOARDING_GOALS, ONBOARDING_ASSESSMENT
```

#### 通知系统模块 (`src/actions/notification.ts`)
```typescript
- createInAppNotification(params)  // 创建通知 + 偏好检查
- getNotifications(userId, limit)  // 获取通知列表
- markNotificationAsRead(notificationId)
- markAllAsRead()

// 特性
+ BILLING 类型强制放行（用户不能关闭）
+ 偏好开关支持 (inApp*, email*)
+ 未读计数独立获取
```

#### 反馈系统模块 (`src/actions/feedback.ts`)
```typescript
- submitFeedback(params)           // 支持匿名提交
- getUserFeedbacks()               // 获取用户反馈历史

// 特性
+ userId 可选（支持匿名）
+ email 自动填充或使用填写值
```

#### 其他高级模块
- `content-pipeline/` : OCR处理、质量检查、审核流程
- `practice/` : 智能推荐、错题本、数据服务、配额管理
- `admin/` : 权限覆写、用户操作、条纹伪装
- `parent.ts` : 亲子关系管理
- `settings.ts` : 用户偏好设置
- `blog.ts` : 博客文章
- `stripe-actions.ts` : Stripe集成
- `marketing.ts` : 营销相关
- `ai-tutor.ts` : AI辅导
- `storage.ts` : 文件存储操作

### 2.3 API Routes 列表

**共7个 API Route**（均为后端操作）：

| 路由 | 方法 | 说明 | 认证方式 |
|------|------|------|---------|
| `/api/cron/cleanup-leaderboard` | GET | 清理3个月前的排行榜数据 | Bearer token |
| `/api/cron/trial-expiry` | GET | 处理试用期到期 | Bearer token |
| `/api/webhook/stripe` | POST | Stripe 支付回调（订阅+推荐奖励） | Stripe signature |
| `/api/auth/impersonate` | GET | 伪装登录（入口） | Token参数 |
| `/api/auth/impersonate/status` | GET | 伪装登录状态检查 | Cookie |
| `/api/auth/impersonate/end` | POST | 伪装登录退出 | Cookie |
| `/api/ai-tutor` | POST | AI辅导API | Supabase auth |

### 2.4 中间件（Middleware）

**当前状态**：未找到项目根目录的 `middleware.ts` 文件

**含义**：
- 路由保护通过 **Server Components + getCurrentUser()** 实现
- 不依赖中间件层（设计选择）

### 2.5 Supabase 客户端配置

#### Browser Client (`/src/lib/supabase/client.ts`)
```typescript
// 创建匿名密钥客户端（用于客户端读取公开数据）
createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

#### Server Client (`/src/lib/supabase/server.ts`)
```typescript
// 创建服务端客户端（支持认证）
createServerClient(url, anonKey, { 
  cookies: {
    get(name) {...},
    set(name, value, options) {
      // ⭐ 关键：1小时滑动窗口
      maxAge: 3600  // 强制覆盖 Supabase 默认 400 天
    },
    remove(name, options) {...}
  }
})
```

**特性**：
- ✅ HttpOnly cookies（防 XSS）
- ✅ Secure 标志（生产环境 HTTPS）
- ✅ SameSite: lax（CSRF防护）
- ✅ 1小时会话自动刷新

---

## 3. 数据库种子数据

**文件**：`/Users/victorsim/Desktop/Projects/learn_more_v1.0/prisma/seed.ts`

### 3.1 种子流程
```
1. 清理现有数据 (deleteMany 所有表)
2. 创建 8 个科目 (Mathematics, Physics, ... Computer Science)
3. 每个科目创建 3 个章节
4. 每个章节创建 3 类课程 (VIDEO, DOCUMENT, QUIZ)
5. 为每个章节创建 2 个题目 (SINGLE_CHOICE, MULTIPLE_CHOICE)
6. 创建演示用户 (demo@learnmore.com) + 4个其他用户
7. 创建 3 个每日任务示例
8. 创建 3 篇博客文章
9. 创建社区帖子示例
10. 初始化排行榜数据 (WEEKLY)
```

### 3.2 执行命令
```bash
pnpm db:seed
```

---

## 4. Mock 数据和测试支持

### 4.1 Mock 数据文件

| 文件 | 用途 | 数据量 |
|------|------|-------|
| `/src/lib/mock/content-pipeline-data.ts` | 内容管道UI演示 | 6个批次 + 7条审计日志 + 3个题目样本 |
| `/src/components/admin/users/mock/userMockData.ts` | 用户管理UI演示 | 待确认 |
| `/src/lib/content-pipeline/providers/mock-ocr.ts` | OCR模拟提供者 | 待确认 |

### 4.2 测试覆盖

- `/src/actions/__tests__/` : 5个测试文件
- `/src/lib/__tests__/` : 测试套件
- `/src/components/**/__tests__/` : 组件测试

---

## 5. 权限与安全实现

### 5.1 权限引擎

**文件**：`/src/lib/permissions/` 目录

```typescript
// 核心函数
getEffectiveTier(user)     // 计算有效订阅层级（考虑覆写）
hasPermission(role, action) // 检查角色权限
getRetentionDate(tier)      // 获取数据保留期限
```

### 5.2 用户管理后台功能

#### A. 伪装登录 (Impersonation)
- 管理员可伪装登录为目标用户
- JWT token 签发 (`signImpersonationToken`)
- Token 验证 + 过期检查
- 审计日志记录 (IMPERSONATE_START / IMPERSONATE_END)

#### B. 权限覆写 (Permission Override)
```typescript
UserPermissionOverride {
  userId, overriddenBy, targetField, previousValue, newValue,
  reason, expiresAt  // 可选：自动过期
}
```

#### C. 安全审计日志
```typescript
SecurityLog {
  userId, action (枚举), ipAddress, userAgent, metadata
}
```

### 5.3 封禁机制
```typescript
User.status = 'BANNED'  // 自动视同未登录
// getCurrentUser() 会返回 null
```

---

## 6. 支付与订阅集成

### 6.1 Stripe 配置

**文件**：`/src/lib/stripe.ts`

```typescript
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
  { apiVersion: '2025-12-15.clover' }
)
```

### 6.2 支付流程 (Webhook)

**Webhook 事件**：`checkout.session.completed`

```
1. 验证 Webhook 签名
2. 提取 userId 和 planName (从 metadata)
3. 映射 plan → SubscriptionTier
   - 'standard'/'self-learner' → STANDARD
   - 'smart_plus'/'scholar' → SMART_PLUS
   - 'premier'/'ultimate' → PREMIER
4. 更新 User.subscriptionTier 和期限
5. 发送收据通知
6. 查找推荐关系（如果 PENDING）
7. 发放奖励：
   - 推荐人：+14天
   - 被推荐人：+7天
8. 标记推荐为 COMPLETED
```

---

## 7. 通知与邮件系统

### 7.1 邮件服务

**文件**：`/src/lib/email.ts`

```typescript
const sendEmail = async ({
  to, subject, html,
  from = 'Learn More <onboarding@resend.dev>'
})

// 依赖：Resend API (RESEND_API_KEY)
```

### 7.2 通知触发器

**文件**：`/src/actions/notification-triggers.ts`

```typescript
// 关键触发器
- triggerWelcomeNotification()      // 注册欢迎
- triggerReceiptNotification()      // 支付收据
- triggerSocialReplyNotification()  // 社交回复
```

---

## 8. 内容流水线（Content Pipeline）

### 8.1 处理流程

```
SourceFile (PDF/Image/DOCX) 
  ↓
OCR Processing (Google Vision / Tesseract / Mathpix)
  ↓
AI Structuring (Gemini/GPT提取题目结构)
  ↓
Quality Check (字段验证、格式检查)
  ↓
Review Pipeline (人工审核)
  ↓
Publish → Question / QuestionGroup
```

### 8.2 存储与审计
- `SourceFile` : 原始文件URL + OCR状态
- `ContentReviewLog` : 审核操作记录
- `QuestionReport` : 用户纠错追踪

---

## 9. 主要执行流程示例

### 9.1 用户注册完整流程

```
1. Frontend: 提交 signupAction()
   ↓
2. Backend: Zod 验证邮箱/密码/用户名/推荐码
   ↓
3. 验证推荐码 (如果有)
   - 检查推荐人存在性
   - 验证推荐人为 PREMIER 用户
   - 检查推荐配额
   ↓
4. Supabase Auth: 创建 auth.users
   ↓
5. Trigger: 自动创建 public.users 记录
   ↓
6. Upsert 补救：确保用户存在且补充信息
   - 生成推荐码 (generateReferralCode)
   - 设置试用期 (7天 STANDARD)
   ↓
7. 创建 UserSettings
   ↓
8. 创建 Referral 记录 (如果使用推荐码)
   ↓
9. 触发欢迎通知 + 邮件
   ↓
10. 重定向到 /dashboard
```

### 9.2 测验提交完整流程

```
1. Frontend: 调用 submitQuiz()
   ↓
2. 权限检查：getCurrentUser()
   ↓
3. Zod 验证：答案数据
   ↓
4. 批量查询题目 (findMany by IDs)
   ↓
5. 循环评分：为每个答案判对/错
   - 题型特定比较逻辑
   ↓
6. 事务：原子创建
   - ExamRecord
   - UserAttempt[] (所有答案)
   - ErrorBook 更新 (对/错处理)
   ↓
7. 排行榜更新：updateLeaderboardScore()
   ↓
8. 游戏化触发：
   - checkAndRefreshStreak()
   - trackDailyProgress(QUIZ_SCORE)
   ↓
9. 返回结果
```

---

## 10. 生产部署建议

### 10.1 必需环境变量

```bash
# 数据库
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_JWT_SECRET=...

# 邮件
RESEND_API_KEY=...

# 支付
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# 通用
JWT_SECRET=...
CRON_SECRET=...

# 可选：AI服务
GOOGLE_AI_API_KEY=...      # Gemini
OPENAI_API_KEY=...         # GPT
```

### 10.2 Cron Jobs 配置

在 `vercel.json` 中配置：
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-leaderboard",
      "schedule": "0 2 * * 0"  // 每周一凌晨2点
    },
    {
      "path": "/api/cron/trial-expiry",
      "schedule": "0 3 * * *"   // 每日凌晨3点
    }
  ]
}
```

### 10.3 数据库迁移

```bash
# 首次部署
npx prisma migrate deploy

# 新增字段
npx prisma migrate dev --name description_of_change

# 重置（开发环境）
npx prisma db push --force-reset
```

---

## 11. 关键指标与性能

### 11.1 API 响应时间目标
- Server Actions: P95 < 200ms
- 数据库查询: < 50ms
- 页面加载 FCP: < 1s
- 页面加载 TTI: < 3s

### 11.2 数据库索引覆盖的查询

| 查询 | 索引 | 用途 |
|------|------|------|
| 用户排行榜 | `(period, weekStart, score DESC)` | 排序 |
| 用户日配额 | `(userId, createdAt)` | 计数/分组 |
| 错题统计 | `(userId, questionId)` | 去重/更新 |
| OCR搜索 | `(contentHash)` | 去重 |

---

## 12. 已知限制与未来改进

### 12.1 当前限制
1. **Redis缺失** : 排行榜仅用PostgreSQL（<1000用户可接受）
2. **Message Queue缺失** : 通知/邮件为同步（可能阻塞）
3. **推荐系统** : 仅基于层级，无个性化算法
4. **自动评分** : Essay题型不支持

### 12.2 V2.0+ 改进方向
- 添加Redis Adapter替换PostgreSQL排行榜
- 集成 RabbitMQ 用于异步任务队列
- AI辅助essay自动评分（Gemini/GPT）
- 个性化题库推荐引擎
- WebSocket实时排行榜更新

---

## 13. 文件清单

### 核心数据库文件
- ✅ `/prisma/schema.prisma` (1057行) - 完整Schema
- ✅ `/prisma/seed.ts` (330行) - 种子数据脚本

### Prisma 客户端
- ✅ `/src/lib/prisma.ts` (16行) - 单例模式客户端

### Supabase 客户端
- ✅ `/src/lib/supabase/client.ts` (14行) - Browser客户端
- ✅ `/src/lib/supabase/server.ts` (57行) - Server客户端 + 会话管理

### Server Actions (39个文件)
- ✅ `/src/actions/auth.ts` (354行)
- ✅ `/src/actions/subject.ts` (202行)
- ✅ `/src/actions/progress.ts` (76行)
- ✅ `/src/actions/quiz.ts` (172行)
- ✅ `/src/actions/profile.ts` (131行)
- ✅ `/src/actions/community.ts` (404行)
- ✅ `/src/actions/leaderboard.ts` (46行)
- ✅ `/src/actions/gamification.ts` (93行)
- ✅ `/src/actions/notification.ts` (205行)
- ✅ `/src/actions/feedback.ts` (73行)
- 其他34个...

### API Routes (7个)
- ✅ `/src/app/api/cron/cleanup-leaderboard/route.ts`
- ✅ `/src/app/api/cron/trial-expiry/route.ts`
- ✅ `/src/app/api/webhook/stripe/route.ts`
- ✅ `/src/app/api/auth/impersonate/route.ts`
- ✅ `/src/app/api/auth/impersonate/status/route.ts`
- ✅ `/src/app/api/auth/impersonate/end/route.ts`
- ✅ `/src/app/api/ai-tutor/route.ts`

### 辅助库
- ✅ `/src/lib/email.ts` - 邮件服务
- ✅ `/src/lib/stripe.ts` - Stripe配置
- ✅ `/src/lib/jwt.ts` - 伪装JWT
- ✅ `/src/lib/gamification-utils.ts` - 条纹/XP/任务
- ✅ `/src/lib/leaderboard/pg-adapter.ts` - 排行榜适配器
- ✅ `/src/lib/permissions/` - 权限引擎

---

## 14. 总体评估

| 项目 | 状态 | 分数 |
|------|------|------|
| 数据库设计 | ✅ 完整 | 9/10 |
| Server Actions 实现 | ✅ 全面 | 9/10 |
| 安全与隔离 | ✅ 严格 | 9/10 |
| 错误处理 | ⚠️ 部分 | 7/10 |
| 测试覆盖 | ⚠️ 有限 | 6/10 |
| 文档完整性 | ✅ 高 | 8/10 |

**总体评分**：8/10 - **生产级别实现**

---

## 15. 快速参考命令

```bash
# 开发
pnpm dev                    # 启动开发服务器

# 数据库
pnpm db:seed               # 执行种子脚本
npx prisma studio          # 打开Prisma GUI
npx prisma db push         # 推送Schema变更

# 质量检查
pnpm lint                  # ESLint检查
pnpm tsc --noEmit          # TypeScript检查
pnpm test                  # 运行测试

# 构建与部署
pnpm build                 # 生产构建
vercel deploy              # Vercel预览部署
vercel deploy --prod       # Vercel生产部署
```

---

**生成**：Claude Code @ 2026-02-05
**项目**：LearnMore 中学生在线教育平台
