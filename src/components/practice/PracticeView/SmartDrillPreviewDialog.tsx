'use client'

import { BrainCircuit, Clock3, Radar, Sparkles, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SmartDrillPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  subjectTitle: string
  chapterCount: number
  weakChapterCount: number
  strongestSignal: string
}

export function SmartDrillPreviewDialog({
  open,
  onOpenChange,
  subjectId,
  subjectTitle,
  chapterCount,
  weakChapterCount,
  strongestSignal,
}: SmartDrillPreviewDialogProps) {
  const router = useRouter()
  const estimatedMinutes = Math.max(8, Math.min(16, 6 + weakChapterCount * 2))
  const estimatedQuestions = weakChapterCount > 0 ? 10 : 8

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-4xl overflow-hidden border border-[#24324D] bg-[#08111F] p-0 text-white shadow-[0_30px_90px_rgba(2,8,23,0.55)]">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(135deg,_#0F1C33,_#08111F_58%,_#060C16)]" />
          <div className="absolute -right-16 -top-12 h-44 w-44 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute left-20 top-10 h-24 w-24 rounded-full bg-emerald-400/8 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <DialogHeader className="space-y-3 text-left">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
                <Radar className="h-3.5 w-3.5 text-cyan-300" />
                Smart Drill Preview
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                先看这一轮训练预览
              </DialogTitle>
              <DialogDescription className="max-w-2xl text-sm leading-6 text-slate-300">
                本轮会基于 <span className="font-bold text-white">{subjectTitle}</span> 当前训练状态，优先编排一组短轮高价值题。先确认节奏和重点，再正式进入连续作答页面。
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  <Target className="h-3.5 w-3.5 text-cyan-300" />
                  预计题量
                </div>
                <div className="mt-3 text-2xl font-black text-white">{estimatedQuestions} 题</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
                  预计时间
                </div>
                <div className="mt-3 text-2xl font-black text-white">{estimatedMinutes} 分钟</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  <BrainCircuit className="h-3.5 w-3.5 text-cyan-300" />
                  当前重点
                </div>
                <div className="mt-3 text-lg font-black text-white">
                  {weakChapterCount > 0 ? `${weakChapterCount} 个薄弱点待收口` : '建立首轮基线'}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300/80">为什么推荐这组题</div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <li>{strongestSignal}</li>
                  <li>{chapterCount > 0 ? `会优先覆盖你当前科目下更有波动的章节。` : '当前科目数据还不完整，会先用一组通用题建立状态基线。'}</li>
                  <li>题目会以连续滚动的方式展示，适合顺着往下做，不会频繁切页。</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  进入后会看到什么
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>答题布局</span>
                    <span className="font-bold text-white">整组连续作答</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>反馈方式</span>
                    <span className="font-bold text-white">每题原地判定</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>结果页</span>
                    <span className="font-bold text-white">统一复盘摘要</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="rounded-2xl bg-cyan-400 px-5 py-6 text-sm font-black text-slate-950 hover:bg-cyan-300"
                onClick={() => {
                  onOpenChange(false)
                  router.push(`/dashboard/practice/smart-drill?subjectId=${encodeURIComponent(subjectId)}&autostart=1`)
                }}
              >
                开始这一轮 Smart Drill
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
