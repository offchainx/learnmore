# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：用户进入成就页
  当：加载概览与徽章列表
  则：展示真实统计和已解锁与未解锁状态。
- 给定：用户达到成就阈值
  当：触发 awardBadgeIfEligible
  则：仅首次授予并写入通知。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| getAchievementOverview | 成就页首屏 | 正常：已登录用户；异常：未登录 | 未登录返回 null | 成功返回统计结构 | 查询幂等 | achievement overview 日志 |  |  |
| listUserBadges | 成就页徽章列表 | 正常：已登录；异常：无 badge 数据 | 未登录返回空列表 | 返回解锁态与授予时间 | 查询幂等 | list badges 日志 |  |  |
| awardBadgeIfEligible | 练习或社区或 streak 事件 | 正常：达标；异常：未达标 | 内部链路触发 | 达标发放，未达标不写入 | 重复触发不重复发放 | award badge 日志 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 徽章初始化 | badges | code、name | SELECT code, name FROM badges ORDER BY created_at; | 调用后重复查询 | 默认徽章存在且不重复 | 清理测试数据后复测 |  |
| 自动授予 | user_badges | user_id、badge_id、awarded_at | SELECT user_id, badge_id FROM user_badges WHERE user_id={{userId}}; | 达标触发后再次查询 | 新增符合阈值的 badge | 重复触发记录数不增加 |  |
| 成就通知 | notifications | type、metadata | SELECT id, type, metadata FROM notifications WHERE user_id={{userId}} AND type=ACHIEVEMENT ORDER BY created_at DESC LIMIT 10; | 触发后再次查询 | 新通知与 badge 对齐 | 清理后复测 |  |

## 发布检查
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
