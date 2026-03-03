import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/common'
import AdminDashboardV2 from '@/components/admin/dashboard/v2/AdminDashboardV2'
import type {
  AdminDashboardAuditItem,
  AdminDashboardMetric,
  AdminDashboardQuickAction,
  AdminDashboardRiskItem,
  AdminDashboardRole,
  AdminDashboardWorkItem,
} from '@/types/admin-dashboard'

export const dynamic = 'force-dynamic'

const mockKpis: AdminDashboardMetric[] = [
  {
    id: 'kpi-active-users',
    title: '活跃用户',
    value: '2,845',
    trend: 3.2,
    trendLabel: '较昨日',
    sparklineData: [2120, 2201, 2310, 2250, 2418, 2550, 2845],
    visibleTo: ['ADMIN', 'TEACHER'],
  },
  {
    id: 'kpi-revenue',
    title: '营收',
    value: '¥128,420',
    trend: 12.5,
    trendLabel: '较昨日',
    sparklineData: [92000, 96000, 99800, 105000, 111000, 119000, 128420],
    visibleTo: ['ADMIN', 'TEACHER'],
  },
  {
    id: 'kpi-completion',
    title: '课程完成率',
    value: '68.2%',
    trend: 5.1,
    trendLabel: '较上周',
    sparklineData: [60, 61, 63, 64, 66, 67, 68.2],
    visibleTo: ['ADMIN', 'TEACHER'],
  },
  {
    id: 'kpi-tickets',
    title: '待处理工单',
    value: '12',
    trend: -10.0,
    trendLabel: '较昨日',
    sparklineData: [20, 18, 16, 15, 13, 10, 12],
    exception: '2 个超时风险',
    visibleTo: ['ADMIN', 'TEACHER'],
  },
  {
    id: 'kpi-system-errors',
    title: '系统异常',
    value: '3',
    trend: 50.0,
    trendLabel: '较昨日',
    sparklineData: [0, 1, 0, 2, 1, 2, 3],
    exception: '1 个 critical',
    visibleTo: ['ADMIN', 'TEACHER'],
  },
]

const mockWorkQueue: AdminDashboardWorkItem[] = [
  {
    id: 'w1',
    title: '审核新课程: Python 数据分析实战',
    sla: '1 小时剩余',
    slaLevel: 'critical',
    type: 'review',
    href: '/admin/content/review',
    visibleTo: ['ADMIN', 'TEACHER'],
  },
  {
    id: 'w2',
    title: '用户投诉: 无法播放视频 (ID: 9527)',
    sla: '4 小时剩余',
    slaLevel: 'warning',
    type: 'feedback',
    href: '/admin/feedback',
    visibleTo: ['ADMIN', 'TEACHER'],
  },
  {
    id: 'w3',
    title: '审核评论: 包含敏感词汇',
    sla: '12 小时剩余',
    slaLevel: 'normal',
    type: 'review',
    href: '/admin/content/reports',
    visibleTo: ['ADMIN', 'TEACHER'],
  },
  {
    id: 'w4',
    title: '退款申请: 误操作购买',
    sla: '23 小时剩余',
    slaLevel: 'normal',
    type: 'feedback',
    href: '/admin/feedback',
    visibleTo: ['ADMIN'],
  },
]

const mockRisks: AdminDashboardRiskItem[] = [
  {
    id: 'r1',
    title: '异常登录: 连续失败 50 次 (IP: 10.0.0.1)',
    level: 'critical',
    time: '10:42',
    source: 'Security_Gateway',
    href: '/admin/permissions',
    visibleTo: ['ADMIN'],
  },
  {
    id: 'r2',
    title: '数据库 CPU 使用率 > 90%',
    level: 'high',
    time: '09:15',
    source: 'Monitor_DB_Master',
    href: '/admin/permissions',
    visibleTo: ['ADMIN'],
  },
  {
    id: 'r3',
    title: 'API 响应延迟 > 2s',
    level: 'medium',
    time: '08:30',
    source: 'Monitor_API',
    href: '/admin/permissions',
    visibleTo: ['ADMIN'],
  },
]

const mockAudits: AdminDashboardAuditItem[] = [
  {
    id: 'a1',
    actor: 'admin_alice',
    action: '强制下架',
    target: 'Course_ID_8821',
    time: '10:30',
    level: 'critical',
    visibleTo: ['ADMIN'],
  },
  {
    id: 'a2',
    actor: 'teacher_bob',
    action: '更新章节',
    target: 'React_Basics_Ch3',
    time: '09:45',
    level: 'info',
    visibleTo: ['ADMIN', 'TEACHER'],
  },
  {
    id: 'a3',
    actor: 'system_bot',
    action: '自动封禁',
    target: 'User_Spam_112',
    time: '09:00',
    level: 'warning',
    visibleTo: ['ADMIN'],
  },
]

const mockActions: AdminDashboardQuickAction[] = [
  { id: 'qa1', label: '内容审核', icon: 'review', href: '/admin/content/review', visibleTo: ['ADMIN', 'TEACHER'] },
  { id: 'qa2', label: '用户管理', icon: 'users', href: '/admin/users', visibleTo: ['ADMIN', 'TEACHER'] },
  { id: 'qa3', label: '权限配置', icon: 'permissions', href: '/admin/permissions', visibleTo: ['ADMIN'] },
  { id: 'qa4', label: '学员反馈', icon: 'feedback', href: '/admin/feedback', visibleTo: ['ADMIN', 'TEACHER'] },
  { id: 'qa5', label: '优惠券管理', icon: 'vouchers', href: '/admin/vouchers', visibleTo: ['ADMIN'] },
]

export default async function AdminDashboardPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login?redirectTo=/admin')
  }

  if (profile.role !== 'ADMIN' && profile.role !== 'TEACHER') {
    redirect('/dashboard')
  }

  const role = profile.role as AdminDashboardRole

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <AdminDashboardV2
        role={role}
        kpis={mockKpis}
        workQueue={mockWorkQueue}
        risks={mockRisks}
        audits={mockAudits}
        actions={mockActions}
        lastUpdated={new Date().toISOString()}
      />
    </AdminClientWrapper>
  )
}
