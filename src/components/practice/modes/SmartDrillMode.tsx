'use client'

import { useState, useEffect } from 'react'
import { Question } from '@prisma/client'
import { getSmartDrillQuestions } from '@/actions/practice/recommendation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Loader2 } from 'lucide-react'

interface SmartDrillModeProps {
  userId: string
  subjectId: string
  userGrade: number
}

export default function SmartDrillMode({ userId, subjectId, userGrade }: SmartDrillModeProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchQuestions() {
      try {
        setLoading(true)
        setError(null)
        // Request 10 questions by default
        const data = await getSmartDrillQuestions(userId, subjectId, 10)
        
        if (!isMounted) return

        if (data.length === 0) {
            setError("No questions found for this subject. Try picking a different subject or difficulty.")
        } else {
            setQuestions(data)
        }
      } catch (err) {
        if (!isMounted) return
        setError("Failed to load smart drill questions.")
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchQuestions()

    return () => { isMounted = false }
  }, [userId, subjectId])

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
            </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 max-w-2xl mx-auto mt-8">
        <CardContent className="flex flex-col items-center justify-center p-6 text-red-600">
          <AlertCircle className="h-10 w-10 mb-2" />
          <p className="font-medium">{error}</p>
          <Button variant="outline" className="mt-4 bg-white hover:bg-red-50 border-red-200" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
       {/* Placeholder for QuizSession */}
       <Card className="max-w-4xl mx-auto shadow-md">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary p-2 rounded-lg">⚡️</span>
                Smart Drill Session
            </CardTitle>
         </CardHeader>
         <CardContent>
            <div className="mb-6 space-y-2">
                <h3 className="font-semibold text-lg">Ready to Practice!</h3>
                <p className="text-muted-foreground">
                    We've curated {questions.length} questions based on your learning history.
                </p>
            </div>

            {/* Placeholder Visual Indicator */}
            <div className="p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 text-2xl font-bold">
                    ?
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">QuizSession Component Pending</h4>
                <p className="text-sm text-gray-500 max-w-md">
                    The interactive quiz interface (Task B1.4) will be integrated here. 
                    It will handle question navigation, answer checking, and result submission.
                </p>
            </div>

            {/* Temporary Debug Info - Hidden in production */}
            <div className="mt-8 pt-4 border-t text-xs text-muted-foreground">
                <p className="font-mono mb-2 uppercase tracking-wider text-gray-400">Debug: Loaded Questions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="p-2 bg-slate-50 rounded border flex justify-between">
                            <span>Q{idx + 1}: {q.difficulty}★</span>
                            <span className="font-mono text-[10px] truncate w-24">{q.id}</span>
                        </div>
                    ))}
                </div>
            </div>
         </CardContent>
       </Card>
    </div>
  )
}
