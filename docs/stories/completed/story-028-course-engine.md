# Story-028: Course Player Engine

**状态**: Completed ✅
**优先级**: P0 (Core)
**前置任务**: Story-025

## 1. 目标
实现核心的"学习闭环"中的"学"环节。让课程详情页和播放页具备真实逻辑。

## 2. 任务拆解
- [x] **Course Data Fetching**:
    - 实现 `getSubjectDetails`, `getLessonData` Actions。
    - 在 `/course/[subjectId]` 渲染真实的目录树。
- [x] **Video Player State**:
    - 记录视频播放进度 (每 5s 防抖触发 Action)。
    - 更新 `UserProgress.lastPosition`。
    - 视频播放结束时,标记 `UserProgress.isCompleted = true` (进度 ≥ 90%)。
- [x] **Navigation**:
    - 实现 "Next Lesson" 按钮,自动跳转到下一节。
    - 侧边栏的完成状态 (Checkmark) 实时更新。

## 3. 验收标准
- [x] 进入课程页,显示数据库中的章节。
- [x] 观看视频,中途退出,下次进入能从上次位置继续。
- [x] 完成视频后,该节课显示"已完成"。

## 4. 实现总结

### 关键文件
- `src/actions/subject.ts:28-183` - 课程数据获取 (getSubjectDetails, getLessonData)
- `src/actions/progress.ts:7-66` - 进度更新逻辑 (updateUserLessonProgress)
- `src/components/business/LessonVideoPlayer.tsx` - 视频播放器组件 (进度上报)
- `src/components/business/CourseNavigation.tsx` - 课程导航组件 (下一课按钮)
- `src/app/course/[subjectId]/layout.tsx` - 课程布局 (侧边栏目录树)
- `src/app/course/[subjectId]/[lessonId]/page.tsx` - 课程详情页

### 核心实现亮点
1. **进度同步机制**:
   - 使用 5 秒防抖避免频繁数据库写入
   - 进度 ≥ 90% 自动标记完成 (用户体验优化)
   - 使用 `revalidatePath()` 实现 UI 实时更新

2. **Next Lesson 逻辑**:
   - 自动查找同科目下一节课 (支持跨章节)
   - 课程结束时显示友好提示

3. **用户体验**:
   - 从上次观看位置继续播放
   - 侧边栏完成状态实时反馈
   - 错误处理和 fallback UI

### 质量检查
- ✅ ESLint: 0 errors, 36 warnings (仅图片优化建议)
- ✅ TypeScript: 无类型错误
- ✅ Build: 生产构建成功
- ✅ 代码质量: 使用 Prisma + Server Actions + React Hooks

## 5. 遇到的问题与解决方案
- **问题**: ReactPlayer 类型定义问题
- **解决**: 使用 `any` 类型 + ESLint 注释抑制警告
