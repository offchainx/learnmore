import prisma from "@/lib/prisma";
import { DailyTaskType } from "@prisma/client";
import dayjs from "dayjs";

export const XP_PER_LEVEL = 1000;

export function calculateLevel(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function calculateNextLevelXp(level: number) {
  return level * XP_PER_LEVEL;
}

/**
 * Checks and updates the user's login streak.
 * Should be called when the user performs a meaningful action (completes a lesson, logs in, etc.)
 */
export async function checkAndRefreshStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastStudyDate: true, streak: true },
  });

  if (!user) return;

  const now = dayjs();
  const lastDate = user.lastStudyDate ? dayjs(user.lastStudyDate) : null;

  // If never studied, set to today and streak 1
  if (!lastDate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastStudyDate: now.toDate(),
        streak: 1,
      },
    });
    return;
  }

  // Check if same day
  if (lastDate.isSame(now, "day")) {
    // Already tracked for today
    return;
  }

  // Check if consecutive day (yesterday)
  // If last study was yesterday, increment streak
  // dayjs().subtract(1, 'day')
  if (lastDate.isSame(now.subtract(1, "day"), "day")) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastStudyDate: now.toDate(),
        streak: { increment: 1 },
      },
    });
  } else {
    // Streak broken, reset to 1
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastStudyDate: now.toDate(),
        streak: 1,
      },
    });
  }
}

/**
 * Ensures daily tasks exist for the user for the current day.
 */
export async function ensureDailyTasks(userId: string) {
  const today = dayjs().startOf("day").toDate();
  const tomorrow = dayjs().endOf("day").toDate();

  // Check if tasks exist for today
  const count = await prisma.dailyTask.count({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (count > 0) return;

  // Create default tasks
  const tasks = [
    {
      userId,
      type: DailyTaskType.LOGIN,
      title: "每日登录",
      targetCount: 1,
      currentCount: 1, // Auto-complete login task upon creation (since they are here)
      xpReward: 50,
      date: today,
    },
    {
      userId,
      type: DailyTaskType.COMPLETE_LESSON,
      title: "完成 1 节课程",
      targetCount: 1,
      currentCount: 0,
      xpReward: 100,
      date: today,
    },
    {
      userId,
      type: DailyTaskType.QUIZ_SCORE,
      title: "完成 1 次测验",
      targetCount: 1,
      currentCount: 0,
      xpReward: 80,
      date: today,
    },
  ];

  await prisma.dailyTask.createMany({
    data: tasks,
  });
}

/**
 * Updates progress for a specific task type.
 */
export async function trackDailyProgress(userId: string, type: DailyTaskType, amount = 1) {
  const today = dayjs().startOf("day").toDate();
  const tomorrow = dayjs().endOf("day").toDate();

  const task = await prisma.dailyTask.findFirst({
    where: {
      userId,
      type,
      date: {
        gte: today,
        lt: tomorrow,
      },
      isClaimed: false, // Don't update claimed tasks
    },
  });

  if (task) {
    // Don't go over target
    const newCount = Math.min(task.currentCount + amount, task.targetCount);
    if (newCount !== task.currentCount) {
      await prisma.dailyTask.update({
        where: { id: task.id },
        data: { currentCount: newCount },
      });
    }
  }
}
