'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type OnboardingDashboardPreviewProps = {
  displayName: string
  school: string
  grade: string
  avatar: string | null
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <Card className="rounded-[18px] border border-slate-200 bg-white p-4 text-slate-900 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.18)]">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Card>
  )
}

export function OnboardingDashboardPreview({
  displayName,
  school,
  grade,
  avatar,
}: OnboardingDashboardPreviewProps) {
  return (
    <div className="relative h-full overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 text-slate-900 shadow-[0_24px_80px_-46px_rgba(15,23,42,0.22)] sm:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
        <div className="absolute left-[-12%] top-[-16%] h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[-14%] right-[-10%] h-64 w-64 rounded-full bg-slate-400/10 blur-3xl" />
      </div>

      <div className="relative flex h-full min-h-[360px] flex-col gap-5 desktop:min-h-[520px]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
              实时预览
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-950">
              你的 dashboard 会按这些资料打开。
            </h2>
          </div>

          <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 shadow-none">
            就绪
          </Badge>
        </div>

        <div className="grid gap-4 desktop:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <Card className="rounded-[22px] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border border-slate-200 ring-1 ring-slate-100">
                <AvatarImage src={avatar || ''} alt={displayName} />
                <AvatarFallback className="bg-slate-100 text-lg font-semibold text-slate-800">
                  {displayName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                  资料摘要
                </p>
                <h3 className="truncate text-2xl font-semibold tracking-tight text-slate-950">
                  {displayName || '你的姓名'}
                </h3>
                <p className="truncate text-sm text-slate-500">
                  {school || '你的学校'}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  年级
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {grade || '-'}
                </p>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  聚焦
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  Smart Drill
                </p>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  连续天数
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  0 days
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            <MetricCard
              title="今日"
              value="3 项任务"
              description="一轮热身、一个重点练习、以及今晚的回顾任务。"
            />
            <MetricCard
              title="建议优先"
              value="Error Wiper"
              description="dashboard 会根据年级和学校上下文优先安排薄弱题型。"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-[18px] border border-slate-200 bg-white p-4 text-slate-900 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              学习路径
            </p>
            <div className="mt-4 space-y-3">
              {['热身复习', '薄弱题型练习', '计时回顾'].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'size-2 rounded-full',
                      index === 0 ? 'bg-emerald-500' : 'bg-slate-300'
                    )}
                  />
                  <p className="text-sm text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[18px] border border-slate-200 bg-white p-4 text-slate-900 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              提醒时间
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  20:00
                </p>
                <p className="mt-2 text-sm text-slate-500">每日提醒预览</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                生效中
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
