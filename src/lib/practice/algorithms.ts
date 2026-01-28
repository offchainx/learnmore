/**
 * Practice Center Algorithms
 * 练习中心算法库
 *
 * 包含：考分预测、智能推荐、掌握度计算等核心算法
 */

import {
  ExamForecast,
  ExamForecastRawData,
  TrendDirection,
  scoreToGrade,
} from './types'

// ============ 考分预测算法 ============

/**
 * 计算平均正确率
 * @param attempts 答题记录数组
 * @returns 正确率 (0-100)
 */
export function calculateAverageCorrectRate(
  attempts: { isCorrect: boolean }[]
): number {
  if (attempts.length === 0) return 0

  const correctCount = attempts.filter(a => a.isCorrect).length
  return (correctCount / attempts.length) * 100
}

/**
 * 计算课程完成率
 * @param totalLessons 总课程数
 * @param completedLessons 已完成课程数
 * @returns 完成率 (0-100)
 */
export function calculateCourseCompletion(
  totalLessons: number,
  completedLessons: number
): number {
  if (totalLessons === 0) return 0
  return Math.min((completedLessons / totalLessons) * 100, 100)
}

/**
 * 计算连续学习天数加成
 * @param streak 连续学习天数
 * @returns 加成分数 (最多10分)
 */
export function calculateStreakBonus(streak: number): number {
  // 每天0.5分，最多10分
  return Math.min(streak * 0.5, 10)
}

/**
 * 计算趋势方向
 * 对比近7天 vs 前7天的正确率
 * @param attempts 答题记录（按时间排序，最新在前）
 * @returns 趋势方向
 */
export function calculateTrend(
  attempts: { isCorrect: boolean; createdAt: Date }[]
): TrendDirection {
  if (attempts.length < 5) return 'STABLE' // 数据太少，无法判断趋势

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // 近7天的答题
  const recentAttempts = attempts.filter(a => new Date(a.createdAt) >= sevenDaysAgo)
  // 7-14天前的答题
  const previousAttempts = attempts.filter(a => {
    const date = new Date(a.createdAt)
    return date >= fourteenDaysAgo && date < sevenDaysAgo
  })

  const recentRate = calculateAverageCorrectRate(recentAttempts)
  const previousRate = calculateAverageCorrectRate(previousAttempts)

  // 如果前一周没有数据，无法对比
  if (previousAttempts.length === 0) return 'STABLE'

  const diff = recentRate - previousRate

  // 差值超过5%才认为有明显趋势
  if (diff > 5) return 'UP'
  if (diff < -5) return 'DOWN'
  return 'STABLE'
}

/**
 * 计算预测置信度
 * 基于答题数量和时间分布
 * @param attempts 答题记录
 * @returns 置信度 (0-100)
 */
export function calculateConfidence(
  attempts: { isCorrect: boolean; createdAt: Date }[]
): number {
  if (attempts.length === 0) return 0

  // 基础置信度：答题数量
  // 30题以下线性增长，30题以上满分
  const countScore = Math.min(attempts.length / 30, 1) * 60

  // 时间分布置信度：近7天有活跃答题 +40分
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentAttempts = attempts.filter(a => new Date(a.createdAt) >= sevenDaysAgo)
  const recencyScore = recentAttempts.length > 0 ? 40 : 20

  return Math.round(countScore + recencyScore)
}

/**
 * 生成近7天每日正确率数据（用于Sparkline图表）
 * @param attempts 答题记录
 * @returns 长度为7的数组，表示近7天每天的正确率 (0-100)
 */
export function generateSparklineData(
  attempts: { isCorrect: boolean; createdAt: Date }[]
): number[] {
  const result: number[] = []
  const now = new Date()

  // 从6天前到今天
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const dayAttempts = attempts.filter(a => {
      const date = new Date(a.createdAt)
      return date >= dayStart && date <= dayEnd
    })

    if (dayAttempts.length === 0) {
      // 没有数据时，使用前一天的值或0
      result.push(result.length > 0 ? result[result.length - 1] : 50)
    } else {
      result.push(calculateAverageCorrectRate(dayAttempts))
    }
  }

  return result
}

/**
 * 主函数：计算考分预测
 *
 * 预测公式：
 * 预测分 = (平均答题正确率 * 0.6) + (课程完成率 * 0.3) + (连续学习天数加成 * 0.1)
 *
 * @param rawData 原始数据
 * @returns 考分预测结果
 */
export function calculateExamForecast(rawData: ExamForecastRawData): ExamForecast {
  const { recentAttempts, totalLessons, completedLessons, userStreak } = rawData

  // 计算各项指标
  const avgCorrectRate = calculateAverageCorrectRate(recentAttempts)
  const courseCompletion = calculateCourseCompletion(totalLessons, completedLessons)
  const streakBonus = calculateStreakBonus(userStreak)

  // 预测分数（加权计算）
  const predictedScore =
    avgCorrectRate * 0.6 +
    courseCompletion * 0.3 +
    streakBonus * 0.1

  // 确保分数在 0-100 范围内
  const normalizedScore = Math.max(0, Math.min(100, predictedScore))

  // 计算等级
  const grade = scoreToGrade(normalizedScore)

  // 计算趋势
  const trend = calculateTrend(recentAttempts)

  // 计算置信度
  const confidence = calculateConfidence(recentAttempts)

  // 生成Sparkline数据
  const sparklineData = generateSparklineData(recentAttempts)

  return {
    grade,
    score: Math.round(normalizedScore * 10) / 10, // 保留一位小数
    trend,
    confidence,
    sparklineData,
  }
}

/**
 * 计算等级变化提示文案
 * @param currentGrade 当前预测等级
 * @param trend 趋势方向
 * @returns 提示文案
 */
export function getGradeTrendText(
  currentGrade: string,
  trend: TrendDirection
): string {
  if (trend === 'UP') {
    return '+1 Grade'
  } else if (trend === 'DOWN') {
    return '-1 Grade'
  }
  return 'Stable'
}
