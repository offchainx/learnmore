/**
 * Types Barrel Export
 * 统一导出所有类型定义
 */

// ============ Student Namespace ============
/**
 * 学生端核心类型
 * @example
 * import { Student } from '@/types'
 * const user: Student.User = { ... }
 */
export namespace Student {
  /**
   * 学生用户信息
   * @description 包含学生个人信息和学习进度
   */
  export interface User {
    id: string
    email: string
    username: string
    avatar: string
    grade: number
    level: number
    xp: number
    streak: number
  }

  /**
   * 学科信息
   * @description 6个学科（数学、物理、化学、英语、语文、生物）
   */
  export interface Subject {
    id: string
    name: string
    icon: string
    color: string
    progress: number
    lastLesson: string
    masteryLevel: number
  }
}

// ============ Admin Namespace (Re-export) ============
/**
 * Admin后台用户管理相关类型
 * Story-046: 用户全生命周期管理后台
 * @example
 * import { Admin } from '@/types'
 * const user: Admin.User = { ... }
 */
export { Admin } from './admin'

// ============ Content Pipeline ============
/**
 * 内容流水线相关类型（批量导入、题目审核）
 */
export type {
  BatchStatusUI,
  BatchData,
  ImportTask,
  AuditLogType,
  AuditLogEntry,
  StatsData,
  QuestionOption,
  QuestionExplanation,
  QuestionMetadata,
  ReviewHistoryEntry,
  QuestionReviewData,
} from './content-pipeline'

// ============ Feedback ============
/**
 * 反馈系统相关类型
 */
export { FeedbackCategory, FeedbackStatus } from './feedback'
