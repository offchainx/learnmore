# ws-01 执行台（auth onboarding flow）

## 1. 项目快照

- 状态：doing
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：把 auth / onboarding 流程冻结成可执行规范，并作为后续实现的唯一主文档

## 2. 任务定位

- ws-01 不再推进 v0 参考样板
- ws-01 现在只负责 onboarding auth flow 的工程边界、页面形态、状态机和任务台账
- 以前围绕 v0 / prompt assist 的内容，保留为历史背景，不再作为当前主线

## 3. 已确认的流程

1. `/login` 或 `/register`
2. Google 登录成功后进入 `/auth/callback`
3. callback 同步用户后进行 onboarding 分流
4. 未完成 legal -> `/onboarding/legal`
5. legal 完成但 profile 未完成 -> `/onboarding/profile`
6. 资料保存完成 -> `/dashboard`

## 4. 当前冻结边界

- legal acceptance 必须写入数据库
- profile onboarding 必须支持 `displayName / school / grade / avatar`
- 学校选择第一版采用本地候选 + 自由输入
- `username` 不再承担真实姓名角色
- dashboard 访问必须有 onboarding 兜底
- 目前不生成 Gemini prompt，不回到 v0 prompt 协作

## 5. 设计原则

- 使用独立 onboarding 路由，不再走 dashboard 内弹窗流
- 页面布局向 Novu 对齐：左侧品牌说明，右侧表单卡片或表单 + 预览
- 所有完成状态都应该可由 DB 状态直接推导
- 第一步追求流程正确与状态稳定，第二步再做品牌和视觉细化

## 6. 主文档结构

这个 `tasks.md` 同时承担以下角色：

- 流程总览
- 页面规格
- 数据模型说明
- 路由与 action 清单
- 任务拆解
- 决策记录
- 会话记忆

## 7. 页面规格

### 7.1 `/login`

- 左侧：品牌说明区
- 右侧：登录表单
- 需要保留 `Email / Password / Google` 三种路径
- 底部有 `/register` 跳转

### 7.2 `/register`

- 左侧：与登录页同一套品牌说明区
- 右侧：注册表单
- 需要保留 `Google` 登录入口
- 底部有 `/login` 跳转

### 7.3 `/onboarding/legal`

- 左侧：与 auth 页统一的品牌说明区
- 右侧：窄卡片
- 内容包括：
  - 标题
  - 简短说明
  - 单个同意勾选框
  - `Terms of Service` 链接
  - `Privacy Policy` 链接
  - `Continue` 主按钮
- 未勾选前按钮禁用

### 7.4 `/onboarding/profile`

- 左侧：资料表单
- 右侧：实时 dashboard 预览
- 表单包括：
  - 头像
  - `displayName`
  - `school`
  - `grade`
- 学校输入支持候选联想
- 年级只开放 `7 / 8 / 9`
- 页面使用本地受控 preview，不发真实 dashboard 数据请求
- 预览区显示：
  - 头像
  - 姓名
  - 学校
  - 年级
  - 简化 dashboard 卡片

### 7.5 `/dashboard`

- 只在 onboarding 完成后进入
- 对未完成 onboarding 的登录用户提供重定向保护

## 8. 数据模型

### 8.1 `User` 新增字段建议

- `displayName String?`
- `legalConsentAcceptedAt DateTime?`
- `legalConsentVersion String?`
- `onboardingCompletedAt DateTime?`
- `onboardingStep String?`

### 8.2 既有字段复用

- `avatar`
- `school`
- `grade`

### 8.3 完成状态判断

- legal 未完成
  - `legalConsentAcceptedAt == null`
- profile 未完成
  - `displayName == null || school == null || grade == null`
- onboarding 完成
  - `onboardingCompletedAt != null`

### 8.4 当前版本常量

- `LEGAL_CONSENT_VERSION = "2026-04-28"`
- `ONBOARDING_STEP_LEGAL = "legal"`
- `ONBOARDING_STEP_PROFILE = "profile"`
- `ONBOARDING_STEP_DONE = "done"`

## 9. Action / Service

### 9.1 `resolveOnboardingRedirect`

- 输入：当前用户
- 输出：`/onboarding/legal`、`/onboarding/profile` 或 `/dashboard`
- 用于 callback 和 dashboard guard
- callback 场景下应先完成 `syncCurrentUserToDatabase` 再计算下一跳

### 9.2 `acceptLegalConsent`

- 写入 legal 同意状态
- 更新 `onboardingStep` 到 `profile`
- 返回 profile 页面路径

### 9.3 `completeOnboardingProfile`

- 写入 `displayName / school / grade / avatar`
- 标记 `onboardingCompletedAt`
- 更新 `onboardingStep` 到 `done`
- 返回 dashboard 路径
- 这是 onboarding 专用 action，不建议直接复用现有 settings/profile 表单 action
- 如果后续需要让 settings 页也支持学校字段，再单独扩展现有 profile action

### 9.4 `getOnboardingStatus`

- 用于页面渲染与重定向判断
- 避免在各处散落重复判断逻辑

## 10. 组件建议

- `OnboardingShell`
- `LegalConsentCard`
- `OnboardingProfileForm`
- `OnboardingDashboardPreview`
- `SchoolCombobox`
- `OnboardingProgress`

## 11. 学校候选策略

- 第一版不接外部学校库
- 先用本地 `schools.ts` 列表
- 输入 1-2 个字后开始模糊匹配
- 返回前 8 条候选
- 没有结果时允许手动输入
- 后续可升级为地区排序、拼音匹配、远端检索

## 12. 路由 / 文件清单

### 12.1 现有文件修改

- `prisma/schema.prisma`
- `src/app/auth/callback/route.ts`
- `src/actions/user/auth.ts`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/components/business/auth/login-form.tsx`
- `src/components/business/auth/register-form.tsx`
- `src/actions/user/profile.ts` 只在需要扩展现有 settings/profile 能力时再动，onboarding 首版优先走独立 action

### 12.2 新增文件

- `src/app/(onboarding)/layout.tsx`
- `src/app/(onboarding)/onboarding/legal/page.tsx`
- `src/app/(onboarding)/onboarding/profile/page.tsx`
- `src/components/onboarding/OnboardingShell.tsx`
- `src/components/onboarding/LegalConsentCard.tsx`
- `src/components/onboarding/OnboardingProfileForm.tsx`
- `src/components/onboarding/OnboardingDashboardPreview.tsx`
- `src/components/onboarding/SchoolCombobox.tsx`
- `src/components/onboarding/OnboardingProgress.tsx`
- `src/actions/user/onboarding.ts`
- `src/lib/auth/onboarding.ts`
- `src/lib/schools.ts`
- `src/data/schools.ts`

## 13. 实施任务表

| id    | description    | owner | status | link                                               | notes                                                        |
| ----- | -------------- | ----- | ------ | -------------------------------------------------- | ------------------------------------------------------------ |
| T-001 | 数据模型       | codex | done   | `prisma/schema.prisma`                             | onboarding 字段已补齐并同步 Supabase                         |
| T-002 | 状态服务       | codex | done   | `src/lib/auth/onboarding.ts`                       | 统一计算下一跳，已补单测                                     |
| T-003 | OAuth 分流     | codex | done   | `src/app/auth/callback/route.ts`                   | session 后先同步用户，再跳正确步骤                           |
| T-004 | legal 页面     | codex | done   | `src/app/(onboarding)/onboarding/legal/page.tsx`   | 账号级 legal acceptance                                      |
| T-005 | profile 页面   | codex | done   | `src/app/(onboarding)/onboarding/profile/page.tsx` | 资料采集 + 实时预览                                          |
| T-006 | 学校候选       | codex | done   | `src/components/onboarding/SchoolCombobox.tsx`     | 独中名单本地候选，支持中文/马来文/英文别名与手动输入         |
| T-007 | dashboard 提醒 | codex | done   | `src/app/(dashboard)/dashboard/page.tsx`           | 未完成 onboarding 的用户仍可进入 dashboard，但会收到站内提醒 |
| T-008 | auth 品牌统一  | codex | done   | `src/components/business/auth/*`                   | 登录/注册共享统一 shell 与品牌视觉语言                       |
| T-009 | 测试与验收     | codex | done   | `src/**/*.test.ts*`                                | redirect / save / reminder / school search tests 已通过     |

## 14. 开发顺序

1. 先改 schema
2. 再写 onboarding 状态服务
3. 再改 OAuth callback
4. 然后上 legal 页
5. 再上 profile 页
6. 接着做学校候选
7. 最后补 dashboard guard 和测试

## 15. 关键决策记录

| date       | decision                                            | reason                                                            | impact                                         |
| ---------- | --------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| 2026-04-28 | ws-01 从 v0 prompt assist 改为 onboarding auth flow | 用户不再继续推进 v0 线，当前重心是 onboarding 落地                | ws-01 改成实施台而不是 prompt 台               |
| 2026-04-28 | onboarding 采用独立路由                             | 更贴近 Novu，legal/profile 都需要独立页面和状态机                 | 不再用 dashboard dialog 路线                   |
| 2026-04-28 | 姓名使用 `displayName`                              | 避免 `username` 唯一约束与语义冲突                                | schema 需要补字段                              |
| 2026-04-28 | 学校候选先做本地列表                                | 先把主链路做稳，避免卡在外部数据源                                | 后续可升级搜索策略                             |
| 2026-04-28 | profile onboarding 采用独立 action                  | 现有 settings/profile form 字段过多，不适合直接承载 onboarding    | onboarding 与 settings 解耦，避免后续返工      |
| 2026-04-28 | OAuth callback 先同步用户再分流                     | 防止 session 有了但 public.users / user_settings 未就绪           | redirect 决策更稳定                            |
| 2026-04-28 | 学校候选改为马来西亚华文独立中学名单                | 当前教材和 onboarding 目标都面向独中场景，需要中文/马来文双向检索 | 本地候选列表改为独中目录，不再使用通用学校样本 |

## 16. 会话记忆

| date       | topic          | summary                                                                                                                               | files                                                                                                                 | next                   |
| ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 2026-04-28 | 目录改名       | `ws-01-v0-reference-prototype-and-prompt-assist` 已废弃，改名为 `ws-01-auth-onboarding-flow`                                          | `spec.md`, `tasks.md`                                                                                                 | 清理旧路径引用         |
| 2026-04-28 | 文档合并       | 原 `novu-inspired-onboarding-auth-flow.md` 已不再需要，全部内容合入 `tasks.md`                                                        | `tasks.md`                                                                                                            | 后续只维护这一份主文档 |
| 2026-04-28 | T-001 complete | 已补 `displayName / legalConsentAcceptedAt / legalConsentVersion / onboardingCompletedAt / onboardingStep`，并写入 Supabase migration | `prisma/schema.prisma`, `supabase/migrations/025_t048_add_onboarding_fields_to_users.sql`, `src/actions/user/auth.ts` | 进入 T-002             |

## 17. 当前不做

- 不回到 v0 prompt 生成
- 不恢复 contextual onboarding dialog 方案
- 不在这一步做 design contract 或 token 化
- 不引入外部学校数据库

## 18. 下一步

- 先修正所有旧路径引用
- 删除废弃的 `novu-inspired-onboarding-auth-flow.md`
- 然后从 `T-001` 开始推进
