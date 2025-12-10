# Story-006-course-tree: Course Tree Component

**Phase**: Phase 2: Course Engine
**Goal**: 实现支持无限层级的课程目录树组件
**预估时间**: 6-8 Hours
**Story Points**: 8
**前置依赖**: Story-003, Story-004, Story-005
**负责人**: _待分配_

---

## 1. Objectives (实现目标)

- [ ] 创建 `CourseTree` 递归组件。
- [ ] 支持展开/折叠状态记忆。
- [ ] 高亮当前选中的章节。
- [ ] 展示章节的学习状态图标 (锁/完成/进行中)。

---

## 2. Tech Plan (技术方案)

- React: Recursive Rendering (组件调用自身)。
- Shadcn: `Collapsible` 或 `Accordion` 组件。
- Tailwind: 缩进样式处理。

---

## 3. Verification (测试验收)

### 功能性测试

- [ ] 组件在桌面端 (1920x1080) 正常渲染
- [ ] 组件在移动端 (375x667) 响应式显示
- [ ] 所有交互元素可点击且有视觉反馈
- [ ] 无控制台错误或警告

### 可访问性测试

- [ ] 键盘导航可用 (Tab键可遍历所有交互元素)
- [ ] 屏幕阅读器兼容 (使用语义化HTML标签)
- [ ] 色彩对比度符合 WCAG AA 标准

### 性能测试

- [ ] 组件首次渲染时间 < 100ms
- [ ] 无不必要的重渲染 (使用React DevTools验证)
- [ ] 图片懒加载正常工作 (如适用)

---

## 4. Deliverables (交付物)

- ✅ 完整的功能实现
- ✅ 相关测试代码 (单元测试/集成测试)
- ✅ Git Commit: `"feat: implement course tree component"`
- ✅ Preview URL (Vercel自动部署)

---

## 5. Definition of Done (完成标准)

### 代码质量

- [ ] 通过 ESLint 检查 (0 errors, 0 warnings)
- [ ] 通过 TypeScript 类型检查 (`pnpm tsc --noEmit`)
- [ ] 代码复杂度在合理范围 (关键函数 < 15行)
- [ ] 有必要的代码注释

### 测试覆盖

- [ ] 关键功能有测试覆盖
- [ ] 测试通过 (`pnpm test`)
- [ ] 手动测试所有验收标准

### 文档完整

- [ ] README 更新 (如有新功能需说明)
- [ ] API文档更新 (如有新接口)
- [ ] 代码中的 TODO 已处理或转为Issue

### 部署就绪

- [ ] Staging环境验证通过
- [ ] Performance检查通过 (Lighthouse/Web Vitals)
- [ ] 无安全漏洞 (运行 `pnpm audit`)

---

## 6. Rollback Plan (回滚预案)

**触发条件**:

- 组件渲染导致页面崩溃
- 严重的样式问题影响用户体验

**回滚步骤**:

```bash
# 1. 回滚到上一个稳定版本
git revert <commit-hash>

# 2. 重新部署
vercel --prod

# 3. 验证页面恢复正常
```

**预防措施**:

- 在Staging环境充分测试
- 使用Storybook隔离组件开发
- 添加视觉回归测试

---

## 7. Post-Completion Actions (完成后行动)

### 立即执行

- [ ] 将此文件从 `backlog/` 移至 `completed/`
- [ ] 更新项目进度 (README.md)
- [ ] 通知团队成员

### 可选执行

- [ ] 录制功能演示视频
- [ ] 写开发日志 (遇到的问题和解决方案)
- [ ] 提取可复用组件到组件库

### 监控设置

- [ ] 在 Sentry 设置错误追踪
- [ ] 在 Vercel Analytics 查看性能指标
- [ ] 记录基线数据 (用于后续对比)

---

## 8. Notes & Learnings (开发过程中填写)

### 遇到的坑

_(开发时填写)_

### 解决方案

_(开发时填写)_

### 可复用的代码片段

_(开发时填写)_

### 时间记录

- **预估时间**: 6-8 Hours
- **实际时间**: \_\_\_ hours
- **偏差分析**: \_\_\_

---

**创建时间**: 2025-12-09
**最后更新**: 2025-12-09
**状态**: Completed ✅
**风险等级**: 🟡 中

---

## 9. Component API Reference

### `<CourseTree />`

**Path**: `src/components/business/CourseTree.tsx`

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `chapters` | `CourseChapter[]` | Yes | Array of chapter objects (can be nested). |
| `selectedChapterId` | `string \| null` | Yes | The ID of the currently active chapter. |
| `onChapterSelect` | `(id: string) => void` | Yes | Callback function when a chapter is clicked. |
| `level` | `number` | No | Internal use for recursion indentation (default: 0). |

### `CourseChapter` Interface

```typescript
interface CourseChapter {
  id: string;
  title: string;
  isCompleted?: boolean; // Show checkmark icon
  isLocked?: boolean;    // Show lock icon & disable click
  children?: CourseChapter[]; // Nested chapters
}
```
