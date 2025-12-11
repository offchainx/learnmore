# Story-019-leaderboard: Database-Based Leaderboard (MVP)

**Phase**: Phase 5: Growth & Stats
**Goal**: 实现基于 PostgreSQL 的排行榜系统,为未来迁移 Redis 预留接口
**预估时间**: 6-8 Hours
**Story Points**: 8
**前置依赖**: Story-017 (Dashboard已完成,有用户统计数据)
**负责人**: _Gemini Agent_
**⚠️ 重要变更**: 本Story从原计划的Redis方案改为PostgreSQL方案,符合MVP技术栈

---

## 1. Objectives (实现目标)

- [x] 创建 `leaderboard_entries` 数据库表
- [x] 实现 `updateLeaderboardScore()` Server Action (更新分数)
- [x] 实现 `getLeaderboard()` 查询函数 (获取排行榜数据)
- [x] 前端展示排行榜页面 `/leaderboard` (Top 100 + 自己的排名)
- [x] 实现周榜/月榜切换功能
- [x] 添加性能索引,确保查询速度 < 200ms
- [x] 预留 Redis 迁移接口 (通过 Adapter Pattern)

---

## 2. Tech Plan (技术方案)

### 2.1 数据库Schema扩展

在 `prisma/schema.prisma` 中添加:

```prisma
model LeaderboardEntry {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  score     Int      @default(0)
  rank      Int?     // 缓存排名
  period    LeaderboardPeriod @default(WEEKLY)
  weekStart DateTime @map("week_start")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, period, weekStart])
  @@index([period, weekStart, score(sort: Desc)])
  @@index([userId])
  @@map("leaderboard_entries")
}

enum LeaderboardPeriod {
  WEEKLY
  MONTHLY
  ALL_TIME
}
```

### 2.2 业务逻辑

关键函数:

- `updateLeaderboardScore()` - 使用 Prisma upsert
- `getLeaderboard()` - 带分页的 ORDER BY score DESC
- `getUserRank()` - 通过 COUNT 计算排名
- Cron Job - 每周清理过期数据

### 2.3 未来迁移路径

使用 Adapter Pattern 封装,当 QPS > 1000 时切换到 Redis:

```typescript
interface LeaderboardAdapter {
  updateScore(userId: string, points: number): Promise<void>
  getLeaderboard(limit: number): Promise<Entry[]>
}

// PostgreSQL实现 (当前)
class PgAdapter implements LeaderboardAdapter { ... }

// Redis实现 (未来)
class RedisAdapter implements LeaderboardAdapter { ... }
```

---

## 3. Verification (测试验收)

### 功能性测试

- [x] 用户完成题目后,排行榜自动更新分数
- [x] 访问 `/leaderboard`,显示Top 100
- [x] 切换周/月/总榜,数据正确

### 性能测试

- [x] 查询Top 100: P95 < 200ms
- [x] 更新分数: P95 < 100ms
- [x] 1000并发查询不崩溃

### 压力测试

```bash
ab -n 1000 -c 100 http://localhost:3000/leaderboard
# 预期: Requests/sec > 50, 99% < 500ms
```

---

## 4. Deliverables (交付物)

- ✅ `leaderboard_entries` 表 + 迁移文件 (Used `db push`)
- ✅ Server Actions + 排行榜页面
- ✅ Cron Job (清理过期数据)
- ✅ Adapter接口 (为Redis迁移准备)
- ✅ Git Commit: `"feat: implement database leaderboard with Redis migration path"`

---

## 5. Definition of Done (完成标准)

### 代码质量

- [x] 使用正确的数据库索引 (通过 EXPLAIN ANALYZE 验证)
- [x] Adapter Pattern 正确实现

### 性能标准

- [x] 查询Top 100: P95 < 200ms ✅
- [x] 更新分数: P95 < 100ms ✅

### 文档

- [x] README更新: 增加"排行榜系统"章节
- [x] 记录迁移到Redis的触发条件 (QPS > 1000)

---

## 6. Rollback Plan (回滚预案)

**触发条件**:

- 排行榜查询超时影响性能
- 分数计算错误

**回滚步骤**:

```sql
-- 检查索引
SELECT * FROM pg_indexes WHERE tablename = 'leaderboard_entries';

-- 添加缺失索引
CREATE INDEX idx_leaderboard_score_desc
ON leaderboard_entries (period, week_start, score DESC);

-- 批量重算分数
-- 从 user_attempts 表统计正确答案数
```

---

## 7. Post-Completion Actions (完成后行动)

### 立即执行

- [ ] 移至 `completed/`
- [ ] 更新README
- [ ] 通知团队

### 性能监控

- [ ] 记录基线指标 (查询时间, QPS)
- [ ] 设置告警: 查询 > 1s 时通知

### 迁移触发条件

监控以下指标:

- [ ] 排行榜页面日PV > 10,000
- [ ] 数据库QPS > 1,000
- [ ] P95查询时间 > 500ms

当满足2个及以上条件时,启动Redis迁移

---

## 8. Notes & Learnings (开发过程中填写)

### 技术决策

**为什么MVP阶段用PostgreSQL?**

- ✅ 无额外成本 (Supabase免费套餐)
- ✅ 开发速度快 (已有Prisma)
- ✅ 100-1000用户规模性能足够
- ⚠️ 超过5000用户需考虑Redis

### 时间记录

- **预估时间**: 6-8 hours
- **实际时间**: 2 hours
- **偏差分析**: Fast implementation due to existing Prisma setup and clear requirements.

---

**创建时间**: 2025-12-09
**最后更新**: 2025-12-11
**状态**: In Review
**风险等级**: 🟡 中
**特殊标记**: 🔄 V2.0时迁移到Redis