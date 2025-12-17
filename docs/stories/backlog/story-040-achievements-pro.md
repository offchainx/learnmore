# Story-038: 成就系统 2.0

**状态**: Backlog ⚪
**优先级**: P1
**预计工时**: 6-8小时
**前置依赖**: Story-020 (个人中心)
**技术难度**: 🟡 Medium

---

## 1. 目标

升级成就系统,实现限时成就、稀缺徽章和社交展示功能。

- [ ] 限时成就(FOMO营销)
- [ ] 成就稀缺度展示(获得人数%)
- [ ] 成就墙(个人主页展示)
- [ ] 社交分享(生成成就卡片图片)
- [ ] 成就解锁动画

---

## 2. 技术方案

### 数据模型
```prisma
model Achievement {
  id          String   @id
  name        String   // "首杀" "连续学习7天"
  description String
  icon        String   // 徽章图标URL
  rarity      Rarity   // 稀缺度
  isLimited   Boolean  @default(false) // 是否限时
  startDate   DateTime?
  endDate     DateTime?
  condition   Json     // 解锁条件(规则引擎)
  createdAt   DateTime @default(now())
}

model UserAchievement {
  id            String      @id
  userId        String
  achievementId String
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  unlockedAt    DateTime    @default(now())
  isDisplayed   Boolean     @default(true) // 是否在个人主页展示

  @@unique([userId, achievementId])
}

enum Rarity {
  COMMON    // 普通 (>50%获得)
  RARE      // 稀有 (10-50%)
  EPIC      // 史诗 (<10%)
  LEGENDARY // 传说 (<1%)
}
```

### 成就规则引擎
```typescript
// src/lib/achievements/rule-engine.ts
const achievementRules = [
  {
    id: 'first-login',
    name: '初来乍到',
    condition: { type: 'LOGIN_COUNT', value: 1 },
  },
  {
    id: 'streak-7',
    name: '七日修行',
    condition: { type: 'STREAK_DAYS', value: 7 },
  },
  {
    id: 'perfect-score',
    name: '满分学霸',
    condition: { type: 'QUIZ_SCORE', value: 100 },
  },
  {
    id: 'speed-demon',
    name: '闪电侠',
    condition: { type: 'ANSWER_TIME', operator: '<', value: 10 }, // 10秒内答对
    isLimited: true,
    endDate: new Date('2025-12-31'),
  },
];

export async function checkAchievements(userId: string, event: UserEvent) {
  for (const rule of achievementRules) {
    const isUnlocked = evaluateCondition(rule.condition, event);

    if (isUnlocked) {
      const existing = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: rule.id } },
      });

      if (!existing) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: rule.id },
        });

        // 触发解锁动画
        await triggerAchievementAnimation(userId, rule);
      }
    }
  }
}

const evaluateCondition = (condition, event) => {
  switch (condition.type) {
    case 'LOGIN_COUNT':
      return event.loginCount >= condition.value;
    case 'STREAK_DAYS':
      return event.streakDays >= condition.value;
    case 'QUIZ_SCORE':
      return event.score === condition.value;
    case 'ANSWER_TIME':
      return condition.operator === '<'
        ? event.answerTime < condition.value
        : event.answerTime > condition.value;
    default:
      return false;
  }
};
```

### 稀缺度计算
```typescript
// src/lib/achievements/rarity.ts
export async function calculateRarity(achievementId: string) {
  const totalUsers = await prisma.user.count();
  const unlockedCount = await prisma.userAchievement.count({
    where: { achievementId },
  });

  const percentage = (unlockedCount / totalUsers) * 100;

  if (percentage > 50) return 'COMMON';
  if (percentage > 10) return 'RARE';
  if (percentage > 1) return 'EPIC';
  return 'LEGENDARY';
}
```

### 社交分享图片生成
```typescript
// src/actions/generate-achievement-card.ts
'use server';

import { createCanvas, loadImage } from 'canvas';

export async function generateAchievementCard(achievementId: string) {
  const achievement = await prisma.achievement.findUnique({ where: { id: achievementId } });

  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, 800, 600);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 600);

  // 徽章图标
  const icon = await loadImage(achievement.icon);
  ctx.drawImage(icon, 300, 100, 200, 200);

  // 文字
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(achievement.name, 400, 400);

  // 转换为Buffer
  const buffer = canvas.toBuffer('image/png');

  // 上传到Supabase
  const { data } = await supabase.storage.from('achievements').upload(
    `${achievementId}.png`,
    buffer
  );

  return data.publicUrl;
}
```

---

## 3. UI组件

### 成就墙
```typescript
// src/components/achievements/AchievementWall.tsx
export function AchievementWall({ userId }) {
  const achievements = await getUserAchievements(userId);

  return (
    <div className="grid grid-cols-4 gap-4">
      {achievements.map(ach => (
        <AchievementBadge
          key={ach.id}
          achievement={ach}
          rarity={calculateRarity(ach.achievementId)}
        />
      ))}
    </div>
  );
}
```

### 解锁动画
```typescript
// src/components/achievements/UnlockAnimation.tsx
export function UnlockAnimation({ achievement }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.8 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
    >
      <div className="text-center">
        <motion.img
          src={achievement.icon}
          alt={achievement.name}
          className="w-48 h-48 mx-auto"
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 2 }}
        />
        <h1 className="text-4xl font-bold text-white mt-8">
          成就解锁!
        </h1>
        <p className="text-2xl text-slate-300">{achievement.name}</p>
      </div>
    </motion.div>
  );
}
```

### 限时成就倒计时
```typescript
// src/components/achievements/LimitedBadge.tsx
export function LimitedBadge({ achievement }) {
  const timeLeft = differenceInDays(achievement.endDate, new Date());

  return (
    <div className="relative">
      <AchievementBadge achievement={achievement} />
      {achievement.isLimited && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded text-xs">
          剩余 {timeLeft} 天
        </div>
      )}
    </div>
  );
}
```

---

## 4. 验收标准

- [ ] 成就解锁逻辑准确(无误触发)
- [ ] 稀缺度计算正确
- [ ] 限时成就过期后自动隐藏
- [ ] 社交分享图片生成成功
- [ ] 解锁动画效果流畅

---

## 5. 交付物

- `src/lib/achievements/rule-engine.ts`
- `src/lib/achievements/rarity.ts`
- `src/actions/generate-achievement-card.ts`
- `src/components/achievements/AchievementWall.tsx`
- `src/components/achievements/UnlockAnimation.tsx`
- Prisma Migration (Achievement, UserAchievement)

---

**创建时间**: 2025-12-16
