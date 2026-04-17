# Rollout Plan

## 1. 文档目的

本文件定义 UI 重构的推进节奏与验收方式。其核心要求是：先建立规范，再进行试点，随后扩散，最后纳入治理。

## 2. 推进阶段

### 阶段 1：定义

- 锁定 token、typography、基础组件、页面 shell 的规则。
- 只做标准确立，不做大规模页面重构。

### 阶段 2：试点

- 选择 1 个营销页、1 个仪表盘页、1 个详情页作为样板。
- 用同一套规则重做，验证一致性。

### 阶段 3：扩散

- 将验证通过的规则复制到其他页面。
- 优先迁移高曝光页面和风格漂移最明显的页面。

### 阶段 4：治理

- 将规则写进文档、review 习惯和 AI 使用规范。
- 后续新增功能默认遵守，不再每次重新解释。

## 3. 当前代码关系

- `design-tokens.md` 对应 `src/app/globals.css` 和 `tailwind.config.ts`。
- `typography.md` 对应 `src/components/shared/pageTypography.ts`。
- `component-specs.md` 对应 `src/components/ui/` 与 `src/components/shared/`。
- `page-shells.md` 对应 `src/components/shared/pageSurfaces.ts`、`PageHeroShell.tsx`、`SectionBlockHeader.tsx`、`PageEmptyState.tsx`。

## 4. 验收标准

- 业务页面不再随意使用临时视觉值。
- 基础组件只有一套权威实现。
- 页面都能明确归类到某一种模板。
- 新增 UI 变化默认先进入系统层，再进入业务层。
