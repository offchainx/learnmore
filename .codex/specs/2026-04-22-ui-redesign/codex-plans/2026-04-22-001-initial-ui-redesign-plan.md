# 前端 UI 重构推进方案

## Summary
- 不需要一开始就把所有组件细节一次性锁死。第一阶段只锁定“设计契约”：品牌气质、字体组合、字号层级、主辅色规则、圆角区间、阴影哲学、间距节奏、动效边界、图标风格、内容语气。等第一版样板满意后，再反推完整组件库和页面规则。
- 可以先用 v0 做一版“组合样板”来定调，而且这是当前最省轮次的做法。组合样板不是只做单页，而是一次覆盖：营销首页首屏 + dashboard/practice 壳层 + 3-5 个高频核心卡片/模块。这样既能定品牌感，也能定产品内页的骨架。
- 设计方法上，采用 [awesome-design-md](https://github.com/VoltAgent/awesome-design-md/tree/main) 的 `DESIGN.md` 思路做统一设计契约，再结合 [taste-skill](https://github.com/Leonxlnx/taste-skill) 的 anti-slop 规则做 prompt 收敛。
- 已确认默认方向：`温暖教育`、`组合样板`、`Light-First`。这意味着第一阶段先把浅色主题做扎实，暗色模式第二阶段再映射，不在第一轮消耗 v0 额度。

## Key Changes
- 先做一次 UI 审计，不改功能，只产出三份输入材料给 v0：
  - `must-keep 功能清单`：按路由分组列出必须保留的功能、状态、交互，不允许 v0 因为审美重做而删能力。
  - `anti-pattern 黑名单`：明确禁止蓝紫 AI 渐变、无意义 glow、Sparkles 装饰、过重玻璃化、过多悬浮卡片、与教育产品不符的“赛博 SaaS”语气。
  - `design contract / DESIGN.md`：定义字体、字号、色板、圆角、阴影、边框、布局、动效、插图与文案语气。
- 第一轮 v0 只做一个高价值 prompt，不做碎修。这个 prompt 目标是产出一个组合样板，必须包含：
  - 营销首页首屏与下折一段，体现“温暖教育”而不是 AI 工具感。
  - 登录后主壳层，至少包含顶部信息区、侧边导航或底部导航策略、核心列表/卡片/表单/筛选区。
  - practice 首页中的学科切换、训练模式、章节进度、历史试卷或分析面板中的代表性模块。
  - 明确要求保留现有产品能力，不改变信息架构，不引入新业务流程。
- v0 第一轮满意后，Codex 才开始反推系统层，不直接逐页抄视觉：
  - 把样板拆成正式 token：色彩、文字、圆角、阴影、边框、间距、交互动效。
  - 把高频 primitives 收敛成共享组件规范：`Button`、`Input`、`Badge`、`Card/Panel`、`Tabs`、`Dialog`、`Table/List`、`Empty/Loading/Error`、`Page Shell`。
  - 清理表现型 variant，尤其是 `glow` 这类纯视觉变体，改成语义化 variant；业务 API、action、route shape 不变。
- 页面落地按批次推进，不全站同时重写：
  - 第 1 批：共享壳层与通用组件，覆盖 marketing / dashboard / practice 的公共骨架。
  - 第 2 批：营销主路径，优先 `首页`、`pricing`、`subjects`、`how-it-works`。
  - 第 3 批：学生主路径，优先 `dashboard`、`practice center`、`courses`、`community`、`settings`。
  - 第 4 批：深交互练习流，优先 `smart drill`、`mock arena`、`past paper`、`quiz session`。
  - 第 5 批：admin，沿用同一 token，但视觉语气更克制、更工具化，不强行复制 consumer 的温暖表达。
- v0 使用规则固定下来，避免浪费：
  - 每次进 v0 前，先由 Codex 离线整理 prompt、约束、参考、必须保留点、禁止项。
  - 只有当“预期提升是结构性提升”时才发下一轮，不为了修一个圆角、一个阴影单独开会话。
  - 预计节奏：`1 次核心定调 + 1 次缺口补图 + 最多 1 次疑难页面专项`，不把 v0 当日常微调器。

## Public APIs / Interfaces / Types
- 新增 repo 根部设计契约文档：
  - `DESIGN.md`：给 v0/Codex 共用，作为唯一视觉规范来源。
  - `v0-prompt-pack`：记录已验证有效的 prompt 模板、禁止项、样板目标、验收标准。
- 共享 UI 接口会收敛，但业务接口不变：
  - `Button`、`Card`、`Badge`、`Input`、`Dialog`、`Tabs`、`Table` 等保留功能，压缩表现型 variant。
  - `pageSurfaces.ts`、`pageTypography.ts`、全局 CSS token 会升级为正式设计系统层。
  - 不调整现有 actions、数据模型、路由结构、权限逻辑。
- 主题策略：
  - 第一阶段只定义 `Light-First` 的完整 token。
  - 第二阶段再把 token 映射到 dark mode，不在第一轮样板里双开。

## Test Plan
- 视觉验收：
  - 在 `390 / 768 / 1440` 三档下验证首页、dashboard 壳层、practice 壳层。
  - 对比当前版本，确认 AI 味明显下降，且新样板能覆盖现有高频模块。
  - 检查中英文与马来文文案长度下是否溢出、断行异常或层级失衡。
- 功能验收：
  - 保证 auth、pricing、dashboard、practice、community、admin 的主要路径不因 UI 重构丢功能。
  - 每个高频组件必须补齐 `loading / empty / error / disabled` 状态，不只做 happy path。
  - 移动端导航、safe area、底部 tab、顶部 header 继续工作。
- 实现验收：
  - consumer 页面遵循统一 token，不再出现蓝紫 glow / Sparkles / 无意义渐变的旧风格回流。
  - admin 允许更工具化，但必须共享同一基础 token，而不是另起一套体系。
  - 深交互学习页面控制动效预算，避免持续动画影响学习专注和移动端性能。

## Assumptions
- 当前默认主受众是中学生与家长，因此整体方向采用“温暖教育”，不是科技炫技。
- consumer 端按移动优先设计，admin 按桌面优先设计。
- 第一版样板默认使用中文文案，但布局必须能承受英文和马来文长度变化。
- 第一阶段不移除任何现有功能，除非后续你明确指定某些功能可暂时屏蔽。
- 第一阶段不追求全站同时改完，而是先冻结设计系统，再分批落地；否则成本和返工都会显著上升。
