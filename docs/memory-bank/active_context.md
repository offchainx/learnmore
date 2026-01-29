# Active Context

## Current Focus
- **Story**: [Story-044] 题目全生命周期管理 (Content Pipeline)
- **Goal**: 建立从源文件到数据库的标准题目录入、处理、打标与审核流程。
- **Current Task**: Implementing Content Pipeline (Task B: OCR & Processing).

## Recent Changes
- **Story-044 Progress**:
    - Task A (Data Foundation): Schema updated, seed data verification complete.
    - Task B (Processing): PDF processing support added to OCR service.
- **Story-043 Completed**:
    - Refactored `QuestionBankView` into modular components.
    - Implemented `SmartDrill`, `ErrorWiper`, `MockArena` modes.
    - Integrated real data visualization (`KnowledgeHive`, `Forecast`).
    - Cleaned up lint errors and fixed build issues.
- **Documentation**:
    - Archived `story-043` to `completed/`.
    - Created `story-044` (Active) and `story-045` (Backlog).

## Next Steps
1.  **Analyze Schema**: Review `schema.prisma` for `QuestionGroup` support (Composite Questions).
2.  **Design Ingestion Flow**: Define the OCR -> Structure -> Verify workflow.
3.  **Implement**: Start with database migration for Story-044.

## Active Story Status
- **Story-044**: Planning 📅
- **Story-043**: Completed ✅
