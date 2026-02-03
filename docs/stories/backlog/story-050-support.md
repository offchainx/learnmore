# Story-050: 帮助中心与合规 (Support & Compliance)

**阶段**: Phase 8: Core Experience & Retention
**目标**: 建立完善的法律合规页面（Terms, Privacy）和用户支持系统（FAQ, Feedback），满足 Stripe 上线要求并提升用户信任。
**预估时间**: 15-20 Hours
**Story Points**: 13
**前置依赖**: None
**负责人**: _待分配_

---

## 📋 1. Executive Summary (概要)

### 当前痛点
- ⚠️ **Stripe 风险**: 没有 ToS (服务条款) 和 Privacy Policy (隐私政策)，Stripe 可能会冻结支付账户。
- ⚠️ **无处申诉**: 用户遇到 Bug 或支付问题，找不到联系入口，只能去社交媒体吐槽。
- ⚠️ **信任感低**: 网站看起来像个 "Side Project"，缺乏正规 SaaS 的必备要素。

### 目标状态
- ✅ **Legal Pages**: 专业的 `/terms`, `/privacy`, `/refund` 页面。
- ✅ **Help Center**: `/help` 页面，包含 FAQ 和搜索。
- ✅ **Feedback Widget**: 全局悬浮按钮，允许用户提交 Bug 或建议。
- ✅ **Admin Inbox**: 在 Story-046 的 Admin 后台查看用户反馈。

---

## 🏗️ 2. System Architecture (系统架构)

### 2.1 数据模型

```prisma
model UserFeedback {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String?  @db.Uuid // 可选，支持匿名反馈
  type      String   // "BUG", "FEATURE", "BILLING"
  content   String   @db.Text
  email     String?  // 联系邮箱
  
  status    String   @default("OPEN") // OPEN, IN_PROGRESS, CLOSED
  adminNote String?
  
  createdAt DateTime @default(now())
}
```

---

## 🎯 3. Implementation Tasks (实施任务拆解)

---

## 📦 Task A: 法律合规页面 (Legal Pages)

### 🎯 目标
创建静态的法律文档页面。

### 📄 核心文件
- `src/app/(marketing)/terms/page.tsx`
- `src/app/(marketing)/privacy/page.tsx`
- `src/app/(marketing)/refund/page.tsx`

### 🔧 详细实施指南
- 内容参考: 使用开源的 SaaS Terms 模板 (如 `getterms.io` 或 `avodocs`)。
- **关键点**:
  - 退款政策 (Refund Policy): 必须明确写出“7天内可退款”或“数字化商品不可退款”。
  - 数据隐私: 明确我们收集什么数据 (Email, 做题记录)。

---

## 📦 Task B: 帮助中心 (Help Center)

### 🎯 目标
一个简单的 FAQ 页面。

### 📄 核心文件
- `src/app/(marketing)/help/page.tsx`
- `src/components/support/FAQAccordion.tsx`

### 🔧 详细实施指南
- 使用 `shadcn/ui` 的 `Accordion` 组件。
- 至少填充 10 个常见问题：
  - "如何取消订阅？"
  - "智学版和自学版有什么区别？"
  - "忘记密码怎么办？"

---

## 📦 Task C: 反馈挂件 (Feedback Widget)

### 🎯 目标
让用户方便地联系我们。

### 📄 核心文件
- `src/components/support/FeedbackWidget.tsx`
- `src/actions/support.ts`

### ✅ 交付物清单
- [ ] C1: 悬浮按钮 (右下角) -> Popover -> 表单。
- [ ] C2: `submitFeedback` Action -> 写入 DB -> (可选) 发送邮件给 Admin。

---

## ✅ 4. Verification Plan (验收标准)

- [ ] **Stripe 合规**: 确保 Terms 和 Privacy 页面的链接能打开，且包含必要条款。
- [ ] **反馈闭环**: 提交一个反馈，确认数据库中有记录。

---

## 📅 5. Execution Roadmap

1.  **Day 1**: 全部搞定。这是最简单的一个 Story，主要是文案工作和简单的 CRUD。
