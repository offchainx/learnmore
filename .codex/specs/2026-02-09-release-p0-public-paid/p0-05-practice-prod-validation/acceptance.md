# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：用户完成一组练习提交
  当：调用 submitQuiz
  则：判分结果正确，exam_records、user_attempts、error_book 同步更新。
- 给定：用户达到成就阈值
  当：练习提交触发 awardBadgeIfEligible
  则：成就只授予一次且可在页面展示。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| submitQuiz | Practice 提交 | 正常：合法答案集；异常：未登录或题目不存在 | 未登录应返回 Unauthorized | 成功返回分数，异常返回错误 | 重放不应制造重复脏数据 | submit quiz error 日志 |  |  |
| updateLeaderboardScore | submitQuiz 后置 | 正常：correctCount>0；异常：points=0 | 内部链路触发 | 成功更新榜单 | 重放需验证积分一致 | leaderboard update 日志 |  |  |
| awardBadgeIfEligible | submitQuiz 后置 | 正常：达标；异常：未达标 | 内部链路触发 | 达标发徽章，未达标不发 | user_badges 唯一约束防重 | achievement 日志 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 完成一次练习 | exam_records | id、user_id、score | SELECT id, user_id, score FROM exam_records WHERE user_id={{userId}} ORDER BY created_at DESC LIMIT 3; | 提交后再次查询 | 新增 1 条记录且分数合理 | 删除测试记录后复测 |  |
| 作答明细写入 | user_attempts | question_id、is_correct、exam_record_id | SELECT count(*) FROM user_attempts WHERE exam_record_id={{examRecordId}}; | 提交后再次查询 | 数量等于提交题数 | 清理后复测 |  |
| 错题本更新 | error_book | mastery_level、updated_at | 查询对应题目 mastery | 提交后再次查询 | 正确题归零，错误题递增 | 人工回退后复测 |  |
| 榜单积分更新 | leaderboard_entries | period、score | 查询三周期 score | 提交后再次查询 | WEEKLY、MONTHLY、ALL_TIME 同步变化 | 回滚提交后复核 |  |

## 发布检查
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
