# Story-036: 每日任务系统

**状态**: Backlog ⚪
**优先级**: P1
**预计工时**: 4-6小时
**前置依赖**: None
**技术难度**: 🟢 Easy

---

## 1. 目标

实现每日任务和连续签到系统,提升用户日活。

- [ ] 每日任务(3题/1课/1帮助)
- [ ] 连续签到奖励递增
- [ ] 任务每日0点重置
- [ ] 签到中断重新计数
- [ ] 奖励自动发放(积分/徽章)

---

## 2. 技术方案

### 数据模型
```prisma
model DailyTask {
  id          String   @id
  userId      String
  date        DateTime @default(now()) // 任务日期
  tasks       Json     // 任务列表与完成状态
  isCompleted Boolean  @default(false)

  @@unique([userId, date])
}

model CheckInRecord {
  id           String   @id
  userId       String
  streak       Int      @default(1) // 连续签到天数
  lastCheckIn  DateTime @default(now())
}
```

### 任务定义
```typescript
const dailyTasks = [
  { id: 'answer-3-questions', name: '完成3道题目', reward: 10, progress: 0, target: 3 },
  { id: 'watch-1-lesson', name: '观看1节课程', reward: 20, progress: 0, target: 1 },
  { id: 'help-1-student', name: '帮助1位同学', reward: 15, progress: 0, target: 1 },
];
```

### 任务进度更新
```typescript
// src/actions/update-task-progress.ts
'use server';

export async function updateTaskProgress(userId: string, taskId: string) {
  const today = startOfDay(new Date());

  const dailyTask = await prisma.dailyTask.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, tasks: dailyTasks },
    update: {},
  });

  const tasks = dailyTask.tasks as typeof dailyTasks;
  const task = tasks.find(t => t.id === taskId);

  if (task && task.progress < task.target) {
    task.progress++;

    // 检查是否完成
    if (task.progress === task.target) {
      await awardPoints(userId, task.reward);
    }

    await prisma.dailyTask.update({
      where: { id: dailyTask.id },
      data: { 
        tasks,
        isCompleted: tasks.every(t => t.progress >= t.target),
      },
    });
  }
}
```

### 签到系统
```typescript
// src/actions/check-in.ts
'use server';

export async function checkIn(userId: string) {
  const record = await prisma.checkInRecord.findUnique({ where: { userId } });
  const now = new Date();

  if (!record) {
    // 首次签到
    await prisma.checkInRecord.create({
      data: { userId, streak: 1, lastCheckIn: now },
    });
    await awardPoints(userId, 5);
    return { streak: 1, reward: 5 };
  }

  const lastCheckIn = new Date(record.lastCheckIn);
  const daysDiff = differenceInDays(now, lastCheckIn);

  if (daysDiff === 0) {
    throw new Error('今日已签到');
  }

  if (daysDiff === 1) {
    // 连续签到
    const newStreak = record.streak + 1;
    const reward = Math.min(5 + newStreak * 2, 50); // 最高50分

    await prisma.checkInRecord.update({
      where: { userId },
      data: { streak: newStreak, lastCheckIn: now },
    });

    await awardPoints(userId, reward);
    return { streak: newStreak, reward };
  }

  // 中断,重新开始
  await prisma.checkInRecord.update({
    where: { userId },
    data: { streak: 1, lastCheckIn: now },
  });

  await awardPoints(userId, 5);
  return { streak: 1, reward: 5 };
}
```

### Cron Job (每日重置)
```typescript
// src/app/api/cron/reset-daily-tasks/route.ts
export async function GET() {
  const yesterday = subDays(startOfDay(new Date()), 1);

  // 删除昨天的任务记录
  await prisma.dailyTask.deleteMany({
    where: { date: yesterday },
  });

  return Response.json({ success: true });
}
```

---

## 3. UI组件

### 每日任务卡片
```typescript
// src/components/tasks/DailyTaskCard.tsx
export function DailyTaskCard({ task }) {
  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">{task.name}</p>
          <p className="text-sm text-slate-400">
            进度: {task.progress}/{task.target}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span>+{task.reward}</span>
        </div>
      </div>
      <Progress value={(task.progress / task.target) * 100} />
    </div>
  );
}
```

### 签到日历
```typescript
// src/components/checkin/CheckInCalendar.tsx
export function CheckInCalendar({ streak }) {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  return (
    <div className="flex gap-2">
      {last7Days.map((day, i) => (
        <div
          key={i}
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${i < streak ? 'bg-green-500' : 'bg-slate-700'}
          `}
        >
          {format(day, 'd')}
        </div>
      ))}
    </div>
  );
}
```

---

## 4. 验收标准

- [ ] 任务每日0点准时重置
- [ ] 签到中断后streak重置为1
- [ ] 连续签到奖励递增正确
- [ ] 完成所有任务后显示"全部完成"徽章
- [ ] 奖励积分正确发放到用户账户

---

## 5. 交付物

- `src/actions/update-task-progress.ts`
- `src/actions/check-in.ts`
- `src/components/tasks/DailyTaskCard.tsx`
- `src/components/checkin/CheckInCalendar.tsx`
- `src/app/api/cron/reset-daily-tasks/route.ts`
- Prisma Migration (DailyTask, CheckInRecord)

---

**创建时间**: 2025-12-16
