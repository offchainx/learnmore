/**
 * Admin User Management - User Detail Types
 * 用户详情页完整数据类型
 */

import { User } from './user-basic'
import { AdminNote, SecurityLogEntry, ImpersonationSessionInfo } from './user-security'

// 用户详情页完整数据
export interface UserDetail extends User {
  notes: AdminNote[]
  recentSecurityLogs: SecurityLogEntry[]
  activeImpersonationSession?: ImpersonationSessionInfo | null
}
