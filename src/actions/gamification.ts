"use server";

import { getCurrentUser } from "@/actions/auth"; // Assuming this is how we get the current user
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DailyTaskType } from "@prisma/client";

export async function completeOnboardingTask(type: DailyTaskType) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Find the active task for today (or generic onboarding task)
  // Onboarding tasks might not be strictly bound to "today" if user registered yesterday but didn't finish.
  // We should find the specific onboarding task that is not claimed.
  const task = await prisma.dailyTask.findFirst({
    where: {
      userId: user.id,
      type: type,
      isClaimed: false,
    },
    orderBy: { date: 'desc' } // Get latest if duplicates
  });

  if (!task) {
    // Task might already be claimed or doesn't exist
    return { success: false, message: "Task not found or already done" };
  }

  try {
    // Mark as completed (current = target)
    await prisma.dailyTask.update({
      where: { id: task.id },
      data: { currentCount: task.targetCount },
    });
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to complete onboarding task:", error);
    return { success: false, error: "Database error" };
  }
}

export async function claimTaskReward(taskId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const userId = user.id;

  const task = await prisma.dailyTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.userId !== userId) {
    throw new Error("Unauthorized");
  }

  if (task.currentCount < task.targetCount) {
    throw new Error("Task not completed");
  }

  if (task.isClaimed) {
    throw new Error("Reward already claimed");
  }

  try {
    await prisma.$transaction([
      prisma.dailyTask.update({
        where: { id: taskId },
        data: { isClaimed: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: task.xpReward } },
      }),
    ]);
    
    revalidatePath("/dashboard");
    return { success: true, xpGained: task.xpReward };
  } catch (error) {
    console.error("Failed to claim reward:", error);
    return { success: false, error: "Failed to claim reward" };
  }
}
