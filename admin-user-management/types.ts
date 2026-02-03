export enum UserStatus {
  ACTIVE = 'Active',
  BANNED = 'Banned',
  PAUSED = 'Paused',
}

export enum SubscriptionTier {
  STARTER = 'Starter',
  STANDARD = 'Standard',
  SMART_PLUS = 'Smart+',
  PREMIER = 'Premier',
}

export interface ActivityLog {
  id: string;
  action: string;
  target?: string;
  timestamp: string; // ISO Date
  relativeTime: string;
}

// New Types for Detailed Views
export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  type: 'Renewal' | 'Initial' | 'Adjustment';
  status: 'Success' | 'Refunded' | 'Failed';
}

export interface PermissionRecord {
  id: string;
  type: string;
  duration: string;
  reason: string;
  admin: string;
  date: string;
}

export enum AuditEventType {
  ALL = 'All',
  PERMISSION = 'Permission Change',
  IMPERSONATE = 'Impersonation',
  STATUS = 'Status Change',
  LOGIN = 'Login',
  NOTE = 'Note',
  OTHER = 'Other'
}

export interface AuditLogItem {
  id: string;
  type: AuditEventType;
  title: string;
  description: string;
  timestamp: string;
  meta?: {
    isSessionStart?: boolean;
    isSessionEnd?: boolean;
  };
}

export interface ReferralNode {
  id: string;
  name: string;
  tier: SubscriptionTier;
  children?: ReferralNode[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  status: UserStatus;
  tier: SubscriptionTier;
  lastActive: string;
  lastActiveLabel: string;
  
  // Extended Profile Data
  grade: string;
  school: string;
  role: string;
  location: string;
  phone: string;
  joinDate: string;
  joinSource: string;
  totalSpend: number;
  projectsCount: number;
  apiCalls: number;
  
  // Stats
  activeDeviceCount: number;
  learningStats: {
    totalQuestions: number;
    accuracy: number;
    mistakes: number;
    daysActive: number;
  };
}

export interface SortConfig {
  key: keyof User;
  direction: 'asc' | 'desc';
}