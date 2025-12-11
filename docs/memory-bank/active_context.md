# Active Context

## Current Focus
Story 019: Leaderboard System (MVP)

## Goals
- Create `LeaderboardEntry` model in Prisma schema.
- Implement server actions for updating and fetching leaderboard scores.
- Build the leaderboard UI with weekly/monthly/all-time views.
- Ensure performance with proper indexing and an adapter pattern for future Redis migration.

## Recent Changes
- Started Story 019.
- Moved `story-019-leaderboard.md` to `active/`.

## Next Steps
1. Update `prisma/schema.prisma` with `LeaderboardEntry` model.
2. Generate Prisma client and create migration.
