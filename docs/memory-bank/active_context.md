# Active Context

## Current Focus
- **Story**: [Story-010] 练习中心重构与AI升级 (Practice Center Revamp)
- **Immediate Task**: Implement "Smart Document Parser" (PDF/Image Upload -> AI Parsing -> Question Extraction).
- **Goal**: Allow users to upload exam papers (PDF/Image), automatically extract questions via Gemini Vision, and review them before saving to the Question Bank.

## Recent Changes
- **Fix (Critical)**: Resolved Supabase Auth Trigger (`on_auth_user_created`) failure.
    - Cause: Incorrect column name (`raw_user_metadata` vs `raw_user_meta_data`) and missing Enum type casting.
    - Solution: Recreated trigger/function via `005_fix_auth_trigger.sql` (and manual SQL Editor execution) with robust error handling and type safety.
- Updated `story-010` to include Image upload support and refined parsing logic using Gemini Vision.
- Updated `story-010` implementation steps to reflect the new technical plan.

## Next Steps
1.  **Plan**: Create detailed implementation plan for the Smart Parser (Backend API + Frontend Upload/Preview).
2.  **Backend**: Implement `DocumentExtractionService` and `/api/practice/parse-document`.
3.  **Frontend**: Create Upload Component and Parsed Result Editor.

## Active Story Status
- **Story-010**: In Progress (Phase 3 prioritized).
