import { describe, it, expect } from 'vitest'
import {
  MasteryLevel,
  calculateChapterMastery,
  calculateChapterHotness,
  calculateWeightedAccuracy,
  getMasteryLevelLabel,
  getMasteryStars,
  getHotnessDisplay,
  MASTERY_CONFIG,
  HOTNESS_CONFIG,
} from '../mastery'

// ============ 测试辅助函数 ============

/**
 * 创建模拟的 UserAttempt 记录
 */
function createAttempt(
  isCorrect: boolean,
  daysAgo: number,
  baseDate: Date = new Date()
): { isCorrect: boolean; createdAt: Date } {
  const createdAt = new Date(baseDate)
  createdAt.setDate(createdAt.getDate() - daysAgo)
  return { isCorrect, createdAt }
}

/**
 * 批量创建答题记录
 */
function createAttempts(
  configs: Array<{ isCorrect: boolean; daysAgo: number }>,
  baseDate: Date = new Date()
): Array<{ isCorrect: boolean; createdAt: Date }> {
  return configs.map((c) => createAttempt(c.isCorrect, c.daysAgo, baseDate))
}

// ============ calculateChapterMastery 测试 ============

describe('calculateChapterMastery', () => {
  const baseDate = new Date('2024-06-15T12:00:00Z')

  describe('边界情况', () => {
    it('空数组返回 NOT_STARTED', () => {
      expect(calculateChapterMastery([], baseDate)).toBe(MasteryLevel.NOT_STARTED)
    })

    it('单条正确记录返回 ADVANCED', () => {
      const attempts = [createAttempt(true, 0, baseDate)]
      expect(calculateChapterMastery(attempts, baseDate)).toBe(MasteryLevel.ADVANCED)
    })

    it('单条错误记录返回 BEGINNER', () => {
      const attempts = [createAttempt(false, 0, baseDate)]
      expect(calculateChapterMastery(attempts, baseDate)).toBe(MasteryLevel.BEGINNER)
    })
  })

  describe('等级阈值测试', () => {
    it('100% 正确率 → ADVANCED', () => {
      // 全部正确的记录
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 1 },
        { isCorrect: true, daysAgo: 2 },
        { isCorrect: true, daysAgo: 3 },
        { isCorrect: true, daysAgo: 4 },
      ], baseDate)
      expect(calculateChapterMastery(attempts, baseDate)).toBe(MasteryLevel.ADVANCED)
    })

    it('0% 正确率 → BEGINNER', () => {
      // 全部错误的记录
      const attempts = createAttempts([
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 1 },
        { isCorrect: false, daysAgo: 2 },
        { isCorrect: false, daysAgo: 3 },
        { isCorrect: false, daysAgo: 4 },
      ], baseDate)
      expect(calculateChapterMastery(attempts, baseDate)).toBe(MasteryLevel.BEGINNER)
    })

    it('刚好 80% 正确率 → ADVANCED', () => {
      // 10题中8题正确 (相同时间权重相同)
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
      ], baseDate)
      expect(calculateChapterMastery(attempts, baseDate)).toBe(MasteryLevel.ADVANCED)
    })

    it('刚好 60% 正确率 → INTERMEDIATE', () => {
      // 10题中6题正确 (相同时间权重相同)
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
      ], baseDate)
      expect(calculateChapterMastery(attempts, baseDate)).toBe(MasteryLevel.INTERMEDIATE)
    })

    it('59% 正确率 → BEGINNER', () => {
      // 模拟略低于60%的情况
      // 使用均匀分布的记录，近似59%
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        // 5 正确 / 9 总数 ≈ 55.5%
      ], baseDate)
      expect(calculateChapterMastery(attempts, baseDate)).toBe(MasteryLevel.BEGINNER)
    })
  })

  describe('指数衰减加权测试', () => {
    it('近期答对的权重更高', () => {
      // 场景: 早期全错，近期全对
      // 预期: 由于近期权重更高，总体应该偏向 ADVANCED
      const attempts = createAttempts([
        // 近期3天全对
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 1 },
        { isCorrect: true, daysAgo: 2 },
        // 早期20天前全错
        { isCorrect: false, daysAgo: 20 },
        { isCorrect: false, daysAgo: 21 },
        { isCorrect: false, daysAgo: 22 },
      ], baseDate)

      const level = calculateChapterMastery(attempts, baseDate)
      // 近期3天权重 ≈ 1 + 0.9 + 0.82 = 2.72
      // 远期20天权重 ≈ 0.14 * 3 = 0.42
      // 加权正确率 ≈ 2.72 / (2.72 + 0.42) ≈ 86.6%
      expect(level).toBe(MasteryLevel.ADVANCED)
    })

    it('近期答错对总分影响更大', () => {
      // 场景: 早期全对，近期全错
      // 预期: 由于近期权重更高，总体应该偏向 BEGINNER
      const attempts = createAttempts([
        // 近期3天全错
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 1 },
        { isCorrect: false, daysAgo: 2 },
        // 早期20天前全对
        { isCorrect: true, daysAgo: 20 },
        { isCorrect: true, daysAgo: 21 },
        { isCorrect: true, daysAgo: 22 },
      ], baseDate)

      const level = calculateChapterMastery(attempts, baseDate)
      // 加权正确率 ≈ 0.42 / (2.72 + 0.42) ≈ 13.4%
      expect(level).toBe(MasteryLevel.BEGINNER)
    })

    it('半衰期7天验证: 7天前的权重约为0.5', () => {
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 0 },   // 权重 ≈ 1
        { isCorrect: false, daysAgo: 7 },  // 权重 ≈ 0.5
      ], baseDate)

      // 加权正确率 ≈ 1 / (1 + 0.5) ≈ 66.7%
      const accuracy = calculateWeightedAccuracy(attempts, baseDate)
      expect(accuracy).toBeGreaterThanOrEqual(65)
      expect(accuracy).toBeLessThanOrEqual(68)
    })
  })

  describe('记录数量限制测试', () => {
    it('只使用最近 MAX_ATTEMPTS 条记录', () => {
      // 创建超过限制数量的记录
      const attempts: Array<{ isCorrect: boolean; createdAt: Date }> = []

      // 最近30条全对
      for (let i = 0; i < MASTERY_CONFIG.MAX_ATTEMPTS; i++) {
        attempts.push(createAttempt(true, i, baseDate))
      }

      // 更早的30条全错 (应该被忽略)
      for (let i = MASTERY_CONFIG.MAX_ATTEMPTS; i < MASTERY_CONFIG.MAX_ATTEMPTS * 2; i++) {
        attempts.push(createAttempt(false, i, baseDate))
      }

      expect(calculateChapterMastery(attempts, baseDate)).toBe(MasteryLevel.ADVANCED)
    })
  })
})

// ============ calculateWeightedAccuracy 测试 ============

describe('calculateWeightedAccuracy', () => {
  const baseDate = new Date('2024-06-15T12:00:00Z')

  it('空数组返回 0', () => {
    expect(calculateWeightedAccuracy([], baseDate)).toBe(0)
  })

  it('全对返回 100', () => {
    const attempts = createAttempts([
      { isCorrect: true, daysAgo: 0 },
      { isCorrect: true, daysAgo: 1 },
    ], baseDate)
    expect(calculateWeightedAccuracy(attempts, baseDate)).toBe(100)
  })

  it('全错返回 0', () => {
    const attempts = createAttempts([
      { isCorrect: false, daysAgo: 0 },
      { isCorrect: false, daysAgo: 1 },
    ], baseDate)
    expect(calculateWeightedAccuracy(attempts, baseDate)).toBe(0)
  })

  it('返回四舍五入的整数', () => {
    const attempts = createAttempts([
      { isCorrect: true, daysAgo: 0 },
      { isCorrect: true, daysAgo: 0 },
      { isCorrect: false, daysAgo: 0 },
    ], baseDate)
    // 2/3 = 66.666...%
    expect(calculateWeightedAccuracy(attempts, baseDate)).toBe(67)
  })
})

// ============ calculateChapterHotness 测试 ============

describe('calculateChapterHotness', () => {
  const baseDate = new Date('2024-06-15T12:00:00Z')

  describe('边界情况', () => {
    it('空数组返回 NORMAL', () => {
      expect(calculateChapterHotness([], baseDate)).toBe('NORMAL')
    })

    it('单条错误记录返回 WEAK (30天正确率为0%)', () => {
      const attempts = [createAttempt(false, 0, baseDate)]
      // 单条错误记录 → 30天正确率为0% < 60% → WEAK
      expect(calculateChapterHotness(attempts, baseDate)).toBe('WEAK')
    })

    it('单条正确记录返回 NORMAL', () => {
      const attempts = [createAttempt(true, 0, baseDate)]
      // 单条正确记录 → 30天正确率为100% → NORMAL
      expect(calculateChapterHotness(attempts, baseDate)).toBe('NORMAL')
    })
  })

  describe('HOT 判定测试', () => {
    it('7天内 > 10次 且 正确率 < 70% → HOT', () => {
      // 7天内11次，正确率约45% (5对6错)
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: true, daysAgo: 1 },
        { isCorrect: false, daysAgo: 1 },
        { isCorrect: true, daysAgo: 2 },
        { isCorrect: false, daysAgo: 2 },
        { isCorrect: true, daysAgo: 3 },
        { isCorrect: false, daysAgo: 3 },
        { isCorrect: true, daysAgo: 4 },
        { isCorrect: false, daysAgo: 4 },
        { isCorrect: false, daysAgo: 5 },
      ], baseDate)
      expect(calculateChapterHotness(attempts, baseDate)).toBe('HOT')
    })

    it('7天内刚好 10次 → 不满足 HOT (需要 > 10)', () => {
      const attempts = createAttempts([
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 1 },
        { isCorrect: false, daysAgo: 1 },
        { isCorrect: false, daysAgo: 2 },
        { isCorrect: false, daysAgo: 2 },
        { isCorrect: false, daysAgo: 3 },
        { isCorrect: false, daysAgo: 3 },
        { isCorrect: false, daysAgo: 4 },
        { isCorrect: false, daysAgo: 4 },
      ], baseDate)
      // 10次全错，但数量刚好是10，不满足 > 10 的条件
      // 但30天正确率为0%，满足 WEAK 条件
      expect(calculateChapterHotness(attempts, baseDate)).toBe('WEAK')
    })

    it('7天内 > 10次 但正确率 >= 70% → 不是 HOT', () => {
      // 7天内15次，正确率约80% (12对3错)
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: true, daysAgo: 1 },
        { isCorrect: true, daysAgo: 1 },
        { isCorrect: true, daysAgo: 1 },
        { isCorrect: true, daysAgo: 2 },
        { isCorrect: true, daysAgo: 2 },
        { isCorrect: true, daysAgo: 2 },
        { isCorrect: true, daysAgo: 3 },
        { isCorrect: true, daysAgo: 3 },
        { isCorrect: true, daysAgo: 3 },
        { isCorrect: false, daysAgo: 4 },
        { isCorrect: false, daysAgo: 5 },
        { isCorrect: false, daysAgo: 6 },
      ], baseDate)
      expect(calculateChapterHotness(attempts, baseDate)).toBe('NORMAL')
    })
  })

  describe('WEAK 判定测试', () => {
    it('30天正确率 < 60% → WEAK', () => {
      // 30天内5次，正确率40% (2对3错)
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 10 },
        { isCorrect: true, daysAgo: 15 },
        { isCorrect: false, daysAgo: 20 },
        { isCorrect: false, daysAgo: 25 },
        { isCorrect: false, daysAgo: 28 },
      ], baseDate)
      expect(calculateChapterHotness(attempts, baseDate)).toBe('WEAK')
    })

    it('30天正确率刚好 60% → NORMAL', () => {
      // 30天内5次，正确率60% (3对2错)
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 10 },
        { isCorrect: true, daysAgo: 15 },
        { isCorrect: true, daysAgo: 20 },
        { isCorrect: false, daysAgo: 25 },
        { isCorrect: false, daysAgo: 28 },
      ], baseDate)
      expect(calculateChapterHotness(attempts, baseDate)).toBe('NORMAL')
    })

    it('超过30天的记录不计入 WEAK 判定', () => {
      // 35天前的错误记录不应该影响判定
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 5 },
        { isCorrect: true, daysAgo: 10 },
        { isCorrect: true, daysAgo: 15 },
        { isCorrect: false, daysAgo: 35 }, // 超过30天，不计入
        { isCorrect: false, daysAgo: 40 }, // 超过30天，不计入
      ], baseDate)
      // 30天内3次全对，100%正确率
      expect(calculateChapterHotness(attempts, baseDate)).toBe('NORMAL')
    })
  })

  describe('优先级测试', () => {
    it('同时满足 HOT 和 WEAK 条件时，返回 HOT', () => {
      // 7天内15次，正确率33% - 同时满足HOT和WEAK
      const attempts = createAttempts([
        { isCorrect: true, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: false, daysAgo: 0 },
        { isCorrect: true, daysAgo: 1 },
        { isCorrect: false, daysAgo: 1 },
        { isCorrect: false, daysAgo: 1 },
        { isCorrect: true, daysAgo: 2 },
        { isCorrect: false, daysAgo: 2 },
        { isCorrect: false, daysAgo: 2 },
        { isCorrect: true, daysAgo: 3 },
        { isCorrect: false, daysAgo: 3 },
        { isCorrect: false, daysAgo: 3 },
        { isCorrect: true, daysAgo: 4 },
        { isCorrect: false, daysAgo: 4 },
        { isCorrect: false, daysAgo: 4 },
      ], baseDate)
      // 15次，5对10错，正确率33%
      expect(calculateChapterHotness(attempts, baseDate)).toBe('HOT')
    })
  })
})

// ============ 辅助函数测试 ============

describe('辅助函数', () => {
  describe('getMasteryLevelLabel', () => {
    it('返回正确的中文标签', () => {
      expect(getMasteryLevelLabel(MasteryLevel.NOT_STARTED)).toBe('未开始')
      expect(getMasteryLevelLabel(MasteryLevel.BEGINNER)).toBe('初学')
      expect(getMasteryLevelLabel(MasteryLevel.INTERMEDIATE)).toBe('中级')
      expect(getMasteryLevelLabel(MasteryLevel.ADVANCED)).toBe('高级')
    })

    it('无效值返回"未知"', () => {
      expect(getMasteryLevelLabel(99 as MasteryLevel)).toBe('未知')
    })
  })

  describe('getMasteryStars', () => {
    it('返回对应的星级数', () => {
      expect(getMasteryStars(MasteryLevel.NOT_STARTED)).toBe(0)
      expect(getMasteryStars(MasteryLevel.BEGINNER)).toBe(1)
      expect(getMasteryStars(MasteryLevel.INTERMEDIATE)).toBe(2)
      expect(getMasteryStars(MasteryLevel.ADVANCED)).toBe(3)
    })
  })

  describe('getHotnessDisplay', () => {
    it('HOT 返回红色标签', () => {
      const result = getHotnessDisplay('HOT')
      expect(result.label).toBe('需重点复习')
      expect(result.color).toBe('red')
    })

    it('WEAK 返回橙色标签', () => {
      const result = getHotnessDisplay('WEAK')
      expect(result.label).toBe('薄弱环节')
      expect(result.color).toBe('orange')
    })

    it('NORMAL 返回空标签', () => {
      const result = getHotnessDisplay('NORMAL')
      expect(result.label).toBe('')
      expect(result.color).toBe('gray')
    })
  })
})

// ============ 配置常量测试 ============

describe('配置常量', () => {
  it('MASTERY_CONFIG 包含预期值', () => {
    expect(MASTERY_CONFIG.MAX_ATTEMPTS).toBe(30)
    expect(MASTERY_CONFIG.DECAY_HALF_LIFE_DAYS).toBe(7)
    expect(MASTERY_CONFIG.THRESHOLDS.INTERMEDIATE).toBe(60)
    expect(MASTERY_CONFIG.THRESHOLDS.ADVANCED).toBe(80)
  })

  it('HOTNESS_CONFIG 包含预期值', () => {
    expect(HOTNESS_CONFIG.HOT_RECENT_DAYS).toBe(7)
    expect(HOTNESS_CONFIG.HOT_MIN_ATTEMPTS).toBe(10)
    expect(HOTNESS_CONFIG.HOT_ACCURACY_THRESHOLD).toBe(70)
    expect(HOTNESS_CONFIG.WEAK_RECENT_DAYS).toBe(30)
    expect(HOTNESS_CONFIG.WEAK_ACCURACY_THRESHOLD).toBe(60)
  })
})
