/**
 * AnalyticsSidebar 类型定义
 */

export interface DbChapter {
  id: string
  title: string
  subjectId: string
  parentId: string | null
  order: number
  totalQuestions: number
  avgDifficulty: number | null
  cachedMastery: unknown
  lastCacheUpdate: Date | null
  createdAt: Date
  x: number | null
  y: number | null
}
