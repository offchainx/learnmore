# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：生产环境变量已配置
  当：触发支付结账与 webhook
  则：订阅状态正确落库且重复 webhook 不重复写入。
- 给定：回滚预案存在
  当：演练失败路径
  则：可恢复到上一稳定版本。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| createCheckoutSession | pricing 页面提交 | 异常：`["bad_plan","monthly"]`；正常：`["standard","monthly"]` | 未登录应拒绝 | 失败返回结构化错误码（INVALID_INPUT/UNAUTHORIZED） | 同参数重放不产生重复写入 | `BillingAudit` 可检索 | partial（本地 pass；预发 fail） | 本地（2026-02-10）：`Next-Action: 607b12628901748bc823a607af1c74e67b8034c650` -> `{"code":"INVALID_INPUT"}`；未登录 -> `{"code":"UNAUTHORIZED"}`；日志含 `result":"unauthorized"`。预发（2026-02-10）：`Next-Action: 6083ac7bd5ba50785e26f1716b0f17d339c1044d5b` 调用返回 `HTTP 500`（digest: `3095804688`），待触发预发重新部署并复测。 |
| POST /api/webhook/stripe | Stripe 推送事件 | 异常：缺少签名、伪造签名 | 外部调用，必须验签 | 均返回 400 | 重放异常事件不应落库 | `WebhookAudit` 可检索 | pass（本地负路径 + 预发负路径） | 本地（2026-02-10）：`MISSING_SIGNATURE`、`INVALID_SIGNATURE` 均 400；日志含 `result":"missing_signature"` 与 `result":"invalid_signature"`。预发（2026-02-10）：缺签名 400 响应 `Webhook Error: No stripe-signature header value was provided.`；伪签名 400 响应 `Webhook Error: No signatures found matching...`（提示预发 webhook 仍走 Stripe 默认错误串，非统一 JSON 响应，疑似未部署最新修复）。 |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 支付成功 | users | subscription_tier、subscription_end | 待预发执行 | 待预发执行 | 待预发执行 | 待预发执行 | pending（需要真实 Stripe 成功回调） |
| webhook 幂等重放 | notifications | type、link | `users=8, referrals=0, notifications=4, stripeEvents=1` | `users=8, referrals=0, notifications=4, stripeEvents=1` | 无新增脏写入 | 本地仅验证“异常重放不写入” | pass（异常重放） |
| 推荐奖励结算 | referrals, users | status、reward_granted、subscription_end | `referrals=0`（无可结算样本） | 待预发执行 | 待预发执行 | 待预发执行 | pending（无本地样本） |

## 预发复测进度（T-006）
- 2026-02-10 探测结果：
  - `https://learnmore.vercel.app` 可访问（`200`），但首页内容为 `Create Next App` 默认模板，不是当前项目。
  - 通过 GitHub Deployments API 反查到当前项目的真实 Vercel 预发地址模式：`https://learnmorev10-<suffix>-chainvistas-projects.vercel.app`。
  - 最近成功部署样例：`https://learnmorev10-ppll31n91-chainvistas-projects.vercel.app`（deployment id: `3790299001`）。
  - 初始访问返回 `401 Authentication Required`（Vercel Deployment Protection）。
  - 已通过 bypass token 设置 bypass cookie，预发 `/pricing` 可访问（`200`）。
  - 预发 webhook 负路径（缺签名/伪签名）均返回 `400`（详见上方矩阵证据）。
  - 预发 `createCheckoutSession` Server Action 调用返回 `500`（digest），无法完成“结构化错误码”复测。
- 结论：预发环境已定位且可访问，但预发行为与本地实现不一致（webhook 未统一 JSON、action 500），疑似预发部署版本未包含本地修复；需触发预发重新部署（或切换到正确的 preview deployment）后再完成 T-006。

## 发布检查
- [x] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [x] 幂等与越权场景通过（本地负路径）
- [ ] 回滚方案可执行
- [x] 已获得用户批准进入开发
