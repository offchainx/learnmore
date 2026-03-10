'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Question } from '@prisma/client'
import { getSmartDrillQuestions } from '@/actions/practice/recommendation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
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

  useEffect(() => {
    let isMounted = true

    async function fetchQuestions() {
      try {
        setLoading(true)
        setError(null)
        // Request 10 questions by default
        const data = await getSmartDrillQuestions(userId, subjectId, 10)

        if (!isMounted) return

        if (!data || data.length === 0) {
            setError("No questions found for this subject. Try picking a different subject or difficulty.")
        } else {
            setQuestions(data)
        }
      } catch (err) {
        if (!isMounted) return
        setError(`Failed to load questions: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
    <div className="container mx-auto">
       <QuizSession 
         questions={questions} 
         userId={userId} 
         onExit={() => router.push('/dashboard/practice')} 
       />
    </div>
  )
}
