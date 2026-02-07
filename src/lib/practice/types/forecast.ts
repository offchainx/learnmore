/**
 * Practice Center - Exam Forecast Types
 * 考分预测（Exam Forecast）类型定义
 */

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
