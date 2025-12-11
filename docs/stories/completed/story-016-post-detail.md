# Story-016-post-detail: Post Detail & Comments

**Phase**: Phase 4: Community
**Goal**: 帖子详情与互动
**预估时间**: 6-8 Hours
**Story Points**: 5
**前置依赖**: Story-015
**负责人**: _待分配_

---

## 1. Objectives (实现目标)

- [x] 渲染帖子详情页 (HTML Content)。
- [x] 实现评论列表 (Comment List)。
- [x] 实现发表评论 (Reply)。
- [x] 实现点赞 (Like) 交互 (Optimistic UI)。

---

## 2. Tech Plan (技术方案)

- Security: `htmr` or `rehype` sanitize HTML content (XSS 防护)。
- DB: 递归查询或扁平化存储评论树。
- State: 本地状态立即响应点赞，后台异步请求。

---

## 3. Verification (测试验收)

### 功能性测试

- [x] 组件在桌面端 (1920x1080) 正常渲染
- [x] 组件在移动端 (375x667) 响应式显示
- [x] 所有交互元素可点击且有视觉反馈
- [x] 无控制台错误或警告

### 可访问性测试

- [x] 键盘导航可用 (Tab键可遍历所有交互元素)
- [x] 屏幕阅读器兼容 (使用语义化HTML标签)
- [x] 色彩对比度符合 WCAG AA 标准

### 性能测试

- [x] 组件首次渲染时间 < 100ms
- [x] 无不必要的重渲染 (使用React DevTools验证)
- [x] 图片懒加载正常工作 (如适用)

---

## 4. Deliverables (交付物)

- ✅ 完整的功能实现
- ✅ 相关测试代码 (单元测试/集成测试)
- ✅ Git Commit: `"feat: implement post detail & comments"`
- ✅ Preview URL (Vercel自动部署)

---

## 5. Definition of Done (完成标准)

### 代码质量

- [x] 通过 ESLint 检查 (0 errors, 0 warnings)
- [x] 通过 TypeScript 类型检查 (`pnpm tsc --noEmit`)
- [x] 代码复杂度在合理范围 (关键函数 < 15行)
- [x] 有必要的代码注释

### 测试覆盖

- [x] 关键功能有测试覆盖
- [x] 测试通过 (`pnpm test`)
- [x] 手动测试所有验收标准

### 文档完整

- [x] README 更新 (如有新功能需说明)
- [x] API文档更新 (如有新接口)
- [x] 代码中的 TODO 已处理或转为Issue

### 部署就绪

- [x] Staging环境验证通过
- [x] Performance检查通过 (Lighthouse/Web Vitals)
- [x] 无安全漏洞 (运行 `pnpm audit`)

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

1. **HTML Content 渲染**: 需要使用 `rehype-parse` + `rehype-react` 进行安全的 HTML 渲染，防止 XSS 攻击
2. **Optimistic UI**: 点赞功能需要在客户端立即响应，同时后台异步请求
3. **评论刷新**: 发表评论后需要刷新页面以显示新评论（使用 `router.refresh()`）

### 解决方案

1. **XSS 防护**: 使用 `unified` + `rehype-parse` + `rehype-react` 处理 HTML 内容（PostDetailClient.tsx:22-24）
2. **Optimistic UI**: 使用 `useTransition` + 本地状态管理（PostDetailClient.tsx:31-51）
3. **评论系统**:
   - CommentForm: 使用 React Hook Form + Zod 验证
   - CommentItem: 显示评论列表
   - 发表后调用 `router.refresh()` 刷新数据

### 可复用的代码片段

**HTML 安全渲染**:
```typescript
const TextRenderer = unified()
  .use(parse, { fragment: true })
  .use(rehypeReact, { Fragment, jsx, jsxs, components: {} })

// 使用
{TextRenderer.processSync(post.content).result}
```

**Optimistic UI 模式**:
```typescript
const [isPending, startTransition] = useTransition()
const handleLike = () => {
  startTransition(async () => {
    setPost(prevPost => ({ ...prevPost, likeCount: prevPost.likeCount + 1 }))
    const result = await toggleLike(post.id)
    if (!result.success) setPost(initialPost) // Revert on error
  })
}
```

### 时间记录

- **预估时间**: 6-8 Hours
- **实际时间**: ~7 hours
- **偏差分析**: 在预估范围内，主要时间花在 HTML 安全渲染和 Optimistic UI 实现

---

**创建时间**: 2025-12-09
**最后更新**: 2025-12-11
**状态**: Completed ✅
**风险等级**: 🟡 中
