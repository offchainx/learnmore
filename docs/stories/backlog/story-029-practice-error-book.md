# Story-029: Practice & Error Book

**状态**: Backlog ⚪
**优先级**: P0 (Core)
**前置任务**: Story-028

## 1. 目标
实现“练习”与“反馈”闭环。包括做题、判分、错题记录与消除。

## 2. 任务拆解
- [ ] **Quiz Engine**:
    - 在 `LessonPlayer` 中渲染 Quiz 类型内容。
    - 提交答案时，调用 `submitAnswer` Action。
    - 自动判分，并写入 `UserAttempt` 表。
- [ ] **Error Book Logic**:
    - 如果答错，自动在 `ErrorBook` 表创建记录 (`mastery_level = 0`)。
    - 如果在错题本中答对，增加 `mastery_level`。
    - 当 `mastery_level >= 3`，从错题本“移除”（或标记为已掌握）。
- [ ] **Weakness Sniper**:
    - 在 Dashboard 实现“Weakness Sniper”卡片逻辑，读取 `ErrorBook` 数据。
    - 点击 "Fix" 按钮，直接进入练习模式。

## 3. 验收标准
- [ ] 做题后能立即看到对错。
- [ ] 错题自动出现在错题本页面。
- [ ] 在错题本中复习并答对后，熟练度提升。
