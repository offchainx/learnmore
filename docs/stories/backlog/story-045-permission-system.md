# Story-045: 动态权限与商业化转化系统 (Dynamic Permission & Monetization System)

**阶段**: Phase 7: Business & Monetization
**目标**: 重构定价与权益体系，建立以“效率”为核心的付费墙，实现全站功能的权限门控与转化驱动
**预估时间**: 60-80 Hours
**Story Points**: 55
**前置依赖**: Story-031 (Payment), Story-042 (Referral System), Story-044 (Content Pipeline)
**负责人**: _待分配_

---

## 📋 1. Executive Summary (概要)

### 1.1 核心战略：买资源 vs 买时间
本 Story 将实现 *Story-045p* 定义的商业化逻辑，将用户权益从简单的“能访问/不能访问”升级为基于效率和数据价值的四层体系：

- **Starter (体验版)**: **众包贡献者**。只能看到基础题库和参考答案，数据仅保留 7 天（滚动删除），无 AI 辅助。
- **Standard (自学版)**: **资源购买者**。拥有全量题库和文字解析，但需自己筛选。数据保留 30 天。拥有 7 天试用期。
- **Premier (领航版)**: **极致服务**。增加家长对齐和 VIP 客服。

### 1.2 技术目标
- ✅ **构建权限中枢**: 废除硬编码的 `user.role` 检查，统一使用 `getEffectiveRole` + `config.ts`。
- ✅ **实现全站门控**: 必须在题库、解析、社区、家长端等所有触点埋入权限检查。
- ✅ **数据视野控制**: 后端实现基于 Tier 的数据保留期（Retention Policy），物理或逻辑上屏蔽旧数据。
- ✅ **转化钩子 (Hooks)**: 开发一套“诱导”组件库（PreviewHook, EfficiencyMirror），在用户受限时优雅地引导升级。

---

## 🏗️ 2. System Architecture (系统架构)

### 2.1 核心数据流

```
User Request
       ↓
[Permission Engine] -> getEffectiveRole()
   ├─ Check Admin Overrides (Audit Log)
   ├─ Check Subscription Status & Expiry
   └─ Fallback to Base Role
       ↓
[Feature Gate] -> checkPermission()
   ├─ Config Matrix Lookup
   └─ Return: ALLOW | DENY | LIMIT_REACHED
       ↓
[Data Scope] -> applyRetentionPolicy()
   ├─ Tier: STARTER -> where: { createdAt > NOW-7d }
   ├─ Tier: STANDARD -> where: { createdAt > NOW-30d }
   └─ Tier: SMART_PLUS -> No Filter
```

---

## 🎯 3. Implementation Tasks (实施任务拆解)

---

## 📦 Task A: 核心引擎与配置 (Core Foundation)

### 🎯 你需要完成什么？
构建权限系统的“大脑”。定义数据模型、TypeScript 类型、配置矩阵以及核心判断逻辑。这是后续所有 Task 的基础。

### 📄 核心文件
- `prisma/schema.prisma` (更新)
- `src/lib/permissions/types.ts` (新建)
- `src/lib/permissions/config.ts` (新建)
- `src/lib/permissions/engine.ts` (新建)
- `src/actions/permissions.ts` (新建)

### ⚡ Server Actions
- `getEffectiveRoleAction(userId)`: 获取用户实际等级
- `checkPermissionAction(featureKey)`: 服务端鉴权

### 📘 TypeScript 定义
- `SubscriptionTier`: 枚举
- `FeatureKey`: 联合类型
- `PermissionConfig`: 配置接口

### 🧪 单元测试
- `engine.test.ts`: 覆盖各种角色、过期、覆写场景

### ✅ 交付物清单
- [ ] A1: Prisma Schema Migration (`User` & `UserPermissionOverride`)
- [ ] A2: 完整的 Type 定义
- [ ] A3: 完整的 Config 矩阵
- [ ] A4: 核心 Engine 实现
- [ ] A5: 单元测试通过 (100% 覆盖率)

### 🏁 验收标准
- 运行 `npx prisma migrate dev` 成功
- `pnpm test src/lib/permissions` 全部通过
- 修改 `config.ts` 中的权限，无需重启服务，逻辑立即生效

### 📝 开发步骤建议
1.  修改 Prisma Schema 并生成 Migration。
2.  定义 Types 和 Config。
3.  实现 Engine 逻辑。
4.  编写并运行测试。

### 🔧 详细实施指南

#### A1: Database Schema

```prisma
// prisma/schema.prisma

model User {
  // ... existing fields
  role             UserRole     @default(STUDENT)
  
  // New Fields for Story-045
  subscriptionTier SubscriptionTier? // null = STARTER
  subscriptionEnd  DateTime?
  
  permissionOverrides UserPermissionOverride[]
}

model UserPermissionOverride {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @db.Uuid
  user          User     @relation(fields: [userId], references: [id])
  
  overriddenBy  String   @db.Uuid // Admin ID
  targetField   String   // 'subscriptionTier' | 'subscriptionEnd'
  previousValue String?
  newValue      String?
  reason        String   @db.Text
  
  createdAt     DateTime @default(now())
  expiresAt     DateTime? // Optional: auto-expire the override

  @@index([userId])
  @@map("user_permission_overrides")
}

enum SubscriptionTier {
  STANDARD
  SMART_PLUS
  PREMIER
}
```

#### A2 & A3: Types & Config

`src/lib/permissions/config.ts`:

```typescript
export const TIER_CONFIG = {
  STARTER: {
    features: {
      'content.question_bank': 'BASIC',
      'content.analysis': 'ANSWER_ONLY',
      'ai.attribution': false,
      'community.post': false,
      'export.data': 'NONE',
    },
    retentionDays: 7,
  },
  STANDARD: {
    features: {
      'content.question_bank': 'PAST_PAPER',
      'content.analysis': 'TEXT_DETAILED',
      'ai.attribution': false,
      'community.post': true,
      'export.data': '30_DAYS',
    },
    retentionDays: 30,
  },
  SMART_PLUS: {
    features: {
      'content.question_bank': 'ADVANCED',
      'content.analysis': 'KNOWLEDGE_LINKED',
      'ai.attribution': true,
      'community.post': true,
      'export.data': 'ALL_TIME',
    },
    retentionDays: -1, // Infinite
  },
  PREMIER: {
    features: {
      'content.question_bank': 'CHALLENGE',
      'content.analysis': 'PRIORITY',
      'ai.attribution': true,
      'community.post': true,
      'export.data': 'ALL_TIME_PLUS',
    },
    retentionDays: -1,
  }
} as const

export type TierKey = keyof typeof TIER_CONFIG
export type FeatureKey = keyof typeof TIER_CONFIG['STARTER']['features']
```

#### A4: Engine Logic

`src/lib/permissions/engine.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import { TIER_CONFIG, TierKey, FeatureKey } from './config'

export async function getEffectiveRole(userId: string): Promise<TierKey> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      permissionOverrides: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  if (!user) return 'STARTER'

  // 1. Admin/Teacher Bypass
  if (['ADMIN', 'TEACHER'].includes(user.role)) return 'PREMIER'

  // 2. Check Overrides (Audit Log Priority)
  const override = user.permissionOverrides[0]
  if (override && override.targetField === 'subscriptionTier' && override.newValue) {
    // Check if override is expired (if expiresAt logic exists)
    return override.newValue as TierKey
  }

  // 3. Check Subscription Expiry
  if (user.subscriptionTier && user.subscriptionEnd && user.subscriptionEnd > new Date()) {
    return user.subscriptionTier as TierKey
  }

  // 4. Default Fallback
  return 'STARTER'
}

export async function checkPermission(userId: string, feature: FeatureKey) {
  const tier = await getEffectiveRole(userId)
  const config = TIER_CONFIG[tier]
  return config.features[feature]
}
```

---

## 📦 Task B: 转化组件库 (Conversion UI Kit)

### 🎯 你需要完成什么？
开发一套高颜值的 React 组件，用于在前端优雅地“拒绝”用户，并诱导其升级。

### 📄 核心文件
- `src/components/permissions/FeatureLock.tsx`
- `src/components/permissions/PreviewHook.tsx`
- `src/components/permissions/UpsellModal.tsx`
- `src/components/permissions/EfficiencyMirror.tsx`
- `src/components/permissions/MemoryDecayVisual.tsx`

### ⚡ Server Actions
- 无 (纯 UI 组件，触发逻辑在父组件)

### 📘 TypeScript 定义
- `UpsellModalProps`: triggerSource, open, onOpenChange
- `HookProps`: triggerCondition, message

### ✅ 交付物清单
- [ ] B1: `FeatureLock` 组件 (磨砂玻璃锁)
- [ ] B2: `UpsellModal` 组件 (升级弹窗，含 Stripe 链接)
- [ ] B3: `PreviewHook` 组件 (AI 归因分析诱饵)
- [ ] B4: `MemoryDecayVisual` 组件 (数据丢失警告)

### 🏁 验收标准
- `FeatureLock` 能正确遮挡内容并显示锁图标
- `UpsellModal` 点击后能跳转 Stripe 或显示价格表
- `PreviewHook` 样式不突兀，能融入练习界面

### 🔧 详细实施指南

#### B1: FeatureLock
```tsx
// src/components/permissions/FeatureLock.tsx
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FeatureLock({ children, tierName = '智学版' }: { children: React.ReactNode, tierName?: string }) {
  return (
    <div className="relative overflow-hidden group">
      <div className="blur-sm select-none pointer-events-none opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px] z-10">
        <div className="bg-card p-6 rounded-lg shadow-lg border flex flex-col items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold">解锁{tierName}功能</h3>
            <p className="text-sm text-muted-foreground mt-1">升级即可无限制使用此功能</p>
          </div>
          <Button>立即升级</Button>
        </div>
      </div>
    </div>
  )
}
```

#### B3: PreviewHook (The Soft Hook)
```tsx
// src/components/permissions/PreviewHook.tsx
export function PreviewHook() {
  return (
    <div className="mt-4 p-4 border border-dashed border-primary/30 bg-primary/5 rounded-lg flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xl">🤖</span>
        <div>
          <p className="text-sm font-medium text-foreground">AI 发现你在这个知识点反复丢分</p>
          <p className="text-xs text-muted-foreground">点击查看归因分析与提分建议</p>
        </div>
      </div>
      <div className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded">
        UPGRADE
      </div>
    </div>
  )
}
```

---

## 📦 Task C: 业务深度集成 (Business Integration)

### 🎯 你需要完成什么？
将 Task A 的逻辑和 Task B 的组件真正“织入”到业务代码中。这是最耗时的一步。

### 📄 核心文件
- `src/actions/practice/question-service.ts` (修改)
- `src/app/(dashboard)/dashboard/practice/quiz/QuizResult.tsx` (修改)
- `src/lib/permissions/prisma-scope.ts` (新建)

### ⚡ Server Actions
- `applyRetentionScope`: 工具函数，非 Action，但在 Action 中使用

### ✅ 交付物清单
- [ ] C1: 练习中心题库过滤 (根据 Tier 过滤 source)
- [ ] C2: 解析页面集成 FeatureLock 和 PreviewHook
- [ ] C3: 历史记录查询集成数据保留策略 (Retention Policy)

### 🏁 验收标准
- Starter 用户无法获取 `ADVANCED` 类型的题目
- Standard 用户做错题时能看到 `PreviewHook`
- 升级用户后，被隐藏的旧数据（7-30天）能重新显示

### 🔧 详细实施指南

#### C1: Question Filtering
```typescript
// src/actions/practice/question-service.ts
import { getEffectiveRole } from '@/lib/permissions/engine'
import { TIER_CONFIG } from '@/lib/permissions/config'

export async function getQuestions(params: any) {
  const user = await getCurrentUser()
  const tier = await getEffectiveRole(user.id)
  const config = TIER_CONFIG[tier]
  
  const permission = config.features['content.question_bank']
  
  const whereClause: any = {}
  
  if (permission === 'BASIC') {
    whereClause.sourceType = 'TEXTBOOK'
  } else if (permission === 'PAST_PAPER') {
    whereClause.sourceType = { in: ['TEXTBOOK', 'PAST_PAPER'] }
  }
  // SMART_PLUS gets everything
  
  return prisma.question.findMany({ where: whereClause, ... })
}
```

#### C3: Data Retention Scope
```typescript
// src/lib/permissions/prisma-scope.ts
import { TIER_CONFIG, TierKey } from './config'

export function getRetentionDate(tier: TierKey): Date {
  const days = TIER_CONFIG[tier].retentionDays
  if (days === -1) return new Date(0) // 1970-01-01 (All time)
  
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// Usage in getHistory action:
// const tier = await getEffectiveRole(userId)
// const minDate = getRetentionDate(tier)
// prisma.userAttempt.findMany({
//   where: { 
//     userId,
//     createdAt: { gte: minDate } // Hides old data
//   }
// })
```

---

## 📦 Task D: 试用期机制 (Trial Logic)

### 🎯 你需要完成什么？
实现 Standard 版的 7 天自动试用逻辑，以及过期的降级处理。

### 📄 核心文件
- `src/actions/auth.ts` (修改)
- `src/components/layout/TrialBanner.tsx` (新建)

### ✅ 交付物清单
- [ ] D1: 注册自动赠送 7 天 Standard
- [ ] D2: 全局倒计时 Banner

### 🔧 详细实施指南

#### D1: Registration Hook
```typescript
// src/actions/auth.ts -> signup function
// Inside prisma.user.create:

data: {
  // ... basic fields
  subscriptionTier: 'STANDARD',
  subscriptionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
}
```

#### D2: Trial Banner Logic
```typescript
// Check if user.subscriptionTier === 'STANDARD' 
// AND subscriptionEnd is within 24 hours.
// If so, render red banner.
```

---

## 📦 Task E: Admin 调控台 (Admin Console)

### 🎯 你需要完成什么？
为客服提供手动干预用户权限的界面和审计记录。

### 📄 核心文件
- `src/app/(dashboard)/admin/permissions/page.tsx`
- `src/actions/admin/permission-override.ts`

### ✅ 交付物清单
- [ ] E1: Admin 权限管理页
- [ ] E2: 权限覆写 Server Action

### 🔧 详细实施指南

#### E2: Override Action
```typescript
// src/actions/admin/permission-override.ts
export async function createOverride(data: { userId: string, tier: string, reason: string }) {
  // Check Admin
  // Create Audit Record
  await prisma.userPermissionOverride.create({
    data: {
      userId: data.userId,
      overriddenBy: adminId,
      targetField: 'subscriptionTier',
      newValue: data.tier,
      reason: data.reason
    }
  })
  
  // Update User Cache
  await prisma.user.update({
    where: { id: data.userId },
    data: { subscriptionTier: data.tier as SubscriptionTier }
  })
}
```

---

## 🤖 Prompts for Development

**Generating Config & Types:**
> "Create a `src/lib/permissions/config.ts` file that defines a `TIER_CONFIG` object. It should map 'STARTER', 'STANDARD', 'SMART_PLUS', 'PREMIER' to a feature matrix (features object) and retentionDays. Also export `TierKey` and `FeatureKey` types based on this object."

**Generating FeatureLock:**
> "Create a React component `FeatureLock` using Tailwind CSS and Lucide React icons. It should accept `children` and blur them out, overlaying a lock icon and an 'Upgrade' button centered on top. Use a glassmorphism effect for the overlay."

**Generating Prisma Scope:**
> "Write a utility function `getRetentionDate(tier: TierKey)` that calculates the cutoff date based on `TIER_CONFIG`. Then show me how to apply this in a Prisma `findMany` query for `UserAttempt` model to filter out old records."