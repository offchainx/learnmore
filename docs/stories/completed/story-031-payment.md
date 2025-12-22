# Story-031: Payment & Subscription

**状态**: Completed ✅
**优先级**: P2
**前置任务**: Story-025

## 1. 目标
实现付费订阅流程（Stripe 集成），区分 Free/Scholar/Ultimate 用户权益。

## 2. 任务拆解
- [x] **Stripe Integration**:
    - 配置 Stripe 产品与价格 ID (已连接环境变量).
    - 创建 `/actions/stripe-actions.ts` 生成支付链接 (支持自动创建/查找 Customer).
    - 创建 `/api/webhook/stripe` 处理支付成功回调 (更新 User Role).
- [x] **Pricing Page**:
    - 将 `/pricing` 页面按钮连接到 `createCheckoutSession` Action.
    - 添加了加载状态处理。
- [x] **Access Control**:
    - 更新 `User.role` (支持 STUDENT, PRO, ULTIMATE).
    - 实现 `src/lib/permissions.ts` 权限管理系统。
    - 在 `getLessonData` 中添加逻辑：非 PRO 用户在做题时限制只能看到前 5 道题。

## 3. 验收标准
- [x] 点击 Pricing 页面按钮能跳转 Stripe 支付页.
- [x] 支付成功后，通过 Webhook 自动更新数据库用户状态 (已实现逻辑).
- [x] 非会员访问付费内容（如题目库超过 5 题的部分）被拦截.
