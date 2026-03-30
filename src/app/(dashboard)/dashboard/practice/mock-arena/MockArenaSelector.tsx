'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Clock, Brain, Target, Zap, Trophy, Lock } from 'lucide-react'
import { startExam, type ExamDifficulty } from '@/actions/practice/exam'
import { cn } from '@/lib/utils'
import type { QuotaStatus } from '@/actions/practice/quota'

interface Subject {
  id: string
  name: string
  icon?: string | null
}

interface MockArenaSetupProps {
  userId: string
  subjects: Subject[]
  quotaStatus: QuotaStatus
}

const DIFFICULTY_OPTIONS: { value: ExamDifficulty; label: string; description: string; color: string }[] = [
  {
    value: 'EASY',
    label: '简单',
    description: '以基础题为主，适合热身与建立信心',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
  },
  {
    value: 'MEDIUM',
    label: '标准',
    description: '难度分布更均衡，适合常规模拟',
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
  },
  {
    value: 'HARD',
    label: '困难',
    description: '高压强练，更接近冲刺状态',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30'
  },
]

const QUESTION_COUNT_OPTIONS = [20, 30, 40, 50]

function parseDifficulty(value: string | null): ExamDifficulty | null {
  if (value === 'EASY' || value === 'MEDIUM' || value === 'HARD') {
    return value
  }
  return null
}

function parseQuestionCount(value: string | null): number | null {
  const parsed = Number(value)
  if (QUESTION_COUNT_OPTIONS.includes(parsed)) {
    return parsed
  }
  return null
}

export default function MockArenaSetup({ userId, subjects, quotaStatus }: MockArenaSetupProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [subjectId, setSubjectId] = useState<string>(searchParams.get('subjectId') || '')
  const [difficulty, setDifficulty] = useState<ExamDifficulty>(
    parseDifficulty(searchParams.get('difficulty')) || 'MEDIUM'
  )
  const [questionCount, setQuestionCount] = useState(
    parseQuestionCount(searchParams.get('questionCount')) || 20
  )
  const [error, setError] = useState<string | null>(null)
  const autoStart = searchParams.get('autostart') === '1'
  const autoStartedRef = useRef(false)

  // Calculate estimated time (1.5 min per question)
  const estimatedMinutes = Math.ceil(questionCount * 1.5)

  const handleStartExam = () => {
    if (!quotaStatus.canProceed) {
      setError('You have reached your weekly exam limit. Upgrade to PRO for more.')
      return
    }

    if (!subjectId) {
      setError('请选择科目')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await startExam(userId, {
        subjectId,
        difficulty,
        totalQuestions: questionCount,
        timeLimitMinutes: estimatedMinutes
      })

      if (result.success && result.examRecordId) {
        // Store questions in sessionStorage for the exam page
        if (result.questions) {
          sessionStorage.setItem(`exam_${result.examRecordId}`, JSON.stringify({
            questions: result.questions,
            timeLimit: estimatedMinutes * 60, // convert to seconds
            startTime: Date.now()
          }))
        }
        router.push(
          `/dashboard/practice/mock-arena/${result.examRecordId}?subjectId=${encodeURIComponent(subjectId)}`
        )
      } else {
        setError(result.error || '创建模拟卷失败')
      }
    })
  }

  useEffect(() => {
    if (!autoStart || !subjectId || isPending || autoStartedRef.current) return
    autoStartedRef.current = true
    handleStartExam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, subjectId])

  if (autoStart && subjectId && !error) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Card className="w-full max-w-2xl rounded-[30px] border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">正在生成 Mock Arena 试卷</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                这一步会直接进入统一答题页，不再展示中间配置页面。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (autoStart) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Card className="w-full max-w-2xl rounded-[30px] border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-300">
              <Lock className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                当前无法直接开始 Mock Arena
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {error || '当前配置下未能生成可用试卷。'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => router.push('/dashboard/practice')}
                className="rounded-2xl px-6"
              >
                返回练习中心
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.replace(
                    `/dashboard/practice/mock-arena?subjectId=${encodeURIComponent(subjectId)}&difficulty=${difficulty}&questionCount=${questionCount}`
                  )
                }
                className="rounded-2xl px-6"
              >
                改成手动配置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quota Status Alert */}
      {!quotaStatus.canProceed && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
          <CardContent className="pt-6 flex items-center gap-4">
             <div className="p-2 bg-red-100 rounded-full dark:bg-red-800">
               <Lock className="h-6 w-6 text-red-600 dark:text-red-200" />
             </div>
             <div>
               <h3 className="font-semibold text-red-800 dark:text-red-200">本周模拟次数已用完</h3>
               <p className="text-sm text-red-600 dark:text-red-300">
                 本周已使用 {quotaStatus.used}/{quotaStatus.limit} 次模拟。
                 <Button variant="link" className="px-1 h-auto text-red-700 font-bold underline" onClick={() => router.push('/pricing')}>
                   升级套餐
                 </Button> 
                 后可继续使用。
               </p>
             </div>
          </CardContent>
        </Card>
      )}

      {quotaStatus.canProceed && quotaStatus.limit !== Infinity && (
         <div className="flex justify-end">
            <Badge variant="outline" className="text-xs">
              Weekly Quota: {quotaStatus.used} / {quotaStatus.limit} used
            </Badge>
         </div>
      )}

      {/* Exam Configuration Card */}
      <Card className={cn(!quotaStatus.canProceed && "opacity-60 pointer-events-none")}>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            配置模拟卷
          </CardTitle>
          <CardDescription>
            先确认题量、难度和科目，再开始整卷模拟
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">科目</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="选择科目" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.icon} {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <Label>难度</Label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDifficulty(option.value)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    difficulty === option.value
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Badge className={cn('mb-2', option.color)} variant="secondary">
                    {option.label}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count Selection */}
          <div className="space-y-2">
            <Label htmlFor="questionCount">题量</Label>
            <Select
              value={questionCount.toString()}
              onValueChange={(v) => setQuestionCount(parseInt(v))}
            >
              <SelectTrigger id="questionCount">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_COUNT_OPTIONS.map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} 题
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Exam Preview Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center tablet:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span className="text-sm">题量</span>
              </div>
              <p className="text-2xl font-bold">{questionCount}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">时长</span>
              </div>
              <p className="text-2xl font-bold">{estimatedMinutes} 分钟</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span className="text-sm">难度</span>
              </div>
              <p className="text-2xl font-bold">
                {DIFFICULTY_OPTIONS.find((option) => option.value === difficulty)?.label || '标准'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span className="text-sm">满分</span>
              </div>
              <p className="text-2xl font-bold">100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button
        onClick={handleStartExam}
        disabled={isPending || !subjectId}
        size="lg"
        className="w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在生成试卷...
          </>
        ) : (
          <>
            开始模拟
          </>
        )}
      </Button>

      {/* Important Notes */}
      <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
            开始前提醒
          </h4>
          <ul className="text-sm text-orange-600 dark:text-orange-300 space-y-1 list-disc list-inside">
            <li>模拟过程中不会即时显示答案，更接近正式考试</li>
            <li>可以自由切题，也可以先标记后回看</li>
            <li>时间结束后系统会自动交卷</li>
            <li>提交后再统一查看得分和解析</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
