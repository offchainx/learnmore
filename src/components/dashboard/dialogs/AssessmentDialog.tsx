'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

// Mock Questions for Assessment
const QUESTIONS = [
  {
    id: 'q1',
    content: 'Solve for x: 2x + 5 = 15',
    options: ['x = 5', 'x = 10', 'x = 2.5', 'x = 7.5'],
    answer: 'x = 5',
    explanation: '2x = 10, so x = 5.'
  },
  {
    id: 'q2',
    content: 'Which of the following is a prime number?',
    options: ['15', '21', '29', '33'],
    answer: '29',
    explanation: '29 has only two factors: 1 and itself.'
  },
  {
    id: 'q3',
    content: 'What is the derivative of x²?',
    options: ['x', '2x', '2', 'x²'],
    answer: '2x',
    explanation: 'Using the power rule: d/dx(x^n) = nx^(n-1).'
  }
]

interface AssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AssessmentDialog({ open, onOpenChange, onSuccess }: AssessmentDialogProps) {
  const [step, setStep] = useState(0) // 0-2 questions, 3 result
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const currentQ = QUESTIONS[step]

  const handleAnswer = (option: string) => {
    setSelected(option)
    setShowResult(true)
    
    // Auto proceed after delay
    setTimeout(() => {
      const isCorrect = option === currentQ.answer
      if (isCorrect) setScore(s => s + 1)
      
      if (step < QUESTIONS.length - 1) {
        setStep(s => s + 1)
        setSelected(null)
        setShowResult(false)
      } else {
        setStep(QUESTIONS.length) // Finish
        // Trigger success callback after showing final result briefly
        setTimeout(() => {
             onSuccess()
             onOpenChange(false)
        }, 2000)
      }
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Skill Assessment</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step < QUESTIONS.length ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-4 text-sm font-medium text-slate-500">
                  Question {step + 1} of {QUESTIONS.length}
                </div>
                <h3 className="text-lg font-bold mb-6">{currentQ.content}</h3>
                <div className="space-y-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = selected === opt
                    const isCorrect = opt === currentQ.answer
                    
                    let btnClass = "w-full justify-start h-12 text-left"
                    if (showResult && isSelected) {
                        btnClass += isCorrect ? " bg-green-100 border-green-500 text-green-700" : " bg-red-100 border-red-500 text-red-700"
                    } else if (showResult && isCorrect) {
                        btnClass += " bg-green-100 border-green-500 text-green-700"
                    }
                    
                    return (
                      <Button
                        key={opt}
                        variant="outline"
                        className={btnClass}
                        onClick={() => !showResult && handleAnswer(opt)}
                        disabled={showResult}
                      >
                        {opt}
                        {showResult && isSelected && (
                            isCorrect ? <CheckCircle2 className="ml-auto w-5 h-5 text-green-600" /> : <XCircle className="ml-auto w-5 h-5 text-red-600" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-8">
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="mb-4 text-5xl"
               >
                 🎉
               </motion.div>
               <h2 className="text-2xl font-bold text-green-600 mb-2">Assessment Complete!</h2>
               <p className="text-slate-600 mb-4">You scored {score}/{QUESTIONS.length}.</p>
               <p className="text-sm text-slate-500">We&apos;ve calibrated your difficulty level.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
