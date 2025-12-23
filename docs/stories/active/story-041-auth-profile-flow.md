# Story-041: Dashboard-First Onboarding & Auth Flow

## 1. Background (背景)
原计划采用独立的 `/onboarding` 页面，但为了降低进入门槛并复用现有 UI，决定采用 **Contextual Onboarding** 策略。
用户注册后直接进入 Dashboard，通过完成预置的 **Today's Tasks (新手任务)** 来完善资料、设置目标并进行能力评估。

## 2. Goals (目标)
1.  **Zero Friction Entry**: 注册后立即进入 Dashboard，无强制跳转。
2.  **Gamified Setup**: 将资料填写包装为“赚取 XP”的任务。
3.  **Graceful Degradation**: Dashboard 各模块需适配“无年级/无数据”的冷启动状态。
4.  **Acquisition Tracking**: 保持原计划的来源追踪功能。

## 3. Tech Plan (技术方案)

### 3.1 Data Schema Updates (Retained)
-   `User` & `UserSettings`: 依然需要增加 tracking 和 settings 字段 (已完成)。
-   `DailyTaskType`: 需增加枚举值 `SETUP_PROFILE`, `ASSESSMENT` 以区分新手任务。

### 3.2 Data Seeding (Auth Trigger)
-   修改 `001_auth_trigger.sql`。
-   新用户注册时，自动向 `daily_tasks` 插入 3 条记录：
    1.  `SETUP_PROFILE` (Setup Profile & Avatar)
    2.  `SET_GOALS` (Set Time & Weakness)
    3.  `ASSESSMENT` (Take Mini-Test)

### 3.3 Dashboard Adaptation
-   **DailyMissions Component**:
    -   识别特殊任务类型。
    -   点击任务 -> 打开对应的 Dialog (复用 `ProfileForm`, `SettingsForm`, `QuestionCard`)。
    -   任务完成检测：监听数据变更或手动触发 `completeTask` Server Action。
-   **Empty States**:
    -   Course Recommendation: `if (!user.grade) return <SetupGradePlaceholder />`
    -   Error Book: `if (user.errorBook.length === 0) return <AssessmentPlaceholder />`

### 3.4 Integration Steps

#### Phase 1: Database & Tracking (Partially Done)
-   [x] Schema Update (`utm_source`, etc.)
-   [ ] Update `DailyTaskType` enum in Schema.
-   [ ] Update `001_auth_trigger.sql` to seed tasks.

#### Phase 2: Auth Stability
-   [ ] Remove any redirect logic in Middleware (Stay on Dashboard).
-   [ ] Verify Session Persistence.

#### Phase 3: Dashboard Logic
-   [ ] Update `DailyMissions.tsx` to handle actions (Dialogs).
-   [ ] Create/Refactor `ProfileDialog`, `AssessmentDialog`.
-   [ ] Implement Empty States for Widgets.

## 4. Deliverables (交付物)
-   更新后的 Supabase Auth Trigger。
-   支持交互操作的 Daily Missions 组件。
-   Dashboard 的冷启动（无资料）适配。

## 5. Definition of Done (完成标准)
-   新用户注册后直接看到 Dashboard。
-   Dashboard 显示 3 个新手任务。
-   点击任务能弹窗并正常保存数据。
-   保存数据后，任务状态自动变更为“已领取/已完成”，XP 增加。