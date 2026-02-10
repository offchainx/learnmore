# P0 生产环境变量与发布基线清单

## 1. 必填环境变量
- DATABASE_URL
- DIRECT_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_STRIPE_PRICE_STANDARD_MONTHLY
- NEXT_PUBLIC_STRIPE_PRICE_STANDARD_ANNUAL
- NEXT_PUBLIC_STRIPE_PRICE_SMARTPLUS_MONTHLY（或 NEXT_PUBLIC_STRIPE_PRICE_SMART_PLUS_MONTHLY）
- NEXT_PUBLIC_STRIPE_PRICE_SMARTPLUS_ANNUAL（或 NEXT_PUBLIC_STRIPE_PRICE_SMART_PLUS_ANNUAL）
- NEXT_PUBLIC_STRIPE_PRICE_PREMIER_MONTHLY
- NEXT_PUBLIC_STRIPE_PRICE_PREMIER_ANNUAL

## 2. 域名与回调
- NEXT_PUBLIC_APP_URL 必须为生产主域名（含 https）
- Stripe Dashboard:
  - Checkout success_url: `https://<domain>/dashboard?payment=success`
  - Checkout cancel_url: `https://<domain>/pricing?payment=cancelled`
  - Webhook endpoint: `https://<domain>/api/webhook/stripe`

## 3. 发布前检查
- 验证 `/dashboard`、`/dashboard/community`、`/dashboard/leaderboard`、`/pricing` 可访问。
- 验证 Stripe test mode 与 live mode 密钥未混用。
- 验证 webhook secret 对应当前 endpoint。

## 4. Action / Webhook 契约核对
- `createCheckoutSession` 输入白名单：
  - `planKey`: `standard | smart_plus | premier`（`starter` 不走支付）
  - `billingCycle`: `monthly | annual`
- `createCheckoutSession` 错误结构：
  - `{ ok: false, error: { code, message } }`
  - 关键 code：`INVALID_INPUT`、`UNAUTHORIZED`、`MISSING_PRICE_CONFIG`、`STRIPE_ERROR`
- `POST /api/webhook/stripe` 事件处理：
  - 仅处理 `checkout.session.completed`
  - 要求 metadata 至少包含：`userId`、`planKey`（或兼容 `planName`）、`billingCycle`
  - 非法签名返回 `400`，处理失败返回 `500`，重复事件返回 `200 + DUPLICATE_EVENT`

## 5. 幂等与审计要求
- Checkout 请求使用 Stripe `idempotencyKey`（同用户/同套餐/同周期短窗口重放合并）
- Webhook 使用 DB 事务 + `pg_advisory_xact_lock(hashtext(event.id))` 防并发重复处理
- 审计字段必须可检索：`userId`、`action`、`result`、`timestamp`、`eventId`（webhook）

## 6. 回滚策略
- 回滚触发：支付链路不可用、登录主流程失败、核心页面 5xx 激增。
- 回滚动作：
  1. 回滚到上一稳定 commit
  2. 恢复上一个可用 webhook secret（如已替换）
  3. 暂时隐藏付费入口（pricing CTA）
