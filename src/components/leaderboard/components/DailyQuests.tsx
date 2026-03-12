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
}

export function DailyQuests({ quests }: DailyQuestsProps) {
  return (
    <Card className="border border-[#203964] bg-[#07152a] p-6 text-white shadow-[0_16px_60px_rgba(4,10,24,0.32)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <Flame className="h-5 w-5 text-orange-400" /> 推荐挑战
        </h3>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-blue-100/65">
          先做最接近完成的目标
        </span>
      </div>

      <div className="space-y-4">
        {quests.map((q, i) => {
          const QuestIcon = q.icon
          return (
            <div key={i} className="group">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${q.color}`}>
                    <QuestIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200 transition-colors group-hover:text-white">
                      {q.title}
                    </div>
                    <div className="text-xs text-slate-400">{q.subtitle}</div>
                    <div className="mt-1 font-mono text-[11px] text-blue-300">
                      +{q.xp} XP
                    </div>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-7 border-slate-700 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Link href={q.href}>{q.cta}</Link>
                </Button>
              </div>
              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${q.progress >= q.total ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${(q.progress / q.total) * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right text-[10px] text-slate-500">
                {q.progress}/{q.total}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
