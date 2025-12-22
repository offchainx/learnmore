# Active Context

**Current Focus**: Story-028: Course Player Engine

## Context
Implementing the core "Learning Loop" by activating course and lesson pages with real data and progress tracking.
- Fetch real subject and chapter data from Prisma.
- Implement video progress synchronization (saving `last_position`).
- Implement lesson completion logic.

## Recent Changes
- Started Story-028.
- Finished Story-027.

## Next Steps
- [ ] Implement `getSubjectDetails` server action.
- [ ] Implement `getLessonData` server action.
- [ ] Create `updateVideoProgress` and `completeLesson` actions in `src/actions/progress.ts`.
- [ ] Update Course and Lesson pages to use real data.

## Active User Questions
- None.
