# P0 AC-03 User/Voucher 字段与幂等核对

## 执行信息
- 日期：2026-03-05
- 环境：本地（`.env.local` 指向 Supabase）
- 执行方式：Prisma + SQL 对照脚本（临时数据，脚本末尾已清理）

## 字段映射矩阵
| 表 | Prisma 字段 | DB 列名 | 读写链路 | 核对结论 |
|---|---|---|---|---|
| users | `subscriptionTier`、`subscriptionStatus` | `subscription_tier`、`subscription_status` | `src/actions/billing/stripe.ts` 订阅同步 | pass |
| user_settings | `userId`、`language`、`theme` | `user_id`、`language`、`theme` | `src/actions/user/auth.ts` 兜底 upsert | pass |
| voucher_codes | `isActive`、`validFrom`、`validTo`、`maxRedemptions`、`redeemedCount` | `is_active`、`valid_from`、`valid_to`、`max_redemptions`、`redeemed_count` | `src/actions/billing/checkout.ts` 可用性校验 | pass |
| voucher_redemptions | `voucherId`、`userId`、`stripeSessionId`、`appliedAmount` | `voucher_id`、`user_id`、`stripe_session_id`、`applied_amount` | `src/app/api/webhook/stripe/route.ts` 首次支付核销 | pass |

## 幂等与约束落地
1. Schema 新增唯一约束：`voucher_redemptions(voucher_id, user_id)`。
2. webhook 核销逻辑调整为：
   - 先原子占位 `voucher_codes.redeemed_count`（`updateMany` + 上限条件）。
   - 再写 `voucher_redemptions`。
   - 若触发 `P2002`，回滚占位并返回 `ALREADY_REDEEMED`。

## SQL/脚本证据（2026-03-05）
- 临时用户：`aa5bbc20-a5fc-40f7-8891-da0a93bad275`
- 临时券：`cf70dd87-1208-43a1-9d53-e0bc93b17adf` / `AC03_1772701380061_4D7OG6`

### 证据 A：`user_settings` 单行
```sql
SELECT user_id, language, theme
FROM user_settings
WHERE user_id = 'aa5bbc20-a5fc-40f7-8891-da0a93bad275';
```
结果：同一用户连续两次 upsert 后，`count = 1`。

### 证据 B：`voucher_codes` 字段映射
```sql
SELECT code, is_active, valid_from, valid_to, max_redemptions, redeemed_count
FROM voucher_codes
WHERE id = 'cf70dd87-1208-43a1-9d53-e0bc93b17adf';
```
结果：`is_active=true`，`valid_from/valid_to=NULL`，`max_redemptions=3`，与 Prisma 查询一致。

### 证据 C：`voucher_redemptions` 幂等
```sql
SELECT voucher_id, user_id, stripe_session_id, applied_amount
FROM voucher_redemptions
WHERE voucher_id = 'cf70dd87-1208-43a1-9d53-e0bc93b17adf'
  AND user_id = 'aa5bbc20-a5fc-40f7-8891-da0a93bad275'
ORDER BY created_at DESC;
```
结果：
- 第一次插入成功。
- 第二次同 `voucher_id + user_id` 插入触发 `P2002`。
- 最终查询仅 1 行核销记录。

## 清理结果
- 已删除临时 `voucher_redemptions`、`voucher_codes`、`user_settings`、`users` 数据。
