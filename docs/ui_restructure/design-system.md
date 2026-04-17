# LearnMore Design System

## 1. 文档目的

本文件定义 LearnMore 的 UI 设计系统边界，用于约束后续页面、组件和重构工作。该系统的目标是将当前已有的局部 UI 实现收敛为统一规则，避免新的页面继续产生视觉分叉。

## 2. 设计原则

- 所有视觉值优先来自 token。
- 业务页面只负责组合，不负责重新定义基础视觉。
- 基础组件只保留一份权威实现。
- 页面模板固定化，减少自由拼接。
- AI 生成内容必须限定在既有组件和 token 范围内。

## 3. 系统分层

- Tokens：颜色、间距、圆角、阴影、状态色。
- Typography：标题、正文、说明、标签、数字值。
- Component Primitives：Button、Card、Input、Badge、Dialog、Tabs、Table、EmptyState、Page Header。
- Page Shells：营销页、仪表盘页、详情页、管理页、文档页。

## 4. 当前代码映射

| 设计层 | 当前落点 | 说明 |
| --- | --- | --- |
| Tokens | [`src/app/globals.css`](../../src/app/globals.css) | 负责定义 CSS 变量、亮色 / 暗色映射、状态色与阴影语义。 |
| Tailwind 映射 | [`tailwind.config.ts`](../../tailwind.config.ts) | 负责将语义 token 暴露给 Tailwind class。 |
| 页面级外壳 | [`src/components/shared/pageSurfaces.ts`](../../src/components/shared/pageSurfaces.ts) | 负责页面框架、卡片、输入框、空状态等页面级表面类名。 |
| 页面级排版 | [`src/components/shared/pageTypography.ts`](../../src/components/shared/pageTypography.ts) | 负责页面标题、区块标题、说明文字、数字值等排版级别。 |
| 页面级间距 | [`src/components/shared/pageSpacing.ts`](../../src/components/shared/pageSpacing.ts) | 负责页面区块间距、卡片内边距、列表密度。 |
| 页面外壳组件 | [`src/components/shared/PageHeroShell.tsx`](../../src/components/shared/PageHeroShell.tsx) | 负责首屏 Hero 结构与动作区布局。 |
| 页面区块标题 | [`src/components/shared/SectionBlockHeader.tsx`](../../src/components/shared/SectionBlockHeader.tsx) | 负责二级区块标题和说明的统一结构。 |
| 页面空状态 | [`src/components/shared/PageEmptyState.tsx`](../../src/components/shared/PageEmptyState.tsx) | 负责空状态的图标、标题、描述、动作排列。 |

## 5. 维护方式

- token 变更先修改底层变量，再同步 Tailwind 映射。
- 基础组件的新增变体应优先复用既有语义，不应重建一套风格。
- 页面级组件若被多个页面复用，应提升为 shared 级别。
- 新增规则必须写入本目录文档，不能只在某个页面中临时实现。

## 6. 第一阶段验收

- 新页面不再需要自行定义颜色体系。
- 新页面不再需要自行定义标题字号体系。
- 新页面不再需要自行拼装按钮、卡片和输入框视觉。
- 新页面能够明确归类到某一种 shell 模板。
