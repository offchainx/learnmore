import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, CheckSquare, MessageCircle, ShieldCheck, Users } from 'lucide-react'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/common'

export const dynamic = 'force-dynamic'

type AdminRole = 'ADMIN' | 'TEACHER'

type MetricCard = {
  id: string
  label: string
  value: string
  delta: string
  hint: string
}

type WorkItem = {
  id: string
  title: string
  meta: string
  level: 'normal' | 'urgent'
}

type ShortcutItem = {
  id: string
  label: string
  desc: string
  href: string
  visibleTo: AdminRole[]
  icon: typeof CheckSquare
}

const metricCards: MetricCard[] = [
  { id: 'users', label: '总用户数', value: '12,345', delta: '+123', hint: '本周累计 850' },
  { id: 'active', label: '活跃课程', value: '48', delta: '+2', hint: '本周累计 5' },
  { id: 'refund', label: '待处理退款', value: '3', delta: '+1', hint: '本周累计 12' },
  { id: 'security', label: '系统异常', value: '0', delta: '0', hint: '本周累计 1' },
]

const pendingItems: WorkItem[] = [
  { id: 'p1', title: '新课程发布申请：Python 进阶', meta: '提交人：张老师 · 2 小时前', level: 'normal' },
  { id: 'p2', title: '学生作业复核：算法基础', meta: '待复核数量：15 · 5 小时前', level: 'urgent' },
]

const feedbackItems: WorkItem[] = [
  { id: 'f1', title: '视频播放卡顿反馈（user_9527）', meta: '10 分钟前', level: 'normal' },
]

const securityItems: WorkItem[] = [
  { id: 's1', title: '异常登录尝试 IP 封禁', meta: 'IP: 192.168.x.x · 刚刚', level: 'urgent' },
]

const shortcutItems: ShortcutItem[] = [
  { id: 'review', label: '内容审核', desc: '进入题目审核队列', href: '/admin/content/review', visibleTo: ['ADMIN', 'TEACHER'], icon: CheckSquare },
  { id: 'users', label: '用户管理', desc: '查看用户状态与订阅', href: '/admin/users', visibleTo: ['ADMIN', 'TEACHER'], icon: Users },
  { id: 'feedback', label: '学员反馈', desc: '处理反馈工单', href: '/admin/feedback', visibleTo: ['ADMIN'], icon: MessageCircle },
  { id: 'security', label: '权限配置', desc: '管理角色权限与风险项', href: '/admin/permissions', visibleTo: ['ADMIN'], icon: ShieldCheck },
]

function levelClass(level: WorkItem['level']): string {
  if (level === 'urgent') {
    return 'bg-red-500/15 text-red-300 border border-red-400/30'
  }

  return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
}

export default async function AdminDashboardPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login?redirectTo=/admin')
  }

  if (profile.role !== 'ADMIN' && profile.role !== 'TEACHER') {
    redirect('/dashboard')
  }

  const role = profile.role as AdminRole
  const canViewSecurity = role === 'ADMIN'
  const visibleShortcuts = shortcutItems.filter((item) => item.visibleTo.includes(role))
  const updatedAt = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">管理员总览</h1>
              <p className="mt-1 text-sm text-slate-400">数据窗口：今日 + 近 7 天</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              更新时间 {updatedAt}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <article key={card.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">{card.label}</p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-3xl font-semibold text-white">{card.value}</p>
                <p className="text-sm text-emerald-300">{card.delta}</p>
              </div>
              <p className="mt-4 text-xs text-slate-500">{card.hint}</p>
            </article>
          ))}
        </section>

        <section className={`grid gap-4 ${canViewSecurity ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/80">
            <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h2 className="font-semibold text-white">待审核事项</h2>
              <Link href="/admin/content/review" className="text-xs text-blue-300 hover:text-blue-200">
                查看全部
              </Link>
            </header>
            <ul className="space-y-4 p-5">
              {pendingItems.map((item) => (
                <li key={item.id} className="space-y-2">
                  <p className="text-sm font-medium text-slate-100">{item.title}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400">{item.meta}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${levelClass(item.level)}`}>
                      {item.level}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/80">
            <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h2 className="font-semibold text-white">用户反馈</h2>
              <Link href="/admin/feedback" className="text-xs text-blue-300 hover:text-blue-200">
                查看全部
              </Link>
            </header>
            <ul className="space-y-4 p-5">
              {feedbackItems.map((item) => (
                <li key={item.id} className="space-y-2">
                  <p className="text-sm font-medium text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.meta}</p>
                </li>
              ))}
            </ul>
          </article>

          {canViewSecurity && (
            <article className="rounded-2xl border border-slate-800 bg-slate-900/80">
              <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <h2 className="font-semibold text-white">安全风险监控</h2>
                <Link href="/admin/permissions" className="text-xs text-blue-300 hover:text-blue-200">
                  查看全部
                </Link>
              </header>
              <ul className="space-y-4 p-5">
                {securityItems.map((item) => (
                  <li key={item.id} className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
                      <AlertTriangle className="h-4 w-4 text-red-300" />
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-400">{item.meta}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${levelClass(item.level)}`}>
                        {item.level}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80">
          <header className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold text-white">快捷入口</h2>
          </header>
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            {visibleShortcuts.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 transition hover:border-blue-400/60 hover:bg-slate-950"
                >
                  <Icon className="h-5 w-5 text-blue-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-100">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </AdminClientWrapper>
  )
}
