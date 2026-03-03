# P0 异常后台请求审计（T-007）

> 目标：定位并修复空闲状态下的异常请求，重点关注 `GET /api/auth/impersonate/status` 与 `POST /admin/feedback`。

## 修复前观测
| request | source_component | trigger_condition | interval/frequency | idle_1m_count | idle_3m_count | expected_or_not | evidence |
|---|---|---|---|---|---|---|---|
| `GET /api/auth/impersonate/status` |  |  |  |  |  |  |  |
| `POST /admin/feedback` |  |  |  |  |  |  |  |

## 修复动作
| action_id | request | change_summary | changed_files | expected_effect | status |
|---|---|---|---|---|---|
| FIX-001 | `GET /api/auth/impersonate/status` | 轮询条件收敛（路径/可见性/cookie） |  | 降低非必要轮询 | todo |
| FIX-002 | `POST /admin/feedback` | 通知轮询从 Server Action 改为 GET API |  | 消除空闲态周期性 POST | todo |

## 修复后观测
| request | source_component | trigger_condition | interval/frequency | idle_1m_count | idle_3m_count | result | evidence |
|---|---|---|---|---|---|---|---|
| `GET /api/auth/impersonate/status` |  |  |  |  |  |  |  |
| `POST /admin/feedback` |  |  |  |  |  |  |  |

## 结论
- 是否完成异常请求闭环：`todo`
- 是否满足 AC-05：`todo`
- 回归风险：`todo`
