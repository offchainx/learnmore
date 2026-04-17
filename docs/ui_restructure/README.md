# UI 重构文档总入口

本目录用于沉淀 LearnMore 当前阶段的 UI 重构规范。其目标不是重新设计一套视觉语言，而是在现有 `Next.js + Tailwind + Radix + 语义化 CSS 变量` 的基础上，形成一套可持续维护、可复用、可审查的界面系统。

## 文档阅读顺序

1. [`design-system.md`](./design-system.md)
2. [`design-tokens.md`](./design-tokens.md)
3. [`typography.md`](./typography.md)
4. [`component-specs.md`](./component-specs.md)
5. [`page-shells.md`](./page-shells.md)
6. [`rollout-plan.md`](./rollout-plan.md)

## 使用范围

- Next.js App Router 页面
- Tailwind / Radix / shadcn 风格组件
- 业务页面、管理页面、营销页面
- AI 参与生成或重构的 UI 代码

## 当前原则

- 设计规则优先于页面实现
- 基础组件优先于局部拼装
- token 优先于裸值
- 页面结构优先于局部美化
- 任何新增视觉能力都应先进入本目录，再进入业务代码

## 维护说明

- 如果某个规则已经在代码中有明确落点，优先在对应文档中更新，不要只在某个页面里“口头约定”。
- 如果某个页面出现了新的视觉模式，先判断它属于 token、typography、component 还是 page shell，再决定是否升级为系统能力。
- 本目录中的文档应当长期作为重构依据，而不是一次性说明。
