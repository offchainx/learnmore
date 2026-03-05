'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  FileText,
  Key,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  ShieldAlert,
  Ticket,
  Users,
} from 'lucide-react'
import type {
  AdminDashboardAuditItem,
  AdminDashboardLoadState,
  AdminDashboardMetric,
  AdminDashboardQuickAction,
  AdminDashboardQuickActionIcon,
  AdminDashboardRiskItem,
  AdminDashboardRole,
  AdminDashboardWindow,
  AdminDashboardWorkItem,
} from '@/types/admin-dashboard'

interface AdminDashboardV2Props {
  role: AdminDashboardRole
  kpis: AdminDashboardMetric[]
  workQueue: AdminDashboardWorkItem[]
  risks: AdminDashboardRiskItem[]
  audits: AdminDashboardAuditItem[]
  actions: AdminDashboardQuickAction[]
  lastUpdated: string
  initialWindow?: AdminDashboardWindow
  initialState?: AdminDashboardLoadState
}

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-[#1F2937] bg-[#111827] shadow-sm ${className}`}>{children}</div>
)

const Badge = ({
  children,
  level = 'normal',
}: {
  children: React.ReactNode
  level?: 'normal' | 'warning' | 'critical' | 'info' | 'low' | 'medium' | 'high'
}) => {
  const styles = {
    normal: 'bg-[#1F2937] text-[#9CA3AF]',
    info: 'border border-blue-900/30 bg-blue-900/20 text-blue-400',
    low: 'border border-blue-900/30 bg-blue-900/20 text-blue-400',
    medium: 'border border-amber-900/30 bg-amber-900/20 text-amber-400',
    warning: 'border border-amber-900/30 bg-amber-900/20 text-amber-400',
    high: 'border border-red-900/30 bg-red-900/20 text-red-400',
    critical: 'border border-red-900/30 bg-red-900/20 text-red-400',
  }

  return <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[level]}`}>{children}</span>
}

const Sparkline = ({ data, color = '#3B82F6' }: { data: number[]; color?: string }) => {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 30
  const width = 60
  const step = width / (data.length - 1)

  const points = data
    .map((d, i) => {
      const x = i * step
      const y = height - ((d - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const Header = ({
  window,
  lastUpdated,
  loading,
  onRefresh,
  onWindowChange,
}: {
  window: AdminDashboardWindow
  lastUpdated: string
  loading: boolean
  onRefresh: () => void
  onWindowChange: (w: AdminDashboardWindow) => void
}) => {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#E5E7EB]">管理员总览</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-[#9CA3AF]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            数据窗口:
          </span>
          <span className="font-medium text-[#E5E7EB]">
            {window === 'TODAY' ? '今日 + 近7天' : window === 'WEEK' ? '本周 + 近30天' : '本月 + 近90天'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-1">
          {(['TODAY', 'WEEK', 'MONTH'] as AdminDashboardWindow[]).map((w) => (
            <button
              key={w}
              onClick={() => onWindowChange(w)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                window === w ? 'bg-[#1F2937] text-[#E5E7EB]' : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              {w === 'TODAY' ? '今日' : w === 'WEEK' ? '本周' : '本月'}
            </button>
          ))}
        </div>

        <div className="mx-1 h-4 w-px bg-[#1F2937]" />

        <span className="font-mono text-xs text-[#9CA3AF]">
          {new Date(lastUpdated).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>

        <button
          onClick={onRefresh}
          className="rounded-lg p-2 text-[#9CA3AF] transition-colors hover:bg-[#1F2937] hover:text-[#E5E7EB]"
          title="刷新数据"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  )
}

const KpiRow = ({ items }: { items: AdminDashboardMetric[] }) => {
  return (
    <section className="mb-8">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {items.map((item) => {
          const isPositive = item.trend >= 0
          const trendColor = isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'
          const sparklineColor = isPositive ? '#22C55E' : '#EF4444'

          return (
            <Card
              key={item.id}
              className="group min-w-[260px] shrink-0 snap-start p-5 transition-colors hover:border-[#374151] md:min-w-[280px] lg:basis-[calc((100%-3rem)/4)] lg:min-w-0"
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-sm font-medium text-[#9CA3AF]">{item.title}</h3>
                {item.exception && (
                  <span className="rounded border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-1.5 py-0.5 text-[10px] text-[#F59E0B]">
                    {item.exception}
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-[#E5E7EB]">{item.value}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`flex items-center text-xs font-medium ${trendColor}`}>
                      {isPositive ? <ArrowUpRight className="mr-0.5 h-3 w-3" /> : <ArrowDownRight className="mr-0.5 h-3 w-3" />}
                      {Math.abs(item.trend)}%
                    </span>
                    <span className="text-[10px] text-[#6B7280]">{item.trendLabel}</span>
                  </div>
                </div>
                <div className="opacity-50 transition-opacity group-hover:opacity-100">
                  <Sparkline data={item.sparklineData} color={sparklineColor} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

const PriorityQueue = ({ items }: { items: AdminDashboardWorkItem[] }) => {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1F2937] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          <h3 className="font-medium text-[#E5E7EB]">今日必须处理</h3>
        </div>
        <span className="text-xs text-[#6B7280]">按 SLA 升序</span>
      </div>
      <div className="min-h-[200px] max-h-[300px] flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-[#4B5563]">
            <CheckCircle className="mb-2 h-8 w-8 opacity-20" />
            <p className="text-sm">今日工作已清空</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#1F2937]">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="group block px-5 py-3 transition-colors hover:bg-[#1F2937]/50">
                  <div className="mb-1 flex items-start justify-between">
                    <span className="line-clamp-1 text-sm font-medium text-[#E5E7EB] transition-colors group-hover:text-blue-400">{item.title}</span>
                    <Badge level={item.slaLevel}>{item.sla}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${item.type === 'review' ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`} />
                    <span className="text-xs capitalize text-[#9CA3AF]">{item.type === 'review' ? '审核' : '反馈'}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

const RiskPanel = ({ items }: { items: AdminDashboardRiskItem[] }) => {
  return (
    <Card className="flex h-full flex-col border-[#EF4444]/30 bg-[#EF4444]/5">
      <div className="flex items-center justify-between border-b border-[#EF4444]/20 bg-[#EF4444]/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#EF4444]" />
          <h3 className="font-medium text-[#EF4444]">最近告警</h3>
        </div>
        <Badge level="critical">{items.length}</Badge>
      </div>
      <div className="min-h-[200px] max-h-[300px] flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-[#EF4444]/50">
            <ShieldAlert className="mb-2 h-8 w-8 opacity-20" />
            <p className="text-sm">系统运行安全</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#EF4444]/20">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="block px-5 py-3 transition-colors hover:bg-[#EF4444]/10">
                  <div className="mb-1 flex items-start justify-between">
                    <span className="text-sm font-medium text-[#E5E7EB]">{item.title}</span>
                    <span className="font-mono text-[10px] text-[#EF4444]">{item.time}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-[#9CA3AF]">{item.source}</span>
                    <span
                      className={`rounded border px-1.5 text-[10px] ${
                        item.level === 'critical'
                          ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]'
                          : item.level === 'high'
                            ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]'
                            : 'border-[#4B5563] text-[#9CA3AF]'
                      }`}
                    >
                      {item.level.toUpperCase()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

const AuditTable = ({ items }: { items: AdminDashboardAuditItem[] }) => {
  return (
    <Card className="mb-8 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1F2937] px-5 py-4">
        <h3 className="font-medium text-[#E5E7EB]">最近操作审计</h3>
        <Link href="/admin/permissions" className="text-xs text-[#3B82F6] hover:text-[#60A5FA]">
          查看全部日志
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1F2937]/50 text-xs uppercase tracking-wider text-[#6B7280]">
            <tr>
              <th className="px-5 py-3 font-medium">操作人</th>
              <th className="px-5 py-3 font-medium">行为</th>
              <th className="px-5 py-3 font-medium">对象</th>
              <th className="px-5 py-3 text-right font-medium">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {items.map((log) => (
              <tr key={log.id} className="transition-colors hover:bg-[#1F2937]/30">
                <td className="px-5 py-3 font-medium text-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#374151] text-[10px] text-[#E5E7EB]">
                      {log.actor.charAt(0)}
                    </div>
                    {log.actor}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge level={log.level}>{log.action}</Badge>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-[#9CA3AF]">{log.target}</td>
                <td className="px-5 py-3 text-right font-mono text-xs text-[#6B7280]">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

const QuickActions = ({ items }: { items: AdminDashboardQuickAction[] }) => {
  const getIcon = (type: AdminDashboardQuickActionIcon) => {
    switch (type) {
      case 'review':
        return <FileText className="h-5 w-5" />
      case 'feedback':
        return <MessageSquare className="h-5 w-5" />
      case 'users':
        return <Users className="h-5 w-5" />
      case 'permissions':
        return <Key className="h-5 w-5" />
      case 'vouchers':
        return <Ticket className="h-5 w-5" />
      default:
        return <MoreHorizontal className="h-5 w-5" />
    }
  }

  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">快捷入口</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex flex-col items-center justify-center rounded-xl border border-[#1F2937] bg-[#111827] p-4 transition-all hover:border-[#3B82F6] hover:bg-[#1F2937]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2937] text-[#9CA3AF] transition-colors group-hover:bg-[#3B82F6]/10 group-hover:text-[#3B82F6]">
              {getIcon(item.icon)}
            </div>
            <span className="text-sm font-medium text-[#E5E7EB] transition-colors group-hover:text-white">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboardV2({
  role,
  kpis,
  workQueue,
  risks,
  audits,
  actions,
  lastUpdated,
  initialWindow = 'TODAY',
  initialState = 'SUCCESS',
}: AdminDashboardV2Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [window, setWindow] = useState<AdminDashboardWindow>(initialWindow)
  const [state, setState] = useState<AdminDashboardLoadState>(initialState)
  const [loading, setLoading] = useState(false)

  const isVisible = (visibleTo: AdminDashboardRole[]) => visibleTo.includes(role)

  const visibleKpis = kpis.filter((i) => isVisible(i.visibleTo))
  const visibleWorkQueue = workQueue.filter((i) => isVisible(i.visibleTo))
  const visibleRisks = risks.filter((i) => isVisible(i.visibleTo))
  const visibleAudits = audits.filter((i) => isVisible(i.visibleTo))
  const visibleActions = actions.filter((i) => isVisible(i.visibleTo))

  useEffect(() => {
    setWindow(initialWindow)
  }, [initialWindow])

  useEffect(() => {
    setState(initialState)
    setLoading(false)
  }, [initialState, kpis, workQueue, risks, audits, actions, lastUpdated])

  const handleRefresh = () => {
    setLoading(true)
    router.refresh()
  }

  const handleWindowChange = (nextWindow: AdminDashboardWindow) => {
    setWindow(nextWindow)
    setLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set('window', nextWindow)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  if (state === 'LOADING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1020]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    )
  }

  if (state === 'ERROR') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1020] text-[#EF4444]">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <h2 className="text-lg font-medium">数据加载失败</h2>
          <button onClick={handleRefresh} className="mt-4 rounded bg-[#1F2937] px-4 py-2 text-sm text-[#E5E7EB] hover:bg-[#374151]">
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1020] p-4 font-sans text-[#E5E7EB] md:p-8">
      <Header window={window} lastUpdated={lastUpdated} loading={loading} onRefresh={handleRefresh} onWindowChange={handleWindowChange} />

      <KpiRow items={visibleKpis} />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PriorityQueue items={visibleWorkQueue} />
        </div>
        <div>{role === 'ADMIN' ? <RiskPanel items={visibleRisks} /> : <Card className="flex h-full items-center justify-center p-6 text-sm text-[#4B5563]">暂无更多模块权限</Card>}</div>
      </div>

      <AuditTable items={visibleAudits} />
      <QuickActions items={visibleActions} />
    </div>
  )
}
