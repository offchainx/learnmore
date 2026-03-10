'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Question } from '@prisma/client'
import { getSmartDrillQuestions } from '@/actions/practice/recommendation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowRight, BrainCircuit, Clock3, Radar, RefreshCcw, Sparkles, Target } from 'lucide-react'
import QuizSession from '@/components/practice/session/QuizSession'

interface SmartDrillSessionProps {
  userId: string
  subjectId: string
}

export default function SmartDrillSession({ userId, subjectId }: SmartDrillSessionProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [sessionVersion, setSessionVersion] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function fetchQuestions() {
      try {
        setLoading(true)
        setError(null)
        setHasStarted(false)
        const data = await getSmartDrillQuestions(userId, subjectId, 10)

        if (!isMounted) return

        if (!data || data.length === 0) {
          setQuestions([])
          setError('No questions found for this subject. Try picking a different subject or difficulty.')
        } else {
          setQuestions(data)
        }
      } catch (err) {
        if (!isMounted) return
        setQuestions([])
        setError(`Failed to load questions: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchQuestions()

    return () => { isMounted = false }
  }, [userId, subjectId, sessionVersion])

  const estimatedMinutes = useMemo(() => Math.max(6, Math.round(questions.length * 1.2)), [questions.length])
  const chapterCoverageCount = useMemo(() => {
    const chapterIds = new Set(questions.map(question => question.chapterId).filter(Boolean))
    return chapterIds.size
  }, [questions])
  const averageDifficulty = useMemo(() => {
    if (questions.length === 0) return 0
    const difficultySum = questions.reduce((sum, question) => sum + (question.difficulty ?? 0), 0)
    return Math.round((difficultySum / questions.length) * 10) / 10
  }, [questions])
  const trainingFocusLabel = averageDifficulty >= 4
    ? 'Higher intensity'
    : averageDifficulty >= 2.5
      ? 'Balanced difficulty'
      : 'Warm-up intensity'

  const handleRefreshPack = () => {
    setSessionVersion(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="mb-8 flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <Skeleton className="h-[220px] w-full rounded-[28px]" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="mx-auto mt-8 max-w-2xl border-red-200 bg-red-50 dark:border-red-950 dark:bg-red-950/20">
        <CardContent className="flex flex-col items-center justify-center p-6 text-red-600">
          <AlertCircle className="mb-2 h-10 w-10" />
          <p className="font-medium">{error}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="border-red-200 bg-white hover:bg-red-50" onClick={handleRefreshPack}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Another Pack
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard/practice')}>
              Back to Practice
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasStarted) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="overflow-hidden rounded-[30px] border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(135deg,_#0f172a,_#111827_58%,_#0b1220)] text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)] dark:border-slate-800">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                  <Radar className="h-3.5 w-3.5" />
                  Smart Drill Setup
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">开启一轮个性化精准训练</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                  这组题会优先覆盖近期薄弱章节，并补充一部分未做过的新题，适合在进入章节训练或模拟考试前快速校准状态。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    <Target className="h-3.5 w-3.5 text-cyan-300" />
                    Questions
                  </div>
                  <div className="mt-3 text-2xl font-black text-white">{questions.length}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
                    Estimate
                  </div>
                  <div className="mt-3 text-2xl font-black text-white">{estimatedMinutes} min</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    <BrainCircuit className="h-3.5 w-3.5 text-cyan-300" />
                    Focus
                  </div>
                  <div className="mt-3 text-lg font-black text-white">{trainingFocusLabel}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300/80">Why this pack</div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <li>优先收口最近答错较多的章节。</li>
                  <li>补充新题，避免只在旧题上形成错觉熟练。</li>
                  <li>题目数量控制在一轮可完成的长度，适合高频复训。</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300/80">Coverage</div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>章节覆盖</span>
                    <span className="font-bold text-white">{chapterCoverageCount || 1} 个章节</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>平均难度</span>
                    <span className="font-bold text-white">{averageDifficulty || '--'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>推荐节奏</span>
                    <span className="font-bold text-white">单轮完成后再决定是否加练</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-2xl bg-cyan-400 px-5 py-6 text-sm font-black text-slate-950 hover:bg-cyan-300" onClick={() => setHasStarted(true)}>
                开始 Smart Drill
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 px-5 py-6 text-white hover:bg-white/10 hover:text-white" onClick={handleRefreshPack}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                刷新推荐题组
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Recommended Use</div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">适合日常训练开场、刷完章节后的快速校准，以及模拟前的短时热身。</p>
            </CardContent>
          </Card>
          <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Feedback Rhythm</div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">每题即时判定，做完一轮统一回看表现，避免在中途被过多数据打断。</p>
            </CardContent>
          </Card>
          <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                Outcome
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">结束后会保存本轮正确率，并给出继续加练还是切到其他模式的建议。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <QuizSession
        key={`${subjectId}-${sessionVersion}`}
        questions={questions}
        userId={userId}
        mode="SMART_DRILL"
        subjectId={subjectId}
        title="Smart Drill"
        sessionLabel="Smart Drill"
        sessionSubtitle="即时判定当前题，做完一轮后再看整体建议。"
        onRestart={() => {
          setHasStarted(false)
        }}
        onExit={() => router.push('/dashboard/practice')}
      />
    </div>
  )
}
