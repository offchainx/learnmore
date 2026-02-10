# P0 上线冒烟清单

## 核心功能
- [ ] 登录/登出可用
- [ ] Dashboard 可加载真实数据
- [ ] Practice 可拉题并提交判分
- [ ] Leaderboard 可切换周/月/总榜
- [ ] Community 可发帖、点赞、评论、打开详情
- [ ] Achievements 可展示真实徽章与统计
- [ ] Pricing 可发起 checkout（standard/smart_plus/premier）
- [ ] Stripe webhook 能写入订阅并幂等处理（同 event.id 重放仅处理一次）

## 异常场景
- [ ] 排行榜空数据展示空态
- [ ] 社区帖子不存在时有友好提示
- [ ] webhook 重放不会重复处理
- [ ] checkout 非法参数返回结构化错误（`{ ok: false, error: { code, message } }`）

## 观测
- [ ] 查看最近 24h 日志无大面积 5xx
- [ ] 支付成功率与失败率可追踪
- [ ] 关键 API 耗时在可接受范围

## 数据快照核对（本地 + 预发）
- [ ] 支付前后核对 `users`：`subscription_tier`、`subscription_start`、`subscription_end`
- [ ] 幂等重放核对 `notifications`：`link = stripe:event:<eventId>` 计数保持 1
- [ ] 推荐奖励链路核对 `referrals`：`status`、`reward_granted`、`reward_date`
- [ ] 保留本次验证 SQL 与结果摘要，回填到验收文档
