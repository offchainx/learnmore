'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, RotateCcw, CircleCheck, CircleX, HelpCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExamResult } from '@/actions/practice/exam'
import { useRouter } from 'next/navigation'

import type { Question as PrismaQuestion } from '@prisma/client'

interface ResultSummaryProps {
  result: ExamResult
  questions?: PrismaQuestion[]
  onRetry?: () => void
  backLink?: string
  backLabel?: string
}

export default function ResultSummary({ 
  result, 
  questions,
  onRetry, 
  backLink = '/dashboard/practice',
  backLabel = 'Back to Practice'
}: ResultSummaryProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Score Summary */}
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Session Complete!</CardTitle>
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
              <p className="text-2xl font-bold">
                {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}
              </p>
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
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button onClick={() => router.push(backLink)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Question Review</h3>
        {result.questions.map((q, idx) => {
          const originalContent = questions?.find(oq => oq.id === q.questionId)?.content
          
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
                {originalContent && <p className="font-medium">{originalContent}</p>}
                
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
