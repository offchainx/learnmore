# Story-046: 用户全生命周期管理后台 (User 360 Dashboard)

**阶段**: Phase 7: Business & Monetization
**目标**: 构建"上帝视角"的用户管理系统，赋予 Admin/客服一站式解决用户问题的能力（查询、诊断、干预、审计）
**预估时间**: 55-65 Hours
**Story Points**: 45
**前置依赖 (三级链，需全部完成才可启动)**:
  - `Story-031 (Payment)` — 提供 Stripe 集成基础
  - `Story-042 (Referral)` — 提供邀请树数据
  - `Story-045 (Permission System)` — 提供权限引擎、`UserPermissionOverride`、`applyAdminOverride`（本 Story 核心集成点）
  - > ⚠️ Story-045 本身依赖 031 和 042，因此实际依赖深度为 **3 级**。启动前须确认 045 已归档到 `completed/`。
**负责人**: _待分配_

---

## 📋 1. Executive Summary (概要)

### 当前痛点
- ⚠️ **黑盒运营**: 客服无法知道用户的具体状态（是付费了没生效？还是账号被封了？）。
- ⚠️ **干预困难**: 遇到用户投诉（如“试用期没开通”），Admin 只能手动改数据库，风险极高且无记录。
- ⚠️ **数据孤岛**: 支付在 Stripe，学习在 DB，邀请在 Referral 表，没有一个聚合视图能看清“这个用户是谁”。

### 目标状态
建立 **User 360 Dashboard**，采用 **Master-Detail (列表-详情)** 架构：
- ✅ **全景视图**: 可以在一个页面看完用户的 身份、订阅、学习、社交、安全 五大维度。
- ✅ **上帝权限**: 支持 **"Login as User" (伪装登录)**，一键复现用户现场。
- ✅ **深度干预**: 集成 Story-045 的权限覆写能力，支持手动发奖、延期、封禁。
- ✅ **安全审计**: 所有敏感操作（改密、封号、查看隐私）留痕。

---

## 🏗️ 2. System Architecture (系统架构)

### 2.1 页面架构 (UI Map)

```
/admin/users (列表页)
├── Filters (Status, Tier, Risk, Activity)
└── Data Table (Sortable, Batch Actions)

/admin/users/[id] (详情页 - 360 View)
├── Header (Avatar, Quick Actions: Impersonate/Ban/ResetPass)
└── Tabs
    ├── 1. Overview (概览)
    │   ├── Identity Card (Email, Reg Date, Source)
    │   ├── Security Log (Last IP, Devices)
    │   └── Admin Notes (内部备注系统)
    ├── 2. Subscription (订阅 - Story 045 Integrated)
    │   ├── Current Plan Status
    │   ├── Override Controls (Grant Trial, Extend)
    │   └── Stripe Payment History
    ├── 3. Activity (学习行为)
    │   ├── Stats (Questions Done, Accuracy)
    │   └── Activity Timeline (Login, Quiz, ErrorBook)
    ├── 4. Growth (增长 - Story 042 Integrated)
    │   ├── Referral Stats
    │   └── Invitation Tree
    └── 5. Audit (审计)
        └── 审计时间线 (SecurityLog + UserPermissionOverride + ImpersonationSession 三表汇聚)
```

### 2.2 数据模型扩展 (Schema)

除了 Story-045 已有的 `UserPermissionOverride`，本 Story 需新增三块运维辅助表。

> **设计决策说明**:
> - `SecurityLog.action` 使用 **Prisma Enum** 而非自由字符串，避免 typo 导致审计记录静默丢失，编译期即可校验。
> - `AdminNote` 采用**软删除**策略（`deletedAt`），备注是运维痕迹，不应被永久抹除，需保留恢复能力。
> - `ImpersonationSession` 独立建表而非塞进 `SecurityLog.metadata`，伪装登录的**进入和退出**是两个独立事件，需要独立的状态字段来追踪生命周期。

```prisma
// ── Enum 定义 ──────────────────────────────────

enum SecurityAction {
  LOGIN
  LOGOUT
  PASSWORD_RESET
  IMPERSONATE_START   // 伪装登录：进入
  IMPERSONATE_END     // 伪装登录：退出（主动退出 / Token 过期）
  USER_BANNED
  USER_UNBANNED
  PERMISSION_OVERRIDE // 权限覆写（与 Story-045 对齐）
  ADMIN_NOTE_ADDED
  ADMIN_NOTE_DELETED  // 软删除操作本身也需审计
}

// ── User 关联扩展 ──────────────────────────────

model User {
  // ... existing fields

  // 运维关联 (本 Story 新增)
  adminNotes            AdminNote[]
  securityLogs          SecurityLog[]
  impersonationSessions ImpersonationSession[]
}

// ── 客服/运营内部备注（用户不可见，支持软删除） ──

model AdminNote {
  id        String   @id @default(uuid()) @db.Uuid
  userId   String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id])

  authorId  String   @db.Uuid  // 操作者 Admin ID
  content   String   @db.Text  // Markdown 格式
  isPinned  Boolean  @default(false)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // 软删除时间；非 null 表示已删除，列表层过滤即可隐藏

  @@index([userId])
  @@index([userId, deletedAt]) // 常查询：某用户下所有未删除备注
}

// ── 安全审计日志 ────────────────────────────────

model SecurityLog {
  id        String         @id @default(uuid()) @db.Uuid
  userId   String         @db.Uuid
  user      User           @relation(fields: [userId], references: [id])

  action    SecurityAction // 枚举，编译期安全
  ipAddress String?
  userAgent String?
  metadata  Json?          // 附加上下文，例如 { reason: "Spam", adminId: "..." }

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([userId, createdAt]) // 时间线查询场景
}

// ── 伪装登录会话（追踪完整生命周期） ────────────

model ImpersonationSession {
  id            String   @id @default(uuid()) @db.Uuid
  adminId       String   @db.Uuid  // 发起伪装的 Admin
  targetUserId  String   @db.Uuid  // 被伪装的用户
  targetUser    User     @relation(fields: [targetUserId], references: [id])

  token         String   // 签发的 JWT（存储用于退出时无效化校验）
  startedAt     DateTime @default(now())
  expiresAt     DateTime // Token 自然过期时间（startedAt + 1h）
  endedAt       DateTime? // 实际退出时间；null 表示仍活跃或等待过期
  endReason     String?  // "MANUAL_LOGOUT" | "TOKEN_EXPIRED" | "ADMIN_REVOKED"

  @@index([targetUserId])
  @@index([adminId, startedAt])
}
```

---

## 🎯 3. Implementation Tasks (实施任务拆解)

### ⚠️ 策略说明：UI First + 明确的 Mock/Real 边界

由于 Admin 后台交互复杂，我们采取 **UI First** 策略。
**Task A** 构建完整的静态 Mock UI，确保交互流畅、视觉层级清晰；**Task B 起逐步切换为真实数据和逻辑**。
每个 Task 的数据来源边界如下表明确，开发时不再猜测：

| Task | 数据源 | 策略 |
|------|--------|------|
| **Pre-Task** | — | 仅搭建布局壳层，无数据 |
| **Task A** | 全 Mock | Mock 生成器提供用户列表，不请求数据库 |
| **Task B** | User 表 Real / Note & Log Real / Impersonation Real | 用户基础信息对接真实 DB；Admin Note 和 SecurityLog 写入真实表；Impersonation 必须接真实 Auth（安全敏感，无法 Mock） |
| **Task C** | Subscription Real / Stripe Mock | 订阅状态从 `UserPermissionOverride` 读取真实数据；Stripe 支付流水本阶段用 Mock，后续对接 Webhook |
| **Task D** | Referral Real / Activity Real | 对接 Story-042 的真实 Referral 数据；学习行为从 `UserAttempt` 聚合 |

---

### 📊 跨 Task 数据流梳理

各 Task 之间并非孤立的，以下是核心的数据流依赖关系，开发前须通知：

```
┌─────────────────────────────────────────────────────────┐
│                    数据层 (Prisma)                        │
│                                                         │
│  User ←──── SecurityLog (Task B 写入)                   │
│    │                                                    │
│    ├─── AdminNote (Task B 写入)                         │
│    │                                                    │
│    ├─── ImpersonationSession (Task B 写入/更新)          │
│    │                                                    │
│    ├─── UserPermissionOverride ← (来自 Story-045)       │
│    │         ↑ Task C 调用 applyAdminOverride 写入       │
│    │         ↑ Task D 的 Audit Tab 读取                  │
│    │                                                    │
│    ├─── Referral (来自 Story-042) ← Task D 读取         │
│    │                                                    │
│    └─── UserAttempt / ErrorBook ← Task D 读取           │
└─────────────────────────────────────────────────────────┘
         ↑                    ↑
         │                    │
┌────────┴────┐    ┌──────────┴────────┐
│  Task B     │    │  Task C           │
│  写入审计   │    │  写入权限覆写     │
│  写入备注   │    │  读取 Stripe Mock │
│  写入伪装会话│    └───────────────────┘
└─────────────┘
         ↓                    ↓
┌────────────────────────────────────┐
│  Tab 5: Audit (审计视图)           │
│  汇聚读取: SecurityLog +           │
│           UserPermissionOverride +  │
│           ImpersonationSession     │
└────────────────────────────────────┘
```

**关键规则**: `SecurityLog` 是所有敏感操作的**唯一写入入口**，Task B / C / D 中任何状态变更都必须先写 `SecurityLog` 再执行业务操作，保证审计不可遗漏。

---

## 📦 Pre-Task: Admin 公共布局 (AdminLayout)

> **为什么单独提出**: `AdminLayout` 是所有 `/admin/*` 页面的公共容器（侧栏导航、顶栏、宽屏约束）。它不属于某个具体功能 Task，而是所有后续 Task 的基础依赖。必须优先完成，否则后续每个 Task 都会卡在布局层。

### 🎯 目标
创建或确认 `AdminLayout` 组件存在且结构正确，确保 `/admin/users` 及其子路由能正常渲染。

### 📄 核心文件
- `src/components/layout/AdminLayout.tsx`
- `src/app/(dashboard)/admin/layout.tsx` (Next.js 布局文件，挂载 AdminLayout)

### ✅ 交付物清单
- [ ] P1: `AdminLayout` 组件（侧栏 + 主内容区 + 顶栏）
- [ ] P2: `/admin/layout.tsx` 路由级 layout 挂载
- [ ] P3: 确认全屏宽布局适配桌端视口（min-width: 1024px）

### 🔧 实施指南
- 检查 `src/components/layout/` 是否已有 `AdminLayout.tsx`（Story-044 内容管理可能已创建）。
- 若已存在，仅需确认结构兼容（侧栏 nav 项可扩展）即可；若不存在则新建。
- 侧栏导航项需支持动态扩展，后续 Task 会往里加 "Users" 入口。

---

## 📦 Task A: 用户列表页 (The List)

### 🎯 目标
实现用户列表页（带高级筛选 + 服务端分页），使用 Mock 数据预填充，确保交互流畅。

### 📄 核心文件
- `src/app/(dashboard)/admin/users/page.tsx`
- `src/components/admin/users/UserTable.tsx`
- `src/components/admin/users/UserFilters.tsx`
- `src/components/admin/users/UserStatusBadge.tsx`
- `src/components/admin/users/mock/userMockData.ts`

### 📘 TypeScript 定义
- `UserSummary`: 列表行的数据结构
- `UserTableColumn`: 列定义
- `UserFilterState`: 筛选状态接口
- `PaginationParams`: 分页参数 `{ page, pageSize, sortField, sortDirection }`

### ✅ 交付物清单
- [ ] A1: 用户列表页 (依赖 Pre-Task 布局)
- [ ] A2: Shadcn DataTable 实现（服务端分页 + 排序）
- [ ] A3: 组合过滤器 (Status, Tier, Search)
- [ ] A4: Mock Data 生成器（覆盖所有状态和 Tier 组合）

### 🔧 详细实施指南

#### A1: 页面入口
挂载在 `AdminLayout` 内，侧栏添加 "Users" 导航项。

#### A2: UserTable + 分页策略

**分页设计决策**:
- 采用 **Offset 分页**（非 Cursor），理由：列表页需要支持随机跳页（如直接跳第 50 页），Cursor 分页无法实现。
- 每页默认 **20 条**，可选 10 / 20 / 50。
- 排序和过滤参数由服务端处理，客端仅传递 `PaginationParams`，避免前端拉取全部数据。
- Mock 阶段：模拟服务端分页逻辑（在 Mock 生成器内做切片），保证后续切换为真实 API 时接口签名一致。

```tsx
// src/components/admin/users/UserTable.tsx
import { DataTable } from "@/components/ui/data-table"

export const columns: ColumnDef<UserSummary>[] = [
  {
    accessorKey: "email",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar src={row.original.avatar} />
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "subscriptionTier",
    header: "Tier",
    cell: ({ row }) => <TierBadge tier={row.getValue("subscriptionTier")} />
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
  },
  {
    accessorKey: "lastActiveAt",
    header: "Last Active",
    // 支持服务端排序，列头点击触发 sortField 切换
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]
```

#### A3: Filters
实现一个组合过滤器组件，状态变更立即触发分页重置（回到第 1 页）：
- **Status**: Active / Banned / Suspended
- **Tier**: Starter / Standard / Smart+ / Premier（对齐 Story-045 四级体系）
- **Search**: Email / Name（去掉 Phone，当前 User 表无 phone 字段，避免查询空字段）

#### A4: Mock Data 生成器
生成 200 条用户，确保覆盖所有 `Status × Tier` 组合，以及 `lastActiveAt` 的时间分布（今天、本周、上月、3 个月以前），保证过滤和排序在 Mock 阶段就能真实验证。

---

## 📦 Task B: 详情页 - 身份与安全 (Identity & Security)

### 🎯 目标
实现 `Overview` Tab，包含用户基础画像、状态控制（带高风险确认）、内部备注（软删除）、以及**伪装登录（完整进退流程）**。

### 📄 核心文件
- `src/app/(dashboard)/admin/users/[id]/page.tsx`
- `src/components/admin/users/UserProfileHeader.tsx`
- `src/components/admin/users/tabs/OverviewTab.tsx`
- `src/components/admin/users/AdminNoteList.tsx`
- `src/components/admin/users/HighRiskConfirmDialog.tsx` ← 新增
- `src/components/admin/users/ImpersonateBanner.tsx` ← 新增（前台伪装警告条）
- `src/actions/admin/user-ops.ts` (Server Actions)
- `src/app/api/auth/impersonate/route.ts` (进入端点)
- `src/app/api/auth/impersonate/end/route.ts` (退出端点) ← 新增

### ⚡ Server Actions
- `toggleUserStatus(userId, status, reason)`: 封禁/解封（调用前需前端展示确认弹窗）
- `addAdminNote(userId, content)`: 添加备注
- `softDeleteAdminNote(noteId)`: 软删除备注（设置 `deletedAt`）
- `restoreAdminNote(noteId)`: 恢复备注（清除 `deletedAt`）
- `impersonateUser(userId)`: 伪装登录入口
- `endImpersonation()`: 伪装登录退出

### ✅ 交付物清单
- [ ] B1: 详情页 Header (显示关键指标 + 快捷操作按钮，高风险按钮带 `HighRiskConfirmDialog`)
- [ ] B2: Overview Tab UI
- [ ] B3: Admin Note 系统 (软删除 CRUD + 恢复功能)
- [ ] B4: 伪装登录 — 进入流程
- [ ] B5: 伪装登录 — 退出流程（主动退出 + Token 过期处理）
- [ ] B6: 前台伪装警告条 `ImpersonateBanner`

### 🔧 详细实施指南

#### B1: 高风险操作确认机制 (HighRiskConfirmDialog)

Header 中的 **封禁用户** 和 **伪装登录** 是高风险操作，不能一键执行。必须经过确认弹窗：

```
┌──────────────────────────────────────┐
│  ⚠️ 确认：封禁用户                   │
│                                      │
│  用户: user@example.com              │
│  操作: 将状态设为 Banned             │
│                                      │
│  原因 (必填):                        │
│  ┌──────────────────────────────┐    │
│  │  (Textarea, min 10 chars)    │    │
│  └──────────────────────────────┘    │
│                                      │
│  [取消]              [确认封禁]      │
└──────────────────────────────────────┘
```

**规范**:
- 受 `HighRiskConfirmDialog` 保护的操作: `封禁用户` / `伪装登录` / `重置密码`
- `Reason` 字段必填且 min 10 字符，提交后写入 `SecurityLog.metadata.reason`
- 弹窗确认后才触发对应 Server Action，取消则不执行任何操作

#### B3: Admin Note — 软删除逻辑
- 列表默认只显示 `deletedAt IS NULL` 的备注。
- 删除时仅设置 `deletedAt = now()`，同时写入一条 `SecurityLog(action: ADMIN_NOTE_DELETED)`。
- UI 提供 "查看已删除" 开关，展示被软删除的备注（置灰样式），每条带 "恢复" 按钮。
- 恢复时清除 `deletedAt`，同时写入 `SecurityLog`。

#### B4 & B5: Impersonation 完整流程（进入 + 退出）

这是本 Story 安全风险最高的功能。**进入和退出必须作为一个完整闭环设计**，不能只有进入没有退出。

---

**① 进入流程 (Login as User)**

```typescript
// src/actions/admin/user-ops.ts
'use server'

export async function impersonateUser(targetUserId: string, reason: string) {
  const adminUser = await getCurrentUser();
  if (adminUser.role !== 'ADMIN') throw new Error("Unauthorized");

  // 1. 写入审计日志
  await prisma.securityLog.create({
    data: {
      userId: targetUserId,
      action: 'IMPERSONATE_START',
      metadata: { adminId: adminUser.id, reason }
    }
  });

  // 2. 创建会话记录
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // +1h
  const session = await prisma.impersonationSession.create({
    data: {
      adminId: adminUser.id,
      targetUserId,
      token: '',        // 先占位，签发 Token 后回填
      expiresAt,
    }
  });

  // 3. 签发 JWT（payload 包含 sessionId，用于退出时定位会话）
  const token = signImpersonationToken({
    sessionId: session.id,
    adminId: adminUser.id,
    targetUserId,
    exp: '1h'
  });

  // 4. 回填 token 到会话记录（用于退出时校验）
  await prisma.impersonationSession.update({
    where: { id: session.id },
    data: { token }
  });

  // 5. 返回重定向 URL，前端在新 Tab 打开
  return { redirectUrl: `/api/auth/impersonate?token=${token}` };
}
```

**② 退出流程 (End Impersonation)**

退出有两个入口，逻辑统一：

| 入口 | 触发条件 | 处理方式 |
|------|----------|----------|
| **主动退出** | 用户点击前台 `ImpersonateBanner` 上的 "退出伪装" 按钮 | 调用 `POST /api/auth/impersonate/end` |
| **Token 过期** | 访问受保护路由时 middleware 校验发现 Token 已过 `expiresAt` | middleware 自动清除 Cookie 并重定向到登录页 |

```typescript
// src/app/api/auth/impersonate/end/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const sessionId = // 从当前 HttpOnly Cookie 中的 impersonation token 解码获取

  // 1. 更新会话记录
  await prisma.impersonationSession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      endReason: 'MANUAL_LOGOUT'
    }
  });

  // 2. 写入审计日志
  await prisma.securityLog.create({
    data: {
      userId: // targetUserId from session,
      action: 'IMPERSONATE_END',
      metadata: { sessionId, endReason: 'MANUAL_LOGOUT' }
    }
  });

  // 3. 清除伪装 Cookie，重定向回 Admin 详情页
  const response = NextResponse.redirect(`/admin/users/${targetUserId}`);
  response.cookies.set('impersonation_token', '', { maxAge: 0, httpOnly: true });
  return response;
}
```

**③ Token 过期处理（Middleware 层）**

在 `src/middleware.ts` 中增加一个检查：如果当前请求携带 `impersonation_token` Cookie 但 Token 已过期：
1. 更新对应 `ImpersonationSession.endedAt` + `endReason: 'TOKEN_EXPIRED'`
2. 写入 `SecurityLog(IMPERSONATE_END)`
3. 清除 Cookie，重定向到 `/login`

#### B6: 前台伪装警告条 (ImpersonateBanner)

伪装状态下，前台**所有页面顶部**都需要显示一条醒目警告条，防止 Admin 忘记自己在伪装：

```
┌────────────────────────────────────────────────────────────┐
│  🔴  你正在以 user@example.com 的身份浏览  [退出伪装]      │
│      剩余时间: 47 min                                       │
└────────────────────────────────────────────────────────────┘
```

- 实现为 `ImpersonateBanner` 组件，在 `RootLayout` 或对应 layout 层条件渲染（检测 Cookie 存在）。
- "退出伪装" 按钮触发 `POST /api/auth/impersonate/end`。
- 剩余时间由 `expiresAt - now()` 计算，客端轮询更新（每 30s）。倒计时归零时自动执行退出逻辑。

---

## 📦 Task C: 详情页 - 订阅与权限 (Subscription & Story-045)

### 🎯 目标
集成 Story-045 的能力，管理用户的付费生命周期。实现 `Subscription` Tab。

### 📄 核心文件
- `src/components/admin/users/tabs/SubscriptionTab.tsx`
- `src/components/admin/users/GrantPermissionDialog.tsx`
- `src/components/admin/users/StripeHistoryTable.tsx`

### ⚡ Server Actions
- 复用 Story-045 的 `applyAdminOverride`（本 Story 不重写，仅调用）。
- 新增 `getStripePaymentHistory(customerId)`（本阶段返回 Mock 数据，见 Mock/Real 边界矩阵）。

### ✅ 交付物清单
- [ ] C1: 当前订阅状态卡片 (显示 Tier, Start/End Date, Auto-Renew Status)
- [ ] C2: 手动权限控制 Dialog (赠送试用、强制升级)
- [ ] C3: 支付流水列表 (Mock Stripe 数据)

### 🔧 详细实施指南

#### C2: Manual Override Integration

复用 Story-045 的 `UserPermissionOverride` 逻辑。
"Grant Access" 按钮触发 `GrantPermissionDialog`，Dialog 结构如下：

```
┌──────────────────────────────────────┐
│  赠送/覆写权限                        │
│                                      │
│  用户: user@example.com              │
│  当前 Tier: Standard                 │
│                                      │
│  操作类型:                            │
│  ○ 7-Day Trial    ○ Compensatory    │
│  ○ Manual Upgrade ○ Custom          │
│                                      │
│  时长:                               │
│  ○ 7 天  ○ 1 个月  ○ 自定义(天数)    │
│                                      │
│  原因 (必填, min 10 chars):          │
│  ┌──────────────────────────────┐    │
│  │  (Textarea)                  │    │
│  └──────────────────────────────┘    │
│                                      │
│  [取消]           [确认赠送]         │
└──────────────────────────────────────┘
```

**提交流程**:
1. 前端校验 Reason 非空且 >= 10 chars。
2. 调用 `applyAdminOverride`（来自 Story-045）写入 `UserPermissionOverride`。
3. **同步写入** `SecurityLog(action: PERMISSION_OVERRIDE, metadata: { type, duration, reason })`。
4. 弹窗关闭，Subscription Tab 数据刷新。

---

## 📦 Task D: 详情页 - 增长与行为 (Growth & Activity)

### 🎯 目标
实现 `Growth` 和 `Activity` Tabs，展示 Referral 数据和学习行为。同时实现 **Tab 5: Audit** 的汇聚视图。

### 📄 核心文件
- `src/components/admin/users/tabs/GrowthTab.tsx`
- `src/components/admin/users/tabs/ActivityTab.tsx`
- `src/components/admin/users/tabs/AuditTab.tsx` ← 新增，审计汇聚视图
- `src/components/admin/users/ReferralTree.tsx`

### ⚡ Server Actions
- `getUserActivityStats(userId)`: 聚合 `UserAttempt` 数据（做题数、正确率、按科目分布）
- `getUserReferralNetwork(userId)`: 递归获取邀请关系（复用 Story-042 逻辑，限深度 2 层）
- `getUserAuditLogs(userId)`: 汇聚读取 `SecurityLog` + `UserPermissionOverride` + `ImpersonationSession`，按 `createdAt` 降序返回统一时间线

### ✅ 交付物清单
- [ ] D1: Referral Stats 卡片 (邀请码、总邀请数、已获奖励)
- [ ] D2: 简单的邀请关系树/列表（缩进 2 层）
- [ ] D3: 学习热力图 (GitHub style) 或 活跃时间轴
- [ ] D4: Audit Tab — 审计时间线（汇聚所有敏感操作记录）

### 🔧 详细实施指南

#### D2: Referral Visualization
不需要复杂的 D3.js，使用简单的缩进列表或 Shadcn Tree 组件展示 1-2 层下线即可。
重点展示：**Referral Code**, **Total Referred Count**, **Rewards Earned**.

#### D4: Audit Tab — 审计时间线

这是 360 Dashboard 的**可信度核心**，所有敏感操作的痕迹都汇聚在这里。

**数据来源汇聚**（三表 JOIN，统一为时间线条目）:

| 来源表 | 映射到时间线的事件类型 |
|--------|------------------------|
| `SecurityLog` | 登录、密码重置、伪装进入/退出、封禁/解封、备注新增/删除 |
| `UserPermissionOverride` | 权限赠送、试用期延期、手动升级 |
| `ImpersonationSession` | 伪装会话开启/结束（补充 SecurityLog 的会话级别信息） |

**UI 要求**:
- 时间线倒序排列，每条项显示：时间戳、操作类型标签（颜色编码）、操作人（Admin 名）、备注/原因。
- 支持按事件类型过滤（多选）。
- 伪装会话条目需显示 **持续时长**（`endedAt - startedAt`）和 **退出原因**。

---

## ✅ 4. Verification Plan (验收标准)

### 4.1 UI/UX 验收
- [ ] **列表页分页**: 切换页码后数据正确变化，不全载入；修改 pageSize 后总页数重新计算。
- [ ] **列表页筛选**: 组合筛选 "Standard Tier" + "Status=Active" 后结果准确，且分页自动重置到第 1 页。
- [ ] **详情页**: 切换 Tab 无卡顿，信息展示布局合理，无溢出（桌端 1920px 和笔记本 1366px 均测试）。
- [ ] **高风险确认弹窗**: 点击"封禁用户"按钮后弹出确认弹窗，Reason 字段少于 10 字时提交按钮禁用；取消后无任何副作用。
- [ ] **伪装登录入口**: 点击 "Login as User" 后弹出确认弹窗（同上），确认后新标签页打开前台，顶部显示 `ImpersonateBanner`（含用户信息 + 剩余时间）。
- [ ] **伪装退出**: 点击 Banner 上 "退出伪装" 后 Cookie 清除，重定向回 Admin 详情页，Banner 消失。
- [ ] **Admin Note 软删除**: 删除备注后列表消失；勾选 "查看已删除" 后出现（置灰），点击恢复后恢复正常显示。

### 4.2 功能验收（含 API 级别测试）
- [ ] **封禁用户 — API 级别**: 封禁用户后，用该用户的 Session Cookie 直接请求受保护 API 路由（如 `/api/dashboard`），应返回 `401` 或被 middleware 拦截重定向。**不能仅靠手测登录页来验证**。
- [ ] **权限干预**: Admin 手动赠送 7 天试用后，直接查询 `UserPermissionOverride` 表确认记录存在且 `expiresAt` 正确；同时用户前台立即反映 (Check Story-045 logic)。
- [ ] **伪装登录 — Token 过期**: 伪装进入后，手动修改 `ImpersonationSession.expiresAt` 为过去时间（模拟过期），然后访问任意前台页面，应自动被退出并写入 `endReason: TOKEN_EXPIRED` 的审计记录。
- [ ] **审计日志完整性**: 执行以下操作序列后，逐一在 Audit Tab 中确认对应记录存在且信息准确：
  1. 封禁用户 → 应有 `USER_BANNED` 记录
  2. 赠送试用 → 应有 `PERMISSION_OVERRIDE` 记录
  3. 伪装登录并退出 → 应有 `IMPERSONATE_START` + `IMPERSONATE_END` 记录
  4. 新增备注并软删除 → 应有 `ADMIN_NOTE_ADDED` + `ADMIN_NOTE_DELETED` 记录
- [ ] **非 Admin 权限校验**: 用 `role !== 'ADMIN'` 的账号直接调用 `impersonateUser` / `toggleUserStatus` Server Action，应抛出 Unauthorized 异常。

---

## 📅 5. Execution Roadmap

1.  **Phase 0: 基础铺垫 (Pre-Task)** - *Day 1 上午*
    - 确认或创建 `AdminLayout`，挂载到 `/admin/layout.tsx`。
    - 侧栏添加 "Users" 导航入口。
    - **此阶段不写任何业务代码**，仅确保布局壳层可用。

2.  **Phase 1: 列表页 (Task A)** - *Day 1 下午*
    - 搭建 `/admin/users` 列表页，Mock 数据填充。
    - 实现分页策略（Offset + 服务端 Mock 切片）+ 组合过滤器。
    - 验证：筛选 + 分页交互无 bug。

3.  **Phase 2: 身份与安全 (Task B)** - *Day 2 ~ Day 3*（预估最耗时的 Task）
    - 对接真实 User 数据到详情页。
    - 实现 `HighRiskConfirmDialog`（封禁、伪装、重置密码均走此弹窗）。
    - 实现 Admin Note CRUD（含软删除 + 恢复）。
    - 实现 Impersonation **完整闭环**：进入 → Banner → 主动退出 + Token 过期处理。
    - ⚠️ **建议顺序**: 先做进入流程，再做退出流程，最后接通 Token 过期 Middleware。不要混开。

4.  **Phase 3: 订阅与审计 (Task C)** - *Day 4*
    - 集成 Story-045 的 `applyAdminOverride`。
    - 实现 GrantPermissionDialog + SecurityLog 同步写入。
    - Stripe 支付流水用 Mock 填充。

5.  **Phase 4: 增长与审计汇聚 (Task D)** - *Day 4 ~ Day 5*
    - 对接 Story-042 Referral 数据，实现缩进树。
    - 实现学习活跃时间线（从 `UserAttempt` 聚合）。
    - **最后实现 Audit Tab**：三表汇聚时间线，这是所有前面写入的数据的最终呈现，必须放到最后做。

6.  **Phase 5: 验收与收尾** - *Day 5*
    - 按 Section 4 验收清单逐项执行（特别是 API 级别测试项）。
    - `pnpm lint && pnpm tsc --noEmit && pnpm build` 全部通过。
    - 修复所有 bug 后归档 Story。

---

## 📝 开发备注

### 🔒 安全
- **高风险操作必须经过确认弹窗**: 封禁用户、伪装登录、重置密码 — 这三个操作均由 `HighRiskConfirmDialog` 守门，Reason 必填。直接一键执行是不可接受的。
- **Impersonation 是闭环而非单向**: 进入流程和退出流程必须作为一整个功能开发和测试，缺少退出机制等同于安全漏洞。
- **权限校验在 Server Action 层**: 所有敏感 Server Action 的第一行必须是 `getCurrentUser()` + `role === 'ADMIN'` 校验，不依赖前端路由守卫。
- **SecurityLog 是唯一写入入口**: 任何状态变更（封禁、赠送、伪装）都必须先写 `SecurityLog`，再执行业务操作。顺序不可颠倒，否则业务成功但审计丢失。

### ⚡ 性能
- 用户列表页采用 **Offset 分页 + 服务端过滤**，不在客端加载全部用户数据。
- Audit Tab 的三表汇聚查询可能较慢，建议加 `@@index([userId, createdAt])` 索引（已在 Schema 中标注），且默认只加载最近 30 天的记录，提供 "加载更多" 分页。

### 🧩 集成注意
- Story-045 的 `applyAdminOverride` 接口签名需在启动前确认（参数列表、返回值），避免开发中发现不兼容。
- Story-042 的 Referral 数据查询接口同上，确认是否已有 `getUserReferralNetwork` 或需自行实现。

---

## 🤖 6. Frontend Design Guide — AI Studio Prompt (前端设计指南)

**重要说明**：以下所有前端页面的设计都可以使用 AI 工具（如 Gemini AI Studio、v0.dev 等）生成，下面提供的是详细的 Prompt 指南。生成后按 Story-021/023 迁移流程接入 Next.js。所有数据使用 Mock，不涉及后端逻辑。

---

#### 模块1：用户列表页

**路径**: `/admin/users`

**功能描述**：
- 带高级筛选的用户列表（状态、层级、搜索）
- 服务端分页（Offset 模式，每页 20 条）
- 可排序列头（默认按最后活跃降序）
- 行级操作入口（查看详情 / 快速封禁）

**AI生成Prompt**：

```
请设计一个 Admin 用户管理列表页（User Management List），用于平台管理员浏览和筛选用户：

设计风格：深色 Admin 后台风格，背景 bg-slate-950，卡片 bg-slate-900 border border-slate-800。
主色调：blue-500（主动作）、emerald-500（活跃）、red-500（封禁）、amber-500（暂停）。
组件库：React + Tailwind CSS + Lucide React Icons

布局要求：

1. 顶部工具栏：
   - 左侧：页面标题 "用户管理"，旁边一个灰色徽章显示总人数（如 "共 248 人"）
   - 右侧：一个 "导出" 按钮（outline 样式，slate 色）

2. 筛选行（工具栏下方，水平排列）：
   - 搜索框：宽约 280px，内部左侧有搜索图标，placeholder 为 "搜索用户邮箱或姓名..."
   - 状态下拉：选项 [全部、活跃、已封禁、已暂停]，默认 "全部"
   - 层级下拉：选项 [全部、Starter、Standard、Smart+、Premier]，默认 "全部"
   - "重置筛选" 文本链接（小字、灰色），仅在任意筛选项被选中时显示

3. 数据表格：
   - thead 吸附滚动，thead 背景 bg-slate-900
   - 列头：用户信息 | 订阅层级 | 状态 | 最后活跃 | 操作。列头可点击排序，当前排序列显示一个小的上下箭头图标，默认 "最后活跃" 降序
   - 每行数据：
     - 用户信息：圆形头像（使用姓名首字母作为占位，根据名字哈希显示不同背景色），右侧两行：粗体姓名 + 灰色小字邮箱
     - 订阅层级：小色块徽章，颜色规定如下：
       - Starter：bg-slate-700 text-slate-300
       - Standard：bg-blue-900 text-blue-300
       - Smart+：bg-purple-900 text-purple-300
       - Premier：bg-amber-900 text-amber-300
     - 状态：彩色圆点 + 文字标签（活跃=绿点、已封禁=红点、已暂停=橙点）
     - 最后活跃：相对时间文字（如 "2 小时前"、"昨天"、"3 天前"）
     - 操作：三点菜图标（⋯），点击展开下拉：查看详情 / 快速封禁 / 发送邀请
   - 行悬停：背景微变为 bg-slate-800/50，整行可点击

4. 分页组件（表格底部）：
   - 左侧：显示 "第 1-20 条，共 248 条"
   - 中间：页码数字胶囊（1, 2, 3, … 13），左右各一个前/后翻页箭头。当前页高亮为 blue-500
   - 右侧：每页条数选择框，选项 [10, 20, 50]

Mock 数据要求：生成 20 行，覆盖所有 状态 × 层级 的组合。"最后活跃" 时间分布覆盖 今天、昨天、3 天前、2 周前。至少包含 2 行已封禁和 2 行已暂停。
请生成一个完整的、自包含的单文件 React 组件，内置 Mock 数据和交互式筛选、分页逻辑。
```

---

#### 模块2：用户详情页（360 仪表盘，含全部 5 个 Tab）

**路径**: `/admin/users/[id]`

**功能描述**：
- 用户画像 Header（头像 + 快捷操作按钮）
- 5 个 Tab 切换：概览 / 订阅 / 学习行为 / 增长 / 审计
- 概览 Tab：身份信息、安全信息、内部备注（含软删除预览）
- 订阅 Tab：当前套餐状态、权限覆写记录、支付流水
- 学习行为 Tab：学习统计、活跃时间轴、GitHub 风格热力图
- 增长 Tab：邀请数据卡片、邀请树（缩进 2 层）
- 审计 Tab：多类型事件汇聚时间线，伪装会话进退分组展示

**AI生成Prompt**：

```
请设计一个 Admin 用户详情页（User 360 Dashboard），用于管理员查看单个用户的全部信息和执行管理操作：

设计风格：深色 Admin 后台风格，与列表页一致（bg-slate-950，卡片 bg-slate-900 border border-slate-800）。
主色调：blue-500、emerald-500、red-500、amber-500、purple-500。
组件库：React + Tailwind CSS + Lucide React Icons

布局要求：

--- A. 用户画像头部（全宽卡片） ---
- 左侧：大圆形头像（约 80px，使用姓名首字母占位，背景色由姓名哈希决定）
- 中间：用户姓名（大号粗体）、下一行为邮箱（灰色小字）、再下一行为两个小色块：层级徽章 + 状态徽章（样式同列表页）
- 右侧：水平排列的 3 个操作按钮（outline 样式，不要用实心）：
  - "伪装登录"：边框和文字颜色 amber-500，左侧放一个 User 图标
  - "封禁用户"：边框和文字颜色 red-500，左侧放一个 Ban 图标
  - "重置密码"：边框和文字颜色 slate-400，左侧放一个 Key 图标
  - 注意：这三个按钮视觉上不要过度醒目，静态时不需要凸显危险感

--- B. Tab 导航栏 ---
- 水平 Tab 栏，下划线样式激活标记（蓝色 2px 下划线），5 个 Tab：
  1. 概览（默认激活）
  2. 订阅
  3. 学习行为
  4. 增长
  5. 审计

--- C. Tab 内容（请全部 5 个 Tab 都设计，切换状态用 React state 控制） ---

【Tab 1：概览】
- 布局：左右两列（左 60%，右 40%）
- 左列：
  - 卡片 "身份信息"：4 行标签:数值对。标签灰色，数值白色。字段：注册日期 / 注册来源（如 "邀请链接"） / 手机号 / 上一次登录 IP
  - 卡片 "安全信息"：2 行：最后登录 IP + 时间、当前活跃设备数（如 "2 台设备"）
- 右列：
  - 卡片 "内部备注"：
    - 标题行 "内部备注"，右侧一个蓝色小按钮 "+ 添加"
    - 2 条备注，聊天气泡样式（bg-slate-800，圆角），每条左上显示操作人头像首字母 + 灰色时间戳，下面是备注正文
    - 底部一条灰色文字链接："查看已删除备注 (1 条)"
    - 展开后显示 1 条被软删除的备注（整体置灰，透明度降低），右侧有一个 "恢复" 小按钮

【Tab 2：订阅】
- 布局：单列，卡片竖排
- 卡片1 "当前订阅"：大号层级徽章，下面一行 开始日期~结束日期，一行 续费状态（绿色开关 ON），一行 "剩余 18 天"（蓝色文字）
- 卡片2 "权限控制"：一个蓝色中号按钮 "赠送权限"。下面一个小表格（2 条 Mock 记录），列：操作类型 / 时长 / 原因 / 操作人 / 时间
- 卡片3 "支付流水"：表格（3 条 Mock 记录），列：时间 / 金额 / 类型（续费/首付/补偿）/ 状态（成功=绿色、退款=红色）

【Tab 3：学习行为】
- 布局：左右两列（左 55%，右 45%）
- 左列：
  - 卡片 "学习统计"：2x2 方格，每格一个大号数字 + 下方标签。示例：做题总数 342 / 正确率 88% / 错题本 24 题 / 学习天数 45 天。数字白色粗体，标签灰色
  - 卡片 "活跃时间轴"：垂直时间线（3~4 条 Mock 事件），左侧竖线 + 彩色圆点，右侧事件类型标签 + 时间。事件类型颜色：登录=蓝色、做题=绿色、错题复习=橙色
- 右列：
  - 卡片 "学习热力图"：GitHub 风格热力图。左侧列标签 周一~周日（7 行），横向显示最近 12 周。每个小方块根据活跃度着色：无=slate-800、低=emerald-900、中=emerald-600、高=emerald-400。底部一行图例：少 ████ 多

【Tab 4：增长】
- 布局：左右两列（各 50%）
- 左列：
  - 卡片 "邀请数据"：3 条数据竖排。邀请码（等宽字体，右侧放一个复制图标）/ 总邀请人数（大号数字）/ 已获奖励（如 "3 次 / ¥30"）
- 右列：
  - 卡片 "邀请树"：缩进树状列表，深度 2 层。根节点为当前用户。第 1 层：3 个被邀请用户（每人显示头像首字母 + 姓名 + 层级小色块）。第 2 层：在第 1 层某个用户下面，缩进显示 1 个二级下线

【Tab 5：审计】
- 布局：单列
- 卡片 "审计时间线"：
  - 顶部筛选行：4 个胶囊形多选标签 [全部] [权限变更] [伪装登录] [状态变更]。默认 "全部" 激活（蓝色）
  - 垂直时间线（6 条 Mock 事件，按时间降序）：
    - 每条事件：左侧是竖线上的彩色图标圆圈（颜色按类型），右侧第一行为粗体事件名 + 灰色时间戳，第二行为小灰字描述（如 "操作人: admin@co.com | 原因: 用户投诉试用期未生效"）
  - Mock 事件列表必须包含：USER_BANNED、PERMISSION_OVERRIDE（赠送7天试用）、IMPERSONATE_START、IMPERSONATE_END（退出原因: 主动退出，持续时长: 12 min）、ADMIN_NOTE_ADDED、LOGIN
  - IMPERSONATE_START 和 IMPERSONATE_END 两条事件视觉上要分组：使用相同的橙黄色，并用一条细线或缩进连接，暗示它们是同一个会话的开始和结束

请生成一个完整的、自包含的单文件 React 组件，内置所有 Mock 数据，5 个 Tab 的切换状态由 React state 管理，所有 Tab 内容均要渲染完整。
```
