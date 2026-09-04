# 全站响应式改造执行清单

## 0. 这份文档怎么用

这不是讨论文档，是执行文档。

你每次只需要看 4 个区块：

- `1. 当前总状态`
- `2. 主任务清单`
- `3. 已完成总结`
- `4. 下一步`

目标是明确三件事：

- 之前完成了什么
- 当前做到哪一步
- 下一步要做什么

---

## 1. 当前总状态

### 1.1 项目目标

在不破坏桌面主体验的前提下，完成全站响应式适配，补齐 `tablet / mobile` 的结构稳定性与可操作性。

### 1.2 已确认的执行策略

- 设计基准：桌面优先
- 实现方式：可收缩基线 + `tablet / desktop / laptop` 向上增强
- 断点治理策略：`中间模式`
- admin / editor 目标：`降级可用`
- 落代码路线：`共享层先行`

### 1.3 当前阶段

- 当前主任务：`主任务 7 - 最终回归`
- 当前状态：`已完成`
- 当前判断：`主任务 1 ~ 7` 已全部完成，后续进入按需微调与缺陷回收阶段

### 1.4 当前断点规则

来源：[tailwind.config.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/tailwind.config.ts:1)

- `sm / md / lg / xl`：手机宽度细分
- `tablet`：`768px`
- `desktop`：`1024px`
- `laptop`：`1280px`

执行规则：

- 不再把 `lg / xl` 当作桌面断点使用
- 新的双栏/多栏切换默认从 `tablet` 或 `desktop` 开始

---

## 2. 主任务清单

### 主任务 1：建立基线与规则

状态：`已完成`

子任务：

- [x] 1.1 明确断点语义
- [x] 1.2 盘点高风险模式
- [x] 1.3 按页面域归类问题
- [x] 1.4 锁定第一批共享层文件范围
- [x] 1.5 关闭基线阶段

完成结果：

- 已确认项目不是默认 Tailwind 断点语义
- 已确认共享层优先、单页后置
- 已锁定第一批共享层改造文件

---

### 主任务 2：共享层改造

状态：`已完成`

目标：

- 统一 app shell / dashboard shell / hero / loading / spacing / surfaces 的响应式基线

子任务：

- [x] 2.1 Wave A：壳层与断点基线
- [x] 2.2 Wave B：共享 spacing / surfaces 收口
- [x] 2.3 代表页面验证（按当前覆盖度收口）
- [x] 2.4 关闭共享层阶段，准备进入结构清理

#### 2.1 Wave A

状态：`已完成`

已修改文件：

- [src/app/layout.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/layout.tsx:1)
- [src/components/layout/dashboard-layout.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/dashboard-layout.tsx:610)
- [src/components/shared/PageHeroShell.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/shared/PageHeroShell.tsx:1)
- [src/components/loading/dashboard-route-loading.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/loading/dashboard-route-loading.tsx:1)

本轮完成内容：

- 补了移动端顶部/底部安全区补偿
- 收口 dashboard shell 的滚动模型与 padding
- 把 hero 的桌面切换从 `lg` 改到 `desktop`
- 把 loading skeleton 的桌面切换从 `lg/xl` 改到 `tablet/desktop`

#### 2.2 Wave B

状态：`已完成`

已修改文件：

- [src/components/shared/pageSpacing.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/shared/pageSpacing.ts:1)
- [src/components/shared/pageSurfaces.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/shared/pageSurfaces.ts:1)

本轮完成内容：

- 把共享 spacing 的放大时机从 `sm` 收口到 `tablet`
- 给共享 shell / table shell 补 `w-full`
- 收口 hero / empty state / section header / segmented button 的共享节奏

#### 2.3 代表页面验证

状态：`已收口`

已验证：

- [x] `/`
- [x] `/login`
- [x] `/dashboard` 登录态桌面页
- [x] `/admin/feedback`

后置到最终回归：

- [ ] `/dashboard/practice` 或等价练习页
- [ ] `courses` 相关页面
- [ ] 关键 viewport 抽检：`390 / 768 / 1024`

阶段结论：

- 当前共享层改动没有把首页、登录页、登录态 dashboard 主壳层打坏
- `/admin/feedback` 的 hydration 错误已修复，admin 代表页基础壳层正常
- 当前验证覆盖度足以继续推进，但 practice / courses 与 viewport 抽检明确后置到最终回归

#### 2.4 关闭共享层阶段

状态：`已完成`

关闭结论：

- 共享层首轮改造已经形成稳定基线，不再卡在代表页补测
- 剩余 practice / courses / viewport 验证不阻塞后续开发
- 从这一项开始，推进重点切换到“单页结构清理”

---

### 主任务 3：结构清理

状态：`已完成`

目标：

- 清理错误断点、固定宽高、超大最小宽度、页面级横向溢出

子任务：

- [x] 3.1 清理错误 `lg / xl` 结构切换
- [ ] 3.2 清理固定 `h / w / min-w`
- [ ] 3.3 清理页面级横向滚动
- [ ] 3.4 产出单页阶段的稳定基线

#### 3.1 清理错误 `lg / xl` 结构切换

状态：`已完成（首轮）`

本轮已处理文件：

- [src/app/(onboarding)/onboarding/legal/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(onboarding)/onboarding/legal/page.tsx:1)
- [src/app/(onboarding)/onboarding/profile/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(onboarding)/onboarding/profile/page.tsx:1)
- [src/components/onboarding/OnboardingProfileForm.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/onboarding/OnboardingProfileForm.tsx:1)
- [src/components/onboarding/OnboardingDashboardPreview.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/onboarding/OnboardingDashboardPreview.tsx:1)
- [src/app/(marketing)/about-us/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/about-us/page.tsx:1)
- [src/components/admin/feedback/FeedbackList.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/feedback/FeedbackList.tsx:1)
- [src/components/admin/content-reports/ReportDetailsDrawer.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/content-reports/ReportDetailsDrawer.tsx:1)

本轮完成结果：

- onboarding 与 marketing 首批页面的 `lg` 结构切换已改成 `desktop`
- admin 抽屉里的 `lg/xl` 结构断点已改成 `desktop`
- 首批目标文件内已无残留 `lg/xl` 结构类名

#### 3.2 清理固定 `h / w / min-w`

状态：`已完成`

本轮已处理文件：

- [src/components/practice/smart-parser/QuestionEditor.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/practice/smart-parser/QuestionEditor.tsx:1)
- [src/components/admin/questions/QuestionReviewDrawer.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/questions/QuestionReviewDrawer.tsx:1)
- [src/components/admin/content-reports/ReportDetailsDrawer.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/content-reports/ReportDetailsDrawer.tsx:1)
- [src/components/admin/feedback/FeedbackList.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/feedback/FeedbackList.tsx:1)
- [src/app/(marketing)/about-us/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/about-us/page.tsx:1)

当前结果：

- `QuestionEditor` 已从双栏固定 `700px` 高度改成随 viewport 收缩
- `QuestionReviewDrawer` 已从固定超宽抽屉改成按 viewport 限宽
- `ReportDetailsDrawer` 已改成按 viewport 限宽
- `FeedbackList` 表格最小宽度已收口一轮
- `about-us` 时间轴的最小宽度已按断点收口一轮
- `FeedbackList` 的筛选器最小宽度、空状态高度、内容列宽已进一步压缩
- `QuestionEditor` 的预览区最小高度与整体最小高度已进一步压缩
- `UserTable`、`GrowthToolsConsole`、`QuestionReviewTable` 的表格与筛选器最小宽度已收口一轮
- `pricing` 与 `LandingBelowFold` 的对比表最小宽度已进一步压缩

完成判断：

- 首轮高风险固定尺寸已完成全站清理
- 剩余固定尺寸主要为组件级可接受最小触控尺寸、图表/骨架尺寸或局部可控展示尺寸，不再作为 3.2 阻塞项

#### 3.3 清理页面级横向滚动

状态：`已完成`

当前结果：

- admin 详情抽屉已从整页超宽风险改成局部容器收缩
- `FeedbackList` 仍保留局部表格横向滚动，这是接受的局部滚动
- marketing 页面仍保留时间轴局部横向滚动，这是接受的局部滚动
- `UserTable`、`GrowthToolsConsole`、`QuestionReviewTable` 保留局部表格横向滚动，这是接受的局部滚动
- `pricing` 与 `LandingBelowFold` 保留局部对比表横向滚动，这是接受的局部滚动

完成判断：

- 全站高风险“页面级横向滚动”已清扫
- 剩余横向滚动均已收敛到局部容器内，且属于业务合理的表格/时间轴/对比区滚动

#### 3.4 产出单页阶段的稳定基线

状态：`已完成`

收口结论：

- 结构性问题的处理顺序已经固化：先纠偏断点，再压缩硬尺寸，最后把横向滚动收敛到局部容器
- admin 表格、抽屉、marketing 时间轴/对比区、practice 工作区都已经形成可复用的响应式处理方式
- 后续主任务 4/5/6 应默认沿用这套单页基线，而不是再回到“宽屏先做完再硬缩”的开发方式

---

### 主任务 4：用户向页面改造

状态：`已完成`

范围：

- marketing
- auth
- onboarding

子任务：

- [x] 4.1 marketing 断点语义纠偏
- [x] 4.2 marketing 大块固定高度首轮压缩
- [x] 4.3 onboarding 预览区最小高度收口
- [x] 4.4 auth 范围确认与阶段关闭

完成结果：

- marketing 域剩余的 `lg / xl` 桌面语义已收口到 `desktop / laptop`
- pricing、landing、subjects、student-care、how-it-works、footer 的横向容器和视觉块高度已按 viewport 收缩一轮
- onboarding 表单预览区和 dashboard preview 的最小高度已从固定大桌面值下放到更合理的基线
- auth 在本阶段未发现额外结构性阻塞项，沿用主任务 2/3 的共享层基线即可

---

### 主任务 5：核心产品页面改造

状态：`已完成`

范围：

- dashboard
- courses
- practice

子任务：

- [x] 5.1 dashboard 宽屏/紧凑桌面断点收口
- [x] 5.2 community / settings 两栏切换收口
- [x] 5.3 courses 主壳层和 lesson player 高度收口
- [x] 5.4 practice 工作区与 review workspace 侧栏收口

完成结果：

- dashboard 首页宽屏专用子网格已跟随 `laptop` 而不是 `xl`，避免 `1024~1279` 区间误进宽屏拼图
- community 与 settings 的双栏布局从 `desktop` 收口到更稳的 `laptop` 阶段，`1024` 左右宽度优先保持单列/窄侧栏
- courses 主页面的 hero 统计区、主内容/侧栏分栏和内容最小高度已按 `laptop` 重新组织
- lesson player 的完成态不再固定 `600px` 高度，而是按 viewport 收缩
- practice 的 unified workspace 与 review workspace 侧栏切换已前移到更合理的断点，避免中等桌面宽度下信息挤压

---

### 主任务 6：后台与密集工具改造

状态：`已完成`

范围：

- admin
- 大表格
- 宽抽屉
- 编辑器工作区

子任务：

- [x] 6.1 admin 剩余 `lg / xl` 断点语义纠偏
- [x] 6.2 宽抽屉与详情面板限宽收口
- [x] 6.3 大表格最小宽度与空状态高度压缩
- [x] 6.4 奖励中心 / 报错详情 / 题目审核等密集控制台收口

完成结果：

- admin 域剩余的 `lg / xl` 结构切换已经收口到 `desktop / laptop`
- `QuestionReviewDrawer`、`ReportsClient`、`content/review`、`RewardCenterControlConsole`、`RewardCenterConsole` 的宽屏切换逻辑已纠偏
- `UserTable`、`QuestionReviewTable`、`GrowthToolsConsole` 等宽表格/空状态进一步压缩，保持局部滚动，不再回到页面级横向溢出
- 报错详情页和审核工作台的横向工具条已按窄桌面重新组织

---

### 主任务 7：最终回归

状态：`已完成`

范围：

- 全宽度回归
- 残余风险确认
- 文档收尾

子任务：

- [x] 7.1 目标文件 lint 回归
- [x] 7.2 生产构建回归
- [x] 7.3 `390 / 768 / 1024` 关键 viewport 抽检
- [x] 7.4 公开页与受保护页控制台检查
- [x] 7.5 文档收尾

完成结果：

- `dashboard / practice / courses / admin/feedback / public landing` 已完成关键 viewport 抽检
- Playwright 控制台检查无 error / warning
- `pnpm build` 已通过
- 本轮涉及文件的 eslint 已通过
- 当前剩余问题不再是结构性响应式阻塞项，进入后续按页微调阶段

---

## 3. 已完成总结

### 3.1 已完成的核心决定

- 桌面优先，但实现上采用可收缩基线
- 不再把 `lg / xl` 当作桌面断点
- admin / editor 采用“降级可用”而不是强同构
- 先改共享层，再改单页

### 3.2 已完成的盘点结论

- 问题不只在 onboarding，已经扩散到 marketing、dashboard、courses、practice、admin
- `dashboard` 和 `admin` 的固定尺寸问题最多
- marketing 的 `overflow-x-hidden` 使用偏多，存在掩盖结构问题的风险
- practice 的典型问题是固定高度工作区
- admin 的典型问题是宽抽屉、表格最小宽度、筛选条密度

### 3.3 已完成的共享层改造总结

Wave A：

- app shell 顶底补偿已补齐
- dashboard shell 滚动与 padding 已统一一轮
- hero / loading 的桌面断点已纠偏

Wave B：

- spacing 的断点语义已统一一轮
- surfaces 的基础壳层宽度与节奏已统一一轮

### 3.4 当前已知未解决问题

- 不再存在阻塞全站响应式推进的结构性问题
- 剩余问题主要是单页视觉细调、信息密度平衡和个别内容块留白优化
- 后续如果继续改动 dashboard / admin，可直接按页面做微调，不需要回到共享层重构

---

## 4. 下一步

### 4.1 现在应该做什么

进入后续业务域改造阶段。

优先顺序：

1. 当前执行清单已全部完成
2. 后续只按新发现的问题做定点微调

### 4.2 主任务 6 的首批处理对象

- admin：
  - [src/components/admin/feedback/FeedbackList.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/feedback/FeedbackList.tsx:1)
  - [src/components/admin/questions/QuestionReviewDrawer.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/questions/QuestionReviewDrawer.tsx:1)
  - [src/components/admin/content-reports/ReportDetailsDrawer.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/content-reports/ReportDetailsDrawer.tsx:1)
  - [src/components/admin/users/UserTable.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/users/UserTable.tsx:1)
  - [src/components/admin/referrals/GrowthToolsConsole.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx:1)

### 4.3 主任务 6 的推进标准

- admin 的宽表格只保留局部横向滚动，不回到页面级横向溢出
- 抽屉与详情面板优先按 viewport 限宽，不再默认固定超宽
- 编辑器工作区以“桌面最佳、窄桌面可用”为目标继续压缩

### 4.4 收口说明

- `practice / courses` 代表页验证已在 `主任务 7` 完成
- `390 / 768 / 1024` 的关键 viewport 抽检已完成
- 后续如果再次出现共享层回归迹象，再补做定向验证

---

## 5. 关键文件

### 5.1 已改的共享层文件

- [src/app/layout.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/layout.tsx:1)
- [src/components/layout/dashboard-layout.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/dashboard-layout.tsx:610)
- [src/components/shared/PageHeroShell.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/shared/PageHeroShell.tsx:1)
- [src/components/loading/dashboard-route-loading.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/loading/dashboard-route-loading.tsx:1)
- [src/components/shared/pageSpacing.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/shared/pageSpacing.ts:1)
- [src/components/shared/pageSurfaces.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/shared/pageSurfaces.ts:1)

### 5.2 后续高优先级单页文件

- [src/app/(onboarding)/onboarding/legal/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(onboarding)/onboarding/legal/page.tsx:1)
- [src/app/(onboarding)/onboarding/profile/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(onboarding)/onboarding/profile/page.tsx:1)
- [src/components/practice/smart-parser/QuestionEditor.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/practice/smart-parser/QuestionEditor.tsx:1)
- [src/components/admin/questions/QuestionReviewDrawer.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/questions/QuestionReviewDrawer.tsx:1)
- [src/components/admin/content-reports/ReportDetailsDrawer.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/content-reports/ReportDetailsDrawer.tsx:1)
- [src/components/admin/feedback/FeedbackList.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/feedback/FeedbackList.tsx:1)
- [src/components/dashboard/DashboardHome.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/DashboardHome.tsx:1)
- [src/components/practice/PracticeView.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/practice/PracticeView.tsx:1)

---

## 6. 简版验证记录

### 已通过

- `/`：基础壳层正常
- `/login`：基础壳层正常
- `/dashboard`：真实登录态桌面页正常
- `/admin/feedback`：hydration 错误已修复，页面正常渲染
- `/dashboard/practice`：真实登录态页面可访问，关键壳层正常
- `/dashboard/courses`：真实登录态页面可访问，关键壳层正常
- `390 / 768 / 1024`：已做关键 viewport 抽检
- `Playwright console`：0 error / 0 warning
- `pnpm build`：通过

### 已收口

- 主任务 1 ~ 7 全部完成

---

## 7. 风险提醒

- 当前不再有阻塞性的结构风险
- 后续风险主要集中在视觉层微调，而不是断点体系或壳层体系
