/**
 * Practice Center Type Definitions
 * 练习中心类型定义
 */

import type { Question, QuestionType, UserRole } from '@prisma/client'

// ============ 章节相关类型 ============

/**
 * 章节基本信息 + 用户掌握度统计
 */
export interface ChapterWithStats {
  id: string
  title: string
  subjectId: string
  parentId: string | null
  order: number
  // 用户统计数据
  stats: {
    totalAttempts: number      // 总答题次数
    correctCount: number       // 正确次数
    masteryLevel: number       // 掌握度 (0-100)
    questionCount: number      // 章节题目总数
  }
}

/**
 * 科目下的章节列表（带统计）
 */
export interface SubjectChaptersResult {
  subjectId: string
  subjectName: string
  chapters: ChapterWithStats[]
}

// ============ 题目筛选相关类型 ============

/**
 * 题目筛选条件
 */
export interface QuestionFilter {
  chapterIds?: string[]        // 章节ID列表（可多选）
  subjectId?: string           // 科目ID
  difficulty?: number[]        // 难度列表 [1,2,3,4,5]
  types?: QuestionType[]       // 题型列表
  excludeRecentDays?: number   // 排除最近N天做过的题（默认30天）
  limit?: number               // 返回数量（默认10）
  userId?: string              // 用户ID（用于排除已做过的题）
}

/**
 * 带统计的题目信息
 */
export interface QuestionWithStats extends Question {
  attemptCount?: number        // 该用户做过几次
  lastAttemptAt?: Date | null  // 最后一次做题时间
  isInErrorBook?: boolean      // 是否在错题本中
}

// ============ 配额相关类型 ============

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
 * 各角色的配额配置
 */
export const QUOTA_CONFIGS: Record<UserRole, QuotaConfig> = {
  STUDENT: {
    dailyQuestionLimit: 50,
    weeklyExamLimit: 3,
    aiTokenDaily: 5,
  },
  PARENT: {
    dailyQuestionLimit: 0,      // 家长不答题
    weeklyExamLimit: 0,
    aiTokenDaily: 0,
  },
  PRO: {
    dailyQuestionLimit: 200,
    weeklyExamLimit: 10,
    aiTokenDaily: 20,
  },
  ULTIMATE: {
    dailyQuestionLimit: -1,     // -1 表示无限制
    weeklyExamLimit: -1,
    aiTokenDaily: 50,
  },
  TEACHER: {
    dailyQuestionLimit: -1,
    weeklyExamLimit: -1,
    aiTokenDaily: 100,
  },
  ADMIN: {
    dailyQuestionLimit: -1,
    weeklyExamLimit: -1,
    aiTokenDaily: -1,
  },
}

// ============ 知识蜂巢（Knowledge Hive）类型 ============

/**
 * 蜂巢节点掌握状态
 */
export type HiveNodeStatus = 'strong' | 'fair' | 'weak' | 'locked'

/**
 * 蜂巢节点数据
 */
export interface HiveNode {
  chapterId: string
  chapterTitle: string
  masteryLevel: number           // 0-3 (对应 ErrorBook 中的 masteryLevel)
  correctRate: number            // 0-100 百分比
  totalAttempts: number          // 总答题次数
  status: HiveNodeStatus         // 根据 correctRate 计算的状态
  color: string                  // CSS 颜色值
}

/**
 * 状态对应颜色映射
 */
export const HIVE_STATUS_COLORS: Record<HiveNodeStatus, string> = {
  strong: '#22c55e',  // green-500
  fair: '#eab308',    // yellow-500
  weak: '#ef4444',    // red-500
  locked: '#6b7280',  // gray-500
}

/**
 * 根据正确率计算蜂巢节点状态
 */
export function getHiveStatus(correctRate: number, totalAttempts: number): HiveNodeStatus {
  if (totalAttempts === 0) return 'locked'
  if (correctRate >= 80) return 'strong'
  if (correctRate >= 60) return 'fair'
  return 'weak'
}

// ============ 工具类型 ============

/**
 * 数据服务返回结果
 */
export interface DataServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}
