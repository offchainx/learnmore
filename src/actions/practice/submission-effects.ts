'use server'

import { awardBadgeIfEligible } from '@/actions/gamification/achievements'
import { ensureDailyTasks, trackDailyProgress } from '@/actions/gamification/daily-tasks'
import { checkAndRefreshStreak } from '@/actions/gamification/streak'
import { updateLeaderboardScore } from '@/actions/leaderboard'
import { incrementTotalStudyTime } from '@/actions/user/study-metrics'
import { DailyTaskType, PracticeMode } from '@prisma/client'

interface ApplyPracticeSubmissionEffectsInput {
  userId: string
  mode: PracticeMode
  correctCount: number
  duration?: number | null
}

export async function applyPracticeSubmissionEffects(
  input: ApplyPracticeSubmissionEffectsInput
): Promise<void> {
  await ensureDailyTasks(input.userId)

  const sideEffects: Promise<unknown>[] = [
    checkAndRefreshStreak(input.userId),
    awardBadgeIfEligible(input.userId, 'PRACTICE'),
    incrementTotalStudyTime(input.userId, input.duration ?? null),
  ]

  switch (input.mode) {
    case PracticeMode.SMART_DRILL:
    case PracticeMode.CHAPTER_DRILL:
    case PracticeMode.MOCK_EXAM:
      if (input.correctCount > 0) {
        sideEffects.push(updateLeaderboardScore(input.userId, input.correctCount * 10))
      }
      sideEffects.push(trackDailyProgress(input.userId, DailyTaskType.QUIZ_SCORE))
      break
    case PracticeMode.PAST_PAPER:
      sideEffects.push(trackDailyProgress(input.userId, DailyTaskType.QUIZ_SCORE))
      break
    case PracticeMode.ERROR_WIPER:
      if (input.correctCount > 0) {
        sideEffects.push(trackDailyProgress(input.userId, DailyTaskType.FIX_ERROR, input.correctCount))
      }
      break
  }

  await Promise.all(sideEffects)
}
