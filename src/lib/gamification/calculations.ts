import dayjs from 'dayjs'

/**
 * Gamification Calculations Module
 *
 * Pure calculation functions with no database operations.
 * Can be used in both client and server components.
 */

// Constants
export const XP_PER_LEVEL = 1000

/**
 * Calculate user level based on total XP
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

/**
 * Calculate XP required for next level
 */
export function calculateNextLevelXp(level: number): number {
  return level * XP_PER_LEVEL
}

/**
 * Calculate progress percentage to next level
 */
export function calculateLevelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp)
  const currentLevelXp = (currentLevel - 1) * XP_PER_LEVEL
  const nextLevelXp = calculateNextLevelXp(currentLevel)
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
  return Math.min(100, Math.max(0, progress))
}

/**
 * Check if streak should be incremented, broken, or maintained
 * Returns: 'increment' | 'break' | 'same_day'
 */
export function checkStreakStatus(
  lastStudyDate: Date | null,
  now: Date = new Date()
): 'first_time' | 'increment' | 'break' | 'same_day' {
  if (!lastStudyDate) {
    return 'first_time'
  }

  const nowDayjs = dayjs(now)
  const lastDateDayjs = dayjs(lastStudyDate)

  // Same day - no change
  if (lastDateDayjs.isSame(nowDayjs, 'day')) {
    return 'same_day'
  }

  // Consecutive day (yesterday) - increment
  if (lastDateDayjs.isSame(nowDayjs.subtract(1, 'day'), 'day')) {
    return 'increment'
  }

  // Streak broken
  return 'break'
}

/**
 * Calculate new streak value based on status
 */
export function calculateNewStreak(
  currentStreak: number,
  status: ReturnType<typeof checkStreakStatus>
): number {
  switch (status) {
    case 'first_time':
      return 1
    case 'increment':
      return currentStreak + 1
    case 'break':
      return 1
    case 'same_day':
      return currentStreak
    default:
      return currentStreak
  }
}

/**
 * Calculate streak multiplier for XP bonuses
 * Example: 7-day streak = 1.2x multiplier
 */
export function calculateStreakMultiplier(streak: number): number {
  if (streak >= 30) return 1.5 // 50% bonus for 30+ days
  if (streak >= 14) return 1.3 // 30% bonus for 14+ days
  if (streak >= 7) return 1.2 // 20% bonus for 7+ days
  return 1.0 // No bonus
}
