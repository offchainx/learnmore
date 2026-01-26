/**
 * 练习中心 - 预测算法模块
 * Story-043 C2: Exam Forecast（考分预测）
 */

// ============ 类型定义 ============

export interface UserAttemptData {
  id: string
  isCorrect: boolean
  createdAt: Date
  questionId: string
}

export interface UserProgressData {
  id: string
  progress: number // 0-100
  isCompleted: boolean
  lessonId: string
}

export type TrendDirection = 'UP' | 'DOWN' | 'STABLE'

export interface ExamForecast {
  grade: string          // A+, A, A-, B+, B, B-, C+, C, C-, D, F
  score: number          // 0-100 预测分数
  trend: TrendDirection  // 趋势方向
  confidence: number     // 0-100 置信度
  recentScores: number[] // 最近7天的每日正确率，用于Sparkline
}

export interface DailyScore {
  date: string  // YYYY-MM-DD
  correctRate: number // 0-100
}

// ============ 等级转换 ============

/**
 * 将分数转换为等级
 * A+: 97-100, A: 93-96, A-: 90-92
 * B+: 87-89, B: 83-86, B-: 80-82
 * C+: 77-79, C: 73-76, C-: 70-72
 * D: 60-69, F: 0-59
 */
export function scoreToGrade(score: number): string {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * 将等级转换为数值（用于趋势比较）
 */
export function gradeToNumeric(grade: string): number {
  const gradeMap: Record<string, number> = {
    'A+': 12, 'A': 11, 'A-': 10,
    'B+': 9, 'B': 8, 'B-': 7,
    'C+': 6, 'C': 5, 'C-': 4,
    'D': 3, 'F': 1
  }
  return gradeMap[grade] ?? 0
}

// ============ 辅助计算函数 ============

/**
 * 计算平均答题正确率
 */
export function calculateAverageCorrectRate(attempts: UserAttemptData[]): number {
  if (attempts.length === 0) return 0

  const correctCount = attempts.filter(a => a.isCorrect).length
  return (correctCount / attempts.length) * 100
}

/**
 * 计算课程完成率
 */
export function calculateCourseCompletion(progress: UserProgressData[]): number {
  if (progress.length === 0) return 0

  // 方案1: 基于完成数量
  const completedCount = progress.filter(p => p.isCompleted).length
  const completionByCount = (completedCount / progress.length) * 100

  // 方案2: 基于平均进度
  const avgProgress = progress.reduce((sum, p) => sum + p.progress, 0) / progress.length

  // 取两者的加权平均（完成数量权重更高）
  return completionByCount * 0.7 + avgProgress * 0.3
}

/**
 * 计算连续学习天数加成
 * 最多加10分
 */
export function calculateStreakBonus(streak: number): number {
  return Math.min(streak * 0.5, 10)
}

/**
 * 计算趋势方向
 * 比较最近3天与之前4天的平均表现
 */
export function calculateTrend(attempts: UserAttemptData[]): TrendDirection {
  if (attempts.length < 7) return 'STABLE'

  const now = new Date()
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(now.getDate() - 3)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)

  // 分割为最近3天和之前4天
  const recent = attempts.filter(a => new Date(a.createdAt) >= threeDaysAgo)
  const earlier = attempts.filter(a => {
    const date = new Date(a.createdAt)
    return date >= sevenDaysAgo && date < threeDaysAgo
  })

  if (recent.length === 0 || earlier.length === 0) return 'STABLE'

  const recentRate = calculateAverageCorrectRate(recent)
  const earlierRate = calculateAverageCorrectRate(earlier)

  const diff = recentRate - earlierRate

  // 差距超过5%才认为是明显趋势
  if (diff > 5) return 'UP'
  if (diff < -5) return 'DOWN'
  return 'STABLE'
}

/**
 * 计算预测置信度
 * 基于答题数量和时间跨度
 */
export function calculateConfidence(attempts: UserAttemptData[]): number {
  if (attempts.length === 0) return 0

  // 因素1: 答题数量（最多50题为满分）
  const quantityFactor = Math.min(attempts.length / 50, 1) * 50

  // 因素2: 时间跨度（最多30天为满分）
  const dates = attempts.map(a => new Date(a.createdAt).toDateString())
  const uniqueDays = new Set(dates).size
  const timeFactor = Math.min(uniqueDays / 14, 1) * 30

  // 因素3: 最近活跃度（最近7天有答题）
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)
  const recentAttempts = attempts.filter(a => new Date(a.createdAt) >= sevenDaysAgo)
  const activityFactor = recentAttempts.length > 0 ? 20 : 0

  return Math.round(quantityFactor + timeFactor + activityFactor)
}

/**
 * 计算最近7天的每日正确率（用于Sparkline）
 */
export function calculateRecentScores(attempts: UserAttemptData[]): number[] {
  const now = new Date()
  const scores: number[] = []

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() - i)
    const dateStr = targetDate.toDateString()

    const dayAttempts = attempts.filter(a =>
      new Date(a.createdAt).toDateString() === dateStr
    )

    if (dayAttempts.length === 0) {
      // 没有数据时使用0或前一天的值
      scores.push(scores.length > 0 ? scores[scores.length - 1] : 0)
    } else {
      scores.push(calculateAverageCorrectRate(dayAttempts))
    }
  }

  return scores
}

// ============ 主预测函数 ============

/**
 * 计算考分预测
 *
 * 预测公式:
 * 预测分 = (平均答题正确率 × 0.6) + (课程完成率 × 0.3) + (连续学习天数加成 × 0.1)
 *
 * @param recentAttempts - 最近30天的答题记录
 * @param userProgress - 课程完成度记录
 * @param streak - 连续学习天数（默认0）
 */
export function calculateExamForecast(
  recentAttempts: UserAttemptData[],
  userProgress: UserProgressData[],
  streak: number = 0
): ExamForecast {
  // 计算各项因子
  const avgCorrectRate = calculateAverageCorrectRate(recentAttempts)
  const courseCompletion = calculateCourseCompletion(userProgress)
  const streakBonus = calculateStreakBonus(streak)

  // 应用预测公式
  const predictedScore =
    avgCorrectRate * 0.6 +
    courseCompletion * 0.3 +
    streakBonus * 0.1

  // 确保分数在0-100范围内
  const normalizedScore = Math.max(0, Math.min(100, predictedScore))

  // 计算等级
  const grade = scoreToGrade(normalizedScore)

  // 计算趋势
  const trend = calculateTrend(recentAttempts)

  // 计算置信度
  const confidence = calculateConfidence(recentAttempts)

  // 计算Sparkline数据
  const recentScores = calculateRecentScores(recentAttempts)

  return {
    grade,
    score: Math.round(normalizedScore * 10) / 10, // 保留1位小数
    trend,
    confidence,
    recentScores
  }
}

// ============ Mock数据生成（开发用） ============

/**
 * 生成模拟预测数据（用于UI开发和测试）
 */
export function generateMockForecast(): ExamForecast {
  return {
    grade: 'A-',
    score: 85.5,
    trend: 'UP',
    confidence: 78,
    recentScores: [65, 70, 68, 75, 72, 80, 85]
  }
}
