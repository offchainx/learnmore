# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：统一设计 token 已落盘
  当：访问 Dashboard、Leaderboard、Community
  则：按钮、卡片、空态与 CTA 风格一致。
- 给定：UI 基线调整完成
  当：执行回归
  则：不新增非预期数据写入。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| getDashboardStats | Dashboard 页面加载 | 正常：已登录；异常：未登录 | 未登录返回 null | 页面可渲染或展示空态 | 查询幂等 | dashboard action 日志 |  |  |
| getLeaderboard / getUserRank | 排行榜切换 | 正常：WEEKLY；异常：非法 period | 未登录隐藏个人信息 | 榜单可见，异常降级空态 | 查询幂等 | leaderboard action 日志 |  |  |
| getPosts | 社区列表加载 | 正常：分页参数；异常：超大 page | 未登录可读 | 返回分页数据或空列表 | 查询幂等 | community list 日志 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| Dashboard 首屏渲染 | users, user_attempts, daily_tasks | 统计字段 | SELECT count(*) FROM user_attempts WHERE user_id={{userId}}; | 渲染后重复同 SQL | 读操作不应引入异常写入 | 若有维护写入需可解释 |  |
| 排行榜周期切换 | leaderboard_entries | period、score | SELECT user_id, period, score FROM leaderboard_entries WHERE period=WEEKLY LIMIT 20; | 切换后查询 MONTHLY 与 ALL_TIME | 页面与查询一致 | 不适用 |  |
| 社区空态和列表态 | posts | id、created_at | SELECT id FROM posts ORDER BY created_at DESC LIMIT 10; | 渲染后重复查询 | 仅读取，不产生写入 | 不适用 |  |

## 发布检查
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
