#!/usr/bin/env python3
"""
批量优化Stories脚本
根据故事类型自动补充缺失的章节
"""

import os
from pathlib import Path

# 故事配置数据
STORIES = {
    "004-layout": {
        "title": "App Shell & Navigation",
        "phase": "Phase 1: Foundation",
        "goal": "构建全局响应式布局框架,包含侧边栏和导航",
        "time": "4-6 Hours",
        "points": 5,
        "depends": "Story-001, Story-002",
        "risk": "🟢 低",
        "type": "ui"
    },
    "005-seed-data": {
        "title": "Seed Data & Admin Tools",
        "phase": "Phase 1: Foundation",
        "goal": "预置系统基础数据,确保开发时有内容可展示",
        "time": "2-3 Hours",
        "points": 3,
        "depends": "Story-002",
        "risk": "🟢 低",
        "type": "data"
    },
    "006-course-tree": {
        "title": "Course Tree Component",
        "phase": "Phase 2: Course Engine",
        "goal": "实现支持无限层级的课程目录树组件",
        "time": "6-8 Hours",
        "points": 8,
        "depends": "Story-003, Story-004, Story-005",
        "risk": "🟡 中",
        "type": "ui"
    },
    "007-lesson-view": {
        "title": "Lesson Page Layout",
        "phase": "Phase 2: Course Engine",
        "goal": "构建学习页面的主布局",
        "time": "4-6 Hours",
        "points": 5,
        "depends": "Story-006",
        "risk": "🟢 低",
        "type": "ui"
    },
    "008-video-player": {
        "title": "Video Player Integration",
        "phase": "Phase 2: Course Engine",
        "goal": "集成专业视频播放器,支持流媒体和防盗链",
        "time": "6-8 Hours",
        "points": 8,
        "depends": "Story-007",
        "risk": "🟡 中",
        "type": "integration"
    },
    "009-progress-sync": {
        "title": "Learning Progress Sync",
        "phase": "Phase 2: Course Engine",
        "goal": "实时记录用户的学习进度",
        "time": "6-8 Hours",
        "points": 8,
        "depends": "Story-008",
        "risk": "🟡 中",
        "type": "logic"
    },
    "010-question-ui": {
        "title": "Question Rendering Engine",
        "phase": "Phase 3: Question Bank",
        "goal": "实现支持富文本和公式的题目渲染组件",
        "time": "6-8 Hours",
        "points": 8,
        "depends": "Story-002",
        "risk": "🟡 中",
        "type": "ui"
    },
    "011-quiz-mode": {
        "title": "Quiz Mode Logic",
        "phase": "Phase 3: Question Bank",
        "goal": "实现完整的答题流程控制",
        "time": "6-8 Hours",
        "points": 8,
        "depends": "Story-010",
        "risk": "🟡 中",
        "type": "logic"
    },
    "012-grading-engine": {
        "title": "Grading & Submission",
        "phase": "Phase 3: Question Bank",
        "goal": "后端判卷逻辑与结果反馈",
        "time": "6-8 Hours",
        "points": 8,
        "depends": "Story-011",
        "risk": "🔴 高",
        "type": "logic"
    },
    "013-error-book": {
        "title": "Error Book System",
        "phase": "Phase 3: Question Bank",
        "goal": "错题自动收集与复习",
        "time": "4-6 Hours",
        "points": 5,
        "depends": "Story-012",
        "risk": "🟢 低",
        "type": "logic"
    },
    "014-post-list": {
        "title": "Community Forum List",
        "phase": "Phase 4: Community",
        "goal": "展示社区帖子列表",
        "time": "6-8 Hours",
        "points": 5,
        "depends": "Story-003",
        "risk": "🟢 低",
        "type": "ui"
    },
    "015-post-editor": {
        "title": "Rich Text Post Editor",
        "phase": "Phase 4: Community",
        "goal": "实现功能完善的发帖编辑器",
        "time": "8-10 Hours",
        "points": 8,
        "depends": "Story-014",
        "risk": "🟡 中",
        "type": "integration"
    },
    "016-post-detail": {
        "title": "Post Detail & Comments",
        "phase": "Phase 4: Community",
        "goal": "帖子详情与互动",
        "time": "6-8 Hours",
        "points": 5,
        "depends": "Story-015",
        "risk": "🟡 中",
        "type": "ui"
    },
    "017-dashboard": {
        "title": "User Dashboard",
        "phase": "Phase 5: Growth & Stats",
        "goal": "个人学习数据概览",
        "time": "6-8 Hours",
        "points": 8,
        "depends": "Story-003, Story-009, Story-012",
        "risk": "🟡 中",
        "type": "ui"
    },
    "018-charts": {
        "title": "Data Visualization",
        "phase": "Phase 5: Growth & Stats",
        "goal": "可视化展示学习能力",
        "time": "6-8 Hours",
        "points": 5,
        "depends": "Story-017",
        "risk": "🟢 低",
        "type": "ui"
    },
    "020-profile": {
        "title": "Profile & Settings",
        "phase": "Phase 5: Growth & Stats",
        "goal": "用户资料管理",
        "time": "4-6 Hours",
        "points": 5,
        "depends": "Story-003",
        "risk": "🟢 低",
        "type": "ui"
    },
}

# 按类型定义的测试模板
VERIFICATION_TEMPLATES = {
    "ui": """### 功能性测试
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
- [ ] 图片懒加载正常工作 (如适用)""",

    "logic": """### 功能性测试
- [ ] 核心业务逻辑正确执行
- [ ] 边缘情况处理正常 (空数据、错误输入等)
- [ ] 错误提示清晰友好

### 单元测试
- [ ] 关键函数有单元测试覆盖 (覆盖率 > 80%)
- [ ] 测试用例包含正常流程和异常流程
- [ ] Mock 外部依赖 (数据库、API等)

### 性能测试
- [ ] 核心函数执行时间 < 50ms
- [ ] 批量操作性能可接受 (如批量判卷)
- [ ] 无内存泄漏""",

    "integration": """### 功能性测试
- [ ] 第三方服务集成成功 (API调用正常)
- [ ] 错误处理机制完善 (网络失败、超时等)
- [ ] 重试机制工作正常 (如适用)

### 集成测试
- [ ] E2E测试覆盖核心流程
- [ ] Mock服务器测试异常场景
- [ ] 真实环境测试通过

### 性能测试
- [ ] API请求响应时间 < 1s (P95)
- [ ] 支持合理的并发量 (根据需求定义)
- [ ] 超时设置合理 (防止长时间挂起)""",

    "data": """### 功能性测试
- [ ] 数据播种脚本可重复执行 (幂等性)
- [ ] 数据关联关系正确
- [ ] 数据格式符合Schema定义

### 数据质量测试
- [ ] 必填字段都有值
- [ ] 枚举值在允许范围内
- [ ] 日期/时间格式统一

### 性能测试
- [ ] 播种脚本执行时间 < 30s
- [ ] 数据库查询有正确索引
- [ ] 大批量插入使用事务"""
}

ROLLBACK_TEMPLATES = {
    "ui": """**触发条件**:
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
- 添加视觉回归测试""",

    "logic": """**触发条件**:
- 业务逻辑错误导致数据不一致
- 性能严重下降影响用户

**回滚步骤**:
```bash
# 1. 立即回滚代码
git revert <commit-hash>
vercel --prod

# 2. 检查数据一致性
# 运行数据修复脚本 (如适用)

# 3. 通知受影响用户
```

**预防措施**:
- 关键逻辑有完整单元测试
- Code Review重点关注边缘情况
- 分阶段发布 (金丝雀部署)""",

    "integration": """**触发条件**:
- 第三方服务不可用
- API调用失败率 > 5%

**回滚步骤**:
```bash
# 1. 回滚代码
git revert <commit-hash>

# 2. 启用降级方案
# 如: 使用缓存数据、禁用该功能

# 3. 监控第三方服务状态
```

**预防措施**:
- 设计降级方案 (Graceful Degradation)
- 添加服务健康检查
- 设置合理的超时和重试策略""",

    "data": """**触发条件**:
- 数据播种错误导致数据损坏
- 数据迁移失败

**回滚步骤**:
```bash
# 1. 从备份恢复数据库
# Supabase Dashboard -> Backups -> Restore

# 2. 或手动删除错误数据
DELETE FROM table_name WHERE created_at > '2025-12-09';

# 3. 重新运行修复后的脚本
pnpm db:seed
```

**预防措施**:
- 播种前自动备份数据库
- 使用事务确保原子性
- 在Dev环境先测试"""
}

def generate_story_content(story_id, config):
    """生成单个故事的完整内容"""

    story_type = config['type']
    verification = VERIFICATION_TEMPLATES.get(story_type, VERIFICATION_TEMPLATES['ui'])
    rollback = ROLLBACK_TEMPLATES.get(story_type, ROLLBACK_TEMPLATES['ui'])

    content = f"""# Story-{story_id}: {config['title']}

**Phase**: {config['phase']}
**Goal**: {config['goal']}
**预估时间**: {config['time']}
**Story Points**: {config['points']}
**前置依赖**: {config['depends']}
**负责人**: _待分配_

---

## 1. Objectives (实现目标)

*(从原文件保留)*

---

## 2. Tech Plan (技术方案)

*(从原文件保留)*

---

## 3. Verification (测试验收)

{verification}

---

## 4. Deliverables (交付物)

- ✅ 完整的功能实现
- ✅ 相关测试代码 (单元测试/集成测试)
- ✅ Git Commit: `"feat: implement {config['title'].lower()}"`
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

{rollback}

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
*(开发时填写)*

### 解决方案
*(开发时填写)*

### 可复用的代码片段
*(开发时填写)*

### 时间记录
- **预估时间**: {config['time']}
- **实际时间**: ___ hours
- **偏差分析**: ___

---

**创建时间**: 2025-12-09
**最后更新**: 2025-12-09
**状态**: Backlog ⚪
**风险等级**: {config['risk']}
"""

    return content


def main():
    """主函数"""
    base_dir = Path("docs/stories/backlog")

    print("📝 Stories批量优化脚本")
    print("=" * 60)
    print(f"\n待处理故事数: {len(STORIES)}")
    print("\n开始处理...\n")

    for story_id, config in STORIES.items():
        filename = f"story-{story_id}.md"
        filepath = base_dir / filename

        # 读取原文件
        if not filepath.exists():
            print(f"⚠️  {filename} 不存在,跳过")
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()

        # 检查是否已经优化过 (通过检查是否有"Definition of Done"章节)
        if "## 5. Definition of Done" in original:
            print(f"✅ {filename} 已优化,跳过")
            continue

        # 提取原有的 Objectives 和 Tech Plan
        objectives_start = original.find("## 1. Objectives")
        objectives_end = original.find("## 2. Tech")
        tech_start = objectives_end
        tech_end = original.find("## 3. Verification")

        if objectives_start > 0 and tech_start > 0:
            original_objectives = original[objectives_start:objectives_end].strip()
            original_tech = original[tech_start:tech_end].strip()
        else:
            print(f"⚠️  {filename} 格式不标准,跳过")
            continue

        # 生成新内容的模板
        new_content = generate_story_content(story_id, config)

        # 替换 Objectives 和 Tech Plan
        new_content = new_content.replace(
            "*(从原文件保留)*",
            original_objectives.replace("## 1. Objectives (实现目标)", "").strip(),
            1
        )
        new_content = new_content.replace(
            "*(从原文件保留)*",
            original_tech.replace("## 2. Tech Plan (技术方案)", "").strip(),
            1
        )

        # 写入新文件
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✅ {filename} 优化完成")

    print("\n" + "=" * 60)
    print("🎉 批量优化完成!")
    print(f"\n建议:")
    print("1. 检查生成的文件,根据具体Story微调内容")
    print("2. 特别关注高风险Story (012-grading-engine)")
    print("3. 运行: git diff 查看所有变更")
    print("\n需要手动补充的内容:")
    print("- 第2章 Tech Plan 的具体实现细节")
    print("- 第8章 Notes & Learnings 在开发时填写")


if __name__ == "__main__":
    main()
