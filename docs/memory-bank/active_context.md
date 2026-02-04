# Active Context

## Current Focus
- **Story**: [Story-045] 权限与订阅系统 (Permissions & Subscriptions)
- **Goal**: 构建基于 Tier (Subscription) 的权限管理系统，支持多层级功能访问控制与 Admin 覆写。
- **Current Task**: Task A: 核心引擎与配置 (Core Foundation) - **COMPLETED**

## Recent Changes
- **Story-045 Progress**:
    - **Task A (Core Foundation)**:
        - Schema verified (subscription fields & override table exist).
        - Defined `TierKey` & `FeatureKey` types.
        - Implemented `TIER_CONFIG` matrix.
        - Created `src/lib/permissions/engine.ts` (Effective Tier & Check Permission).
        - Created `src/actions/permissions.ts` (Server Actions).
        - Verified with `engine.test.ts`.

- **Story-044 Progress** (Previous):
    - Task A & B partially implemented.

## Next Steps
1.  **Story-045 Task B**: Implementation of UI Components (Upgrade Prompt, Locked Features).
2.  **Story-045 Task C**: Integration with existing features (Quiz, Analytics, etc.).

## Active Story Status
- **Story-045**: In Progress 🔄 (Task A Complete)
- **Story-044**: Paused ⏸️