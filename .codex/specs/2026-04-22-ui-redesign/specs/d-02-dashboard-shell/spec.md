id: SPEC-20260422-D-02
title: d-02 dashboard shell
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-22

# 背景
- dashboard shell 是登录后全域 UI 的承载层，导航、信息密度、壳层语言必须先统一。

# 目标（Goals）
- 冻结登录后主壳层、导航和 page shell 原则
- 建立 dashboard / mobile shell 的统一规则
- 清理明显不符合新方向的旧装饰

# 非目标（Non-Goals）
- 不在本阶段深入具体业务模块内容
- 不改动业务路由逻辑

# 稳定边界
- 壳层优先服务可读性和导航效率
- 桌面与移动使用同一设计语言，不做两套品牌

# 依赖（Dependencies）
- `../ws-04-tokenization-and-shared-ui-foundation/`
- `../../harness/component-audit.md`
- `../../harness/route-inventory.md`
