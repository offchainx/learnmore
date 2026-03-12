const tierStyles = [
  {
    chip: 'border-[#7a5a3a]/50 bg-[#24160e] text-[#d9b38c]',
    dot: 'bg-[#b47c42]',
  },
  {
    chip: 'border-slate-400/40 bg-slate-500/10 text-slate-200',
    dot: 'bg-slate-300',
  },
  {
    chip: 'border-amber-400/45 bg-amber-500/12 text-amber-100',
    dot: 'bg-amber-300',
  },
  {
    chip: 'border-cyan-400/45 bg-cyan-500/10 text-cyan-100',
    dot: 'bg-cyan-300',
  },
  {
    chip: 'border-sky-400/45 bg-sky-500/12 text-sky-100',
    dot: 'bg-sky-300',
  },
  {
    chip: 'border-purple-400/45 bg-purple-500/10 text-purple-100',
    dot: 'bg-purple-300',
  },
] as const

interface TierRoadmapProps {
  tiers: string[]
  currentTierIndex: number
  title: string
  currentTierLabel: string
  standingLabel: string
  promotionLabel: string
}

export function TierRoadmap({
  tiers,
  currentTierIndex,
  title,
  currentTierLabel,
  standingLabel,
  promotionLabel,
}: TierRoadmapProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#213d71] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_56%),linear-gradient(180deg,_#07152d_0%,_#071121_100%)] px-5 py-4 text-white shadow-[0_20px_72px_rgba(3,10,28,0.32)]">
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
        <div>
          <div className="text-blue-200/68 text-[11px] font-semibold uppercase tracking-[0.2em]">
            {title}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="bg-white/6 rounded-full border border-blue-300/20 px-3 py-1 text-sm font-semibold text-blue-50">
              {currentTierLabel}
            </span>
            <span className="text-blue-100/72 text-sm">{standingLabel}</span>
          </div>
          <p className="text-blue-100/66 mt-2 text-sm leading-6">
            {promotionLabel}
          </p>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {tiers.map((tier, index) => {
            const style = tierStyles[index] ?? tierStyles[0]
            const isCurrent = index === currentTierIndex
            const isUnlocked = index < currentTierIndex

            return (
              <div key={tier} className="relative">
                <div
                  className={`rounded-[20px] border px-3 py-3 text-center text-xs font-semibold transition-all ${
                    isCurrent
                      ? `${style.chip} shadow-[0_0_22px_rgba(96,165,250,0.2)] ring-1 ring-white/10`
                      : isUnlocked
                        ? `${style.chip} opacity-95`
                        : 'border-white/8 bg-white/[0.03] text-slate-400'
                  }`}
                >
                  <div className="mx-auto flex h-2 w-2 items-center justify-center rounded-full bg-white/10">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${isCurrent || isUnlocked ? style.dot : 'bg-slate-500'}`}
                    />
                  </div>
                  <div className="mt-2 truncate">{tier}</div>
                </div>
                {index < tiers.length - 1 ? (
                  <div className="absolute left-[calc(100%-4px)] top-1/2 hidden h-[2px] w-2 -translate-y-1/2 bg-white/10 lg:block" />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
