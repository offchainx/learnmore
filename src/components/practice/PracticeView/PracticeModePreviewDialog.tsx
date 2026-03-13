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

export type PracticePreviewMode =
  | 'SMART_DRILL'
  | 'ERROR_WIPER'
  | 'MOCK_ARENA'
  | 'CHAPTER_MAP'
  | 'PAST_PAPER'

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
    icon: typeof Radar
  }
> = {
  SMART_DRILL: {
    badge: 'Smart Drill Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(135deg,_#0F1C33,_#08111F_58%,_#060C16)]',
    accent: 'text-cyan-300',
    icon: Radar,
  },
  ERROR_WIPER: {
    badge: 'Error Wiper Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.18),_transparent_24%),linear-gradient(135deg,_#2A1520,_#111827_58%,_#0A0F1A)]',
    accent: 'text-rose-300',
    icon: Eraser,
  },
  MOCK_ARENA: {
    badge: 'Mock Arena Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.18),_transparent_24%),linear-gradient(135deg,_#201A4A,_#111827_58%,_#0A0F1A)]',
    accent: 'text-indigo-300',
    icon: Trophy,
  },
  CHAPTER_MAP: {
    badge: 'Chapter Map Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(135deg,_#2A2416,_#111827_58%,_#0A0F1A)]',
    accent: 'text-amber-300',
    icon: Compass,
  },
  PAST_PAPER: {
    badge: 'Past Paper Preview',
    gradient:
      'bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(135deg,_#102338,_#111827_58%,_#0A0F1A)]',
    accent: 'text-sky-300',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-4xl overflow-hidden border border-[#24324D] bg-[#08111F] p-0 text-white shadow-[0_30px_90px_rgba(2,8,23,0.55)]">
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 ${theme.gradient}`} />
          <div className="absolute -right-16 -top-12 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-20 top-10 h-24 w-24 rounded-full bg-white/5 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <DialogHeader className="space-y-3 text-left">
              <div className={`inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] ${theme.accent}`}>
                <Icon className="h-3.5 w-3.5" />
                {theme.badge}
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {config.title}
              </DialogTitle>
              <DialogDescription className="max-w-2xl text-sm leading-6 text-slate-300">
                <span className="font-bold text-white">{config.subtitle}</span>
                {' · '}
                {config.description}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  <Target className={`h-3.5 w-3.5 ${theme.accent}`} />
                  {config.primaryStatLabel}
                </div>
                <div className="mt-3 text-2xl font-black text-white">{config.primaryStatValue}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  <Clock3 className={`h-3.5 w-3.5 ${theme.accent}`} />
                  {config.secondaryStatLabel}
                </div>
                <div className="mt-3 text-2xl font-black text-white">{config.secondaryStatValue}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  <BrainCircuit className={`h-3.5 w-3.5 ${theme.accent}`} />
                  {config.tertiaryStatLabel}
                </div>
                <div className="mt-3 text-lg font-black text-white">{config.tertiaryStatValue}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.accent}`}>
                  为什么推荐这次练习
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  {config.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] ${theme.accent}`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  进入后会看到什么
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  {config.details.map((detail) => (
                    <div key={detail.label} className="flex items-center justify-between gap-4">
                      <span>{detail.label}</span>
                      <span className="text-right font-bold text-white">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="rounded-2xl bg-white px-5 py-6 text-sm font-black text-slate-950 hover:bg-slate-100"
                onClick={() => {
                  onOpenChange(false)
                  router.push(config.startHref)
                }}
              >
                {config.startLabel}
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl border-white/10 bg-white/5 px-5 py-6 text-white hover:bg-white/10 hover:text-white"
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
