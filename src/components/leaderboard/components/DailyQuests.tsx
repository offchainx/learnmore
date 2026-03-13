import Link from 'next/link'
import { Flame, LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Quest {
  title: string
  subtitle: string
  xp: number
  progress: number
  total: number
  href: string
  cta: string
  icon: LucideIcon
  color: string
}

interface DailyQuestsProps {
  quests: Quest[]
  title: string
  badge: string
}

export function DailyQuests({ quests, title, badge }: DailyQuestsProps) {
  return (
    <Card className="rounded-[28px] border border-[#203964] bg-[#07152a] p-5 text-white shadow-[0_16px_60px_rgba(4,10,24,0.3)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Flame className="h-5 w-5 text-orange-400" />
          {title}
        </h3>
        <span className="text-blue-100/64 truncate rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium">
          {badge}
        </span>
      </div>

      <div className="space-y-3">
        {quests.map((quest) => {
          const QuestIcon = quest.icon
          const progressPercent =
            quest.total > 0 ? (quest.progress / quest.total) * 100 : 0

          return (
            <div
              key={`${quest.title}-${quest.href}`}
              className="border-white/8 rounded-[24px] border bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${quest.color}`}
                >
                  <QuestIcon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[17px] font-semibold leading-none">
                    {quest.title}
                  </div>
                  <div className="text-blue-100/66 mt-1 truncate text-sm">
                    {quest.subtitle}
                  </div>
                  <div className="mt-1 text-sm font-medium text-sky-300">
                    +{quest.xp} XP
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-9 shrink-0 border-slate-700 bg-black/30 px-4 text-sm text-slate-100 hover:bg-slate-900 hover:text-white"
                >
                  <Link href={quest.href}>{quest.cta}</Link>
                </Button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-blue-100/56 w-16 text-right text-xs">
                  {quest.progress}/{quest.total}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
