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
    label: 'Easy',
    description: '50% easy, 40% medium, 10% hard',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    description: '30% easy, 50% medium, 20% hard',
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
  },
  {
    value: 'HARD',
    label: 'Hard',
    description: '10% easy, 40% medium, 50% hard',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30'
  },
]

const QUESTION_COUNT_OPTIONS = [10, 15, 20, 25, 30]

export default function MockArenaSetup({ userId, subjects, quotaStatus }: MockArenaSetupProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [subjectId, setSubjectId] = useState<string>(searchParams.get('subjectId') || '')
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('MEDIUM')
  const [questionCount, setQuestionCount] = useState(20)
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
      setError('Please select a subject')
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
        setError(result.error || 'Failed to start exam')
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
               <h3 className="font-semibold text-red-800 dark:text-red-200">Weekly Limit Reached</h3>
               <p className="text-sm text-red-600 dark:text-red-300">
                 You have used {quotaStatus.used}/{quotaStatus.limit} exam attempts this week. 
                 <Button variant="link" className="px-1 h-auto text-red-700 font-bold underline" onClick={() => router.push('/pricing')}>
                   Upgrade to PRO
                 </Button> 
                 for more.
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
            Configure Your Exam
          </CardTitle>
          <CardDescription>
            Customize your practice test settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
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
            <Label>Difficulty Level</Label>
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
            <Label htmlFor="questionCount">Number of Questions</Label>
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
                    {count} questions
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span className="text-sm">Questions</span>
              </div>
              <p className="text-2xl font-bold">{questionCount}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Time Limit</span>
              </div>
              <p className="text-2xl font-bold">{estimatedMinutes} min</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Difficulty</span>
              </div>
              <p className="text-2xl font-bold capitalize">{difficulty.toLowerCase()}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span className="text-sm">Max Score</span>
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
            Preparing Exam...
          </>
        ) : (
          <>
            Start Exam
          </>
        )}
      </Button>

      {/* Important Notes */}
      <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
            Important Notes
          </h4>
          <ul className="text-sm text-orange-600 dark:text-orange-300 space-y-1 list-disc list-inside">
            <li>No instant feedback during the exam - just like a real test</li>
            <li>You can navigate between questions and mark them for review</li>
            <li>The exam will auto-submit when time runs out</li>
            <li>Results and explanations will be shown after submission</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
