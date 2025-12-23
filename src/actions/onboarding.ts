"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type OnboardingData = {
  // Identity
  grade: number;
  curriculum?: string;
  avatarUrl?: string; // If using uploaded/selected avatar
  
  // Habit
  targetSubject: string; // Weak subject
  studyReminderTime: string;
  
  // Assessment
  difficultyCalibration: number; // Result from mini-test
  
  // Parent
  parentEmail?: string;
  
  // Tracking
  utmSource?: string;
  // ... other utm fields handled by cookie/hidden inputs
};

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Update User Profile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        grade: data.grade,
        avatar: data.avatarUrl, // Optional update if changed
        // You might map curriculum to a field if schema supports it or store in settings
      },
    });

    // 2. Update Settings
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        studyReminderTime: data.studyReminderTime,
        difficultyCalibration: data.difficultyCalibration,
        curriculumSystem: data.curriculum,
      },
      update: {
        studyReminderTime: data.studyReminderTime,
        difficultyCalibration: data.difficultyCalibration,
        curriculumSystem: data.curriculum,
      },
    });

    // 3. Handle Parent Invite (if email provided)
    if (data.parentEmail) {
      // Create an invite code or pending relation
      // For now, let's just log it or store in a simple way if schema allows
      // We'll assume InviteCode logic is handled separately or added here later
      // For MVP: We just skip actual email sending logic here
      console.log(`Invite parent: ${data.parentEmail} for user ${user.id}`);
    }

    // 4. Update Supabase Auth Metadata (CRITICAL for Middleware)
    const { error: authError } = await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });

    if (authError) {
      console.error("Failed to update auth metadata:", authError);
      throw authError;
    }

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error("Onboarding error:", error);
    return { success: false, error: "Failed to save onboarding data" };
  }
}
