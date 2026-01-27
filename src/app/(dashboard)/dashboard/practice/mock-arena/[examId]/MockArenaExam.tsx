'use client'

import { useState, useEffect, useCallback, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { QuestionCard } from '@/components/business/question/QuestionCard'
import CountdownTimer from '@/components/practice/session/CountdownTimer'
import { submitExam, type UserAnswerSubmission, type ExamResult } from '@/actions/practice/exam'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Loader2,
  AlertTriangle,
  Trophy,
  RotateCcw,
  CircleCheck,
  CircleX,
  HelpCircle
} from 'lucide-react'
import type { Question as QuestionType } from '@/components/business/question/types'
import type { Question as PrismaQuestion } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ExamData {
  questions: PrismaQuestion[]
  timeLimit: number // seconds
  startTime: number
}

interface MockArenaExamProps {
  examId: string
  userId: string
}

export default function MockArenaExam({ examId, userId }: MockArenaExamProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Exam state
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Result state
  const [result, setResult] = useState<ExamResult | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  // Load exam data from sessionStorage
  useEffect(() => {
    const loadExamData = () => {
      const stored = sessionStorage.getItem(`exam_${examId}`)
      if (stored) {
        try {
          const data = JSON.parse(stored) as ExamData
          setExamData(data)
        } catch {
          setError('Failed to load exam data')
        }
      } else {
        setError('Exam session not found. Please start a new exam.')
      }
      setIsLoading(false)
    }
    loadExamData()
  }, [examId])

  const questions = useMemo(() => examData?.questions || [], [examData])
  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length

  // Calculate remaining time
  const getRemainingTime = useCallback(() => {
    if (!examData) return 0
    const elapsed = Math.floor((Date.now() - examData.startTime) / 1000)
    return Math.max(0, examData.timeLimit - elapsed)
  }, [examData])

  // Format question for QuestionCard
  const formatQuestion = (q: PrismaQuestion): QuestionType => ({
    id: q.id,
    type: q.type as QuestionType['type'],
    content: q.content,
    options: q.options as Record<string, string> | null,
    answer: null, // Don't show answer during exam
    explanation: null
  })

  // Handle answer change
  const handleAnswerChange = (val: string | string[]) => {
    if (!currentQuestion) return
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: val
    }))
  }

  // Toggle mark for review
  const toggleMarkForReview = () => {
    if (!currentQuestion) return
    setMarkedForReview(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id)
      } else {
        newSet.add(currentQuestion.id)
      }
      return newSet
    })
  }

  // Navigation
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index)
    }
  }

  // Submit exam
  const handleSubmit = useCallback(() => {
    if (!examData) return

    startTransition(async () => {
      const duration = Math.floor((Date.now() - examData.startTime) / 1000)
      const answers: UserAnswerSubmission[] = questions.map(q => ({
        questionId: q.id,
        userAnswer: userAnswers[q.id] || ''
      }))

      const submitResult = await submitExam(examId, userId, answers, duration)

      if (submitResult.success && submitResult.result) {
        // Clear sessionStorage
        sessionStorage.removeItem(`exam_${examId}`)
        setResult(submitResult.result)
      } else {
        setError(submitResult.error || 'Failed to submit exam')
      }
    })
  }, [examData, questions, userAnswers, examId, userId])

  // Auto-submit when time is up
  const handleTimeUp = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  // Count answered and unanswered
  const answeredCount = Object.keys(userAnswers).filter(k => {
    const ans = userAnswers[k]
    return ans && (Array.isArray(ans) ? ans.length > 0 : ans !== '')
  }).length

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Exam Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.push('/dashboard/practice/mock-arena')}>
          Back to Mock Arena
        </Button>
      </div>
    )
  }

  // Result view
  if (result) {
    return (
      <div className="container mx-auto py-6 max-w-4xl space-y-6">
        {/* Score Summary */}
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl">Exam Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center items-end gap-2">
              <span className="text-6xl font-extrabold text-primary">{result.score}</span>
              <span className="text-xl text-muted-foreground mb-2">/ 100</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{result.correctCount}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{result.totalQuestions - result.correctCount}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}</p>
                <p className="text-sm text-muted-foreground">Time Used</p>
              </div>
            </div>

            {/* Question Overview Grid */}
            <div className="grid grid-cols-10 gap-2 max-w-md mx-auto">
              {result.questions.map((q, idx) => (
                <div
                  key={q.questionId}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-md text-xs font-bold border",
                    q.isCorrect
                      ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                      : "bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400"
                  )}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/dashboard/practice/mock-arena')}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => router.push('/dashboard/practice')}>
                Back to Practice
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Question Review</h3>
          {result.questions.map((q, idx) => {
            const originalQuestion = questions.find(oq => oq.id === q.questionId)
            if (!originalQuestion) return null

            return (
              <Card key={q.questionId} className={cn(
                "border-l-4",
                q.isCorrect ? "border-l-green-500" : "border-l-red-500"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Question {idx + 1}</Badge>
                    {q.isCorrect ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CircleCheck className="h-4 w-4" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-red-600">
                        <CircleX className="h-4 w-4" /> Incorrect
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-medium">{originalQuestion.content}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Your Answer:</p>
                      <p className={cn(
                        "font-medium",
                        q.isCorrect ? "text-green-600" : "text-red-600"
                      )}>
                        {Array.isArray(q.userAnswer)
                          ? q.userAnswer.join(', ') || '(No answer)'
                          : q.userAnswer || '(No answer)'}
                      </p>
                    </div>
                    {!q.isCorrect && (
                      <div>
                        <p className="text-muted-foreground mb-1">Correct Answer:</p>
                        <p className="font-medium text-green-600">
                          {Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.join(', ')
                            : q.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <HelpCircle className="h-4 w-4" /> Explanation
                      </div>
                      <p className="text-sm">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Exam in progress view
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CountdownTimer
              duration={getRemainingTime()}
              onTimeUp={handleTimeUp}
            />
            <Badge variant="outline">
              {answeredCount} / {totalQuestions} answered
            </Badge>
          </div>

          <Button
            variant="destructive"
            onClick={() => setShowSubmitDialog(true)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Exam
          </Button>
        </div>

        {/* Progress Bar */}
        <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="h-1" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Card */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <Button
                variant={markedForReview.has(currentQuestion?.id) ? "default" : "outline"}
                size="sm"
                onClick={toggleMarkForReview}
              >
                <Flag className="mr-2 h-4 w-4" />
                {markedForReview.has(currentQuestion?.id) ? 'Marked' : 'Mark for Review'}
              </Button>
            </div>

            {currentQuestion && (
              <QuestionCard
                question={formatQuestion(currentQuestion)}
                userAnswer={userAnswers[currentQuestion.id]}
                onAnswerChange={handleAnswerChange}
                showResult={false}
                readOnly={false}
                className="min-h-[400px]"
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={() => goToQuestion(currentIndex + 1)}
                disabled={currentIndex === totalQuestions - 1}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] && (
                      Array.isArray(userAnswers[q.id])
                        ? (userAnswers[q.id] as string[]).length > 0
                        : userAnswers[q.id] !== ''
                    )
                    const isMarked = markedForReview.has(q.id)
                    const isCurrent = idx === currentIndex

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(idx)}
                        className={cn(
                          "aspect-square flex items-center justify-center rounded-md text-xs font-bold border transition-all",
                          isCurrent && "ring-2 ring-primary",
                          isMarked && "bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                          isAnswered && !isMarked && "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                          !isAnswered && !isMarked && "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-200 dark:bg-green-900/30" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-400 dark:bg-yellow-900/30" />
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted border" />
                    <span>Not Answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} out of {totalQuestions} questions.
              {totalQuestions - answeredCount > 0 && (
                <span className="block text-orange-600 mt-2">
                  Warning: {totalQuestions - answeredCount} question(s) are unanswered!
                </span>
              )}
              {markedForReview.size > 0 && (
                <span className="block text-yellow-600 mt-1">
                  You have {markedForReview.size} question(s) marked for review.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Exam
            </Button>
            <Button onClick={() => handleSubmit()}>
              Submit Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
