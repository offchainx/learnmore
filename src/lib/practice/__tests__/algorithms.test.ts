/**
 * 练习中心 - 预测算法单元测试
 * Story-043 C2: Exam Forecast（考分预测）
 */

import {
  scoreToGrade,
  gradeToNumeric,
  calculateAverageCorrectRate,
  calculateCourseCompletion,
  calculateStreakBonus,
  calculateTrend,
  calculateConfidence,
  calculateRecentScores,
  calculateExamForecast,
  generateMockForecast,
  UserAttemptData,
  UserProgressData
} from '../algorithms'

// ============ scoreToGrade 测试 ============

describe('scoreToGrade', () => {
  it('should return A+ for scores 97-100', () => {
    expect(scoreToGrade(100)).toBe('A+')
    expect(scoreToGrade(97)).toBe('A+')
  })

  it('should return A for scores 93-96', () => {
    expect(scoreToGrade(96)).toBe('A')
    expect(scoreToGrade(93)).toBe('A')
  })

  it('should return A- for scores 90-92', () => {
    expect(scoreToGrade(92)).toBe('A-')
    expect(scoreToGrade(90)).toBe('A-')
  })

  it('should return B+ for scores 87-89', () => {
    expect(scoreToGrade(89)).toBe('B+')
    expect(scoreToGrade(87)).toBe('B+')
  })

  it('should return B for scores 83-86', () => {
    expect(scoreToGrade(86)).toBe('B')
    expect(scoreToGrade(83)).toBe('B')
  })

  it('should return B- for scores 80-82', () => {
    expect(scoreToGrade(82)).toBe('B-')
    expect(scoreToGrade(80)).toBe('B-')
  })

  it('should return C+ for scores 77-79', () => {
    expect(scoreToGrade(79)).toBe('C+')
    expect(scoreToGrade(77)).toBe('C+')
  })

  it('should return C for scores 73-76', () => {
    expect(scoreToGrade(76)).toBe('C')
    expect(scoreToGrade(73)).toBe('C')
  })

  it('should return C- for scores 70-72', () => {
    expect(scoreToGrade(72)).toBe('C-')
    expect(scoreToGrade(70)).toBe('C-')
  })

  it('should return D for scores 60-69', () => {
    expect(scoreToGrade(69)).toBe('D')
    expect(scoreToGrade(60)).toBe('D')
  })

  it('should return F for scores below 60', () => {
    expect(scoreToGrade(59)).toBe('F')
    expect(scoreToGrade(0)).toBe('F')
  })
})

// ============ gradeToNumeric 测试 ============

describe('gradeToNumeric', () => {
  it('should convert grades to numeric values correctly', () => {
    expect(gradeToNumeric('A+')).toBe(12)
    expect(gradeToNumeric('A')).toBe(11)
    expect(gradeToNumeric('A-')).toBe(10)
    expect(gradeToNumeric('B+')).toBe(9)
    expect(gradeToNumeric('B')).toBe(8)
    expect(gradeToNumeric('B-')).toBe(7)
    expect(gradeToNumeric('C+')).toBe(6)
    expect(gradeToNumeric('C')).toBe(5)
    expect(gradeToNumeric('C-')).toBe(4)
    expect(gradeToNumeric('D')).toBe(3)
    expect(gradeToNumeric('F')).toBe(1)
  })

  it('should return 0 for unknown grades', () => {
    expect(gradeToNumeric('X')).toBe(0)
    expect(gradeToNumeric('')).toBe(0)
  })
})

// ============ calculateAverageCorrectRate 测试 ============

describe('calculateAverageCorrectRate', () => {
  it('should return 0 for empty array', () => {
    expect(calculateAverageCorrectRate([])).toBe(0)
  })

  it('should calculate correct rate accurately', () => {
    const attempts: UserAttemptData[] = [
      { id: '1', isCorrect: true, createdAt: new Date(), questionId: 'q1' },
      { id: '2', isCorrect: true, createdAt: new Date(), questionId: 'q2' },
      { id: '3', isCorrect: false, createdAt: new Date(), questionId: 'q3' },
      { id: '4', isCorrect: false, createdAt: new Date(), questionId: 'q4' }
    ]
    expect(calculateAverageCorrectRate(attempts)).toBe(50)
  })

  it('should return 100 for all correct', () => {
    const attempts: UserAttemptData[] = [
      { id: '1', isCorrect: true, createdAt: new Date(), questionId: 'q1' },
      { id: '2', isCorrect: true, createdAt: new Date(), questionId: 'q2' }
    ]
    expect(calculateAverageCorrectRate(attempts)).toBe(100)
  })

  it('should return 0 for all incorrect', () => {
    const attempts: UserAttemptData[] = [
      { id: '1', isCorrect: false, createdAt: new Date(), questionId: 'q1' },
      { id: '2', isCorrect: false, createdAt: new Date(), questionId: 'q2' }
    ]
    expect(calculateAverageCorrectRate(attempts)).toBe(0)
  })
})

// ============ calculateCourseCompletion 测试 ============

describe('calculateCourseCompletion', () => {
  it('should return 0 for empty array', () => {
    expect(calculateCourseCompletion([])).toBe(0)
  })

  it('should calculate completion based on isCompleted and progress', () => {
    const progress: UserProgressData[] = [
      { id: '1', progress: 100, isCompleted: true, lessonId: 'l1' },
      { id: '2', progress: 50, isCompleted: false, lessonId: 'l2' }
    ]
    // completionByCount = 50%, avgProgress = 75%
    // result = 50 * 0.7 + 75 * 0.3 = 35 + 22.5 = 57.5
    expect(calculateCourseCompletion(progress)).toBe(57.5)
  })

  it('should return 100 for all completed with full progress', () => {
    const progress: UserProgressData[] = [
      { id: '1', progress: 100, isCompleted: true, lessonId: 'l1' },
      { id: '2', progress: 100, isCompleted: true, lessonId: 'l2' }
    ]
    expect(calculateCourseCompletion(progress)).toBe(100)
  })
})

// ============ calculateStreakBonus 测试 ============

describe('calculateStreakBonus', () => {
  it('should return 0 for 0 streak', () => {
    expect(calculateStreakBonus(0)).toBe(0)
  })

  it('should return streak * 0.5 for streak < 20', () => {
    expect(calculateStreakBonus(10)).toBe(5)
    expect(calculateStreakBonus(5)).toBe(2.5)
  })

  it('should cap at 10 for streak >= 20', () => {
    expect(calculateStreakBonus(20)).toBe(10)
    expect(calculateStreakBonus(100)).toBe(10)
  })
})

// ============ calculateTrend 测试 ============

describe('calculateTrend', () => {
  it('should return STABLE for less than 7 attempts', () => {
    const attempts: UserAttemptData[] = [
      { id: '1', isCorrect: true, createdAt: new Date(), questionId: 'q1' }
    ]
    expect(calculateTrend(attempts)).toBe('STABLE')
  })

  it('should return UP when recent performance improves significantly', () => {
    const now = new Date()
    const attempts: UserAttemptData[] = []

    // 4-7天前: 低正确率
    for (let i = 4; i <= 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      attempts.push({ id: `old-${i}`, isCorrect: false, createdAt: date, questionId: `q${i}` })
    }

    // 最近3天: 高正确率
    for (let i = 0; i < 3; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      attempts.push({ id: `new-${i}`, isCorrect: true, createdAt: date, questionId: `q${i + 10}` })
    }

    expect(calculateTrend(attempts)).toBe('UP')
  })

  it('should return DOWN when recent performance declines significantly', () => {
    const now = new Date()
    const attempts: UserAttemptData[] = []

    // 4-7天前: 高正确率
    for (let i = 4; i <= 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      attempts.push({ id: `old-${i}`, isCorrect: true, createdAt: date, questionId: `q${i}` })
    }

    // 最近3天: 低正确率
    for (let i = 0; i < 3; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      attempts.push({ id: `new-${i}`, isCorrect: false, createdAt: date, questionId: `q${i + 10}` })
    }

    expect(calculateTrend(attempts)).toBe('DOWN')
  })
})

// ============ calculateConfidence 测试 ============

describe('calculateConfidence', () => {
  it('should return 0 for empty array', () => {
    expect(calculateConfidence([])).toBe(0)
  })

  it('should increase with more attempts', () => {
    const now = new Date()
    const fewAttempts: UserAttemptData[] = [
      { id: '1', isCorrect: true, createdAt: now, questionId: 'q1' }
    ]
    const manyAttempts: UserAttemptData[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`,
      isCorrect: true,
      createdAt: now,
      questionId: `q${i}`
    }))

    expect(calculateConfidence(manyAttempts)).toBeGreaterThan(calculateConfidence(fewAttempts))
  })

  it('should give activity bonus for recent attempts', () => {
    const now = new Date()
    const recentAttempts: UserAttemptData[] = [
      { id: '1', isCorrect: true, createdAt: now, questionId: 'q1' }
    ]

    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 30)
    const oldAttempts: UserAttemptData[] = [
      { id: '1', isCorrect: true, createdAt: oldDate, questionId: 'q1' }
    ]

    expect(calculateConfidence(recentAttempts)).toBeGreaterThan(calculateConfidence(oldAttempts))
  })
})

// ============ calculateRecentScores 测试 ============

describe('calculateRecentScores', () => {
  it('should return array of 7 elements', () => {
    const result = calculateRecentScores([])
    expect(result).toHaveLength(7)
  })

  it('should return 0 for days without attempts', () => {
    const result = calculateRecentScores([])
    expect(result.every(s => s === 0)).toBe(true)
  })

  it('should calculate daily correct rates', () => {
    const now = new Date()
    const attempts: UserAttemptData[] = [
      { id: '1', isCorrect: true, createdAt: now, questionId: 'q1' },
      { id: '2', isCorrect: false, createdAt: now, questionId: 'q2' }
    ]

    const result = calculateRecentScores(attempts)
    expect(result[result.length - 1]).toBe(50) // 今天: 1/2 = 50%
  })
})

// ============ calculateExamForecast 主函数测试 ============

describe('calculateExamForecast', () => {
  it('should return valid forecast object', () => {
    const forecast = calculateExamForecast([], [], 0)

    expect(forecast).toHaveProperty('grade')
    expect(forecast).toHaveProperty('score')
    expect(forecast).toHaveProperty('trend')
    expect(forecast).toHaveProperty('confidence')
    expect(forecast).toHaveProperty('recentScores')
  })

  it('should return F grade for no data', () => {
    const forecast = calculateExamForecast([], [], 0)
    expect(forecast.grade).toBe('F')
    expect(forecast.score).toBe(0)
  })

  it('should apply formula correctly', () => {
    const now = new Date()
    // 100% 正确率
    const attempts: UserAttemptData[] = [
      { id: '1', isCorrect: true, createdAt: now, questionId: 'q1' }
    ]
    // 100% 完成率
    const progress: UserProgressData[] = [
      { id: '1', progress: 100, isCompleted: true, lessonId: 'l1' }
    ]
    // 20天连续学习 (10分加成上限)
    const streak = 20

    const forecast = calculateExamForecast(attempts, progress, streak)

    // 预测分 = (100 * 0.6) + (100 * 0.3) + (10 * 0.1) = 60 + 30 + 1 = 91
    expect(forecast.score).toBe(91)
    expect(forecast.grade).toBe('A-') // 90-92 = A-
  })

  it('should have 7 recent scores for sparkline', () => {
    const forecast = calculateExamForecast([], [], 0)
    expect(forecast.recentScores).toHaveLength(7)
  })
})

// ============ generateMockForecast 测试 ============

describe('generateMockForecast', () => {
  it('should return valid mock forecast', () => {
    const mock = generateMockForecast()

    expect(mock.grade).toBe('A-')
    expect(mock.score).toBe(85.5)
    expect(mock.trend).toBe('UP')
    expect(mock.confidence).toBe(78)
    expect(mock.recentScores).toHaveLength(7)
  })
})
