import type {
  Notification,
  UserFeedback, FeedbackCategory, FeedbackStatus,
  NotificationPreference, User
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

export interface NotificationWithMetadata extends Omit<Notification, 'metadata'> {
  metadata: NotificationMetadata | null;
}

export interface NotificationListResponse {
  success: boolean;
  data?: NotificationWithMetadata[];
  unreadCount?: number;
  total?: number;
  error?: any;
}

export type NotificationPreferenceData = Omit<NotificationPreference, 'userId' | 'emailBilling' | 'updatedAt'>

// ==================== Email ====================

export interface SendEmailParams {
  to: string | string[]
  subject: string
  react?: React.ReactElement
  text?: string
  replyTo?: string
  template?: string
  props?: any
}

export interface SendEmailResult {
  success: boolean
  data?: any
  error?: any
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

export interface FeedbackWithUser extends UserFeedback {
  user?: Partial<User> | null;
}

export interface FeedbackListResponse {
  success: boolean;
  data?: FeedbackWithUser[];
  total?: number;
  byStatus?: Partial<Record<FeedbackStatus, number>>;
  error?: any;
}
