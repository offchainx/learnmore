"use server";

import { getCurrentUser } from "@/actions/auth"; // Assuming this is how we get the current user
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
