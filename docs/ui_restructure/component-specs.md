# Component Specs

## 1. 文档目的

本文件定义 LearnMore 的组件分层、基础组件边界和变体规范。其核心要求是：同类交互能力必须有统一实现，不能在多个页面中分别生成相似但不一致的版本。

## 2. 基础组件范围

优先统一以下基础组件：

- Button
- Card
- Input
- Badge
- Dialog
- Tabs
- Table
- EmptyState
- PageHeader（概念层；当前由 PageHeroShell / SectionBlockHeader 分担）

## 3. 组件边界

- 基础组件只负责通用行为和通用视觉。
- 组合组件负责场景封装，例如 Hero、FilterBar、KpiCard。
- 页面专属组件只在单一页面类型中使用。

## 4. 组件变体

- 变体必须显式命名。
- 常见变体优先使用：
  - `primary`
  - `secondary`
  - `destructive`
  - `ghost`
  - `compact`
  - `default`
  - `large`

## 5. 当前代码映射

| 组件类别 | 当前落点 | 说明 |
| --- | --- | --- |
| Button | [`src/components/ui/button.tsx`](../../src/components/ui/button.tsx) | 当前按钮的主实现，包含 variants、size、loading 和 asChild 支持。 |
| Card | [`src/components/ui/card.tsx`](../../src/components/ui/card.tsx) | 当前卡片系统的主实现。 |
| Input | [`src/components/ui/input.tsx`](../../src/components/ui/input.tsx) | 表单输入统一入口。 |
| Badge | [`src/components/ui/badge.tsx`](../../src/components/ui/badge.tsx) | 标签和状态徽标统一入口。 |
| Dialog | [`src/components/ui/dialog.tsx`](../../src/components/ui/dialog.tsx) | 模态层统一入口。 |
| Tabs | [`src/components/ui/tabs.tsx`](../../src/components/ui/tabs.tsx) | 标签页统一入口。 |
| Table | [`src/components/ui/table.tsx`](../../src/components/ui/table.tsx) | 表格统一入口。 |
| Tooltip | [`src/components/ui/tooltip.tsx`](../../src/components/ui/tooltip.tsx) | 提示层统一入口。 |
| Alert | [`src/components/ui/alert.tsx`](../../src/components/ui/alert.tsx) | 提示与告警统一入口。 |
| Page Empty State | [`src/components/shared/PageEmptyState.tsx`](../../src/components/shared/PageEmptyState.tsx) | 页面级空状态统一实现。 |
| Section Header | [`src/components/shared/SectionBlockHeader.tsx`](../../src/components/shared/SectionBlockHeader.tsx) | 页面区块标题组合组件。 |
| Hero Capsule | [`src/components/shared/HeroCapsule.tsx`](../../src/components/shared/HeroCapsule.tsx) | Hero 语义胶囊标签。 |

## 6. 维护规则

- 同类组件只允许一份权威实现。
- 页面层只允许组合，不允许重写基础视觉。
- 如果某个组件在多个页面出现，优先上提到设计系统层。
- 组件变体必须可枚举、可审查、可复用。

## 7. 禁止项

- 在业务页面里手工复制按钮、卡片、输入框的 class 组合。
- 因为某个页面特殊就重新实现一个“差不多”的组件。
- 在组件内部引入无法解释的局部视觉值。
