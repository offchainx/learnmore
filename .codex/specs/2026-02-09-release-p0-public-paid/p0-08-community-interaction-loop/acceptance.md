# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：用户进入社区列表和详情
  当：执行发帖、评论、点赞
  则：操作成功回显，列表与详情数据一致。
- 给定：重复点赞或取消点赞
  当：多次触发 toggleLike
  则：post_likes 与 posts.likeCount 保持一致。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| createPost | 新建页提交 | 正常：完整字段；异常：空标题 | 未登录应拒绝 | 成功返回 post；失败返回错误 | 重复提交可识别 | create post error 日志 |  |  |
| createComment | 详情页评论提交 | 正常：合法 postId；异常：不存在 postId | 未登录应拒绝 | 成功返回 comment | 重复提交可追踪 | create comment error 日志 |  |  |
| toggleLike | 点赞按钮 | 正常：已有帖子；异常：非法 postId | 未登录应拒绝 | liked 状态切换成功 | 连续点击最终一致 | toggle like error 日志 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 发帖 | posts | id、title、author_id | SELECT id, title, author_id FROM posts WHERE author_id={{userId}} ORDER BY created_at DESC LIMIT 5; | 发帖后重复查询 | 新帖出现且字段正确 | 删除测试帖后复测 |  |
| 评论 | comments | post_id、author_id、content | SELECT id, post_id FROM comments WHERE post_id={{postId}} ORDER BY created_at DESC LIMIT 5; | 评论后重复查询 | 评论数加一且内容正确 | 删除测试评论后复测 |  |
| 点赞联动 | post_likes, posts | user_id、post_id、like_count | 查询点赞关系与 like_count | 点赞和取消后分别查询 | 两表状态一致 | 恢复初始状态后复测 |  |

## 发布检查
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
