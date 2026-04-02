import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Shared Helper Components ---

export const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
  indent = false,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  indent?: boolean
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className={cn(
      `group relative flex w-full items-center overflow-hidden rounded-2xl py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? 'border border-borderTone bg-surface-selected text-primary shadow-surface dark:border-borderTone dark:bg-surface-selected dark:text-primary'
          : 'border border-transparent text-text-secondary hover:border-borderTone hover:bg-surface-subtle hover:text-text-primary dark:text-text-secondary dark:hover:border-borderTone dark:hover:bg-surface-subtle dark:hover:text-text-primary'
      }`,
      indent ? 'pl-10 pr-4' : 'px-4'
    )}
  >
    {active && (
      <div className="absolute inset-y-2 left-2 w-1 rounded-full bg-primary dark:bg-primary" />
    )}
    <div className="relative z-10 mr-3 flex h-5 w-5 shrink-0 items-center justify-center">
      <Icon
        className={`h-full w-full ${active ? 'text-primary dark:text-primary' : 'text-text-tertiary group-hover:text-text-primary dark:text-text-tertiary dark:group-hover:text-text-primary'}`}
      />
    </div>
    <span className="relative z-10">{label}</span>
  </button>
)

export const SubjectCard = ({
  name,
  icon: Icon,
  color,
  bgGradient,
}: {
  name: string
  icon: React.ElementType
  color: string
  bgGradient: string
}) => (
  <Card className="group relative flex h-32 cursor-pointer flex-col justify-between overflow-hidden border-borderTone bg-surface p-5 shadow-surface transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle">
    <div
      className={`absolute right-0 top-0 h-24 w-24 bg-gradient-to-br ${bgGradient} rounded-bl-full opacity-10 transition-opacity group-hover:opacity-20`}
    />
    <div
      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-subtle ${color} ring-1 ring-borderTone transition-all group-hover:ring-[hsl(var(--border-strong))]`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div className="relative z-10">
      <h3 className="text-base font-bold tracking-tight text-text-primary dark:text-text-primary">
        {name}
      </h3>
      <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        85% Complete
      </p>
    </div>
  </Card>
)

export const CircularProgress = ({
  value,
  color,
  label,
  subLabel,
}: {
  value: number
  color: string
  label: string
  subLabel: string
}) => {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-32 w-32">
        <svg
          className="h-full w-full -rotate-90 transform"
          viewBox="0 0 128 128"
        >
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-[hsl(var(--border-subtle))] dark:text-[hsl(var(--border-default))]"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold leading-none text-text-primary dark:text-text-primary">
            {value}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-bold text-text-primary dark:text-text-primary">
          {label}
        </p>
        <p className="text-xs text-text-secondary">{subLabel}</p>
      </div>
    </div>
  )
}

export const StrengthBar = ({
  label,
  value,
  level,
  levelColor,
  suggestion,
}: {
  label: string
  value: number
  level: string
  levelColor: string
  suggestion?: string
}) => (
  <div className="mb-6 last:mb-0">
    <div className="mb-2 flex items-end justify-between">
      <span className="text-sm font-bold text-text-primary dark:text-text-primary">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${levelColor} text-white`}
        >
          {level}
        </span>
        <span className="w-8 text-right text-sm font-bold text-text-secondary dark:text-text-secondary">
          {value}%
        </span>
      </div>
    </div>
    <div className="mb-1 h-2.5 w-full rounded-full bg-[hsl(var(--border-subtle))] dark:bg-[hsl(var(--border-default))]">
      <div
        className={`h-2.5 rounded-full transition-all duration-1000 ${value >= 90 ? 'bg-[hsl(var(--state-success-fg))]' : value >= 75 ? 'bg-primary' : value >= 60 ? 'bg-[hsl(var(--state-warning-fg))]' : 'bg-[hsl(var(--state-danger-fg))]'}`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
    {suggestion && (
      <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300">
        ↑ {suggestion}
      </p>
    )}
  </div>
)

const MOTIVATIONAL_QUOTES = {
  en: [
    'The only way to do great work is to love what you do.',
    "Believe you can and you're halfway there.",
    'Success is the sum of small efforts, repeated day in and day out.',
  ],
  zh: [
    '做伟大的工作，唯一的方法就是热爱你所做的事情。',
    '相信你自己，你已经成功了一半。',
    '成功是每天重复不断的微小努力的总和。',
  ],
  ms: [
    'Satu-satunya cara untuk melakukan kerja yang hebat adalah dengan mencintai apa yang anda lakukan.',
    'Percaya anda boleh dan anda sudah separuh jalan ke sana.',
    'Kejayaan adalah jumlah usaha kecil, berulang hari demi hari.',
  ],
}

const INSPIRATION_BACKGROUNDS = [
  {
    shellLight:
      'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.5)_0%,transparent_28%),linear-gradient(135deg,#f8fafc_0%,#dbeafe_36%,#bfdbfe_100%)]',
    shellDark:
      'dark:bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.16)_0%,transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_36%,#1e3a8a_100%)]',
    glowLight: 'bg-sky-300/35',
    glowDark: 'dark:bg-sky-500/20',
    orbPrimaryLight: 'bg-white/55',
    orbPrimaryDark: 'dark:bg-slate-200/10',
    orbSecondaryLight: 'bg-sky-200/70',
    orbSecondaryDark: 'dark:bg-sky-400/16',
  },
  {
    shellLight:
      'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4)_0%,transparent_24%),linear-gradient(135deg,#fefce8_0%,#fde68a_40%,#fca5a5_100%)]',
    shellDark:
      'dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12)_0%,transparent_24%),linear-gradient(135deg,#111827_0%,#3f2f17_36%,#4c1d1d_100%)]',
    glowLight: 'bg-amber-300/35',
    glowDark: 'dark:bg-amber-500/18',
    orbPrimaryLight: 'bg-white/50',
    orbPrimaryDark: 'dark:bg-amber-100/10',
    orbSecondaryLight: 'bg-rose-200/65',
    orbSecondaryDark: 'dark:bg-rose-400/14',
  },
  {
    shellLight:
      'bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.38)_0%,transparent_26%),linear-gradient(135deg,#ecfeff_0%,#a5f3fc_42%,#bfdbfe_100%)]',
    shellDark:
      'dark:bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.1)_0%,transparent_26%),linear-gradient(135deg,#082f49_0%,#0f172a_42%,#172554_100%)]',
    glowLight: 'bg-cyan-300/35',
    glowDark: 'dark:bg-cyan-400/18',
    orbPrimaryLight: 'bg-white/50',
    orbPrimaryDark: 'dark:bg-cyan-100/10',
    orbSecondaryLight: 'bg-cyan-200/70',
    orbSecondaryDark: 'dark:bg-cyan-300/14',
  },
  {
    shellLight:
      'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.42)_0%,transparent_26%),linear-gradient(135deg,#faf5ff_0%,#ddd6fe_38%,#c4b5fd_100%)]',
    shellDark:
      'dark:bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.12)_0%,transparent_26%),linear-gradient(135deg,#1e1b4b_0%,#111827_38%,#312e81_100%)]',
    glowLight: 'bg-violet-300/35',
    glowDark: 'dark:bg-violet-500/18',
    orbPrimaryLight: 'bg-white/50',
    orbPrimaryDark: 'dark:bg-violet-100/10',
    orbSecondaryLight: 'bg-fuchsia-200/65',
    orbSecondaryDark: 'dark:bg-fuchsia-400/14',
  },
  {
    shellLight:
      'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35)_0%,transparent_26%),linear-gradient(135deg,#f0fdf4_0%,#86efac_40%,#6ee7b7_100%)]',
    shellDark:
      'dark:bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_26%),linear-gradient(135deg,#052e16_0%,#0f172a_40%,#14532d_100%)]',
    glowLight: 'bg-emerald-300/35',
    glowDark: 'dark:bg-emerald-500/18',
    orbPrimaryLight: 'bg-white/50',
    orbPrimaryDark: 'dark:bg-emerald-100/10',
    orbSecondaryLight: 'bg-emerald-200/65',
    orbSecondaryDark: 'dark:bg-emerald-300/14',
  },
] as const

function getDailySeed(lang: string) {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diff / 86400000)
  const langWeight = Array.from(lang).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return dayOfYear + langWeight
}

export const DailyInspiration = ({
  lang,
  t,
  welcomeTitle,
  welcomeSub,
  className,
}: {
  lang: string
  t: {
    dashboard?: { dailyVibe?: string }
    common?: { loading?: string; search?: string }
  }
  welcomeTitle: string
  welcomeSub: string
  className?: string
}) => {
  const [manualOffset, setManualOffset] = useState(0)
  const copy = (zh: string, en: string) => (lang.startsWith('zh') ? zh : en)

  const quotesList = useMemo(
    () =>
      MOTIVATIONAL_QUOTES[lang as keyof typeof MOTIVATIONAL_QUOTES] ||
      MOTIVATIONAL_QUOTES.en,
    [lang]
  )

  const dailySeed = useMemo(() => getDailySeed(lang), [lang])
  const activeIndex =
    (dailySeed + manualOffset) % Math.max(INSPIRATION_BACKGROUNDS.length, 1)
  const activeBackground = INSPIRATION_BACKGROUNDS[activeIndex]
  const quote = quotesList[(dailySeed + manualOffset) % quotesList.length]

  useEffect(() => {
    setManualOffset(0)
  }, [lang])

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-[28px] border border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] shadow-surface-lg dark:border-borderTone dark:bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] dark:shadow-[0_18px_48px_rgba(2,8,23,0.28)] ${className || 'h-56 sm:h-64'}`}
    >
      <div
        className={`absolute inset-0 transition-transform duration-700 group-hover:scale-105 ${activeBackground.shellLight} ${activeBackground.shellDark}`}
      />
      <div
        className={`pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full blur-3xl ${activeBackground.glowLight} ${activeBackground.glowDark}`}
      />
      <div
        className={`pointer-events-none absolute left-6 top-6 h-16 w-16 rounded-full blur-sm ${activeBackground.orbPrimaryLight} ${activeBackground.orbPrimaryDark}`}
      />
      <div
        className={`pointer-events-none absolute bottom-10 right-20 h-24 w-24 rounded-full blur-md ${activeBackground.orbSecondaryLight} ${activeBackground.orbSecondaryDark}`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/18 via-transparent to-transparent dark:from-white/8" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/92 via-white/56 to-transparent dark:from-slate-950/92 dark:via-slate-950/52 dark:to-transparent" />
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/78 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary backdrop-blur-md dark:border-white/12 dark:bg-slate-950/55 dark:text-slate-200">
            <Sparkles className="h-3 w-3 text-primary dark:text-sky-300" />
            {t.dashboard?.dailyVibe || copy('今日灵感', 'Daily Vibe')}
          </div>
          <h1 className="mt-3 text-lg font-semibold tracking-tight text-text-primary dark:text-slate-50 sm:text-[20px]">
            {welcomeTitle}
          </h1>
          <p className="mt-1.5 max-w-lg text-[12px] font-medium leading-5 text-text-secondary dark:text-slate-300 sm:text-[13px]">
            {welcomeSub}
          </p>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-sm italic leading-6 text-text-primary dark:text-slate-50 sm:text-[15px]">
              &quot;{quote}&quot;
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary/85 dark:text-slate-300/85">
              {copy('展示增强模块', 'Display enhancement only')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setManualOffset((value) => value + 1)}
            className="shrink-0 rounded-2xl border border-white/70 bg-white/78 px-3 text-[11px] font-semibold text-text-secondary backdrop-blur-sm hover:bg-white hover:text-text-primary dark:border-white/12 dark:bg-slate-950/55 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            {copy('换一张', 'Refresh')}
          </Button>
        </div>
      </div>
    </div>
  )
}
