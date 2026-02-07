/**
 * Admin User Management - Subscription Types
 * 订阅和支付相关类型
 */

export interface PaymentRecord {
  id: string
  date: string
  amount: number
  type: 'Renewal' | 'Initial' | 'Adjustment'
  status: 'Success' | 'Refunded' | 'Failed'
}

export interface PermissionRecord {
  id: string
  type: string
  duration: string
  reason: string
  admin: string
  date: string
}
