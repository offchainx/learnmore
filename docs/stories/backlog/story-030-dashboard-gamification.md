# Story-030: Dashboard & Gamification Basics

**状态**: Backlog ⚪
**优先级**: P1
**前置任务**: Story-029

## 1. 目标
让 Dashboard 首页“活”起来，引入基础游戏化机制（每日任务、连胜）。

## 2. 任务拆解
- [ ] **Dashboard Core Data**:
    - 统计并显示: `Total Study Time`, `Questions Done`, `Streak` (基于 `User` 表字段)。
    - 计算并显示: `Subject Progress` (基于 `UserProgress`)。
- [ ] **Daily Missions**:
    - 创建定时任务 (Cron) 每天凌晨为所有活跃用户生成 `DailyTask`。
    - 实现 "Claim Reward" Action：用户领取任务奖励，增加 XP。
- [ ] **Streak Logic**:
    - 每次用户完成核心动作（学完一课或做完一组题），检查并更新 `last_study_date` 和 `streak`。

## 3. 验收标准
- [ ] Dashboard 首页显示真实的用户数据。
- [ ] 完成任务后，点击领取，XP 增加，任务卡片变灰。
- [ ] 连续两天登录学习，Streak +1。
