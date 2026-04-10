# T-021 预发复测与发布前收口报告

> 生成日期：2026-04-10  
> 适用范围：`T-021.1 ~ T-021.14`  
> 验证对象：`learn_more_v1.0` 生产部署与对应浏览器留证

## 结论

`T-021` 已完成预发复测、发布前收口、临时产物清理与回滚演练复核，当前形成的结论是：

- 预发复测范围已冻结，页面域、共享写链路、外部依赖和证据口径都已定稿。
- `T-021.6 ~ T-021.10` 的关键浏览器验证已经完成，覆盖学生主域、成长与账户域、公开与转化域、后台管理域、共享写链路与跨域副作用。
- `T-021.11` 的临时调试脚本与临时样本文件已清理，不再保留一次性验证产物。
- `T-021.13` 的回滚演练已复核完成，数据补偿、入口停用、动作拒绝和通知止损路径都能执行。
- 当前没有发现会阻断发布的硬性问题。
- 用户已批准发布前收口结果，建议直接进入正式发布窗口。

## 执行范围

### Phase A: 边界与约束
- `T-021.1` 环境差异核对
- `T-021.2` 复测范围确认
- `T-021.3` 门禁与回滚边界
- `T-021.4` 预发证据口径
- `T-021.5` 发布审批条件

### Phase B: 开发、修复、调试
- `T-021.6` 学生主域复测
- `T-021.7` 成长与账户域复测
- `T-021.8` 公开与转化域复测
- `T-021.9` 后台管理域复测
- `T-021.10` 共享写链路与跨域副作用复测

### Phase C: 清理和收口验证
- `T-021.11` 临时产物清理
- `T-021.12` 最终预发验证报告
- `T-021.13` 回滚演练复核
- `T-021.14` 最终批准与收口

## 关键结果

### Phase A 结果

- 预发与本地的环境差异已经列清，`env`、数据库 schema、迁移版本、对象存储、第三方回调、缓存、队列和定时任务都已纳入核对范围。
- 发布前门禁、回滚边界、证据命名规则和审批条件都已冻结，不再在执行现场临时变更口径。
- 当前保留的发布风险都是“可观测、可复核”的平台项，不再是范围不清的问题。

### Phase B 结果

- 学生主域：
  - `Dashboard` 任务领取后 XP 正常回流。
  - `Settings` 的资料保存、AI 配置、通知偏好和邀请码生成已完成浏览器级留证。
  - 社区新帖和评论链路已完成浏览器级留证。
- 成长与账户域：
  - 排行榜、成就、设置和通知页均已完成浏览器留证。
  - 登录态 / 未登录态分流与回流规则已确认。
- 公开与转化域：
  - 首页、pricing、blog、help、contact、login、register、reset-password 等入口均已完成浏览器留证。
  - referral、voucher、feedback 也完成了可追踪的浏览器回显。
- 后台管理域：
  - `/admin`、`/admin/users`、`/admin/feedback`、`/admin/content/import`、`/admin/content/review`、`/admin/content/reports`、`/admin/referrals`、`/admin/vouchers` 的权限、列表和详情路径已完成留证。
- 共享写链路：
  - 奖励领取、保存资料、通知偏好、评论、发帖、排行榜刷新、补发 / 回滚和内容导入都已完成浏览器级闭环。

### Phase C 结果

- 临时调试脚本已经清理，不再保留一次性验证产物。
- 临时导入样本文件已删除，避免把 smoke 材料误留在正式证据目录中。
- 现阶段保留的都是正式证据文件和正式实现代码，不再有明显的临时 mock / 一次性脚本残留。
- 回滚演练已确认可以通过现有的补发回滚、订阅补偿、券码启停和通知触达完成止损，不需要额外引入新的全局 feature flag 系统才能收口。

## 证据索引

### 浏览器留证

| 领域 | 证据 | 说明 |
|---|---|---|
| 成长与账户域 | [`t0217-browser-smoke.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t0217-browser-smoke.json) | `leaderboard / achievements / settings` 登录态与守卫留证 |
| 公开与转化域 | [`t0218-public-smoke.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t0218-public-smoke.json) | `home / pricing / blog / help / contact / login / register / reset-password` 留证 |
| 后台管理域 | [`t0219-admin-smoke.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t0219-admin-smoke.json) | `/admin`、用户、反馈、内容导入、审核、报错、增长工具留证 |

### 共享写链路截图

| 链路 | 证据 |
|---|---|
| 奖励领取 | [`t02110-dashboard-before-claim.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-dashboard-before-claim.png), [`t02110-dashboard-after-claim.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-dashboard-after-claim.png) |
| 资料保存 | [`t02110-settings-profile-saved.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-settings-profile-saved.png) |
| AI 配置 | [`t02110-settings-ai-saved.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-settings-ai-saved.png) |
| 通知偏好 | [`t02110-settings-notifications-saved.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-settings-notifications-saved.png) |
| 邀请码 | [`t02110-settings-invite-generated.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-settings-invite-generated.png) |
| 社区发帖 / 评论 | [`t02110-contact-feedback-submitted.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-contact-feedback-submitted.png) |
| 奖励中心补发 / 回滚 | [`t02110-admin-reward-center-before.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-admin-reward-center-before.png), [`t02110-admin-reward-applied.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-admin-reward-applied.png), [`t02110-admin-reward-rolled-back.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-admin-reward-rolled-back.png) |
| 排行榜回流 | [`t02110-leaderboard-after-reward.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-leaderboard-after-reward.png), [`t02110-leaderboard-after-rollback.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/t02110-leaderboard-after-rollback.png) |
| 内容导入 | [`admin-content-import.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-content-import.png) |

### 管理域与公开域截图

| 领域 | 证据 |
|---|---|
| 公开页 | [`public-home.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/public-home.png), [`public-pricing.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/public-pricing.png), [`public-blog.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/public-blog.png), [`public-help.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/public-help.png), [`public-contact.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/public-contact.png) |
| Auth / 转化 | [`login-submit.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/login-submit.png), [`register-submit.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/register-submit.png), [`reset-password-submit.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/reset-password-submit.png), [`pricing-voucher-applied.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/pricing-voucher-applied.png), [`register-prefill.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/register-prefill.png) |
| 后台页 | [`admin-home.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-home.png), [`admin-users.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-users.png), [`admin-user-detail.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-user-detail.png), [`admin-feedback.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-feedback.png), [`admin-feedback-detail.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-feedback-detail.png), [`admin-content-review.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-content-review.png), [`admin-content-review-detail.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-content-review-detail.png), [`admin-content-reports-list.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-content-reports-list.png), [`admin-referrals.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-referrals.png), [`admin-referrals-vouchers.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-referrals-vouchers.png), [`admin-vouchers-redirect.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/admin-vouchers-redirect.png) |

## 残余风险

- 课程域真实课时数据的完整闭环仍需 `T-006` 继续推进，这是功能补强，不是当前 `T-021` 的阻断项。
- 当前保留的全部正式证据都已移入 `T021-browser-20260410`，不再混入一次性脚本或临时样本。
- `T-021.13` 已复核完成，`T-021.14` 最终批准也已完成。

## 最终判断

- `T-021.1 ~ T-021.14` 的收口资料已经齐备。
- `T-021.12` 可以视为完成，最终预发验证报告已生成。
- `T-021.13` 的回滚演练已复核完成。
- `T-021.14` 的最终批准已经完成，`T-021` 可视为正式收口完成。
