# Story-031: Payment & Subscription

**状态**: Backlog ⚪
**优先级**: P2
**前置任务**: Story-025

## 1. 目标
实现付费订阅流程（Stripe 集成），区分 Free/Scholar/Ultimate 用户权益。

## 2. 任务拆解
- [ ] **Stripe Integration**:
    - 配置 Stripe 产品与价格 ID。
    - 创建 `/api/checkout` 路由生成支付链接。
    - 创建 `/api/webhook/stripe` 处理支付成功回调。
- [ ] **Pricing Page**:
    - 将 `/pricing` 页面按钮连接到 Checkout API。
- [ ] **Access Control**:
    - 更新 `User.role` 或 `User.subscription_status`。
    - 在课程/题目获取逻辑中添加权限检查（例如：非会员不能看 "Ultimate" 视频）。

## 3. 验收标准
- [ ] 点击 Pricing 页面按钮能跳转 Stripe 支付页。
- [ ] 支付成功后，数据库用户状态更新。
- [ ] 非会员访问付费内容被拦截。
