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
- NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_MONTHLY
- NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_ANNUAL
- NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_MONTHLY
- NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_ANNUAL
- NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_MONTHLY（或 NEXT_PUBLIC_STRIPE_PRICE_CHAMPION_MONTHLY）
- NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_ANNUAL（或 NEXT_PUBLIC_STRIPE_PRICE_CHAMPION_ANNUAL）

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

## 4. 回滚策略
- 回滚触发：支付链路不可用、登录主流程失败、核心页面 5xx 激增。
- 回滚动作：
  1. 回滚到上一稳定 commit
  2. 恢复上一个可用 webhook secret（如已替换）
  3. 暂时隐藏付费入口（pricing CTA）
