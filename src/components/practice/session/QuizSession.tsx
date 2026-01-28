'use client'

import { useState } from 'react'
import { Question } from '@prisma/client'
import { QuestionCard } from '@/components/business/question/QuestionCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, RotateCcw, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QuestionType } from '@prisma/client'

interface QuizSessionProps {
  questions: Question[]
  userId: string
  onExit: () => void
}

export default function QuizSession({ questions, onExit }: QuizSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({})
  // Stores whether a question has been checked and if it was correct
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [isFinished, setIsFinished] = useState(false)

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const progress = ((currentIndex + 1) / totalQuestions) * 100

  // 转换 Prisma Question 为 QuestionCard 需要的格式
  // 注意：这里我们做了一个临时转换，因为 QuestionCard 的 types 定义与 Prisma 类型略有不同
  const formattedQuestion = {
    ...currentQuestion,
    type: currentQuestion.type as QuestionType, // Cast specific enum to string union if needed
    options: currentQuestion.options as Record<string, string>,
    answer: currentQuestion.answer as string | string[],
    explanation: currentQuestion.explanation || null
  }

  const handleAnswerChange = (val: string | string[]) => {
    // Prevent changing answer after checking
    if (results[currentQuestion.id] !== undefined) return

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: val
    }))
  }

  const checkAnswer = () => {
    const uAnswer = userAnswers[currentQuestion.id]
    const qAnswer = formattedQuestion.answer

    let isCorrect = false

    if (formattedQuestion.type === 'SINGLE_CHOICE') {
      isCorrect = uAnswer === qAnswer
    } else if (formattedQuestion.type === 'MULTIPLE_CHOICE') {
      const uArr = Array.isArray(uAnswer) ? uAnswer : [uAnswer]
      const qArr = Array.isArray(qAnswer) ? qAnswer : [qAnswer]
      if (uArr && qArr && uArr.length === qArr.length) {
        const sortedU = [...(uArr as string[])].sort()
        const sortedQ = [...(qArr as string[])].sort()
        isCorrect = sortedU.every((val, index) => val === sortedQ[index])
      }
    } else if (formattedQuestion.type === 'FILL_BLANK') {
         // Simple exact match for now
         isCorrect = uAnswer === qAnswer
    }

    setResults(prev => ({
      ...prev,
      [currentQuestion.id]: isCorrect
    }))
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsFinished(true)
    }
  }

  // 计算分数
  const calculateScore = () => {
    const correctCount = Object.values(results).filter(Boolean).length
    return Math.round((correctCount / totalQuestions) * 100)
  }

  if (isFinished) {
    const score = calculateScore()
    return (
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
             <Flag className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Session Complete!</CardTitle>
          <p className="text-muted-foreground">Here is how you performed</p>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex justify-center items-end gap-2">
              <span className="text-6xl font-extrabold text-primary">{score}</span>
              <span className="text-xl text-muted-foreground mb-2">/ 100</span>
           </div>
           
           <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => (
                 <div 
                   key={q.id} 
                   className={cn(
                     "aspect-square flex items-center justify-center rounded-md text-sm font-bold border",
                     results[q.id] 
                        ? "bg-green-100 border-green-200 text-green-700" 
                        : results[q.id] === false
                            ? "bg-red-100 border-red-200 text-red-700"
                            : "bg-gray-100 text-gray-400" // Skipped or unseen
                   )}
                 >
                    {idx + 1}
                 </div>
              ))}
           </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={onExit}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Practice Again
            </Button>
            <Button onClick={onExit}>
                Back to Dashboard
            </Button>
        </CardFooter>
      </Card>
    )
  }

  const isChecked = results[currentQuestion.id] !== undefined
  const hasAnswered = !!userAnswers[currentQuestion.id] && (Array.isArray(userAnswers[currentQuestion.id]) ? (userAnswers[currentQuestion.id] as string[]).length > 0 : true)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {currentIndex + 1} of {totalQuestions}</span>
        <span>Smart Drill</span>
      </div>
      <Progress value={progress} className="h-2" />

      {/* Main Question Card */}
      <QuestionCard
        question={formattedQuestion}
        userAnswer={userAnswers[currentQuestion.id]}
        onAnswerChange={handleAnswerChange}
        showResult={isChecked}
        readOnly={isChecked}
        className="shadow-md min-h-[400px]"
      />

      {/* Action Bar */}
      <div className="flex justify-end gap-4 mt-6">
        {!isChecked ? (
            <Button 
                onClick={checkAnswer} 
                disabled={!hasAnswered}
                size="lg"
            >
                Check Answer
            </Button>
        ) : (
            <Button 
                onClick={handleNext} 
                size="lg" 
                className={currentIndex === totalQuestions - 1 ? "bg-green-600 hover:bg-green-700" : ""}
            >
                {currentIndex === totalQuestions - 1 ? (
                    <>Finish Session <Flag className="ml-2 h-4 w-4" /></>
                ) : (
                    <>Next Question <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
            </Button>
        )}
      </div>
    </div>
  )
}
