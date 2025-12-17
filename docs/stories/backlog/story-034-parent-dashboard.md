# Story-032: 家长监管看板

**状态**: Backlog ⚪
**优先级**: P1
**预计工时**: 8-10小时
**前置依赖**: Story-017 (学习仪表盘)
**技术难度**: 🟡 Medium

---

## 1. 目标

创建独立的家长视角Dashboard,实现宏观数据展示和监管功能。

- [ ] 家长角色权限系统
- [ ] 学习时长统计图表
- [ ] 专注度分析(番茄钟统计)
- [ ] 心愿单契约系统
- [ ] 同年级对比分析
- [ ] 微信通知推送

---

## 2. 技术方案

### 权限系统
```typescript
// Prisma Schema
enum UserRole {
  STUDENT
  PARENT
  TEACHER
  ADMIN
}

model User {
  id       String   @id
  role     UserRole @default(STUDENT)
  parentId String?  // 学生账号关联的家长ID
  parent   User?    @relation("ParentStudent", fields: [parentId], references: [id])
  children User[]   @relation("ParentStudent")
}
```

### 路由保护
```typescript
// src/app/parent-dashboard/layout.tsx
export default async function ParentLayout({ children }) {
  const user = await getUser();
  if (user.role !== 'PARENT') {
    redirect('/dashboard');
  }
  return <>{children}</>;
}
```

### 数据隐私原则
- ✅ 显示: 学习时长、专注度、科目进度、综合排名
- ❌隐藏: 具体错题内容、答题详情(保护学生隐私)

---

## 3. 核心组件

### 学习时长统计
```typescript
// src/components/parent/StudyTimeChart.tsx
import { BarChart } from 'recharts';

const data = await prisma.studySession.groupBy({
  by: ['date'],
  _sum: { duration: true },
  where: { userId: studentId, createdAt: { gte: startOfWeek } },
});
```

### 心愿单契约
```typescript
// 家长设定目标,学生完成后解锁奖励
model WishContract {
  id          String   @id
  studentId   String
  parentId    String
  goal        String   // "完成20道数学题"
  reward      String   // "周末去游乐园"
  deadline    DateTime
  isCompleted Boolean  @default(false)
}
```

---

## 4. 验收标准

- [ ] 家长账号无法查看学生错题详情
- [ ] 学习时长统计准确(误差 < 5%)
- [ ] 心愿单契约创建/完成流程正常
- [ ] 微信推送准时送达(每日20:00)

---

## 5. 交付物

- `src/app/parent-dashboard/page.tsx`
- `src/components/parent/StudyTimeChart.tsx`
- `src/components/parent/FocusAnalysis.tsx`
- `src/components/parent/WishContract.tsx`
- Prisma Migration (角色系统)

---

**创建时间**: 2025-12-16
