/**
 * Practice Center - Question Related Types
 * 题目筛选相关类型定义
 */

import type { Question, QuestionType } from '@prisma/client'

/**
 * 题目筛选条件
 */
export interface QuestionFilter {
  chapterIds?: string[]        // 章节ID列表（可多选）
  subjectId?: string           // 科目ID
  difficulty?: number[]        // 难度列表 [1,2,3,4,5]
  types?: QuestionType[]       // 题型列表
  includePastPaper?: boolean   // 是否包含历年真题（默认 false）
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
