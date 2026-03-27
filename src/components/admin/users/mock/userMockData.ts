/**
 * Mock Data Generator for User Management
 * Story-046: 用户全生命周期管理后台
 *
 * 生成 200 条用户数据，覆盖所有 Status × Tier 组合
 */

import { Admin } from '@/types'

// 数据池
const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Cameron', 'Quinn', 'Avery', 'Sarah', 'Michael', 'David', 'Emma', 'Olivia', '小明', '小红', '小刚', '小芳', '志强']
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', '王', '李', '张', '刘', '陈']
const DOMAINS = ['gmail.com', 'outlook.com', 'qq.com', '163.com', 'student.edu.cn']
const GRADES = ['初一', '初二', '初三', '高一', '高二', '高三']
const SCHOOLS = ['北京市第一中学', '上海市实验中学', '深圳外国语学校', '杭州学军中学', '成都七中', '南京外国语学校', '广州执信中学', '武汉华师一附中']

const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
  'bg-pink-500', 'bg-rose-500'
]

// 工具函数
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateRelativeTime(offsetHours: number = 0): { iso: string; label: string } {
  const now = new Date()
  const time = new Date(now.getTime() - (offsetHours * 60 * 60 * 1000) - Math.random() * 10000000)

  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  let label = ''
  if (minutes < 60) label = `${minutes} 分钟前`
  else if (hours < 24) label = `${hours} 小时前`
  else if (days < 7) label = `${days} 天前`
  else if (days < 30) label = `${Math.floor(days / 7)} 周前`
  else label = time.toLocaleDateString('zh-CN')

  return { iso: time.toISOString(), label }
}

// 生成单个用户
function generateUser(index: number): Admin.User {
  const firstName = getRandomElement(FIRST_NAMES)
  const lastName = getRandomElement(LAST_NAMES)
  const name = firstName.length === 1 ? `${lastName}${firstName}` : `${firstName} ${lastName}`
  const emailName = firstName.toLowerCase().replace(/\s/g, '')
  const email = `${emailName}${Math.floor(Math.random() * 100)}@${getRandomElement(DOMAINS)}`

  // 确保覆盖所有 Status × Tier 组合
  const statuses = Object.values(Admin.UserStatus)
  const tiers = Object.values(Admin.SubscriptionTier)

  let status: Admin.UserStatus
  let tier: Admin.SubscriptionTier

  // 前 12 个用户确保覆盖所有组合 (3 status × 4 tier = 12)
  if (index < 12) {
    status = statuses[index % 3]
    tier = tiers[Math.floor(index / 3)]
  } else {
    // 其余用户随机分配，但保持合理的分布
    const statusRoll = Math.random()
    if (statusRoll < 0.8) status = Admin.UserStatus.ACTIVE
    else if (statusRoll < 0.9) status = Admin.UserStatus.PAUSED
    else status = Admin.UserStatus.BANNED

    tier = getRandomElement(tiers)
  }

  // 生成不同时间段的 lastActive
  let timeOffset = 0
  if (index % 4 === 0) timeOffset = Math.random() * 1 // 今天
  else if (index % 4 === 1) timeOffset = 24 + Math.random() * 144 // 本周
  else if (index % 4 === 2) timeOffset = 168 + Math.random() * 504 // 上月
  else timeOffset = 720 + Math.random() * 1440 // 3个月以前

  const timeInfo = generateRelativeTime(timeOffset)

  // 使用确定性 ID，避免 SSR/Client 重新生成导致 ID 不匹配
  const deterministicId = `usr_${(10000 + index).toString()}`

  return {
    id: deterministicId,
    name,
    email,
    avatarColor: getRandomElement(AVATAR_COLORS),
    status,
    tier,
    subscriptionEnd:
      tier === Admin.SubscriptionTier.STARTER
        ? null
        : new Date(
            Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 180
          ).toISOString(),
    lastActive: timeInfo.iso,
    lastActiveLabel: timeInfo.label,
    grade: getRandomElement(GRADES),
    school: getRandomElement(SCHOOLS),
    role: 'Student',
    location: '中国',
    phone: `+86 1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    joinDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString(),
    joinSource: Math.random() > 0.5 ? '邀请链接' : '自然搜索',
    totalSpend: Math.floor(Math.random() * 5000),
    projectsCount: Math.floor(Math.random() * 20),
    apiCalls: Math.floor(Math.random() * 100000),
    activeDeviceCount: Math.floor(Math.random() * 3) + 1,
    learningStats: {
      totalQuestions: Math.floor(Math.random() * 500),
      accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
      mistakes: Math.floor(Math.random() * 50),
      daysActive: Math.floor(Math.random() * 60) + 10,
    }
  }
}

// 生成用户列表（缓存）
let cachedUsers: Admin.User[] | null = null

export function generateUsers(count: number = 200): Admin.User[] {
  if (cachedUsers && cachedUsers.length === count) {
    return cachedUsers
  }

  const users: Admin.User[] = []
  for (let i = 0; i < count; i++) {
    users.push(generateUser(i))
  }

  // 按 lastActive 降序排列
  users.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())

  cachedUsers = users
  return users
}

// 模拟服务端分页、筛选、排序
export function fetchMockUsers(
  filters: Admin.UserFilterState,
  pagination: Admin.PaginationParams
): Admin.PaginatedResponse<Admin.UserSummary> {
  let result = generateUsers(200)

  // 1. 筛选
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.school.toLowerCase().includes(q)
    )
  }

  if (filters.status !== 'All') {
    result = result.filter(u => u.status === filters.status)
  }

  if (filters.tier !== 'All') {
    result = result.filter(u => u.tier === filters.tier)
  }

  // 2. 排序
  const { sortField, sortDirection } = pagination
  result.sort((a, b) => {
    if (sortField === 'lastActive') {
      const dateA = new Date(a.lastActive).getTime()
      const dateB = new Date(b.lastActive).getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    }

    if (sortField === 'subscriptionEnd') {
      const dateA = a.subscriptionEnd ? new Date(a.subscriptionEnd).getTime() : 0
      const dateB = b.subscriptionEnd ? new Date(b.subscriptionEnd).getTime() : 0
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    }

    const aValue = String(a[sortField] ?? '')
    const bValue = String(b[sortField] ?? '')

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // 3. 分页
  const total = result.length
  const totalPages = Math.ceil(total / pagination.pageSize)
  const startIndex = (pagination.page - 1) * pagination.pageSize
  const paginatedData = result.slice(startIndex, startIndex + pagination.pageSize)

  // 返回 Admin.UserSummary（不含完整用户信息）
  const summaries: Admin.UserSummary[] = paginatedData.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarColor: u.avatarColor,
    role: u.role,
    status: u.status,
    tier: u.tier,
    subscriptionEnd: u.subscriptionEnd,
    lastActive: u.lastActive,
    lastActiveLabel: u.lastActiveLabel,
    grade: u.grade,
    school: u.school,
  }))

  return {
    data: summaries,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
  }
}

// 根据 ID 获取用户详情
export function getUserById(id: string): Admin.User | undefined {
  const users = generateUsers(200)
  return users.find(u => u.id === id)
}

// --- New Mock Generators for Tab Content ---

export const generatePaymentHistory = (count: number): Admin.PaymentRecord[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `pay_${i}`,
    date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    amount: i === count - 1 ? 199 : 29, // Initial higher, monthly lower
    type: i === count - 1 ? 'Initial' : 'Renewal',
    status: Math.random() > 0.95 ? 'Refunded' : 'Success',
  }));
};

export const generateAuditLogs = (): Admin.AuditLogItem[] => {
  // Hardcoded to match the specific "Grouping" requirement in prompt
  return [
    {
      id: 'aud_1',
      type: Admin.AuditEventType.STATUS,
      title: 'USER_BANNED',
      description: 'Admin: system_bot | Reason: Suspicious API usage spike',
      timestamp: generateRelativeTime(2).label
    },
    {
      id: 'aud_2',
      type: Admin.AuditEventType.IMPERSONATE,
      title: 'IMPERSONATE_END',
      description: 'Reason: Active troubleshooting complete | Duration: 12 min',
      timestamp: generateRelativeTime(5).label,
      meta: { isSessionEnd: true }
    },
    {
      id: 'aud_3',
      type: Admin.AuditEventType.IMPERSONATE,
      title: 'IMPERSONATE_START',
      description: 'Admin: sarah.admin@co.com | Reason: User reported dashboard error',
      timestamp: generateRelativeTime(5.2).label, // Slightly older than end
      meta: { isSessionStart: true }
    },
    {
      id: 'aud_4',
      type: Admin.AuditEventType.PERMISSION,
      title: 'PERMISSION_OVERRIDE',
      description: 'Grant: 7 Days Trial | Reason: Customer support compensation',
      timestamp: generateRelativeTime(24).label
    },
    {
      id: 'aud_5',
      type: Admin.AuditEventType.NOTE,
      title: 'ADMIN_NOTE_ADDED',
      description: 'Admin: mike.support | Content: "User requested refund for May"',
      timestamp: generateRelativeTime(48).label
    },
    {
      id: 'aud_6',
      type: Admin.AuditEventType.LOGIN,
      title: 'LOGIN',
      description: 'IP: 192.168.1.45 | Method: Google OAuth',
      timestamp: generateRelativeTime(72).label
    }
  ];
};

export const generateReferralTree = (): Admin.ReferralNode => {
  return {
    id: 'root',
    name: 'Current User',
    tier: Admin.SubscriptionTier.PREMIER,
    children: [
      {
        id: 'ref_1',
        name: 'Alice M.',
        tier: Admin.SubscriptionTier.STANDARD,
        children: [
          { id: 'ref_1a', name: 'Bob D.', tier: Admin.SubscriptionTier.STARTER }
        ]
      },
      {
        id: 'ref_2',
        name: 'Charlie H.',
        tier: Admin.SubscriptionTier.SMART_PLUS,
        children: []
      },
      {
        id: 'ref_3',
        name: 'Diana P.',
        tier: Admin.SubscriptionTier.STARTER,
        children: []
      }
    ]
  };
};

export const generateHeatmapData = () => {
  // 12 weeks, 7 days
  const weeks = [];
  for (let w = 0; w < 12; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      // 0 = none, 1 = low, 2 = medium, 3 = high
      const val = Math.random();
      let intensity = 0;
      if (val > 0.8) intensity = 3;
      else if (val > 0.6) intensity = 2;
      else if (val > 0.3) intensity = 1;
      days.push(intensity);
    }
    weeks.push(days);
  }
  return weeks;
};
