/**
 * Mastery Calculation Module
 * 掌握度计算模块
 *
 * 提供统一的章节掌握度和热度计算规则
 */

import type { UserAttempt } from '@prisma/client'

// ============ 掌握度等级定义 ============

/**
 * 掌握度等级枚举
 * - NOT_STARTED (0): 未开始 (0%)
 * - BEGINNER (1): 初学 (1-59%)
 * - INTERMEDIATE (2): 中级 (60-79%)
 * - ADVANCED (3): 高级 (80-100%)
 */
export enum MasteryLevel {
  NOT_STARTED = 0,
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
}

/**
 * 章节热度类型
 * - HOT: 近期频繁出错，需要重点复习
 * - WEAK: 长期薄弱，正确率低
 * - NORMAL: 正常状态
 */
export type ChapterHotness = 'HOT' | 'WEAK' | 'NORMAL'

// ============ 算法配置常量 ============

/**
 * 掌握度计算配置
 */
export const MASTERY_CONFIG = {
  /** 用于计算掌握度的最大答题记录数 */
  MAX_ATTEMPTS: 30,
  /** 指数衰减半衰期 (天) - 7天前的答题权重为50% */
  DECAY_HALF_LIFE_DAYS: 7,
  /** 掌握度等级阈值 */
  THRESHOLDS: {
    BEGINNER: 0, // 0% - 59%
    INTERMEDIATE: 60, // 60% - 79%
    ADVANCED: 80, // 80% - 100%
  },
} as const

/**
 * 热度计算配置
 */
export const HOTNESS_CONFIG = {
  /** HOT 判定: 最近N天内 */
  HOT_RECENT_DAYS: 7,
  /** HOT 判定: 最少答题次数 */
  HOT_MIN_ATTEMPTS: 10,
  /** HOT 判定: 正确率阈值 (低于此值为HOT) */
  HOT_ACCURACY_THRESHOLD: 70,
  /** WEAK 判定: 最近N天内 */
  WEAK_RECENT_DAYS: 30,
  /** WEAK 判定: 正确率阈值 (低于此值为WEAK) */
  WEAK_ACCURACY_THRESHOLD: 60,
} as const

// ============ 工具函数 ============

/**
 * 计算两个日期之间的天数差
 * @param date1 - 较早的日期
 * @param date2 - 较晚的日期 (默认为当前时间)
 * @returns 天数差 (浮点数)
 */
function daysBetween(date1: Date, date2: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return (date2.getTime() - date1.getTime()) / msPerDay
}

/**
 * 计算指数衰减权重
 * 使用半衰期公式: weight = 0.5 ^ (daysPassed / halfLife)
 *
 * @param daysPassed - 距今的天数
 * @param halfLifeDays - 半衰期天数
 * @returns 权重值 (0-1)
 */
function calculateDecayWeight(daysPassed: number, halfLifeDays: number): number {
  return Math.pow(0.5, daysPassed / halfLifeDays)
}

/**
 * 过滤指定天数内的答题记录
 * @param attempts - 答题记录数组
 * @param days - 天数范围
 * @param now - 当前时间 (可选，用于测试)
 * @returns 过滤后的答题记录
 */
function filterAttemptsByDays(
  attempts: Pick<UserAttempt, 'createdAt'>[],
  days: number,
  now: Date = new Date()
): Pick<UserAttempt, 'createdAt'>[] {
  const cutoffTime = now.getTime() - days * 24 * 60 * 60 * 1000
  return attempts.filter((a) => new Date(a.createdAt).getTime() >= cutoffTime)
}

// ============ 核心算法 ============

/**
 * 计算章节掌握度等级
 *
 * 算法逻辑:
 * 1. 取最近30次答题记录
 * 2. 使用指数衰减加权 (半衰期7天)
 * 3. 计算加权正确率
 * 4. 根据正确率返回对应等级
 *
 * @param attempts - 用户在该章节的答题记录
 * @param now - 当前时间 (可选，用于测试)
 * @returns MasteryLevel 枚举值
 *
 * @example
 * ```typescript
 * const attempts = await prisma.userAttempt.findMany({ where: { userId, questionId: { in: chapterQuestionIds } } })
 * const level = calculateChapterMastery(attempts)
 * // level: MasteryLevel.INTERMEDIATE
 * ```
 */
export function calculateChapterMastery(
  attempts: Pick<UserAttempt, 'isCorrect' | 'createdAt'>[],
  now: Date = new Date()
): MasteryLevel {
  // 边界情况: 无答题记录
  if (attempts.length === 0) {
    return MasteryLevel.NOT_STARTED
  }

  // 按时间倒序排序，取最近 MAX_ATTEMPTS 条记录
  const sortedAttempts = [...attempts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MASTERY_CONFIG.MAX_ATTEMPTS)

  // 计算加权正确率
  let totalWeight = 0
  let weightedCorrect = 0

  for (const attempt of sortedAttempts) {
    const daysPassed = daysBetween(new Date(attempt.createdAt), now)
    const weight = calculateDecayWeight(daysPassed, MASTERY_CONFIG.DECAY_HALF_LIFE_DAYS)

    totalWeight += weight
    if (attempt.isCorrect) {
      weightedCorrect += weight
    }
  }

  // 防止除零 (理论上不会发生，因为已检查 attempts.length > 0)
  if (totalWeight === 0) {
    return MasteryLevel.NOT_STARTED
  }

  const weightedAccuracy = (weightedCorrect / totalWeight) * 100

  // 根据正确率返回等级
  if (weightedAccuracy >= MASTERY_CONFIG.THRESHOLDS.ADVANCED) {
    return MasteryLevel.ADVANCED
  } else if (weightedAccuracy >= MASTERY_CONFIG.THRESHOLDS.INTERMEDIATE) {
    return MasteryLevel.INTERMEDIATE
  } else {
    return MasteryLevel.BEGINNER
  }
}

/**
 * 计算加权正确率百分比 (用于UI显示)
 *
 * @param attempts - 用户在该章节的答题记录
 * @param now - 当前时间 (可选，用于测试)
 * @returns 加权正确率 (0-100)，无记录返回 0
 */
export function calculateWeightedAccuracy(
  attempts: Pick<UserAttempt, 'isCorrect' | 'createdAt'>[],
  now: Date = new Date()
): number {
  if (attempts.length === 0) {
    return 0
  }

  const sortedAttempts = [...attempts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MASTERY_CONFIG.MAX_ATTEMPTS)

  let totalWeight = 0
  let weightedCorrect = 0

  for (const attempt of sortedAttempts) {
    const daysPassed = daysBetween(new Date(attempt.createdAt), now)
    const weight = calculateDecayWeight(daysPassed, MASTERY_CONFIG.DECAY_HALF_LIFE_DAYS)

    totalWeight += weight
    if (attempt.isCorrect) {
      weightedCorrect += weight
    }
  }

  if (totalWeight === 0) {
    return 0
  }

  return Math.round((weightedCorrect / totalWeight) * 100)
}

/**
 * 计算章节"热度"标签
 *
 * 热度规则:
 * - HOT: 最近7天内答题 > 10次 且 正确率 < 70%
 * - WEAK: 最近30天正确率 < 60%
 * - NORMAL: 其他情况
 *
 * @param attempts - 用户在该章节的答题记录
 * @param now - 当前时间 (可选，用于测试)
 * @returns ChapterHotness 类型
 *
 * @example
 * ```typescript
 * const hotness = calculateChapterHotness(attempts)
 * // hotness: 'HOT' | 'WEAK' | 'NORMAL'
 * ```
 */
export function calculateChapterHotness(
  attempts: Pick<UserAttempt, 'isCorrect' | 'createdAt'>[],
  now: Date = new Date()
): ChapterHotness {
  // 边界情况: 无答题记录
  if (attempts.length === 0) {
    return 'NORMAL'
  }

  // 检查 HOT 条件: 7天内 > 10次 且 正确率 < 70%
  const recentAttempts = filterAttemptsByDays(attempts, HOTNESS_CONFIG.HOT_RECENT_DAYS, now)

  if (recentAttempts.length > HOTNESS_CONFIG.HOT_MIN_ATTEMPTS) {
    const correctCount = (recentAttempts as Pick<UserAttempt, 'isCorrect' | 'createdAt'>[]).filter(
      (a) => a.isCorrect
    ).length
    const accuracy = (correctCount / recentAttempts.length) * 100

    if (accuracy < HOTNESS_CONFIG.HOT_ACCURACY_THRESHOLD) {
      return 'HOT'
    }
  }

  // 检查 WEAK 条件: 30天内正确率 < 60%
  const monthAttempts = filterAttemptsByDays(attempts, HOTNESS_CONFIG.WEAK_RECENT_DAYS, now)

  if (monthAttempts.length > 0) {
    const correctCount = (monthAttempts as Pick<UserAttempt, 'isCorrect' | 'createdAt'>[]).filter(
      (a) => a.isCorrect
    ).length
    const accuracy = (correctCount / monthAttempts.length) * 100

    if (accuracy < HOTNESS_CONFIG.WEAK_ACCURACY_THRESHOLD) {
      return 'WEAK'
    }
  }

  return 'NORMAL'
}

// ============ 辅助函数 ============

/**
 * 获取掌握度等级的显示标签
 * @param level - 掌握度等级
 * @returns 中文标签
 */
export function getMasteryLevelLabel(level: MasteryLevel): string {
  switch (level) {
    case MasteryLevel.NOT_STARTED:
      return '未开始'
    case MasteryLevel.BEGINNER:
      return '初学'
    case MasteryLevel.INTERMEDIATE:
      return '中级'
    case MasteryLevel.ADVANCED:
      return '高级'
    default:
      return '未知'
  }
}

/**
 * 获取掌握度等级对应的星级数 (用于UI显示)
 * @param level - 掌握度等级
 * @returns 星级数 (0-3)
 */
export function getMasteryStars(level: MasteryLevel): number {
  return level
}

/**
 * 获取热度标签的显示信息
 * @param hotness - 热度类型
 * @returns 包含标签和颜色的对象
 */
export function getHotnessDisplay(hotness: ChapterHotness): {
  label: string
  color: 'red' | 'orange' | 'gray'
} {
  switch (hotness) {
    case 'HOT':
      return { label: '需重点复习', color: 'red' }
    case 'WEAK':
      return { label: '薄弱环节', color: 'orange' }
    case 'NORMAL':
      return { label: '', color: 'gray' }
  }
}
