'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Flag } from 'lucide-react'
import { practiceThemeStyles, type PracticeModeTheme } from './theme'

interface PracticeResultStat {
  label: string
  value: ReactNode
  toneClassName?: string
}

interface PracticeResultPanelProps {
  title: string
  subtitle: string
  score: number
  scoreSuffix?: string
  theme?: PracticeModeTheme
  stats: PracticeResultStat[]
  recommendation: string
  questionStates?: boolean[]
  note?: ReactNode
  primaryActionLabel: string
  primaryAction: () => void
  secondaryActionLabel?: string
  secondaryAction?: () => void
}

export function PracticeResultPanel({
  title,
  subtitle,
  score,
  scoreSuffix = '/ 100',
  theme = 'slate',
  stats,
  recommendation,
  questionStates,
  note,
  primaryActionLabel,
  primaryAction,
  secondaryActionLabel,
  secondaryAction,
}: PracticeResultPanelProps) {
  const themeStyle = practiceThemeStyles[theme]
  const statsGridClassName =
    stats.length >= 4 ? 'sm:grid-cols-4' : stats.length === 3 ? 'sm:grid-cols-3' : stats.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'

  return (
    <Card className={cn('mx-auto max-w-3xl rounded-[28px] border-white/10 shadow-[0_24px_70px_rgba(15,23,42,0.18)]', themeStyle.shell)}>
      <CardHeader className="space-y-4 text-center">
        <div className={cn('mx-auto flex h-20 w-20 items-center justify-center rounded-full border', themeStyle.iconWrap)}>
          <Flag className={cn('h-10 w-10', themeStyle.icon)} />
        </div>
        <CardTitle className="text-3xl font-black text-white">{title}</CardTitle>
        <p className="text-slate-300">{subtitle}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-end justify-center gap-2">
          <span className="text-6xl font-extrabold text-white">{score}</span>
          <span className="mb-2 text-xl text-slate-400">{scoreSuffix}</span>
        </div>

        <div className={cn('grid gap-3', statsGridClassName)}>
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{stat.label}</div>
              <div className={cn('mt-2 text-2xl font-black text-white', stat.toneClassName)}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className={cn('text-xs font-black uppercase tracking-[0.18em]', themeStyle.panelLabel)}>Coach Note</div>
          <p className="mt-3 text-sm leading-6 text-slate-200">{recommendation}</p>
          {note ? <div className="mt-3 text-sm text-amber-300">{note}</div> : null}
        </div>

        {questionStates && questionStates.length > 0 ? (
          <div className="grid grid-cols-5 gap-2">
            {questionStates.map((isCorrect, index) => (
              <div
                key={`${index}-${isCorrect ? 'correct' : 'wrong'}`}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-md border text-sm font-bold',
                  isCorrect
                    ? 'border-green-400/20 bg-green-400/12 text-green-200'
                    : 'border-red-400/20 bg-red-400/12 text-red-200',
                )}
              >
                {index + 1}
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col justify-center gap-3 sm:flex-row">
        {secondaryActionLabel && secondaryAction ? (
          <Button
            variant="outline"
            className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            onClick={secondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        ) : null}
        <Button className={cn('rounded-2xl', themeStyle.primaryButton)} onClick={primaryAction}>
          {primaryActionLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
