'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/user/auth';
import { UserRole } from '@prisma/client';
import { generateAIResponse } from '@/lib/gemini';

export async function checkAndDeductAiToken() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { aiTokenBalance: true, role: true, subscriptionTier: true }
  });

  if (!dbUser) return { success: false, error: 'User not found' };

  // Unlimited for PREMIER/ADMIN/TEACHER
  if (dbUser.role === UserRole.ADMIN || dbUser.role === UserRole.TEACHER || dbUser.subscriptionTier === 'PREMIER') {
    return { success: true, remaining: 9999 };
  }

  if (dbUser.aiTokenBalance <= 0) {
    return { success: false, error: 'Insufficient AI tokens' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { aiTokenBalance: { decrement: 1 } }
  });

  return { success: true, remaining: dbUser.aiTokenBalance - 1 };
}

export async function getProblemHint(equation: string | null, question: string) {
  // Deduct token logic could be added here
  const prompt = `You are a helpful math tutor. Give a short, subtle hint for this problem: "${question} ${equation || ''}". 
      Requirements:
      1. One or two sentences max.
      2. Don't give the answer.
      3. Point towards the core mathematical principle.`;
  
  try {
    return await generateAIResponse(
      "You are a helpful math tutor.", 
      prompt
    );
  } catch (error) {
    console.error("AI Hint Error:", error);
    return "Try breaking down the problem into smaller steps.";
  }
}

export async function explainSolution(equation: string | null, question: string, selectedOption: string, isCorrect: boolean) {
  const prompt = `The student is solving: "${question} ${equation || ''}". 
      They selected: "${selectedOption}".
      Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}.
      
      Provide a concise step-by-step explanation. 
      If incorrect, explain the common pitfall.
      If correct, reinforce the concept. 
      Keep it under 150 words.`;

  try {
    return await generateAIResponse(
      "You are a helpful math tutor.",
      prompt
    );
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return "Review the concept and try again.";
  }
}
