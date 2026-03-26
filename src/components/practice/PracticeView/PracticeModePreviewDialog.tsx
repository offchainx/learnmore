'use client'

import { useRouter } from 'next/navigation'
import { BrainCircuit, Clock3, Compass, Eraser, FileText, Radar, Sparkles, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type PracticePreviewMode =
  | 'SMART_DRILL'
  | 'ERROR_WIPER'
  | 'MOCK_ARENA'
  | 'CHAPTER_MAP'
  | 'PAST_PAPER'

export type MockArenaDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

interface MockArenaPreviewOptions {
  onQuestionCountCycle: () => void
  onDifficultyCycle: () => void
}

export interface PracticeModePreviewConfig {
  mode: PracticePreviewMode
  title: string
  subtitle: string
  description: string
  primaryStatLabel: string
  primaryStatValue: string
  secondaryStatLabel: string
  secondaryStatValue: string
  tertiaryStatLabel: string
  tertiaryStatValue: string
  reasons: string[]
  details: Array<{ label: string; value: string }>
  startHref: string
  startLabel: string
  mockArenaOptions?: MockArenaPreviewOptions
}

interface PracticeModePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: PracticeModePreviewConfig | null
}

const previewThemeMap: Record<
  PracticePreviewMode,
  {
    badge: string
    gradient: string
    accent: string
    accentSoft: string
    primaryButton: string
    icon: typeof Radar
  }
> = {
  SMART_DRILL: {
    badge: 'Smart Drill Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(239,246,255,0.96)_52%,_rgba(224,242,254,0.9))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(135deg,_#0F1C33,_#08111F_58%,_#060C16)]',
    accent: 'text-cyan-700 dark:text-cyan-300',
    accentSoft: 'border-cyan-200/80 bg-cyan-50/90 dark:border-cyan-400/20 dark:bg-cyan-400/10',
    primaryButton: 'bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100',
    icon: Radar,
  },
  ERROR_WIPER: {
    badge: 'Error Wiper Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.18),_transparent_28%),linear-gradient(180deg,_rgba(255,251,251,0.98),_rgba(255,241,242,0.96)_52%,_rgba(255,228,230,0.92))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.18),_transparent_24%),linear-gradient(135deg,_#2A1520,_#111827_58%,_#0A0F1A)]',
    accent: 'text-rose-700 dark:text-rose-300',
    accentSoft: 'border-rose-200/80 bg-rose-50/90 dark:border-rose-400/20 dark:bg-rose-400/10',
    primaryButton: 'bg-rose-500 text-white hover:bg-rose-600 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100',
    icon: Eraser,
  },
  MOCK_ARENA: {
    badge: 'Mock Arena Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.18),_transparent_28%),linear-gradient(180deg,_rgba(250,250,255,0.98),_rgba(238,242,255,0.96)_52%,_rgba(224,231,255,0.92))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.18),_transparent_24%),linear-gradient(135deg,_#201A4A,_#111827_58%,_#0A0F1A)]',
    accent: 'text-indigo-700 dark:text-indigo-300',
    accentSoft: 'border-indigo-200/80 bg-indigo-50/90 dark:border-indigo-400/20 dark:bg-indigo-400/10',
    primaryButton: 'bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100',
    icon: Trophy,
  },
  CHAPTER_MAP: {
    badge: 'Chapter Map Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_rgba(255,252,245,0.98),_rgba(255,251,235,0.96)_52%,_rgba(254,243,199,0.92))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(135deg,_#2A2416,_#111827_58%,_#0A0F1A)]',
    accent: 'text-amber-700 dark:text-amber-300',
    accentSoft: 'border-amber-200/80 bg-amber-50/90 dark:border-amber-400/20 dark:bg-amber-400/10',
    primaryButton: 'bg-amber-500 text-slate-950 hover:bg-amber-400 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100',
    icon: Compass,
  },
  PAST_PAPER: {
    badge: 'Past Paper Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(180deg,_rgba(247,252,255,0.98),_rgba(240,249,255,0.96)_52%,_rgba(224,242,254,0.92))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(135deg,_#102338,_#111827_58%,_#0A0F1A)]',
    accent: 'text-sky-700 dark:text-sky-300',
    accentSoft: 'border-sky-200/80 bg-sky-50/90 dark:border-sky-400/20 dark:bg-sky-400/10',
    primaryButton: 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100',
    icon: FileText,
  },
}

export function PracticeModePreviewDialog({
  open,
  onOpenChange,
  config,
}: PracticeModePreviewDialogProps) {
  const router = useRouter()

  if (!config) return null

  const theme = previewThemeMap[config.mode]
  const Icon = theme.icon
  const isMockArena = config.mode === 'MOCK_ARENA' && config.mockArenaOptions

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-4xl overflow-hidden border border-borderTone bg-surface p-0 text-text-primary shadow-[0_30px_90px_rgba(15,23,42,0.18)] dark:border-borderTone dark:bg-surface dark:text-white dark:shadow-[0_30px_90px_rgba(2,8,23,0.55)]">
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 ${theme.gradient}`} />
          <div className="absolute -right-16 -top-12 h-44 w-44 rounded-full bg-white/70 blur-3xl dark:bg-white/10" />
          <div className="absolute left-20 top-10 h-24 w-24 rounded-full bg-white/50 blur-3xl dark:bg-white/5" />

          <div className="relative p-6 sm:p-8">
            <DialogHeader className="space-y-3 text-left">
              <div className={cn('inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em]', theme.accent, theme.accentSoft)}>
                <Icon className="h-3.5 w-3.5" />
                {theme.badge}
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight text-text-primary dark:text-white sm:text-4xl">
                {config.title}
              </DialogTitle>
              <DialogDescription className="max-w-2xl text-sm leading-6 text-text-secondary dark:text-slate-300">
                <span className="font-bold text-text-primary dark:text-white">{config.subtitle}</span>
                {' · '}
                {config.description}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                className={cn(
                  'rounded-2xl border border-borderTone bg-surface p-4 text-left shadow-surface backdrop-blur-md transition hover:bg-surface-subtle dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10',
                  isMockArena && 'cursor-pointer'
                )}
                onClick={() => config.mockArenaOptions?.onQuestionCountCycle()}
                disabled={!isMockArena}
              >
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-text-tertiary dark:text-slate-400">
                  <Target className={`h-3.5 w-3.5 ${theme.accent}`} />
                  {config.primaryStatLabel}
                </div>
                <div className="mt-3 text-2xl font-black text-text-primary dark:text-white">{config.primaryStatValue}</div>
                {isMockArena ? (
                  <div className="mt-2 text-xs text-text-secondary dark:text-slate-400">
                    点击切换下一档题量
                  </div>
                ) : null}
              </button>
              <div className="rounded-2xl border border-borderTone bg-surface p-4 shadow-surface backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-text-tertiary dark:text-slate-400">
                  <Clock3 className={`h-3.5 w-3.5 ${theme.accent}`} />
                  {config.secondaryStatLabel}
                </div>
                <div className="mt-3 text-2xl font-black text-text-primary dark:text-white">{config.secondaryStatValue}</div>
              </div>
              <button
                type="button"
                className={cn(
                  'rounded-2xl border border-borderTone bg-surface p-4 text-left shadow-surface backdrop-blur-md transition hover:bg-surface-subtle dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10',
                  isMockArena && 'cursor-pointer'
                )}
                onClick={() => config.mockArenaOptions?.onDifficultyCycle()}
                disabled={!isMockArena}
              >
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-text-tertiary dark:text-slate-400">
                  <BrainCircuit className={`h-3.5 w-3.5 ${theme.accent}`} />
                  {config.tertiaryStatLabel}
                </div>
                <div className="mt-3 text-lg font-black text-text-primary dark:text-white">{config.tertiaryStatValue}</div>
                {isMockArena ? (
                  <div className="mt-2 text-xs text-text-secondary dark:text-slate-400">
                    点击切换下一档难度
                  </div>
                ) : null}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-borderTone bg-surface/90 p-5 shadow-surface dark:border-white/10 dark:bg-slate-950/40">
                <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.accent}`}>
                  为什么推荐这次练习
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary dark:text-slate-300">
                  {config.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-borderTone bg-surface/90 p-5 shadow-surface dark:border-white/10 dark:bg-slate-950/40">
                <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] ${theme.accent}`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  进入后会看到什么
                </div>
                <div className="mt-4 space-y-3 text-sm text-text-secondary dark:text-slate-300">
                  {config.details.map((detail) => (
                    <div key={detail.label} className="flex items-center justify-between gap-4">
                      <span>{detail.label}</span>
                      <span className="text-right font-bold text-text-primary dark:text-white">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className={cn('rounded-2xl px-5 py-6 text-sm font-black', theme.primaryButton)}
                onClick={() => {
                  onOpenChange(false)
                  router.push(config.startHref)
                }}
              >
                {config.startLabel}
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl border-borderTone bg-surface/90 px-5 py-6 text-text-primary hover:bg-surface-subtle hover:text-text-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                稍后再练
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
