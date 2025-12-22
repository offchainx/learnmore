# Story-030: Dashboard & Gamification Basics

**状态**: Completed ✅
**优先级**: P1
**前置任务**: Story-029

## 1. 目标
让 Dashboard 首页"活"起来,引入基础游戏化机制(每日任务、连胜)。

## 2. 任务拆解
- [x] **Dashboard Core Data**:
    - 统计并显示: `Total Study Time`, `Questions Done`, `Streak` (基于 `User` 表字段)。
    - 计算并显示: `Subject Progress` (基于 `UserProgress`)。
- [x] **Daily Missions**:
    - 创建定时任务 (Cron) 每天凌晨为所有活跃用户生成 `DailyTask` (Implement lazy generation on dashboard load instead)。
    - 实现 "Claim Reward" Action: 用户领取任务奖励,增加 XP。
- [x] **Streak Logic**:
    - 每次用户完成核心动作(学完一课或做完一组题),检查并更新 `last_study_date` 和 `streak`。

## 3. 验收标准
- [x] Dashboard 首页显示真实的用户数据。
- [x] 完成任务后,点击领取,XP 增加,任务卡片变灰。
- [x] 连续两天登录学习,Streak +1。

## 4. 实现总结

### 关键文件
- `src/actions/dashboard.ts:49-217` - Dashboard 数据获取和统计
- `src/actions/gamification.ts` - 每日任务奖励领取
- `src/lib/gamification-utils.ts` - 游戏化工具函数
  - `checkAndRefreshStreak` - 连胜检查和更新
  - `ensureDailyTasks` - 懒加载每日任务生成
  - `trackDailyProgress` - 每日任务进度追踪
- `src/components/dashboard/DailyMissions.tsx` - 每日任务卡片组件
- `src/components/dashboard/DashboardHome.tsx` - Dashboard 首页布局
- `src/actions/progress.ts:36-37` - 完成课程时更新 Streak 和任务进度
- `src/actions/quiz.ts:157-158` - 完成测验时更新 Streak 和任务进度

### 核心实现亮点

1. **Dashboard Core Data (真实数据统计)**:
   - 学习时长: 基于完成课程数量计算 (每课 30 分钟)
   - 题目数量: 统计 `UserAttempt` 总数
   - 正确率: 计算所有答题的正确率百分比
   - 连胜天数: 从 `User.streak` 字段读取
   - 科目进度: 按科目统计正确率
   - 薄弱点: 从 `ErrorBook` 读取前 5 个
   - 最近活动: 从 `UserProgress` 获取最近学习的课程

2. **Daily Missions (每日任务系统)**:
   - **懒加载生成**: 用户访问 Dashboard 时自动生成当天任务
   - **3 种默认任务**:
     - 每日登录 (50 XP, 自动完成)
     - 完成 1 节课程 (100 XP)
     - 完成 1 次测验 (80 XP)
   - **进度追踪**: 业务逻辑中自动调用 `trackDailyProgress`
   - **奖励领取**:
     - 使用 Prisma Transaction 确保原子性
     - 更新任务状态为 `isClaimed = true`
     - 增加用户 XP: `User.xp += task.xpReward`
     - 防止重复领取和未完成领取
   - **UI 排序**: 未领取已完成 > 进行中 > 已领取

3. **Streak Logic (连胜机制)**:
   - **触发时机**:
     - 完成课程 (`updateUserLessonProgress`)
     - 完成测验 (`submitQuiz`)
     - Dashboard 加载时 (`getDashboardStats`)
   - **逻辑规则**:
     - 首次学习: `streak = 1`
     - 同一天重复学习: 不更新
     - 连续天数 (昨天学习过): `streak += 1`
     - 中断 (超过 1 天): `streak = 1`
   - **数据存储**:
     - `User.lastStudyDate`: 最后学习日期
     - `User.streak`: 当前连胜天数

4. **数据集成**:
   - Dashboard 加载时:
     1. 生成每日任务 (`ensureDailyTasks`)
     2. 更新连胜状态 (`checkAndRefreshStreak`)
     3. 获取用户统计数据
     4. 获取每日任务列表
     5. 获取最近活动、薄弱点、科目进度
   - 所有数据在 Server Component 中预取,避免客户端加载闪烁

### 质量检查
- ✅ ESLint: 0 errors, 36 warnings (仅图片优化和 console 建议)
- ✅ TypeScript: 无类型错误
- ✅ Build: 生产构建成功
- ✅ 代码质量: Prisma Transaction + Server Actions + Client Component

## 5. 遇到的问题与解决方案
- **问题**: ArrowRight 未使用导入
- **解决**: 从 DashboardHome.tsx import 中移除
- **问题**: 如何避免每天凌晨 Cron 生成任务
- **解决**: 使用懒加载模式,Dashboard 加载时检查并生成当天任务
- **问题**: 如何防止连胜重复计算
- **解决**: 使用 `dayjs().isSame(now, 'day')` 检查是否同一天
