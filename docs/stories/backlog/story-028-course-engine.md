# Story-028: Course Player Engine

**状态**: Backlog ⚪
**优先级**: P0 (Core)
**前置任务**: Story-025

## 1. 目标
实现核心的“学习闭环”中的“学”环节。让课程详情页和播放页具备真实逻辑。

## 2. 任务拆解
- [ ] **Course Data Fetching**:
    - 实现 `getSubject`, `getChapter`, `getLesson` Actions。
    - 在 `/course/[subjectId]` 渲染真实的目录树。
- [ ] **Video Player State**:
    - 记录视频播放进度 (每 30s 或 暂停时 触发 Action)。
    - 更新 `UserProgress.last_position`。
    - 视频播放结束时，标记 `UserProgress.is_completed = true`。
- [ ] **Navigation**:
    - 实现 "Next Lesson" 按钮，自动跳转到下一节。
    - 侧边栏的完成状态 (Checkmark) 实时更新。

## 3. 验收标准
- [ ] 进入课程页，显示数据库中的章节。
- [ ] 观看视频，中途退出，下次进入能从上次位置继续。
- [ ] 完成视频后，该节课显示“已完成”。
