id: SPEC-20260422-D-03
title: d-03 practice
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-22

# 背景
- practice 是产品主路径，信息密度、训练节奏和专注感要求最高，也是现有 UI 最需要系统性重构的域之一。

# 目标（Goals）
- 重构 practice 主页面与深交互练习流
- 保留训练能力、数据链路和结果反馈
- 建立训练型产品语言，而非游戏厅皮肤

# 非目标（Non-Goals）
- 不改练习数据结构或后端契约
- 不新增练习模式

# 稳定边界
- 保留既有 practice 功能
- 优先提升信息层级、训练专注感和决策清晰度

# 依赖（Dependencies）
- `../ws-00-scope-and-route-freeze/`
- `../ws-03-v0-prompt-pack-and-composite-prototype/`
- `../ws-04-tokenization-and-shared-ui-foundation/`
