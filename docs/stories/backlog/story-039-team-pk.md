# Story-037: 学习小队与PK系统

**状态**: Backlog ⚪
**优先级**: P0 (Phase 9核心 - 社交留存关键)
**预计工时**: 12-14小时
**前置依赖**: Story-035 (段位系统)
**技术难度**: 🔴 Very High

---

## 1. 目标

实现3-5人组队逻辑和实时1v1 PK对战系统。

- [ ] 组队系统(3-5人/队)
- [ ] 组队挑战(团队答题)
- [ ] 1v1实时PK对战
- [ ] WebSocket实时同步
- [ ] PK匹配算法(段位相近)
- [ ] 队伍荣誉称号

---

## 2. 技术方案

### 技术栈
- **实时通信**: Supabase Realtime (WebSocket)
- **匹配算法**: Elo Rating System
- **队伍管理**: PostgreSQL + Prisma

### 数据模型
```prisma
model Team {
  id        String   @id
  name      String
  leaderId  String   // 队长ID
  members   User[]   @relation("TeamMembers")
  level     Int      @default(1)
  createdAt DateTime @default(now())

  @@index([leaderId])
}

model PKMatch {
  id         String   @id
  player1Id  String
  player2Id  String
  player1    User     @relation("Player1", fields: [player1Id], references: [id])
  player2    User     @relation("Player2", fields: [player2Id], references: [id])
  winnerId   String?
  questions  Json     // 题目列表
  status     MatchStatus @default(WAITING)
  createdAt  DateTime @default(now())
}

enum MatchStatus {
  WAITING   // 等待匹配
  IN_PROGRESS // 进行中
  FINISHED  // 已结束
}
```

### 匹配算法
```typescript
// src/lib/matching/pk-matcher.ts
export async function findOpponent(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { rank: true },
  });

  // 查找段位相近的在线玩家(±200分)
  const matchPool = await prisma.user.findMany({
    where: {
      id: { not: userId },
      rank: {
        score: {
          gte: user.rank.score - 200,
          lte: user.rank.score + 200,
        },
      },
      isOnline: true,
    },
    take: 10,
  });

  // 随机选择一位
  const opponent = matchPool[Math.floor(Math.random() * matchPool.length)];

  if (!opponent) {
    throw new Error('暂无匹配对手,请稍后再试');
  }

  // 创建PK对局
  const match = await prisma.pKMatch.create({
    data: {
      player1Id: userId,
      player2Id: opponent.id,
      questions: generateQuestions(5), // 随机5题
      status: 'IN_PROGRESS',
    },
  });

  return match;
}
```

### Realtime PK通信
```typescript
// src/components/pk/PKBattle.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function PKBattle({ matchId }) {
  const [match, setMatch] = useState(null);
  const [myAnswers, setMyAnswers] = useState<number[]>([]);
  const [opponentAnswers, setOpponentAnswers] = useState<number[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // 订阅对局更新
    const channel = supabase.channel(`pk-match-${matchId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'PKMatch',
        filter: `id=eq.${matchId}`,
      }, (payload) => {
        setMatch(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const submitAnswer = async (questionIndex: number, answer: number) => {
    // 提交答案并实时同步
    await supabase.from('pk_answers').insert({
      matchId,
      userId: currentUser.id,
      questionIndex,
      answer,
      timestamp: new Date(),
    });

    setMyAnswers([...myAnswers, answer]);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 左侧:我的答题区 */}
      <div>
        <h2>我 ({myAnswers.length}/5)</h2>
        <QuestionCard onSubmit={submitAnswer} />
      </div>

      {/* 右侧:对手进度 */}
      <div>
        <h2>对手 ({opponentAnswers.length}/5)</h2>
        <ProgressBar value={opponentAnswers.length * 20} />
      </div>
    </div>
  );
}
```

### 组队挑战
```typescript
// src/actions/team-challenge.ts
'use server';

export async function startTeamChallenge(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });

  // 生成团队题目(10题)
  const questions = generateQuestions(10);

  const challenge = await prisma.teamChallenge.create({
    data: {
      teamId,
      questions,
      status: 'IN_PROGRESS',
      deadline: addHours(new Date(), 24), // 24小时内完成
    },
  });

  // 通知所有成员
  await Promise.all(
    team.members.map(member =>
      sendNotification(member.id, `团队挑战开始!`)
    )
  );

  return challenge;
}
```

---

## 3. UI组件

### 匹配动画
```typescript
// src/components/pk/MatchingAnimation.tsx
export function MatchingAnimation() {
  return (
    <div className="flex items-center justify-center h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Swords className="w-24 h-24 text-orange-500" />
      </motion.div>
      <p className="text-2xl mt-8">正在匹配对手...</p>
    </div>
  );
}
```

### 战绩统计
```typescript
// src/components/pk/PKStats.tsx
export function PKStats({ userId }) {
  const stats = await getPKStats(userId);

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="胜场" value={stats.wins} color="green" />
      <StatCard label="败场" value={stats.losses} color="red" />
      <StatCard label="胜率" value={`${stats.winRate}%`} color="blue" />
    </div>
  );
}
```

---

## 4. 性能优化

- **连接池管理**: Supabase Realtime限制并发连接数,需实现连接池
- **消息去重**: 避免重复消息导致状态异常
- **断线重连**: 网络断开后自动重连,恢复对局状态

---

## 5. 验收标准

- [ ] PK匹配延迟 < 3s
- [ ] WebSocket消息延迟 < 500ms
- [ ] 匹配算法段位误差 < ±200分
- [ ] 断线重连后对局状态正确恢复
- [ ] 组队挑战通知准时送达

---

## 6. 交付物

- `src/actions/find-opponent.ts`
- `src/components/pk/PKBattle.tsx`
- `src/components/pk/MatchingAnimation.tsx`
- `src/components/teams/TeamDashboard.tsx`
- `src/lib/matching/pk-matcher.ts`
- Prisma Migration (Team, PKMatch)

---

**创建时间**: 2025-12-16
