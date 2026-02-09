# Skills Registry（项目内）

## 目的
- 记录本项目已经稳定可复用的技能
- 将高频成功实践从 `iteration-log` 提炼为标准流程

## Skill 状态定义
- `draft`：草案，尚未验证稳定
- `trial`：试运行中，至少 2 次成功案例
- `stable`：稳定可复用，纳入默认流程
- `deprecated`：已废弃

## 当前技能清单
| name | status | trigger | output | source |
|---|---|---|---|---|
| spec-kickoff | trial | 新功能/重构任务启动 | 完整 spec 四件套 | `/.codex/specs/_template/` |
| session-close | stable | 每次会话结束 | 迭代日志 + 规则补丁 | `/.codex/workflows/session-close-checklist.md` |
| feature-radar-review | trial | 每周回顾 | adopt/hold/reject 决策 | `/.codex/features/radar.md` |

## 提炼规则
1. 连续 2 次以上“可复用且有效”的做法，才进入 `trial`
2. 进入 `trial` 后补全 `/.codex/skills/skill-template.md` 对应草案
3. 至少 2 周无负反馈，升级为 `stable`
4. 若出现回退或副作用，降级或 `deprecated`
