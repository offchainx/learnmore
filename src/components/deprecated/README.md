# Deprecated Components

This directory contains components that have been replaced or refactored during the Feature Audit process.

## Purpose

These files are kept for:
- Historical reference
- Rollback capability if needed
- Understanding the evolution of the codebase

## Important Notes

- **DO NOT** import these components in new code
- These components may not be maintained or updated
- They will be permanently removed in a future cleanup phase

---

## Deprecation Log

### 2026-02-06: Leaderboard Module Refactoring

**Deprecated File**: `dashboard/views/LeaderboardView.tsx`

**Reason**: Single-file monolithic component (380 lines) refactored into modular architecture

**Replacement**:
- New location: `src/components/leaderboard/LeaderboardView.tsx`
- Architecture:
  ```
  components/leaderboard/
  ├── LeaderboardView.tsx (Main container)
  ├── components/
  │   ├── TierRoadmap.tsx
  │   ├── SeasonBanner.tsx
  │   ├── Podium.tsx
  │   ├── LeaderboardList.tsx
  │   ├── XPBreakdown.tsx
  │   ├── DailyQuests.tsx
  │   └── RivalWatch.tsx
  └── mock-data.ts
  ```

**Migration Notes**:
- All import paths updated to point to new location
- Functionality unchanged, only structural refactoring
- Mock data extracted to separate file for maintainability
