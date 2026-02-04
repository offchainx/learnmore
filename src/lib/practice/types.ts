/**
 * Practice Center Type Definitions
 * 练习中心类型定义
 */

import type { Question, QuestionType, UserRole, SubscriptionTier } from '@prisma/client'

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
    
    // 时间维度统计 (用于 HOT/WEAK 标签)
    recentAttempts?: number      // 近7天答题数
    recentCorrectRate?: number   // 近7天正确率
    monthlyCorrectRate?: number  // 近30天正确率
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

// ============ 薄弱点分析类型 ============

export interface WeaknessItem {
  chapterId: string
  chapterTitle: string
  correctRate: number    // 正确率 (0-100)
  masteryLevel: number   // 掌握度等级 (0-3)
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

// ============ 考分预测（Exam Forecast）类型 ============

/**
 * 趋势方向
 */
export type TrendDirection = 'UP' | 'DOWN' | 'STABLE'

/**
 * 考分预测结果
 */
export interface ExamForecast {
  grade: string              // 预测等级: A+, A, A-, B+, B, B-, C+, C, C-, D, F
  score: number              // 预测分数: 0-100
  trend: TrendDirection      // 趋势方向
  confidence: number         // 置信度: 0-100
  sparklineData: number[]    // 近7天每日正确率数据（用于Sparkline图表）
}

/**
 * 等级阈值配置
 */
export const GRADE_THRESHOLDS: { grade: string; minScore: number }[] = [
  { grade: 'A+', minScore: 95 },
  { grade: 'A', minScore: 90 },
  { grade: 'A-', minScore: 85 },
  { grade: 'B+', minScore: 80 },
  { grade: 'B', minScore: 75 },
  { grade: 'B-', minScore: 70 },
  { grade: 'C+', minScore: 65 },
  { grade: 'C', minScore: 60 },
  { grade: 'C-', minScore: 55 },
  { grade: 'D', minScore: 50 },
  { grade: 'F', minScore: 0 },
]

/**
 * 将分数转换为等级
 */
export function scoreToGrade(score: number): string {
  for (const threshold of GRADE_THRESHOLDS) {
    if (score >= threshold.minScore) {
      return threshold.grade
    }
  }
  return 'F'
}

/**
 * 考分预测输入参数
 */
export interface ExamForecastInput {
  userId: string
  subjectId?: string         // 可选，按科目筛选
}

/**
 * 用于计算预测的原始数据
 */
export interface ExamForecastRawData {
  recentAttempts: {
    isCorrect: boolean
    createdAt: Date
  }[]
  totalLessons: number       // 总课程数
  completedLessons: number   // 已完成课程数
  userStreak: number         // 连续学习天数
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