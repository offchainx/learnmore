import Link from 'next/link'
import { ArrowUpRight, Sword } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RivalWatchProps {
  rival: {
    name: string
    rank: number
    xpGap: number
    avatar: string
    hint: string
    href: string
    cta: string
  } | null
}

export function RivalWatch({ rival }: RivalWatchProps) {
  if (!rival) {
    return (
      <Card className="border border-[#203964] bg-[#07152a] p-6 text-white shadow-[0_16px_60px_rgba(4,10,24,0.32)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sword className="h-4 w-4 text-red-400" />
          追赶目标
        </div>
        <p className="mt-3 text-sm text-blue-100/70">
          先完成一轮练习并进入排行榜，系统会自动为你锁定最值得追赶的目标。
        </p>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="mt-4 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <Link href="/dashboard/practice">去做练习</Link>
        </Button>
      </Card>
    )
  }

  return (
    <Card className="group relative overflow-hidden border border-[#203964] bg-slate-900 p-0 transition-colors hover:border-red-500/50">
      <div className="absolute inset-0 bg-red-500/5 transition-colors group-hover:bg-red-500/10"></div>
      <div className="relative z-10 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <Sword className="h-4 w-4 text-red-500" /> 追赶目标
          </h3>
          <span className="text-[10px] font-bold text-red-400">优先冲刺</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={rival.avatar}
              className="h-12 w-12 rounded-full border-2 border-red-500/50 object-cover"
              alt={rival.name}
            />
            <div className="absolute -bottom-1 -right-1 rounded border border-red-400 bg-red-600 px-1.5 text-[10px] text-white">
              #{rival.rank}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-200">{rival.name}</div>
            <div className="text-xs text-slate-400">
              只领先你{' '}
              <span className="font-bold text-white">{rival.xpGap} XP</span>
            </div>
            <div className="mt-1 text-xs text-blue-300">{rival.hint}</div>
          </div>
        </div>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="mt-4 h-8 border-red-500/30 bg-red-500/5 text-red-100 hover:bg-red-500/10 hover:text-white"
        >
          <Link href={rival.href}>
            {rival.cta}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}
