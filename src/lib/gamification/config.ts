import { DailyTaskType } from '@prisma/client'
import { DailyTaskTemplate } from './types'

/**
 * Gamification Configuration
 *
 * Default daily tasks and reward values.
 */

export const DEFAULT_DAILY_TASKS: DailyTaskTemplate[] = [
  {
    type: DailyTaskType.LOGIN,
    title: '每日登录',
    targetCount: 1,
    xpReward: 50,
  },
  {
    type: DailyTaskType.COMPLETE_LESSON,
    title: '完成 1 节课程',
    targetCount: 1,
    xpReward: 100,
  },
  {
    type: DailyTaskType.QUIZ_SCORE,
    title: '完成 1 次测验',
    targetCount: 1,
    xpReward: 80,
  },
]

export const ONBOARDING_TASK_TEMPLATES: DailyTaskTemplate[] = [
  {
    type: DailyTaskType.ONBOARDING_PROFILE,
    title: '完善个人资料',
    targetCount: 1,
    xpReward: 60,
  },
  {
    type: DailyTaskType.ONBOARDING_GOALS,
    title: '设置学习目标',
    targetCount: 1,
    xpReward: 60,
  },
  {
    type: DailyTaskType.ONBOARDING_ASSESSMENT,
    title: '完成入门测评',
    targetCount: 1,
    xpReward: 80,
  },
]

/**
 * XP rewards for various actions
 */
export const XP_REWARDS = {
  LESSON_COMPLETE: 100,
  QUIZ_COMPLETE: 150,
  PERFECT_QUIZ: 200, // 100% correct
  DAILY_LOGIN: 50,
  STREAK_BONUS: 25, // Per day of streak
  COMMENT_POST: 10,
  CREATE_POST: 20,
} as const
