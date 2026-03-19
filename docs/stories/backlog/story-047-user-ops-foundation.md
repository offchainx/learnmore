# Story-047: 用户运营基础层 — 通知、反馈与合规 (User Ops Foundation)

**阶段**: Phase 8: Core Experience & Retention
**目标**: 建立贯穿产品的双向沟通渠道：系统→用户的通知触达体系，以及用户→系统的反馈闭环与法律合规基础。
**预估时间**: 48-58 Hours
**Story Points**: 38
**前置依赖**: Story-045 (Permission System), Story-046 (User Management Dashboard), Story-031 (Payment/Stripe)
**负责人**: _待分配_

---

## 📋 1. Executive Summary (概要)

### 架构师捆绑理由 (⭐ 为什么合并这些功能)

本Story是 Story-048 (通知系统) 与 Story-050 (支持与合规) 的深度合并。表面上两者领域独立，但存在一个**隐藏的共享基础依赖**：Email Service (Resend)。若分开开发，Email基础设施会被重复搭建，产生技术债务。合并后以 Task A 作为Foundation，Task B 和 Task C 可并行开发，避免浪费。

此外，基于对项目全景的分析，以下功能**强烈建议纳入本Story**：

| 追加功能 | 来源 | 加入理由 |
|---------|------|---------|
| Cookie Consent 横条 | 新增 | Story-050 新增隐私政策页，但缺少Cookie同意机制。这是GDPR合规要求，Stripe审核也会检查。P0级别，必须随Privacy页面同时上线。 |
| Trial Expiry 通知 | Story-048提到但未细化 | Story-045已实现7天试用期机制。试用倒计时通知是核心**转化触点**，直接影响Revenue。Email基础设施在Task A就绪后，边际实现成本极低。 |
| Feedback确认邮件 | 新增 | 用户提交反馈后发送确认邮件，直接提升信任感。Email基础设施已在Task A就绪，追加成本仅为编写一个模板。 |
| Admin Feedback Inbox | Story-050提到但未设计 | Story-046已有Admin后台框架和侧边栏扩展范式。用户反馈若没有正式的处理入口，数据就沉默在DB中，反馈系统就没有价值。 |
| 新页面SEO (Sitemap + Meta) | 新增 | /terms、/privacy、/help 是Google权重较高的页面类型。在创建时做好SEO，零额外架构成本。 |

**任务拆解策略**（同 Story-044，Foundation → Parallel）：

- **Task A (Email & 通知基础)**: Resend集成 + Notification Schema + 偏好设置 — **必须先完成** ⚠️
- **Task B (通知中心)**: 铃铛UI + 触发器集成 — **依赖A完成后开始**
- **Task C (支持与合规)**: 法律页 + Cookie同意 + FAQ + 反馈 + Admin收箱 — **依赖A完成后开始**

**并行开发**: A完成后，B和C可以并行开发 ✅

---

### 当前状态

- ⚠️ **信息黑洞**: 用户不知道会员即将过期、支付是否成功、是否有人回复了自己的帖子
- ⚠️ **信任缺失**: 无法收到支付确认邮件；没有隐私政策、没有Cookie同意机制
- ⚠️ **反馈无回路**: 用户无处提交反馈；即使有反馈，Admin也没有处理入口
- ⚠️ **合规风险**: Stripe审核要求Terms + Privacy + Refund页面必须存在

### 目标状态

- ✅ **双轨通知**: In-App (站内信) + Email (正式触达)，统一通知中心
- ✅ **合规基础**: Terms / Privacy / Refund 页面 + Cookie Consent横条
- ✅ **支持闭环**: FAQ + 反馈挂件 + 确认邮件 + Admin处理后台
- ✅ **转化触点**: Trial Expiry 倒计时通知 (Email + In-App)，驱动付费转化

---

## 🏗️ 2. System Architecture (系统架构)

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│              Story-047: User Ops Foundation                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─── Task A: Foundation Layer (必须先完成) ─────────────┐   │
│  │  [Resend Email Client + react-email 模板]            │   │
│  │  [Notification 表 + NotificationPreference 表]       │   │
│  │  [UserFeedback 表]                                   │   │
│  │  [sendEmail() + createInAppNotification() utilities] │   │
│  └───────────────┬──────────────────┬────────────────────┘   │
│                  ↓                  ↓                         │
│  ┌── Task B: Notification ────┐  ┌── Task C: Support ──────┐ │
│  │  [Bell 图标 + 下拉列表]    │  │  [Legal Pages]          │ │
│  │  [触发器埋点]              │  │  [Cookie Consent Banner]│ │
│  │  - Welcome Email + InApp  │  │  [Help Center + FAQ]    │ │
│  │  - Receipt Email + InApp  │  │  [Feedback Widget]      │ │
│  │  - Trial Expiry (关键!)   │  │  [Feedback Ack Email]   │ │
│  │  - Social Reply InApp     │  │  [Admin Feedback Inbox] │ │
│  │  [通知设置页]              │  │  [SEO: Sitemap + Meta]  │ │
│  └────────────────────────────┘  └─────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 双向沟通渠道 (核心设计理念)

```
系统 → 用户 (Outbound)           用户 → 系统 (Inbound)
────────────────────             ────────────────────
Welcome ────→ Resend → Email     Feedback Widget
Receipt ────→ Resend → Email       ↓
Trial Warning → Resend → Email   submitFeedback() Server Action
                                   ↓
Welcome ────→ Notification表     UserFeedback 表
Reply ──────→ Notification表       ↓
Trial ──────→ Notification表     Ack Email → Resend → Email
Achievement → Notification表       ↓
                                 Admin Inbox (/admin/feedback)
         铃铛图标 ← Notification表
```

### 2.3 与已有系统的集成点

```
Story-045 (Permission / Subscription)
  └─→ User.subscriptionEnd ──→ Task B: Trial Expiry 触发器
  └─→ SubscriptionTier ──→ Task C: Feedback 用户信息展示

Story-046 (Admin Dashboard)
  └─→ /admin/ 路由框架 ──→ Task C: Admin Feedback Inbox
  └─→ Admin侧边栏扩展范式 ──→ Task C: 添加"用户反馈"菜项

Story-031 (Stripe Payment)
  └─→ Webhook payment_succeeded ──→ Task B: Receipt 触发器

Story-034 (Community)
  └─→ Comment 创建事件 ──→ Task B: Social Reply 触发器
```

### 2.4 数据模型

**新增表 (3个)**:

```prisma
// ==================== 站内通知 ====================
model Notification {
  id        String           @id @default(uuid()) @db.Uuid
  userId   String           @db.Uuid
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  type      NotificationType // 通知类型分类
  title     String           // 通知标题
  content   String           @db.Text  // 通知正文
  link      String?          // 点击跳转URL (站内路径，如 /dashboard/community/xxx)
  isRead    Boolean          @default(false)

  metadata  Json?            // 扩展数据 { actorId, postId, ... }

  createdAt DateTime         @default(now()) @map("created_at")

  @@index([userId, isRead])       // 高频查询: 某用户的未读通知数
  @@index([userId, createdAt])    // 高频查询: 某用户的通知列表(分页排序)
  @@map("notifications")
}

enum NotificationType {
  SYSTEM        // 系统通知 (欢迎、版本更新)
  SOCIAL        // 社交通知 (帖子回复、评论)
  BILLING       // 支付通知 (收据、试用到期) ⭐ 此类通知不允许用户关闭
  ACHIEVEMENT   // 成就通知 (获得新勋章)
}

// ==================== 通知偏好 ====================
// ⚠️ 迁移说明: UserSettings中已有 notificationDaily/Weekly/emailMarketing 三个字段，
//    粒度不够（无法独立控制 InApp vs Email）。
//    本表提供更细粒度的控制。初始创建时将旧字段值同步过来。
model NotificationPreference {
  userId String @id @db.Uuid
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Email 通知开关
  emailBilling       Boolean @default(true)  @map("email_billing")       // 支付确认 (始终开启，不可修改)
  emailWeeklyReport  Boolean @default(true)  @map("email_weekly_report") // 学习周报
  emailMarketing     Boolean @default(true)  @map("email_marketing")     // 营销推广

  // In-App 通知开关
  inAppSocial        Boolean @default(true)  @map("in_app_social")       // 社交回复
  inAppSystem        Boolean @default(true)  @map("in_app_system")       // 系统通知
  inAppAchievement   Boolean @default(true)  @map("in_app_achievement")  // 成就

  @@map("notification_preferences")
}

// ==================== 用户反馈 ====================
model UserFeedback {
  id        String   @id @default(uuid()) @db.Uuid
  userId   String?  @db.Uuid  // 可选: 支持匿名反馈
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  type      FeedbackType
  content   String   @db.Text
  email     String?  // 用户联系邮箱 (匿名时如果想收到确认需要填写)

  status    FeedbackStatus @default(OPEN)
  adminNote String?  @db.Text  // Admin处理备注

  resolvedBy String?  @db.Uuid
  resolvedAt DateTime? @map("resolved_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@index([status])                  // Admin按状态筛选
  @@index([createdAt])               // Admin按时间排序
  @@map("user_feedbacks")
}

enum FeedbackType {
  BUG           // Bug报告
  FEATURE       // 功能建议
  BILLING       // 支付问题
  OTHER         // 其他
}

enum FeedbackStatus {
  OPEN          // 待处理
  IN_PROGRESS   // 处理中
  RESOLVED      // 已解决
  CLOSED        // 已关闭
}
```

**User 表扩展 (Relations)**:
```prisma
// 在 User model 中追加以下关联:
  notifications           Notification[]
  feedbacks               UserFeedback[]
  notificationPreference  NotificationPreference?
```

### 2.5 数据模型关系图

```
User
 ├─ 1:N  → Notification              (站内通知)
 ├─ 1:1  → NotificationPreference    (通知偏好)
 └─ 1:N  → UserFeedback              (用户反馈)

Notification
 └─ type: SYSTEM | SOCIAL | BILLING | ACHIEVEMENT
 └─ isRead: 控制铃铛红点数

UserFeedback
 └─ status: OPEN → IN_PROGRESS → RESOLVED | CLOSED
 └─ 匿名支持: userId 可为 null

NotificationPreference
 └─ 迁移来源: UserSettings.notificationDaily/Weekly/emailMarketing
```

### 2.6 技术栈选型

| 组件 | 技术方案 | 备注 |
|------|----------|------|
| Email Service | **Resend** | API体验好，React Email原生支持 |
| Email模板 | **react-email** | 用React写模板，本地可预览 |
| Cookie同意 | **自定义组件** | 交互极简(两个按钮)，避免引入重库增加bundle |
| FAQ | **Shadcn Accordion** | 已有组件，直接复用 |
| SEO/Sitemap | **next-sitemap** | Next.js生态最佳选择 |
| 表单验证 | **React Hook Form + Zod** | 项目已有，保持一致 |

---

## 🎯 3. Feature Breakdown (功能拆解)

### ⚠️ 依赖关系说明

```
Task A (Email & 通知基础层)
    ├── 必须先完成
    └── 提供: Resend Client + Notification/Feedback/Preference Schema + 核心utilities

Task B (通知中心 + 触发器)      Task C (支持 + 合规 + Admin收箱)
    ├── 依赖: Task A                ├── 依赖: Task A (仅Email部分)
    ├── 可并行开发 ✅               ├── 可并行开发 ✅
    └── 独立Git分支                └── 独立Git分支
```

---

## 📦 Task A: Email & 通知基础层 (P0, 必须先完成)

### 🎯 你需要完成什么？

**核心任务**: 搭建Email发送基础设施，创建通知和反馈的数据库表，实现核心utility函数。

**为什么必须先完成Task A？**
- Task B 需要调用 `sendEmail()` 发送 Welcome / Receipt / Trial Expiry 邮件
- Task B 需要调用 `createInAppNotification()` 创建站内通知
- Task C 需要调用 `sendEmail()` 发送 Feedback 确认邮件
- Task B + C 都需要读取 `NotificationPreference` 来决定是否发送通知

**你将创建的内容**:
1. **Resend Client + 5个Email模板**
2. **3个新数据库表** (Notification, UserFeedback, NotificationPreference)
3. **核心Server Actions** (sendEmail, createInAppNotification, 通知CRUD, 偏好管理)
4. **TypeScript类型定义**

---

### 📋 交付物清单

- [ ] **A1: Resend集成**
  - 文件: `src/lib/email/resend.ts`
  - 环境变量: `RESEND_API_KEY` 添加到 `.env.local` 和 `.env.example`
  - 验证: 可以成功发送测试邮件

- [ ] **A2: react-email模板**
  - `src/lib/email/templates/WelcomeEmail.tsx`
  - `src/lib/email/templates/ReceiptEmail.tsx`
  - `src/lib/email/templates/TrialExpiryEmail.tsx`
  - `src/lib/email/templates/FeedbackAckEmail.tsx`
  - `src/lib/email/templates/WeeklyReportEmail.tsx`

- [ ] **A3: Prisma Schema迁移**
  - 新增: Notification, UserFeedback, NotificationPreference 三表
  - User model 追加 3 个 relation
  - 迁移策略备注: UserSettings旧字段值同步到 NotificationPreference
  - 验证: `npx prisma migrate dev` 无报错

- [ ] **A4: 核心Server Actions**
  - 文件: `src/actions/notification.ts`
  - 文件: `src/actions/notification-preferences.ts`

- [ ] **A5: TypeScript类型定义**
  - 文件: `src/lib/notification/types.ts`

---

### ✅ 验收标准

```bash
# 1. Schema迁移成功
npx prisma migrate dev
# 预期: Migration applied successfully

# 2. TypeScript编译通过
pnpm tsc --noEmit
# 预期: 0 errors

# 3. 发送测试邮件
# 临时脚本调用 sendEmail()，在Resend Dashboard确认有发送记录

# 4. 创建测试通知
# 调用 createInAppNotification()，查看DB确认Notification表有记录
# 调用 getUnreadNotificationCount()，确认返回 1

# 5. 偏好设置读写
# 调用 getNotificationPreferences()，确认自动创建并同步旧字段
# 调用 updateNotificationPreferences()，确认更新成功
```

---

### 🔧 Task A 详细实施指南

#### A1: Resend Client

**核心文件**: `src/lib/email/resend.ts`

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export { resend }

/**
 * 通用发邮件封装 (带错误处理)
 * 调用方不需要关心Resend API细节
 */
export async function sendEmail({
  to,
  subject,
  react,
  text,
}: {
  to: string
  subject: string
  react?: React.ReactElement
  text?: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'LearnMore <noreply@learnmore.com>',
      to,
      subject,
      react,
      text,
    })

    if (error) {
      console.error('Resend send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('sendEmail exception:', err)
    return { success: false, error: 'Email service unavailable' }
  }
}
```

#### A2: react-email 模板

```typescript
// src/lib/email/templates/WelcomeEmail.tsx
import {
  Html, Body, Head, Tailwind, Container,
  Section, Text, Button, Hr,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
  email: string
}

export default function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-100">
          <Container className="mx-auto max-w-xl py-10 px-5">
            <Section className="bg-white rounded-lg shadow p-8">
              <Text className="text-2xl font-bold text-gray-800 text-center">
                欢迎加入 LearnMore！
              </Text>
              <Hr />
              <Text className="text-gray-600">
                嗨 {name}，
              </Text>
              <Text className="text-gray-600">
                感谢你选择LearnMore！我们为你准备了专属的学习路径，
                帮助你在数学、物理、化学等科目快速提升。
              </Text>
              <Section className="text-center py-4">
                <Button
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg"
                  href="https://learnmore.com/dashboard"
                >
                  开始学习
                </Button>
              </Section>
              <Hr />
              <Text className="text-sm text-gray-400 text-center">
                如有问题，请访问帮助中心或点击下方联系我们。<br/>
                此邮件发送至 {email}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
```

```typescript
// src/lib/email/templates/ReceiptEmail.tsx
// 核心字段: amount, currency, invoiceId, tier(订阅级别), date
// CTA: "查看发票" 链接到Stripe Invoice URL

// src/lib/email/templates/TrialExpiryEmail.tsx
// 核心字段: name, daysLeft, urgency('warning'|'urgent'), tierFeatures(数组)
// CTA: "现在升级" → /pricing
// 设计: daysLeft <= 1 时用红色警告横条

// src/lib/email/templates/FeedbackAckEmail.tsx
// 核心字段: referenceId(前8位UUID大写), type, estimatedResponseTime
// 传递信息: 确认已收到反馈, 给出参考编号

// src/lib/email/templates/WeeklyReportEmail.tsx
// 核心字段: name, weekCorrectRate, completedCount, streakDays, topSubject
// CTA: "继续学习" → /dashboard
```

#### A3: Server Actions

**核心文件**: `src/actions/notification.ts`

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { NotificationType } from '@prisma/client'

// ==================== 站内通知 CRUD ====================

/**
 * 创建站内通知
 * 调用方: 各业务触发器 (Welcome, Reply, Achievement 等)
 * ⭐ 会自动检查用户的通知偏好，如果用户关闭了对应类型则不创建
 */
export async function createInAppNotification(data: {
  userId: string
  type: NotificationType
  title: string
  content: string
  link?: string
  metadata?: Record<string, any>
}) {
  // 检查用户通知偏好
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId: data.userId }
  })

  // type → 对应的偏好开关映射
  const typeToPreferenceKey: Record<string, keyof typeof pref | null> = {
    SOCIAL: 'inAppSocial',
    SYSTEM: 'inAppSystem',
    ACHIEVEMENT: 'inAppAchievement',
    BILLING: null, // Billing通知不允许关闭
  }

  const preferenceKey = typeToPreferenceKey[data.type]
  if (preferenceKey && pref && !pref[preferenceKey]) {
    return { success: false, reason: 'User preference disabled' }
  }

  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      link: data.link,
      metadata: data.metadata,
    }
  })

  return { success: true, notificationId: notification.id }
}

/**
 * 获取未读通知数量 (用于铃铛红点)
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: { userId, isRead: false }
  })
}

/**
 * 获取通知列表 (分页)
 */
export async function listNotifications(params: {
  userId: string
  limit?: number
  offset?: number
  onlyUnread?: boolean
}) {
  const where: any = { userId: params.userId }
  if (params.onlyUnread) where.isRead = false

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit || 20,
      skip: params.offset || 0,
    }),
    prisma.notification.count({ where: { userId: params.userId } })
  ])

  return { notifications, total }
}

/**
 * 标记单条通知已读
 */
export async function markNotificationAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  })
}

/**
 * 标记所有通知已读
 */
export async function markAllNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  })
  revalidatePath('/dashboard')
}
```

**核心文件**: `src/actions/notification-preferences.ts`

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

/**
 * 获取当前用户的通知偏好
 * ⭐ 如果不存在则自动创建，并将 UserSettings 旧字段值同步过来
 */
export async function getNotificationPreferences() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  let pref = await prisma.notificationPreference.findUnique({
    where: { userId: user.id }
  })

  if (!pref) {
    // 迁移: 读取 UserSettings 中的旧字段
    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id }
    })

    pref = await prisma.notificationPreference.create({
      data: {
        userId: user.id,
        // 同步旧字段
        emailMarketing: settings?.emailMarketing ?? true,
        // notificationDaily → inAppSystem + inAppSocial
        inAppSystem: settings?.notificationDaily ?? true,
        inAppSocial: settings?.notificationDaily ?? true,
        // notificationWeekly → emailWeeklyReport
        emailWeeklyReport: settings?.notificationWeekly ?? true,
        // 其他字段使用默认值
      }
    })
  }

  return pref
}

/**
 * 更新通知偏好
 * ⚠️ emailBilling 不允许修改 (始终为 true)
 */
export async function updateNotificationPreferences(
  preferences: Partial<{
    emailWeeklyReport: boolean
    emailMarketing: boolean
    inAppSocial: boolean
    inAppSystem: boolean
    inAppAchievement: boolean
  }>
) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  await prisma.notificationPreference.update({
    where: { userId: user.id },
    data: preferences
  })

  return { success: true }
}
```

#### A4: TypeScript类型定义

**核心文件**: `src/lib/notification/types.ts`

```typescript
import type {
  Notification, NotificationType,
  UserFeedback, FeedbackType, FeedbackStatus,
  NotificationPreference
} from '@prisma/client'

// ==================== 通知 ====================

export type NotificationWithMeta = Notification & {
  // metadata 字段的类型化
  metadata?: {
    actorId?: string
    actorName?: string
    postId?: string
    postTitle?: string
    invoiceId?: string
    daysLeft?: number
    urgency?: 'warning' | 'urgent'
    [key: string]: any
  }
}

export interface NotificationListResponse {
  notifications: NotificationWithMeta[]
  total: number
}

export type NotificationPreferenceData = Omit<NotificationPreference, 'userId' | 'emailBilling'>

// ==================== Email ====================

export interface SendEmailParams {
  to: string
  subject: string
  react?: React.ReactElement
  text?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// ==================== 反馈 ====================

export interface SubmitFeedbackInput {
  type: FeedbackType
  content: string
  email?: string
}

export type FeedbackWithUser = UserFeedback & {
  user?: {
    id: string
    email: string
    username: string | null
    subscriptionTier: string | null
  } | null
}

export interface FeedbackListResponse {
  feedbacks: FeedbackWithUser[]
  total: number
  byStatus: Partial<Record<FeedbackStatus, number>>
}
```

---

### 📝 开发步骤建议

**Step 1: 安装依赖 (30分钟)**
```bash
pnpm add resend react-email @react-email/components
```

**Step 2: 配置Resend (30分钟)**
- 注册Resend账户，获取API Key
- 添加到 `.env.local` 和 `.env.example`
- 配置发送域名（或先用Resend沙箱域名测试）

**Step 3: Prisma Schema (1-2小时)**
- 添加 3 张新表 + User 关联扩展
- 运行 `npx prisma migrate dev --name add_notification_feedback_schema`

**Step 4: Email模板 (2-3小时)**
- 5个模板逐一实现
- 用 `react-email` CLI 本地预览: `npx react-email start`

**Step 5: Server Actions (2-3小时)**
- `notification.ts` 全部函数
- `notification-preferences.ts` 含迁移逻辑

**Step 6: 验证 (30分钟)**
- 发送测试邮件确认可达
- 创建通知并验证读写

**总预计时间**: 7-10小时

---

### 🔗 Task A 与其他Task的关系

```
Task A 为 Task B 提供:
  - sendEmail() ← Welcome/Receipt/Trial Email 发送
  - createInAppNotification() ← 所有站内通知创建
  - getUnreadNotificationCount() ← 铃铛红点数
  - listNotifications() ← 通知下拉列表数据
  - getNotificationPreferences() ← 判断是否发送

Task A 为 Task C 提供:
  - sendEmail() ← Feedback 确认邮件发送
  - Notification 表 ← (未来) Admin收到新反馈通知
  - UserFeedback 表 ← Feedback Widget 写入 / Admin 读取
```

---

## 📦 Task B: 通知中心 & 触发器集成 (依赖Task A, 可与C并行)

### 🎯 你需要完成什么？

**核心任务**: 实现通知中心UI (铃铛 + 下拉列表)，并在4个关键业务流程中埋点触发通知。

**前置条件**:
- ✅ Task A已完成
- ✅ 现有Dashboard顶栏组件结构 (Story-046框架)

**你将创建的核心组件**:
1. **NotificationBell** — 顶栏铃铛图标 + 未读数红点 + Popover容器
2. **NotificationDropdown** — 通知列表 + 点击跳转 + 全部已读
3. **Trigger函数** — 4个触发点的实现
4. **通知设置页** — 用户精细化控制

---

### 📋 交付物清单

- [ ] **B1: 铃铛组件 + 通知下拉**
  - `src/components/layout/NotificationBell.tsx`
  - `src/components/notification/NotificationDropdown.tsx`
  - 未读 > 0 时显示红点徽章
  - 点击通知: markAsRead + router.push(link)
  - "全部已读" 按钮

- [ ] **B2: Welcome 通知触发**
  - 在 `src/actions/auth.ts` 注册成功后调用:
    - `sendEmail(WelcomeEmail)`
    - `createInAppNotification(SYSTEM, "欢迎加入LearnMore")`

- [ ] **B3: Payment Receipt 通知触发**
  - 在 `src/app/api/webhook/stripe/route.ts` 的 `payment_succeeded` 处调用:
    - `sendEmail(ReceiptEmail)`
    - `createInAppNotification(BILLING, "支付成功")`

- [ ] **B4: Trial Expiry 通知触发** ⭐ 关键转化触点
  - `src/actions/notification-triggers.ts`
  - 逻辑: 扫描 subscriptionEnd 距今 ≤ 3天的用户
    - 剩余3天: Email(Warning) + InApp
    - 剩余1天: Email(Urgent) + InApp
  - 去重: 同一用户每天最多发送一次
  - 触发方式: 接入已有的 `/api/cron/cleanup-leaderboard` 路由模式

- [ ] **B5: Social Reply 通知触发**
  - 在 `src/actions/community.ts` 评论创建后:
    - 判断: 帖子作者 ≠ 评论者
    - `createInAppNotification(SOCIAL, "[用户名]回复了你的帖子")`

- [ ] **B6: 通知设置页**
  - `src/app/(dashboard)/settings/notifications/page.tsx`
  - Toggle 开关矩阵展示所有可控偏好

---

### ✅ 验收标准

```
1. 铃铛显示
   - 新用户注册后, 铃铛显示红点(Welcome通知)
   - 点击铃铛, 下拉显示"欢迎加入"通知
   - 点击通知后, 红点消失

2. Payment触发
   - 模拟 Stripe webhook payment_succeeded
   - 铃铛出现"支付成功"通知
   - 用户邮箱收到Receipt Email

3. Trial Expiry
   - 设置测试用户 subscriptionEnd = 今天 + 1天
   - 触发检查逻辑
   - 用户收到 Email + InApp "试用即将过期"
   - 第二天再触发, 不重复发送

4. Social Reply
   - User A 发帖, User B 回复
   - User A 的铃铛出现回复通知

5. 偏好控制
   - User A 关闭 inAppSocial
   - User B 回复 User A 的帖子
   - User A 的铃铛不出现新通知
```

---

### 🔧 Task B 详细实施指南

#### B1: NotificationBell

```typescript
// src/components/layout/NotificationBell.tsx
'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationDropdown } from '@/components/notification/NotificationDropdown'
import { getUnreadNotificationCount } from '@/actions/notification'

interface NotificationBellProps {
  userId: string
  initialUnreadCount?: number  // Server Component预取的初始值
}

export function NotificationBell({ userId, initialUnreadCount = 0 }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [open, setOpen] = useState(false)

  // Polling: 每60秒刷新未读数
  // ⚠️ 不使用WebSocket: 通知无需秒级实时, Polling足够, 避免部署复杂度
  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await getUnreadNotificationCount(userId)
      setUnreadCount(count)
    }, 60_000)

    return () => clearInterval(interval) // cleanup
  }, [userId])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationDropdown
          userId={userId}
          onCountChange={setUnreadCount}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
```

#### B1 (续): NotificationDropdown

```typescript
// src/components/notification/NotificationDropdown.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '@/actions/notification'
import type { NotificationWithMeta } from '@/lib/notification/types'

const TYPE_ICON: Record<string, string> = {
  SYSTEM: '🔔',
  SOCIAL: '💬',
  BILLING: '💳',
  ACHIEVEMENT: '🏆',
}

interface Props {
  userId: string
  onCountChange: (count: number) => void
  onClose: () => void
}

export function NotificationDropdown({ userId, onCountChange, onClose }: Props) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationWithMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listNotifications({ userId, limit: 15 }).then(({ notifications: data }) => {
      setNotifications(data)
      setLoading(false)
    })
  }, [userId])

  const handleClick = async (notification: NotificationWithMeta) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id)
      const count = await getUnreadNotificationCount(userId)
      onCountChange(count)
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      )
    }
    if (notification.link) {
      router.push(notification.link)
    }
    onClose()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(userId)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    onCountChange(0)
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground text-sm">加载中...</div>
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">通知</h3>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={handleMarkAllRead}>
          <CheckCheck className="h-3 w-3 mr-1" />
          全部已读
        </Button>
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto divide-y">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">暂无通知</div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`
                flex gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors
                ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/30' : ''}
              `}
              onClick={() => handleClick(notification)}
            >
              <span className="text-lg flex-shrink-0">{TYPE_ICON[notification.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{notification.title}</p>
                <p className="text-xs text-muted-foreground truncate">{notification.content}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(notification.createdAt).toLocaleDateString('zh-CN', {
                    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

#### B4: Trial Expiry 触发器 (⭐ 关键)

```typescript
// src/actions/notification-triggers.ts
'use server'

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/resend'
import { createInAppNotification } from './notification'
import WelcomeEmail from '@/lib/email/templates/WelcomeEmail'
import ReceiptEmail from '@/lib/email/templates/ReceiptEmail'
import TrialExpiryEmail from '@/lib/email/templates/TrialExpiryEmail'

/**
 * 检查并触发试用期过期通知
 * 触发方式:
 *   - Cron Job 每日凌晨调用 (接入已有 /api/cron/ 路由模式)
 *   - 用户登录时也可触发一次 (Lazy Check)
 */
export async function checkAndNotifyTrialExpiry() {
  const now = new Date()
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // 查找 subscriptionEnd 在未来3天内的用户
  const expiringUsers = await prisma.user.findMany({
    where: {
      subscriptionEnd: {
        gte: now,              // 还没过期
        lte: threeDaysLater,   // 但在3天内
      }
    },
    select: { id: true, email: true, username: true, subscriptionEnd: true }
  })

  for (const user of expiringUsers) {
    if (!user.subscriptionEnd) continue

    const daysLeft = Math.ceil(
      (user.subscriptionEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    )

    // ⭐ 去重: 检查今天是否已经给该用户发过 Trial 通知
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const alreadySent = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: 'BILLING',
        title: { contains: '试用期' },
        createdAt: { gte: todayStart }
      }
    })
    if (alreadySent) continue

    const urgency = daysLeft <= 1 ? 'urgent' : 'warning'

    // Email (Billing类不受偏好控制，始终发送)
    await sendEmail({
      to: user.email,
      subject: daysLeft <= 1 ? '⚡ 您的试用期明天结束！' : `📅 您的试用期将在 ${daysLeft} 天后结束`,
      react: TrialExpiryEmail({
        name: user.username || '同学',
        daysLeft,
        urgency,
      }),
    })

    // InApp
    await createInAppNotification({
      userId: user.id,
      type: 'BILLING',
      title: daysLeft <= 1 ? '⚡ 试用期明天结束!' : `📅 试用期将在 ${daysLeft} 天后结束`,
      content: '升级到智学版，解锁AI智能学习和无限记忆功能',
      link: '/pricing',
      metadata: { urgency, daysLeft },
    })
  }
}

/**
 * Welcome 通知 (在 auth.ts 注册流程后调用)
 */
export async function triggerWelcomeNotification(userId: string, email: string, name: string) {
  await sendEmail({
    to: email,
    subject: '🎉 欢迎加入 LearnMore!',
    react: WelcomeEmail({ name, email }),
  })

  await createInAppNotification({
    userId,
    type: 'SYSTEM',
    title: '欢迎加入 LearnMore 🎉',
    content: '点击这里开始你的学习之旅!',
    link: '/dashboard',
  })
}

/**
 * Payment Receipt (在 Stripe webhook payment_succeeded 后调用)
 */
export async function triggerPaymentReceiptNotification(
  userId: string,
  email: string,
  amount: number,
  currency: string,
  invoiceId: string
) {
  await sendEmail({
    to: email,
    subject: '✅ 支付确认 - LearnMore',
    react: ReceiptEmail({ amount, currency, invoiceId }),
  })

  await createInAppNotification({
    userId,
    type: 'BILLING',
    title: '💳 支付成功',
    content: `金额: ${currency} ${(amount / 100).toFixed(2)}`,
    link: '/dashboard/settings',
    metadata: { invoiceId, amount },
  })
}

/**
 * Social Reply (在 community.ts 评论创建后调用)
 */
export async function triggerReplyNotification(
  postAuthorId: string,
  commentAuthorName: string,
  postTitle: string,
  postId: string
) {
  // 评论者 = 帖子作者时不通知自己
  await createInAppNotification({
    userId: postAuthorId,
    type: 'SOCIAL',
    title: `${commentAuthorName} 回复了你的帖子`,
    content: `"${postTitle.slice(0, 30)}${postTitle.length > 30 ? '...' : ''}"`,
    link: `/dashboard/community/${postId}`,
    metadata: { postId },
  })
}
```

---

### 📝 开发步骤建议

**Step 1: NotificationBell + Dropdown UI (3-4小时)**
- 实现组件
- 用Mock数据先跑通UI交互

**Step 2: Welcome + Receipt 触发器 (2-3小时)**
- 在 auth.ts 注册流程后埋点调用
- 在 Stripe webhook 中埋点调用

**Step 3: Trial Expiry 触发器 (3-4小时)**
- 扫描逻辑 + 去重机制
- 接入 Cron 路由
- 测试不同剩余天数场景

**Step 4: Social Reply 触发器 (1-2小时)**
- 在社区评论创建后埋点
- 测试自评论不通知

**Step 5: 通知设置页 (2-3小时)**
- UI + 数据绑定

**总预计时间**: 11-16小时

---

### Task B 验证清单

- [ ] 铃铛在新通知时显示红点
- [ ] 点击通知跳转正确，红点更新
- [ ] "全部已读"功能正常
- [ ] Welcome 通知在注册后触发 (Email + InApp)
- [ ] Receipt 通知在支付后触发
- [ ] Trial Expiry 通知在剩余3天/1天时触发，不重复
- [ ] Social Reply 在他人回复时触发，自评论不触发
- [ ] 通知设置页 Toggle 可控制 InApp 发送

---

## 📦 Task C: 支持、合规 & Admin 收箱 (依赖Task A, 可与B并行)

### 🎯 你需要完成什么？

**核心任务**: 创建法律合规页面和Cookie同意机制、帮助中心、用户反馈系统，以及Admin处理后台。

**前置条件**:
- ✅ Task A已完成 (sendEmail可用，UserFeedback表已创建)
- ✅ Story-046的Admin框架可复用

**你将创建的核心内容**:
1. **Legal Pages** — /terms、/privacy、/refund
2. **Cookie Consent Banner** — 全局横条
3. **Help Center** — /help 页面 + FAQ搜索
4. **Feedback Widget** — 全局悬浮按钮 + Modal + 确认邮件
5. **Admin Feedback Inbox** — /admin/feedback 列表 + 详情

---

### 📋 交付物清单

- [ ] **C1: Legal Pages**
  - `src/app/(marketing)/terms/page.tsx`
  - `src/app/(marketing)/privacy/page.tsx`
  - `src/app/(marketing)/refund/page.tsx`
  - 内容要点: 数据收集范围、Cookie政策、退款政策(明确写明"试用期内可全额退款，正式付费后7天内可退款")

- [ ] **C2: Cookie Consent Banner** ⭐
  - `src/components/layout/CookieConsent.tsx`
  - 集成位置: `src/app/layout.tsx` (根布局)
  - 行为: 首次访问显示横条 → 用户选择"全部接受"或"仅必要" → 存入 localStorage → 不再显示
  - Privacy页面中包含Cookie政策说明，与横条一致

- [ ] **C3: Help Center**
  - `src/app/(marketing)/help/page.tsx`
  - `src/components/support/FAQAccordion.tsx`
  - 至少10个常见问题 (见下方FAQ内容清单)
  - 搜索框: 客端实时过滤 (无需后端接口)

- [ ] **C4: Feedback Widget + Server Action**
  - `src/components/support/FeedbackWidget.tsx` (悬浮按钮)
  - `src/components/support/FeedbackModal.tsx` (Modal表单)
  - `src/actions/support.ts` (submitFeedback + Admin CRUD)
  - 集成位置: Dashboard布局和Marketing布局均挂载
  - 提交后: 写入DB → 发送确认Email (如果有邮箱)

- [ ] **C5: Admin Feedback Inbox**
  - `src/app/(dashboard)/admin/feedback/page.tsx` (列表)
  - `src/app/(dashboard)/admin/feedback/[id]/page.tsx` (详情)
  - 功能: 状态/类型筛选、状态流转(Open→InProgress→Resolved)、Admin备注
  - 侧边栏扩展: 添加"用户反馈"菜项 (带未处理数角标)

- [ ] **C6: SEO**
  - 更新 `next.sitemap.js` 包含新页面路径
  - 每个新页面定义 `metadata` (title, description, og:title, og:description)

---

### ✅ 验收标准

```
1. Legal Pages
   - /terms、/privacy、/refund 均可访问且内容完整
   - /privacy 包含Cookie政策说明

2. Cookie Consent
   - 首次访问网站, 底部显示Cookie横条
   - 点击"全部接受" → 横条消失, localStorage 有记录
   - 刷新页面后不再显示横条
   - 切换设备(清除localStorage)后重新显示

3. Help Center
   - /help 显示10个FAQ
   - 搜索关键词"密码" → 过滤出"忘记密码怎么办"
   - Accordion展开/折叠交互正常

4. Feedback 闭环
   - 页面右下角有悬浮按钮
   - 点击 → Modal表单 → 填写 → 提交 → 提示"已提交"
   - 如果填写了邮箱 → 收到确认Email
   - /admin/feedback 有对应记录

5. Admin Inbox
   - /admin/feedback 列表显示所有反馈
   - 可按状态筛选
   - 详情页可更新状态和添加备注
   - 非ADMIN角色访问 /admin/feedback 被拦截
```

---

### 🔧 Task C 详细实施指南

#### C2: Cookie Consent Banner

```typescript
// src/components/layout/CookieConsent.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'learnmore_cookie_consent'

export function CookieConsent() {
  // 初始为 false，避免SSR闪烁
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // 仅在客端执行
    const consent = localStorage.getItem(STORAGE_KEY)
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = (level: 'all' | 'necessary') => {
    localStorage.setItem(STORAGE_KEY, level)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-background border-t shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-2xl">
          <p className="text-sm text-foreground">
            我们使用Cookie来提升您的浏览体验和分析网站使用情况。
            查看我们的{' '}
            <Link href="/privacy" className="underline text-indigo-600 hover:text-indigo-800">
              隐私政策
            </Link>
            {' '}了解更多信息。
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => handleAccept('necessary')}>
            仅必要Cookie
          </Button>
          <Button size="sm" onClick={() => handleAccept('all')}>
            全部接受
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**集成位置** (`src/app/layout.tsx`):
```tsx
import { CookieConsent } from '@/components/layout/CookieConsent'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
```

#### C3: FAQ 内容清单

```typescript
// src/components/support/FAQAccordion.tsx
export const FAQ_DATA = [
  {
    category: '账户与认证',
    items: [
      {
        question: '忘记密码怎么办？',
        answer: '点击登录页面的"忘记密码"链接，系统会向您的注册邮箱发送重置密码邮件。请检查邮箱及垃圾箱。'
      },
      {
        question: '如何修改我的个人信息？',
        answer: '进入 Dashboard → 设置 → 个人信息，可以修改姓名、头像等信息。'
      },
    ]
  },
  {
    category: '订阅与支付',
    items: [
      {
        question: '智学版和自学版有什么区别？',
      },
      {
        question: '如何取消订阅？',
        answer: '进入 Dashboard → 设置 → 订阅管理，点击"取消订阅"即可。取消后当前付费周期结束前仍可正常使用所有功能。'
      },
      {
        question: '支付失败了怎么办？',
        answer: '请先检查您的银行卡是否有拦截提醒或余额不足。如果仍然失败，可尝试更换支付方式，或通过右下角反馈按钮联系我们。'
      },
      {
        question: '试用期结束后会自动扣费吗？',
        answer: '不会自动扣费。试用期结束后，账户将自动降为免费版，不影响已有学习数据。如果想继续使用高级功能，需要手动选择计划并付费。'
      },
    ]
  },
  {
    category: '学习与功能',
    items: [
      {
        question: 'LearnMore 支持哪些科目？',
        answer: '目前支持数学、物理、化学、英语、语文、生物共6个科目，覆盖初中7-9年级的完整课程。'
      },
      {
        question: 'AI智学功能是怎么用的？',
        answer: '智学版或领航版用户在做题页面会看到AI分析入口。做错题目后，点击"AI分析"可查看错误原因分析和个性化改进建议。'
      },
      {
        question: '错题本是什么？怎么查看？',
        answer: '做错的题目会自动加入错题本。进入 Dashboard → 练习 → 错题本可查看所有错误记录。系统会根据遗忘曲线定期提醒复习。'
      },
    ]
  },
  {
    category: '其他',
    items: [
      {
        question: '发现Bug怎么报告？',
        answer: '点击页面右下角的悬浮反馈按钮，选择"Bug报告"类型，详细描述问题即可。我们会尽快跟进处理。'
      },
      {
        question: '如何推荐给朋友？',
        answer: '进入 Dashboard → 推荐朋友，复制你的专属推荐码分享给朋友。每成功推荐一人，双方都会获得学习奖励！'
      },
    ]
  }
]
```

#### C4: Feedback Widget + Server Action

```typescript
// src/components/support/FeedbackWidget.tsx
'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { FeedbackModal } from './FeedbackModal'

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        aria-label="提交反馈"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Modal */}
      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  )
}
```

```typescript
// src/components/support/FeedbackModal.tsx
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitFeedback } from '@/actions/support'

const feedbackSchema = z.object({
  type: z.enum(['BUG', 'FEATURE', 'BILLING', 'OTHER']),
  content: z.string().min(10, '请至少输入10个字符').max(2000),
  email: z.string().email('请输入有效邮箱地址').optional().or(z.literal('')),
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema)
  })

  const onSubmit = async (data: FeedbackFormData) => {
    await submitFeedback({
      type: data.type,
      content: data.content,
      email: data.email || undefined,
    })
    setSubmitted(true)
  }

  // 提交成功状态
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-background border rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold mb-2">感谢你的反馈！</h3>
          <p className="text-sm text-muted-foreground mb-4">
            我们会尽快审阅并处理。如果您填写了邮箱，将收到确认邮件。
          </p>
          <Button onClick={onClose} className="w-full">关闭</Button>
        </div>
      </div>
    )
  }

  // 表单状态
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">提交反馈</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 类型 */}
          <div>
            <Label>反馈类型</Label>
            <Select {...register('type')}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUG">🐛 Bug报告</SelectItem>
                <SelectItem value="FEATURE">💡 功能建议</SelectItem>
                <SelectItem value="BILLING">💳 支付问题</SelectItem>
                <SelectItem value="OTHER">📝 其他</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
          </div>

          {/* 内容 */}
          <div>
            <Label>详细描述</Label>
            <Textarea
              {...register('content')}
              placeholder="请详细描述您遇到的问题或建议..."
              rows={4}
              className="mt-1"
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
          </div>

          {/* 邮箱 (可选) */}
          <div>
            <Label>联系邮箱 <span className="text-muted-foreground text-xs">(可选，用于接收确认邮件)</span></Label>
            <Input
              {...register('email')}
              type="email"
              placeholder="user@example.com"
              className="mt-1"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? '提交中...' : '提交反馈'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

```typescript
// src/actions/support.ts
'use server'

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/resend'
import FeedbackAckEmail from '@/lib/email/templates/FeedbackAckEmail'
import { getCurrentUser } from '@/lib/auth'

// ==================== 用户端: 提交反馈 ====================

/**
 * 提交用户反馈
 * ⭐ 写入DB → 异步发送确认Email (Email失败不影响写入)
 */
export async function submitFeedback(data: {
  type: string
  content: string
  email?: string
}) {
  const user = await getCurrentUser() // 可能为 null (匿名访问者)

  const feedback = await prisma.userFeedback.create({
    data: {
      userId: user?.id ?? null,
      type: data.type as any,
      content: data.content,
      email: data.email ?? user?.email ?? null,
    }
  })

  // 异步发送确认邮件 (用户提供了邮箱时)
  const contactEmail = data.email || user?.email
  if (contactEmail) {
    // 不 await, 不阻塞用户操作
    sendEmail({
      to: contactEmail,
      subject: `[LearnMore] 反馈确认 - #${feedback.id.slice(0, 8).toUpperCase()}`,
      react: FeedbackAckEmail({
        referenceId: feedback.id.slice(0, 8).toUpperCase(),
        type: data.type,
        estimatedResponseTime: '24小时内',
      }),
    }).catch(err => console.error('Feedback ack email failed:', err))
  }

  return { success: true, feedbackId: feedback.id }
}

// ==================== Admin端: 反馈管理 ====================

/**
 * 获取反馈列表 (Admin)
 */
export async function getAdminFeedbackList(params: {
  status?: string
  type?: string
  limit?: number
  offset?: number
}) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized')

  const where: any = {}
  if (params.status) where.status = params.status
  if (params.type) where.type = params.type

  const [feedbacks, total] = await Promise.all([
    prisma.userFeedback.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, username: true, subscriptionTier: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit || 20,
      skip: params.offset || 0,
    }),
    prisma.userFeedback.count({ where })
  ])

  // 各状态数量 (用于筛选栏角标)
  const statusCounts = await prisma.userFeedback.groupBy({
    by: ['status'],
    _count: { id: true }
  })

  return {
    feedbacks,
    total,
    byStatus: Object.fromEntries(statusCounts.map(s => [s.status, s._count.id]))
  }
}

/**
 * 更新反馈状态 + 备注 (Admin)
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: string,
  adminNote?: string
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.userFeedback.update({
    where: { id: feedbackId },
    data: {
      status: status as any,
      ...(adminNote !== undefined && { adminNote }),
      resolvedBy: user.id,
      resolvedAt: new Date(),
    }
  })

  return { success: true }
}
```

---

### 📝 开发步骤建议

**Step 1: Legal Pages (2-3小时)**
- 编写Terms/Privacy/Refund文案
- 确保隐私政策中包含Cookie政策章节

**Step 2: Cookie Consent (1-2小时)**
- 实现横条组件
- 集成到根布局
- 测试SSR闪烁问题

**Step 3: Help Center (2-3小时)**
- FAQ内容编写 (10题)
- Accordion组件 + 搜索过滤

**Step 4: Feedback Widget (3-4小时)**
- Widget + Modal + 表单验证
- submitFeedback Server Action
- 确认Email触发

**Step 5: Admin Feedback Inbox (3-4小时)**
- 列表页 (筛选 + 分页)
- 详情页 (状态变更 + 备注)
- 侧边栏扩展

**Step 6: SEO (1小时)**
- metadata + sitemap更新

**总预计时间**: 12-17小时

---

### Task C 验证清单

- [ ] /terms、/privacy、/refund 内容完整可访问
- [ ] Cookie横条首次显示，选择后不再出现
- [ ] FAQ至少10题，搜索过滤正常
- [ ] 反馈挂件在Dashboard和公开页均可见
- [ ] 提交反馈后 DB 有记录，邮箱收到确认
- [ ] /admin/feedback 列表和详情页功能正常
- [ ] 非Admin访问 /admin/feedback 被拦截

---

## 🎨 4. Frontend Design Guide (前端设计指南)

### 4.1 UI 集成点总图

```
根布局 (layout.tsx)
 └─ CookieConsent (全局底部横条)

Dashboard 布局 (Header)
 └─ NotificationBell (铃铛图标, 顶栏右侧)

Dashboard 布局 + Marketing 布局
 └─ FeedbackWidget (悬浮按钮, 右下角)

Admin 侧边栏
 └─ "用户反馈" 菜项 + 未处理数角标

Settings 路由
 └─ /settings/notifications (通知偏好页)

Public 路由
 └─ /terms, /privacy, /refund, /help
```

### 4.2 NotificationBell 集成位置

```tsx
// 在 Dashboard Header 组件中 (已有的顶栏), 用户头像左边添加:
import { NotificationBell } from '@/components/layout/NotificationBell'

// 在 Server Component 层预取未读数, 避免首屏闪烁:
const unreadCount = await getUnreadNotificationCount(user.id)

<NotificationBell userId={user.id} initialUnreadCount={unreadCount} />
```

### 4.3 Admin Feedback Inbox AI Prompt

```
设计Admin反馈管理后台页面 (/admin/feedback)

列表页:
1. 顶部区域:
   - 标题: "用户反馈"
   - 4个状态卡片: 全部(N) / 待处理(N, 橙色) / 处理中(N, 蓝色) / 已解决(N, 绿色)
   - 类型筛选下拉: 全部 / Bug / 功能建议 / 支付问题

2. 反馈表格:
   - 列: 编号(UUID前8位大写), 类型(彩色标签), 内容(截断至50字),
         用户信息(名称+订阅级别角标), 状态(标签), 提交时间
   - 空状态: "没有匹配的反馈记录"
   - 分页组件

3. 点击行跳转到详情页

详情页:
1. 左侧主区域:
   - 面包屑: 用户反馈 > #XXXXXXXX
   - 完整反馈内容卡片
   - 提交时间显示

2. 右侧面板 (sticky):
   - 用户信息卡片: 头像占位、姓名、邮箱、订阅级别、注册日期
   - 状态选择器(下拉): OPEN / IN_PROGRESS / RESOLVED / CLOSED
   - Admin备注区: 多行文本输入
   - 保存按钮

设计风格: 与 /admin/users 页面风格一致
组件库: Shadcn/ui + Tailwind CSS
```

### 4.4 通知设置页 AI Prompt

```
设计通知偏好设置页面 (/dashboard/settings/notifications)

1. 页面标题: "通知设置"
2. 说明文段: "自定义你希望接收的通知类型"

3. 设置矩阵 (卡片内的Table):
   | 通知类型    | 说明                     | 站内通知    | 邮件通知    |
   |-----------|-------------------------|-----------|-----------|
   | 社交互动   | 帖子回复和评论            | [Toggle]   | -         |
   | 系统通知   | 版本更新和公告            | [Toggle]   | -         |
   | 成就       | 获得新勋章               | [Toggle]   | -         |
   | 支付确认   | 收据和订阅变更            | 始终开启   | 始终开启   |
   | 学习周报   | 每周学习总结             | -         | [Toggle]   |
   | 营销推广   | 活动和促销信息            | -         | [Toggle]   |

   注: "始终开启" 的行不可修改，显示灰色禁用Toggle

4. 底部: "保存偏好" 按钮 (成功后toast提示)

设计风格: 与其他设置页一致, 使用Shadcn Switch组件
```

---

## ✅ 5. Definition of Done (交付标准)

### 功能完整性
- [ ] Task A: Email基础设施可用, 3张新表迁移成功, 核心utilities工作正常
- [ ] Task B: 通知中心UI正常, 4个触发点全部埋点完成
- [ ] Task C: Legal页面上线, Cookie同意正常, FAQ可用, 反馈闭环打通, Admin收箱可用

### 代码质量
- [ ] ESLint 0 errors
- [ ] TypeScript 0 type errors (`pnpm tsc --noEmit`)
- [ ] 所有Server Actions包含错误处理 (try-catch)
- [ ] 用户输入均经过 Zod 验证
- [ ] Admin端点第一行必须做 role 校验

### 安全
- [ ] Admin端点均包含 `role === 'ADMIN'` 校验
- [ ] Feedback支持匿名但不暴露其他用户信息
- [ ] Email中不包含敏感数据 (无密码、无Token、无内部ID)
- [ ] Cookie Consent 选择存储在客端, 不影响核心功能运行

### 性能
- [ ] 通知列表加载 < 500ms
- [ ] Email发送异步处理, 不阻塞主流程 (submitFeedback 确认Email不 await)
- [ ] FAQ页面静态渲染 (SSG)
- [ ] Legal页面静态渲染 (SSG)

### SEO
- [ ] /terms、/privacy、/help、/refund 均有正确的 `metadata`
- [ ] `sitemap.xml` 包含新页面
- [ ] 所有新页面有 og:title 和 og:description

---

## 🚀 6. Implementation Roadmap (实施路线图)

### Week 1: Task A (Email & 通知基础)
```
Day 1: 安装Resend, 配置环境变量, 编写 resend.ts
Day 2: 编写5个 react-email 模板, 本地预览确认
Day 3: Prisma Schema更新 (3新表 + User关联), 运行迁移
Day 4: 实现 notification.ts + notification-preferences.ts Server Actions
Day 5: 验证: 测试邮件发送, 通知读写, 偏好迁移逻辑
```

### Week 2: Task B + C 并行开发
```
Branch 1 (Task B - 通知中心):
  Day 1-2: NotificationBell + NotificationDropdown UI
  Day 3: Welcome + Receipt 触发器埋点
  Day 4: Trial Expiry 触发器 + 去重逻辑
  Day 5: Social Reply 触发器 + 通知设置页

Branch 2 (Task C - 支持与合规):
  Day 1: Legal Pages (Terms / Privacy / Refund)
  Day 2: Cookie Consent 横条 + 集成到根布局
  Day 3: Help Center (FAQ + 搜索过滤)
  Day 4: Feedback Widget + Modal + Server Action + Ack Email
  Day 5: Admin Feedback Inbox + SEO
```

### Week 3: 集成测试与优化
```
Day 1-2: 端到端流程测试
  - 注册 → Welcome通知 → 铃铛点击 → 跳转
  - 模拟支付 → Receipt通知 → 铃铛
  - 试用期倒计时 → Email + InApp
  - 反馈提交 → DB + Ack Email → Admin收箱

Day 3: Bug修复

Day 4: SEO验证 + 性能优化
  - Lighthouse 检查新页面
  - 验证 sitemap.xml

Day 5: Definition of Done 最终确认 + 清理
```

---

## 📚 7. Reference Materials (参考资料)

- [Resend 官方文档](https://resend.com/docs)
- [React Email](https://react.email/) — 模板开发 + 本地预览
- [GDPR Cookie 合规指南](https://gdprhub.eu/) — Cookie横条要求
- [Next.js Sitemap 自动生成](https://nextjs.org/docs/app/api-reference/functions/generateSitemaps)
- [Stripe 商家合规要求](https://stripe.com/docs/connect/legal-details) — ToS/Privacy页面要求

---

## 🔧 8. Troubleshooting Guide (常见问题)

### Q1: Resend 报 "Rate Limit Exceeded"
**原因**: 免费计划限制500封/月
**解决方案**: Trial Expiry触发器已内置去重逻辑（每用户每天最多1封）。生产环境若需更多配额，升级到Resend Pro。

### Q2: Cookie横条在首次渲染时闪烁
**原因**: SSR阶段 localStorage 不可用，useEffect 在客端才执行
**解决方案**: `showBanner` 初始值设为 `false`，仅在 `useEffect` 中确认 localStorage 无记录后才设为 `true`。这样SSR期间不渲染横条，避免闪烁。

### Q3: 通知Polling占用资源
**原因**: 每个挂载的 NotificationBell 都在 setInterval
**解决方案**: useEffect 的 return 函数中 clearInterval。单页应用中同一时刻只有一个 Bell 组件挂载，60s间隔资源消耗可忽略。

### Q4: NotificationPreference 自动创建逻辑报唯一约束冲突
**原因**: 并发情况下两个请求同时尝试创建同一用户的偏好记录
**解决方案**: 使用 Prisma 的 `createMany` 带 `skipDuplicates: true`，或在 `getNotificationPreferences` 中用 `upsert`。

---

## ✍️ 9. Development Notes (开发笔记)

### 架构决策记录 (ADR)

**ADR-001: 通知实时性选择 — Polling vs WebSocket**
- **决策**: 采用简单 Polling (60s间隔)
- **理由**: 通知实时性要求低 (分钟级延迟可接受)。WebSocket需要额外的连接管理和部署配置(Vercel Serverless对WebSocket支持有限)，增加复杂度和成本。
- **迁移触发**: 当用户反馈明确要求"回复后立刻看到通知"时，考虑迁移到 Server-Sent Events (SSE)，比WebSocket更适合单向推送场景。

**ADR-002: Cookie Consent 使用自定义组件**
- **决策**: 不引入第三方Cookie consent库
- **理由**: 交互模式极简 (仅"全部接受"和"仅必要"两个按钮)，自定义实现约50行代码。引入库会额外增加 bundle size，与产品简洁定位不符。
- **存储**: localStorage 足够，不需要服务端记录用户Cookie同意状态。

**ADR-003: NotificationPreference 独立表 vs 扩展 UserSettings**
- **决策**: 创建独立的 `NotificationPreference` 表
- **理由**: `UserSettings` 中已有 `notificationDaily`、`notificationWeekly`、`emailMarketing` 三个字段，但粒度不够 — 无法独立控制 InApp 和 Email。独立表结构清晰，未来扩展新通知类型时不需要修改 UserSettings 表。
- **迁移策略**: 首次创建偏好记录时自动同步旧字段值，保证平滑过渡。

**ADR-004: Feedback 确认Email 异步发送**
- **决策**: `submitFeedback` 先完成DB写入，再异步触发确认Email (不 await)
- **理由**: 用户不应因Email发送耗时而等待表单响应。Email失败不影响核心功能(反馈已入库)。
- **容错**: 用 `.catch()` 记录错误日志，方便排查但不影响用户流程。

**ADR-005: Trial Expiry 通知触发方式**
- **决策**: 接入已有 `/api/cron/` 路由模式 (与 cleanup-leaderboard 同一体系)
- **理由**: 项目已有Cron基础设施，加入新任务零额外运维成本。同时在用户登录时也执行一次检查 (Lazy Check)，确保即使Cron偶尔失败用户也能收到通知。

---

**Story 状态**: Backlog ⚪
**最后更新**: 2026-02-04
**下次审查**: Sprint Planning Meeting

> ⚠️ **备注**: 本Story合并了原 story-048-notifications（通知系统）和 story-050-support（支持与合规）的全部内容。两者已从 backlog 删除。原 story-049-onboarding 已重编号为 Story-048。
