# Story-048: 消息通知系统 (Notification Center)

**阶段**: Phase 8: Core Experience & Retention
**目标**: 构建全渠道触达能力（站内信 + 邮件），提升用户留存与活跃度，确保关键事务信息（如支付、会员过期）准确送达。
**预估时间**: 30-40 Hours
**Story Points**: 25
**前置依赖**: Story-045 (Permission System), Story-031 (Payment)
**负责人**: _待分配_

---

## 📋 1. Executive Summary (概要)

### 当前痛点
- ⚠️ **信息黑洞**: 用户不知道自己的会员即将过期，不知道有人回复了自己的帖子，导致错失挽回机会或互动机会。
- ⚠️ **信任缺失**: 支付成功后收不到官方确认邮件，用户缺乏安全感。
- ⚠️ **运营被动**: 无法主动触达沉睡用户。

### 目标状态
- ✅ **双轨通知架构**: 
  - **In-App (站内信)**: 实时、轻量、互动性强（点赞、回复、系统公告）。
  - **Email (邮件)**: 正式、触达率高、适合召回（支付收据、周报、密码重置）。
- ✅ **统一通知中心**: 在 Dashboard 顶部提供铃铛图标，集中展示未读消息。
- ✅ **用户偏好设置**: 允许用户精细化控制接收哪些类型的通知（"请不要发营销邮件，但我需要看周报"）。

---

## 🏗️ 2. System Architecture (系统架构)

### 2.1 数据模型

```prisma
model Notification {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id])
  
  type      NotificationType // SYSTEM, SOCIAL, BILLING, ACHIEVEMENT
  title     String
  content   String   @db.Text
  link      String?  // 点击跳转链接
  isRead    Boolean  @default(false)
  
  metadata  Json?    // 额外数据 (e.g. { actorId: "...", postId: "..." })
  createdAt DateTime @default(now())

  @@index([userId, isRead])
}

model NotificationSetting {
  userId    String   @id @db.Uuid
  user      User     @relation(fields: [userId], references: [id])
  
  emailBilling    Boolean @default(true)
  emailMarketing  Boolean @default(true)
  emailWeeklyReport Boolean @default(true)
  
  inAppSocial     Boolean @default(true)
  inAppSystem     Boolean @default(true)
}
```

### 2.2 技术栈
- **Email Service**: **Resend** (推荐，API 体验极佳，React Email 支持好) 或 SendGrid。
- **Email Templates**: `react-email` (用 React 写邮件模板)。
- **Real-time**: 简单的 Polling (每分钟轮询) 或 Server Actions (页面刷新时获取)，暂不需要 WebSocket (过度设计)。

---

## 🎯 3. Implementation Tasks (实施任务拆解)

---

## 📦 Task A: 邮件服务基础设施 (Email Infrastructure)

### 🎯 目标
集成 Resend，创建通用的邮件发送服务，设计基础邮件模板。

### 📄 核心文件
- `src/lib/email/resend.ts` (Client Wrapper)
- `src/lib/email/templates/WelcomeEmail.tsx`
- `src/lib/email/templates/ReceiptEmail.tsx`
- `src/actions/email.ts`

### ✅ 交付物清单
- [ ] A1: Resend API Key 配置与 Client 初始化
- [ ] A2: `react-email` 模板库搭建
- [ ] A3: `sendEmail({ to, subject, template })` 通用函数
- [ ] A4: 替换现有的 Auth 邮件 (如有)

### 🔧 详细实施指南
```typescript
// src/actions/email.ts
import { Resend } from 'resend';
import WelcomeEmail from '@/lib/email/templates/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'LearnMore <onboarding@learnmore.com>',
    to: email,
    subject: 'Welcome to LearnMore!',
    react: WelcomeEmail({ name }),
  });
}
```

---

## 📦 Task B: 站内信系统 (In-App Notification)

### 🎯 目标
实现数据库存储、API 读取、以及前端的通知下拉列表。

### 📄 核心文件
- `src/components/layout/NotificationBell.tsx`
- `src/components/notification/NotificationList.tsx`
- `src/actions/notification.ts`

### ✅ 交付物清单
- [ ] B1: Prisma Schema 更新 (Notification 表)
- [ ] B2: Server Actions (`getUnreadCount`, `markAsRead`, `listNotifications`)
- [ ] B3: 铃铛图标组件 (带红点)
- [ ] B4: 下拉列表 UI (支持点击跳转、一键已读)

### 🔧 详细实施指南
**UI 交互**:
点击铃铛 -> 弹出 Popover -> 调用 `listNotifications` -> 渲染列表。
点击某条消息 -> 调用 `markAsRead` -> `router.push(link)`。

---

## 📦 Task C: 触发器集成 (Triggers Integration)

### 🎯 目标
在业务流程中埋点，自动触发通知。

### 场景清单
1.  **Welcome**: 注册成功 -> 发送 Welcome Email + 站内信 "完成新手任务"。
2.  **Billing**: Stripe Webhook (Payment Succeeded) -> 发送 Receipt Email。
3.  **Social**: Story-046 评论/回复 -> 触发站内信 (检查 `NotificationSetting`).
4.  **Retention**: Story-045 试用期还剩 24h -> 发送 Email + 站内信 (Urgent)。

### ✅ 交付物清单
- [ ] C1: `auth.ts` 集成 Welcome Email
- [ ] C2: `stripe/route.ts` 集成 Receipt Email
- [ ] C3: 试用期过期 Cron Job (可选，或懒触发)

---

## 📦 Task D: 通知设置中心 (Settings)

### 🎯 目标
允许用户管理自己的通知偏好。

### 📄 核心文件
- `src/app/(dashboard)/settings/notifications/page.tsx`
- `src/components/settings/NotificationPreferences.tsx`

### ✅ 交付物清单
- [ ] D1: 设置页面 UI
- [ ] D2: `updateNotificationSettings` Server Action
- [ ] D3: 在发送逻辑中加入 `if (!settings.emailMarketing) return;` 检查

---

## ✅ 4. Verification Plan (验收标准)

- [ ] **邮件送达率**: 注册一个新账号，检查是否能在 1 分钟内收到欢迎邮件（检查垃圾箱）。
- [ ] **站内信实时性**: 手动往 DB 插入一条消息，刷新页面，铃铛应显示红点。
- [ ] **偏好控制**: 关闭 "Billing Emails" 开关，模拟一次扣款，确认没有收到邮件。

---

## 📅 5. Execution Roadmap

1.  **Day 1**: Task A (Email Infra) - 跑通 Resend。
2.  **Day 2**: Task B (In-App DB & UI) - 做出铃铛和列表。
3.  **Day 3**: Task C (Triggers) - 在各个业务点埋桩。
4.  **Day 4**: Task D (Settings) - 完成设置页。
