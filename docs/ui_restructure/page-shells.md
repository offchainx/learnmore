# Page Shells

## 1. 文档目的

本文件定义 LearnMore 的页面骨架规范。页面骨架用于约束不同类型页面的布局顺序、信息层级和首屏结构，避免页面在实现过程中因局部优化而失去统一性。

## 2. 页面类型

- 营销页
- 仪表盘页
- 详情页
- 管理页
- 文档页

## 3. 推荐结构

### 营销页
- Hero
- 社会证明
- 功能块
- CTA
- Footer

### 仪表盘页
- Header
- KPI
- 主内容
- 侧栏或抽屉

### 详情页
- Hero
- 元信息
- 内容体
- 相关模块

### 管理页
- 搜索 / 筛选
- 表格
- Drawer / Modal

### 文档页
- Sidebar
- TOC
- Content

## 4. 当前代码映射

| 页面骨架能力 | 当前落点 | 说明 |
| --- | --- | --- |
| Hero 壳 | [`src/components/shared/PageHeroShell.tsx`](../../src/components/shared/PageHeroShell.tsx) | 用于页面首屏结构和动作区布局。 |
| Hero 标题组合 | [`src/components/shared/PageHeroTitle.tsx`](../../src/components/shared/PageHeroTitle.tsx) | 用于标题 + capsule 组合表达。 |
| 区块标题壳 | [`src/components/shared/SectionBlockHeader.tsx`](../../src/components/shared/SectionBlockHeader.tsx) | 用于二级内容区块的标准标题布局。 |
| 空状态壳 | [`src/components/shared/PageEmptyState.tsx`](../../src/components/shared/PageEmptyState.tsx) | 用于页面空内容场景。 |
| 页面视觉表面 | [`src/components/shared/pageSurfaces.ts`](../../src/components/shared/pageSurfaces.ts) | 用于页面 shell、面板、卡片、输入与列表密度等基础形态。 |

## 5. 维护规则

- 页面先分类，再填内容。
- 新页面必须先选择 shell 类型。
- shell 一旦确定，布局顺序不允许随意漂移。
- 若某种结构在多个页面中重复出现，应抽象为 shared shell 能力。
