# Typography

## 1. 文档目的

本文件定义 LearnMore 的排版系统。排版系统用于统一标题、正文、说明、标签和数字值的显示规则，以保证全站阅读节奏稳定。

## 2. 建议层级

- 页面主标题
- 区块标题
- 说明文字
- 元信息
- 标签 / badge
- 数字值 / KPI

## 3. 维护规则

- 页面层尽量复用统一的文本类名常量。
- 只有明确需要视觉差异时，才新增文本层级。
- 中英混排应优先保证行高和字距稳定。
- 同一页面中相同语义的文字不应出现多套字号体系。

## 4. 当前代码映射

| 排版层级 | 当前落点 | 说明 |
| --- | --- | --- |
| 页面 Hero 标题 / 副标题 | [`src/components/shared/PageHeroShell.tsx`](../../src/components/shared/PageHeroShell.tsx) | 首屏标题与说明已统一使用 shared 文本类。 |
| 页面标题常量 | [`src/components/shared/pageTypography.ts`](../../src/components/shared/pageTypography.ts) | 页面主标题、区块标题、说明文字、数字值的统一来源。 |
| 区块标题组合 | [`src/components/shared/SectionBlockHeader.tsx`](../../src/components/shared/SectionBlockHeader.tsx) | 二级标题 + 描述 + 动作区的标准排版结构。 |
| 空状态标题与描述 | [`src/components/shared/PageEmptyState.tsx`](../../src/components/shared/PageEmptyState.tsx) | 空状态标题和描述应统一使用系统级文本层。 |

## 5. 禁止项

- 在页面里随手写 `text-[11px]`、`text-[13px]` 作为默认方案。
- 每个模块各自定义一套标题层级。
- 为了局部视觉效果破坏全站字号节奏。
