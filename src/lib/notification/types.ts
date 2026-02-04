export type NotificationMetadata = {
  questionId?: string;
  badgeId?: string;
  attemptId?: string;
  orderId?: string;
  rewardAmount?: number;
  points?: number;
  [key: string]: any;
};

export interface NotificationWithMetadata {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  link: string | null;
  isRead: boolean;
  metadata: NotificationMetadata | null;
  createdAt: Date;
}
