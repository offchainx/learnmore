import { DailyTaskType } from '@prisma/client'

/**
 * Gamification Type Definitions
 */

export interface DailyTaskTemplate {
  type: DailyTaskType
  title: string
  targetCount: number
  xpReward: number
}

export interface StreakData {
  lastStudyDate: Date | null
  streak: number
}

export interface LevelData {
  level: number
  xp: number
  nextLevelXp: number
  progress: number
}

export interface DailyTaskProgress {
  taskId: string
  type: DailyTaskType
  currentCount: number
  targetCount: number
  isCompleted: boolean
}

// Export DailyTaskType for convenience
export { DailyTaskType }
