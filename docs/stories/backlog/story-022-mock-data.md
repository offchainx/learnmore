# Story-022: 静态数据Mock与页面填充

**状态**: Backlog ⚪
**优先级**: P0 (Critical)
**预计工时**: 4-6小时
**前置依赖**: Story-021
**阻塞Story**: Story-024

---

## 1. 目标 (Objectives)

- [ ] 创建完整的Mock数据库
- [ ] 填充所有页面的数据展示
- [ ] 实现Mock API响应逻辑
- [ ] 确保数据一致性和真实性

---

## 2. 技术方案 (Tech Plan)

### Step 1: 创建Mock数据文件

```typescript
// src/lib/mock/index.ts
export const mockUser = {
  id: 'mock-user-1',
  email: 'demo@learnmore.com',
  username: 'Alex Zhang',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  grade: 8,
  level: 12,
  xp: 3850,
  streak: 12,
};

export const mockSubjects = [
  {
    id: 'math',
    name: '数学',
    icon: 'Calculator',
    color: 'blue',
    progress: 68,
    lastLesson: '二次函数的图像',
    masteryLevel: 85,
  },
  // ... 其他5个学科
];

export const mockLessons = [ /* ... */ ];
export const mockQuestions = [ /* ... */ ];
export const mockPosts = [ /* ... */ ];
export const mockLeaderboard = [ /* ... */ ];
```

### Step 2: 集成Mock数据到页面

```typescript
// src/app/dashboard/page.tsx
import { mockUser, mockSubjects } from '@/lib/mock';

export default function DashboardPage() {
  return <DashboardHome user={mockUser} subjects={mockSubjects} />;
}
```

### Step 3: 质量检查

```bash
pnpm lint && pnpm tsc --noEmit && pnpm build
```

---

## 3. 验收标准 (Verification)

- [ ] Dashboard首页显示真实感的用户数据
- [ ] 学科列表显示6个学科及进度
- [ ] 排行榜显示至少10条Mock数据
- [ ] 社区帖子列表显示至少20条帖子

---

## 4. 交付物 (Deliverables)

- `src/lib/mock/index.ts` - Mock数据库
- `src/lib/mock/users.ts` - 用户Mock数据
- `src/lib/mock/subjects.ts` - 学科Mock数据
- `src/lib/mock/lessons.ts` - 课程Mock数据
- `src/lib/mock/questions.ts` - 题目Mock数据
- `src/lib/mock/posts.ts` - 帖子Mock数据
- `src/lib/mock/leaderboard.ts` - 排行榜Mock数据

---

## 5. Definition of Done

- [x] 所有Objectives已完成
- [x] 所有Verification测试通过
- [x] 质量检查通过
- [x] 代码已commit
- [x] 文档已更新

---

**创建时间**: 2025-12-13
