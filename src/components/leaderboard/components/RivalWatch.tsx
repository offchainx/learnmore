import Link from 'next/link'
import { ArrowUpRight, Sword } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

interface RivalWatchProps {
  title: string
  rival: {
    name: string
    rank: number
    xpGap: number
    avatar: string
    hint: string
    href: string
    cta: string
  } | null
  emptyDescription: string
  emptyCta: string
}

export function RivalWatch({
  title,
  rival,
  emptyDescription,
  emptyCta,
}: RivalWatchProps) {
  if (!rival) {
    return (
      <Card className="rounded-[28px] border border-[#203964] bg-[#07152a] p-5 text-white shadow-[0_16px_60px_rgba(4,10,24,0.3)]">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sword className="h-5 w-5 text-red-400" />
          {title}
        </div>
        <p className="text-blue-100/68 mt-3 text-sm leading-6">
          {emptyDescription}
        </p>
        <Link
          href="/dashboard/practice"
          className={`${buttonVariants({
            variant: 'outline',
            size: 'sm',
          })} mt-4 border-slate-700 bg-black/30 text-slate-100 hover:bg-slate-900 hover:text-white`}
        >
          {emptyCta}
        </Link>
      </Card>
    )
  }

  return (
    <Card className="rounded-[28px] border border-[#203964] bg-[#07152a] p-5 text-white shadow-[0_16px_60px_rgba(4,10,24,0.3)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Sword className="h-5 w-5 text-red-400" />
          {title}
        </h3>
        <span className="bg-red-500/8 rounded-full border border-red-400/20 px-2.5 py-1 text-[10px] font-medium text-red-200/80">
          #{rival.rank}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <img
          src={rival.avatar}
          alt={rival.name}
          className="h-12 w-12 rounded-2xl border border-red-400/30 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold">{rival.name}</div>
          <div className="text-blue-100/66 mt-1 truncate text-sm">
            只领先你{' '}
            <span className="font-semibold text-white">{rival.xpGap} XP</span>
          </div>
          <div className="mt-1 truncate text-xs text-blue-300">
            {rival.hint}
          </div>
        </div>
      </div>

      <Link
        href={rival.href}
        className={`${buttonVariants({
          variant: 'outline',
          size: 'sm',
        })} bg-red-500/6 hover:bg-red-500/12 mt-4 border-red-500/30 text-red-100 hover:text-white`}
      >
        {rival.cta}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  )
}
