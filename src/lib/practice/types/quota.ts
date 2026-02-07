/**
 * Practice Center - Quota Related Types
 * 配额相关类型定义
 */

import type { UserRole, SubscriptionTier } from '@prisma/client'

/**
 * 用户配额限制配置
 */
export interface QuotaConfig {
  dailyQuestionLimit: number   // 每日答题数限制
  weeklyExamLimit: number      // 每周考试次数限制
  aiTokenDaily: number         // 每日AI Token限制
}

/**
 * 用户配额状态
 */
export interface QuotaStatus {
  // 今日答题
  dailyQuestionsUsed: number   // 今日已答题数
  dailyQuestionsLimit: number  // 每日答题上限
  dailyQuestionsRemaining: number // 今日剩余答题数

  // 本周考试
  weeklyExamsUsed: number      // 本周已考试次数
  weeklyExamsLimit: number     // 每周考试上限
  weeklyExamsRemaining: number // 本周剩余考试次数

  // AI Token
  aiTokensRemaining: number    // 剩余AI Token数

  // 用户角色
  userRole: UserRole
  isPremium: boolean           // 是否付费用户
}

/**
 * 各角色的配额配置 (基于等级)
 */
export const QUOTA_CONFIGS: Record<SubscriptionTier, QuotaConfig> = {
  STARTER: {
    dailyQuestionLimit: 20,
    weeklyExamLimit: 1,
    aiTokenDaily: 0,
  },
  STANDARD: {
    dailyQuestionLimit: 50,
    weeklyExamLimit: 5,
    aiTokenDaily: 5,
  },
  SMART_PLUS: {
    dailyQuestionLimit: 150,
    weeklyExamLimit: 15,
    aiTokenDaily: 30,
  },
  PREMIER: {
    dailyQuestionLimit: -1, // 无限制
    weeklyExamLimit: -1,
    aiTokenDaily: 100,
  },
}
