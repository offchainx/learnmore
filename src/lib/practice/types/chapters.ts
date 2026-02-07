/**
 * Practice Center - Chapter Related Types
 * 章节相关类型定义
 */

/**
 * 章节基本信息 + 用户掌握度统计
 */
export interface ChapterWithStats {
  id: string
  title: string
  subjectId: string
  parentId: string | null
  order: number
  // 用户统计数据
  stats: {
    totalAttempts: number      // 总答题次数
    correctCount: number       // 正确次数
    masteryLevel: number       // 掌握度 (0-100)
    questionCount: number      // 章节题目总数

    // 时间维度统计 (用于 HOT/WEAK 标签)
    recentAttempts?: number      // 近7天答题数
    recentCorrectRate?: number   // 近7天正确率
    monthlyCorrectRate?: number  // 近30天正确率
  }
}

/**
 * 科目下的章节列表（带统计）
 */
export interface SubjectChaptersResult {
  subjectId: string
  subjectName: string
  chapters: ChapterWithStats[]
}

/**
 * 薄弱点分析
 */
export interface WeaknessItem {
  chapterId: string
  chapterTitle: string
  correctRate: number    // 正确率 (0-100)
  masteryLevel: number   // 掌握度等级 (0-3)
}
