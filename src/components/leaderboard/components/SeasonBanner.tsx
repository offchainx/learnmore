import { Clock, LucideIcon } from 'lucide-react'

interface SeasonBannerProps {
  seasonData: {
    name: string
    theme: string
    bonus: string
    endsIn: string
    color: string
    border: string
    icon: LucideIcon
  }
}

export function SeasonBanner({ seasonData }: SeasonBannerProps) {
  const SeasonIcon = seasonData.icon

  return (
    <div className={`w-full rounded-2xl border p-1 bg-gradient-to-r ${seasonData.color} ${seasonData.border}`}>
      <div className="rounded-xl border border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] p-4 px-6 backdrop-blur flex flex-col items-center justify-between gap-4 md:flex-row dark:border-borderTone dark:bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <SeasonIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{seasonData.name}</h3>
              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">LIVE</span>
            </div>
            <p className="text-sm font-medium text-orange-700 dark:text-orange-200">{seasonData.bonus}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-borderTone bg-surface-subtle px-4 py-2 dark:border-borderTone dark:bg-surface-subtle">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary dark:text-text-tertiary">Season Ends In</div>
            <div className="font-mono text-xl font-bold tabular-nums text-text-primary dark:text-white">{seasonData.endsIn}</div>
          </div>
          <Clock className="w-5 h-5 text-text-tertiary dark:text-text-tertiary" />
        </div>
      </div>
    </div>
  )
}
