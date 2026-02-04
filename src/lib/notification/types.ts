import type {
  Notification,
  UserFeedback, FeedbackCategory, FeedbackStatus,
  NotificationPreference
} from '@prisma/client'

// ==================== 通知 ====================

export type NotificationMetadata = {
  actorId?: string
  actorName?: string
  postId?: string
  postTitle?: string
  invoiceId?: string
  daysLeft?: number
  urgency?: 'warning' | 'urgent'
  questionId?: string
  badgeId?: string
  attemptId?: string
  orderId?: string
  rewardAmount?: number
  points?: number
  [key: string]: any
}

export type NotificationWithMeta = Omit<Notification, 'metadata'> & {
  metadata?: NotificationMetadata | null
}

// 保留旧别名，兼容已有代码
export type NotificationWithMetadata = NotificationWithMeta

export interface NotificationListResponse {
  notifications: NotificationWithMeta[]
  total: number
  unreadCount: number
}

export type NotificationPreferenceData = Omit<NotificationPreference, 'userId' | 'emailBilling' | 'updatedAt'>

// ==================== Email ====================

export interface SendEmailParams {
  to: string | string[]
  subject: string
  react?: React.ReactElement
  text?: string
  replyTo?: string
}

export interface SendEmailResult {
  success: boolean
  data?: { id: string }
  error?: unknown
}

// ==================== 反馈 ====================

export interface SubmitFeedbackInput {
  userId?: string
  category: FeedbackCategory
  title: string
  content: string
  email?: string
  attachments?: string[]
}

export type FeedbackWithUser = Omit<UserFeedback, 'user'> & {
  user?: {
    id: string
    email: string
    username: string | null
    subscriptionTier: string | null
  } | null
}

export interface FeedbackListResponse {
  feedbacks: FeedbackWithUser[]
  total: number
  byStatus: Partial<Record<FeedbackStatus, number>>
}
