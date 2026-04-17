# Design Tokens

## 1. 文档目的

本文件定义 LearnMore 的 token 体系。token 是设计系统的最底层约束，负责保证颜色、间距、阴影、圆角和状态表达在全局范围内保持一致。

## 2. Token 范围

- 颜色：背景、前景、卡片、弹层、主色、状态色、边框。
- 间距：页面、区块、卡片、表单控件、列表间隔。
- 圆角：基础圆角与层级圆角。
- 阴影：surface / elevated / emphasis 三类。
- 字体：字体族、字号层级、字重、行高、字距。

## 3. 语义优先

- 业务层只使用语义 token，不直接使用裸色值。
- 例如优先使用 `surface-default`、`text-secondary`、`border-default`。
- 避免在页面里直接写 `#...`、`rgb(...)`、`shadow-[...]`。

## 4. 当前代码映射

| Token 方向 | 当前落点 | 说明 |
| --- | --- | --- |
| 全局 CSS 变量 | [`src/app/globals.css`](../../src/app/globals.css) | 当前 token 主定义位置，包含亮色 / 暗色双套语义。 |
| Tailwind 色值映射 | [`tailwind.config.ts`](../../tailwind.config.ts) | 将语义 token 暴露为 Tailwind 可消费的 class 名称。 |
| 页面 shell 语义 | [`src/components/shared/pageSurfaces.ts`](../../src/components/shared/pageSurfaces.ts) | 页面级表面类名应直接基于 token 生成，不应再硬编码颜色。 |

## 5. 维护规则

- 新 token 必须先确认是否能复用现有语义。
- 如果确实需要新增，先定义语义，再定义具体值。
- 亮色和暗色必须成对定义。
- token 不应在业务组件内部局部复制。

## 6. 禁止项

- 在业务组件中临时新增颜色体系。
- 在页面层定义一次性阴影或圆角策略。
- 用“看起来更顺眼”为理由引入无语义的裸值。
