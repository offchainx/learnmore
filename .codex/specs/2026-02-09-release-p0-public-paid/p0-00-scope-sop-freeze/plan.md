# 技术方案（Plan）

## 概览
- 子任务：P0-00 范围冻结与 SOP 建档
- 方案摘要：冻结 P0 范围并固化 SOP 四件套，作为后续任务统一门禁。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| N/A（文档任务） | 文档流程 | 文档完整性校验 | 文档可审阅或退回 | N/A | 审阅时间、审阅人、结论 |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| N/A | N/A | 无 | 文档建档与更新 | Git diff + 审阅记录 |

## 验证步骤（固定流程）
1. 本地：先跑成功路径，再跑失败与越权路径，记录 Action 输入输出与 SQL 前后快照。
2. 预发：复测同一批关键场景，验证幂等与并发行为，确认结果一致。
3. 回归：执行受影响页面最小冒烟，确认无阻断。

## 风险与回滚
- 触发回滚：核心路径阻断、数据写入异常、重复写入导致脏数据。
- 回滚步骤：回滚任务提交 -> 恢复旧入口或旧行为 -> 重新执行本地与预发冒烟。
- 观测要求：日志可定位 userId、action、result、timestamp。

## 开发启动条件
- 仅当用户在文档审阅后明确批准，才允许切换到开发实施阶段。

## 开发改动清单（必填）

### 开发单元映射
| 开发单元 | 文件/目录 | 输入 | 输出 | 验收证据 |
|---|---|---|---|---|
| 总计划重写 | .codex/specs/2026-02-09-release-p0-public-paid/* | P0 任务列表与依赖 | 可执行总计划文档 | 文档 diff + 审阅结论 |
| 子任务重写 | .codex/specs/.../p0-*/四件套 | 每个任务目标与边界 | 任务级开发说明 | 逐任务检查记录 |
| 门禁固化 | p0-*/tasks.md | 用户确认要求 | 开发前置门禁 | T-003 状态可见 |

### 必改文件
- .codex/specs/2026-02-09-release-p0-public-paid/spec.md
- .codex/specs/2026-02-09-release-p0-public-paid/plan.md
- .codex/specs/2026-02-09-release-p0-public-paid/tasks.md
- .codex/specs/2026-02-09-release-p0-public-paid/acceptance.md
- .codex/specs/2026-02-09-release-p0-public-paid/p0-*/spec.md
- .codex/specs/2026-02-09-release-p0-public-paid/p0-*/plan.md
- .codex/specs/2026-02-09-release-p0-public-paid/p0-*/tasks.md
- .codex/specs/2026-02-09-release-p0-public-paid/p0-*/acceptance.md

### 主要接口 / Server Actions
- N/A（文档治理任务）

### 主要数据表
- N/A（文档治理任务）

### 非目标
- 不做任何业务代码实现。

### 开发完成判定（DoD）
- 文档全覆盖且可执行。
