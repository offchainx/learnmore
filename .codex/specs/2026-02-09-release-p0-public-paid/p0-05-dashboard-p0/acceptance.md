# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：用户进入 Dashboard
  当：页面加载统计数据
  则：仅展示真实数据卡片与有效 CTA。
- 给定：同一用户重复刷新页面
  当：触发内部维护 action
  则：daily_tasks 与 streak 不发生重复异常写入。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| getDashboardStats | Dashboard 访问 | 正常：已登录；异常：未登录 | 未登录返回 null | 成功返回结构化数据 | 查询幂等 | dashboard action 日志 |  |  |
| ensureDailyTasks | 首屏加载内部调用 | 正常：今日无任务；异常：已有任务 | 仅登录用户触发 | 首次创建，后续不重复 | 同日幂等 | daily task 日志 |  |  |
| checkAndRefreshStreak | 首屏加载内部调用 | 正常：跨日；异常：同日 | 仅登录用户触发 | 跨日加一，同日不变 | 同日幂等 | streak 日志 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 初始化每日任务 | daily_tasks | user_id、date、type | SELECT user_id, date, type, count(*) FROM daily_tasks WHERE user_id={{userId}} AND date::date=current_date GROUP BY 1,2,3; | 首次与二次加载后各执行一次 | 二次加载计数不增加 | 删除测试数据后复测 |  |
| streak 刷新 | users | streak、last_study_date | SELECT streak, last_study_date FROM users WHERE id={{userId}}; | 页面刷新后再次查询 | 同日不重复增长 | 手动回退后复测 |  |
| 统计一致性 | user_attempts, error_book | 数量字段 | 查询 attempts 与 error 数量 | 页面加载后截图对比 | 页面显示与 SQL 一致 | 不适用 |  |

## 发布检查
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
