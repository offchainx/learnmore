# Story-045: 动态权限与订阅系统 (Dynamic Permission System)

**阶段**: Phase 7: Business & Monetization
**目标**: 实现基于配置的动态权限管理系统，支持不同订阅计划的功能开关与配额控制。
**预估时间**: TBD
**Story Points**: TBD
**前置依赖**: Story-043 (架构重构)

---

## 📋 1. Executive Summary (概要)

### 背景
目前系统的权限控制逻辑（如“每日做题限制”）分散在代码中或尚未实现。为了支持 SaaS 化的商业模式（Free/Pro/Enterprise），需要一个灵活的权限配置中心。

### 目标
1.  **配置化权限**: 将硬编码的限制逻辑提取为可配置的矩阵。
2.  **订阅分层**: 定义不同 User Role 对应的 Feature Flags 和 Quotas。
3.  **UI 集成**: 在前端组件中根据权限状态展示“锁”、“升级提示”或“进度条”。

---

## 🏗️ 2. Permission Architecture (权限架构)

### 2.1 权限矩阵模型 (The Matrix)

建议采用 **RBAC + Feature Flags** 混合模式。

**配置示例 (Config Code)**:
```typescript
export const SUBSCRIPTION_PLANS = {
  STUDENT: {
    daily_question_limit: 20,
    weekly_exam_limit: 2,
    allow_smart_drill: true,
    allow_error_wiper: false, // 仅 Pro 可用
    ai_tokens_daily: 5,
  },
  PRO: {
    daily_question_limit: 100,
    weekly_exam_limit: 10,
    allow_smart_drill: true,
    allow_error_wiper: true,
    ai_tokens_daily: 50,
  },
  // ...
}
```

### 2.2 数据库支持 (可选)
如果需要动态调整，可将配置存入数据库表 `SubscriptionPlan`。初期可直接硬编码在代码库中。

---

## 🎯 3. Implementation Tasks (任务拆解)

### 模块 A: 权限核心 (Backend)
- [ ] **A1**: 定义权限配置常量/类型。
- [ ] **A2**: 实现 `checkPermission(userId, feature)` Server Action。
- [ ] **A3**: 实现 `checkQuota(userId, quotaType)` Server Action。

### 模块 B: 权限守卫 (Middleware/HOC)
- [ ] **B1**: 路由级拦截 (Middleware)。
- [ ] **B2**: 操作级拦截 (Server Action 内部检查)。

### 模块 C: UI 集成 (Frontend)
- [ ] **C1**: `QuotaDisplay` 组件 (显示进度条)。
- [ ] **C2**: `FeatureLock` 组件 (覆盖在不可用功能上，显示锁图标)。
- [ ] **C3**: `UpsellModal` 组件 (引导升级弹窗)。
- [ ] **C4**: 在 `QuestionBankView` (已重构) 中集成上述组件。

---

## ✅ 4. Acceptance Criteria (验收标准)

1.  **安全性**: 后端 API 必须验证权限，不能仅依赖前端隐藏按钮。
2.  **用户体验**: 权限不足时应给予清晰的提示和升级引导，而不是直接报错。
3.  **灵活性**: 修改配置文件即可调整某角色的权益，无需修改业务逻辑代码。
