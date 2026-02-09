# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：榜单页面启用真实数据
  当：切换周榜、月榜、总榜
  则：列表与个人排名均来自 leaderboard_entries。
- 给定：用户练习得分变更
  当：触发 updateLeaderboardScore
  则：对应周期分数正确增加。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| getLeaderboard | 榜单页面加载与切换 | 正常：WEEKLY；异常：limit 超大 | 未登录可看榜单 | 返回有序列表或空榜 | 查询幂等 | leaderboard query 日志 |  |  |
| getUserRank | 我的排名区域 | 正常：已上榜用户；异常：未上榜用户 | 未登录返回 null | 已上榜返回 rank 与 score | 查询幂等 | user rank 日志 |  |  |
| updateLeaderboardScore | 练习提交后 | 正常：points>0；异常：points<=0 | 内部链路触发 | 分数增量正确 | 同事件重放需验证 | leaderboard update 日志 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 周期切换一致性 | leaderboard_entries | period、week_start、score | SELECT user_id, period, score FROM leaderboard_entries WHERE period=WEEKLY ORDER BY score DESC LIMIT 20; | 切换后查询 MONTHLY 与 ALL_TIME | 页面显示与 SQL 一致 | 不适用 |  |
| 个人排名核对 | leaderboard_entries | user_id、score | 查询目标用户当前分数 | 页面显示后再次查询 | getUserRank 与 SQL 计算一致 | 不适用 |  |
| 积分更新核对 | leaderboard_entries | score | 提交前记录分数 | 提交后再次查询 | 分数按 points 增加 | 回滚后复核 |  |

## 发布检查
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
