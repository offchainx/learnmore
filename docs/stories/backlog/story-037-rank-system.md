# Story-035: 段位系统

**状态**: Backlog ⚪
**优先级**: P1 (Phase 9 - 社交竞技核心)
**预计工时**: 6-8小时
**前置依赖**: Story-019 (排行榜系统)
**技术难度**: 🟡 Medium

---

## 1. 目标

仿王者荣耀段位系统,每科独立段位,实现晋升/降级机制。

- [ ] 段位等级系统(青铜 → 钻石 → 王者)
- [ ] 段位图标与徽章
- [ ] 晋升/降级逻辑(基于积分)
- [ ] 赛季制(每月重置)
- [ ] 段位晋级动画效果

---

## 2. 技术方案

### 段位体系设计
```typescript
enum Rank {
  BRONZE = 'BRONZE',      // 青铜 (0-499分)
  SILVER = 'SILVER',      // 白银 (500-999)
  GOLD = 'GOLD',          // 黄金 (1000-1499)
  PLATINUM = 'PLATINUM',  // 铂金 (1500-1999)
  DIAMOND = 'DIAMOND',    // 钻石 (2000-2499)
  MASTER = 'MASTER',      // 大师 (2500-2999)
  KING = 'KING',          // 王者 (3000+)
}

model UserRank {
  id        String   @id
  userId    String
  subjectId String   // 每科独立段位
  rank      Rank
  score     Int      // 积分
  season    String   // 赛季ID (如 "2025-01")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, subjectId, season])
}
```

### 积分计算规则
```typescript
// 答题正确: +10分
// 答题错误: -5分
// 连续答对5题: +20分(Bonus)
// 首次通关章节: +50分
// 每日登录: +5分

const calculateRankChange = (isCorrect: boolean, streak: number) => {
  let points = isCorrect ? 10 : -5;
  if (streak >= 5 && streak % 5 === 0) points += 20;
  return points;
};
```

### 晋升/降级逻辑
```typescript
// src/actions/update-rank.ts
'use server';

export async function updateUserRank(userId: string, subjectId: string, scoreChange: number) {
  const currentRank = await prisma.userRank.findUnique({
    where: { userId_subjectId_season: { userId, subjectId, season: getCurrentSeason() } },
  });

  const newScore = currentRank.score + scoreChange;
  const newRank = calculateRank(newScore);

  // 检查是否晋升
  const isPromotion = getRankLevel(newRank) > getRankLevel(currentRank.rank);

  await prisma.userRank.update({
    where: { id: currentRank.id },
    data: { score: newScore, rank: newRank },
  });

  // 晋升时触发动画
  if (isPromotion) {
    await triggerPromotionAnimation(userId, newRank);
  }

  return { newRank, isPromotion };
}

const calculateRank = (score: number): Rank => {
  if (score >= 3000) return Rank.KING;
  if (score >= 2500) return Rank.MASTER;
  if (score >= 2000) return Rank.DIAMOND;
  if (score >= 1500) return Rank.PLATINUM;
  if (score >= 1000) return Rank.GOLD;
  if (score >= 500) return Rank.SILVER;
  return Rank.BRONZE;
};
```

### 晋升动画
```typescript
// src/components/rank/PromotionAnimation.tsx
'use client';

import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

export function PromotionAnimation({ newRank }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', duration: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
    >
      <Confetti />
      <div className="text-center">
        <motion.img
          src={`/ranks/${newRank.toLowerCase()}.png`}
          alt={newRank}
          className="w-48 h-48 mx-auto"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <h1 className="text-5xl font-bold text-white mt-8">
          晋升至 {getRankName(newRank)}
        </h1>
      </div>
    </motion.div>
  );
}
```

### 赛季制实现
```typescript
// 每月1号0点重置
const getCurrentSeason = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Cron Job (Vercel Cron)
// vercel.json
{
  "crons": [{
    "path": "/api/cron/reset-season",
    "schedule": "0 0 1 * *"
  }]
}

// src/app/api/cron/reset-season/route.ts
export async function GET() {
  const lastSeason = getLastSeason();
  const currentSeason = getCurrentSeason();

  // 1. 归档上赛季数据
  await prisma.seasonArchive.create({
    data: {
      season: lastSeason,
      topPlayers: await getTopPlayers(lastSeason, 100),
    },
  });

  // 2. 重置所有用户段位(保留20%积分)
  await prisma.userRank.updateMany({
    where: { season: lastSeason },
    data: { 
      season: currentSeason,
      score: { multiply: 0.2 },
      rank: Rank.BRONZE,
    },
  });

  return Response.json({ success: true });
}
```

---

## 3. UI组件

### 段位徽章展示
```typescript
// src/components/rank/RankBadge.tsx
export function RankBadge({ rank, size = 'md' }) {
  const sizeMap = { sm: 'w-8 h-8', md: 'w-16 h-16', lg: 'w-32 h-32' };

  return (
    <div className="relative">
      <img
        src={`/ranks/${rank.toLowerCase()}.png`}
        alt={rank}
        className={`${sizeMap[size]} drop-shadow-lg`}
      />
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs">
        {getRankName(rank)}
      </div>
    </div>
  );
}
```

---

## 4. 验收标准

- [ ] 积分计算逻辑正确
- [ ] 段位晋升/降级触发准确
- [ ] 晋升动画效果流畅
- [ ] 赛季重置准时执行(每月1号0点)
- [ ] 每科独立段位互不影响

---

## 5. 交付物

- `src/actions/update-rank.ts`
- `src/components/rank/RankBadge.tsx`
- `src/components/rank/PromotionAnimation.tsx`
- `src/app/api/cron/reset-season/route.ts`
- `public/ranks/` (段位图标素材)
- Prisma Migration (UserRank模型)

---

**创建时间**: 2025-12-16
