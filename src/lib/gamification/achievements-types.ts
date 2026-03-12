export interface AchievementOverview {
  streak: number
  questions: number
  correctAnswers: number
  accuracy: number
  hours: string
  level: number
  xp: number
  nextLevelXp: number
  posts: number
  comments: number
}

export interface BadgeWithUnlockStatus {
  id: string
  code: string
  name: string
  description: string
  icon: string
  condition: string | null
  unlocked: boolean
  awardedAt: Date | null
}
