'use client'

import { cn } from '@/lib/utils'

type OnboardingProgressProps = {
  current: 1 | 2
}

export function OnboardingProgress({ current }: OnboardingProgressProps) {
  const items = [
    { id: 1, label: 'Legal' },
    { id: 2, label: 'Profile' },
  ] as const

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
          步骤 {current}/2
        </p>
        <p className="text-xs text-slate-500">一次性补全资料</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const active = item.id <= current

          return (
            <div
              key={item.id}
              className={cn(
                'h-1.5 rounded-full transition-colors',
                active ? 'bg-slate-900' : 'bg-slate-200'
              )}
              aria-label={item.label}
            />
          )
        })}
      </div>
    </div>
  )
}
