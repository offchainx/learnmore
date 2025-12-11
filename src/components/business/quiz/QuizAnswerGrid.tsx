
"use client";

import React from 'react';
import { useQuizStore } from '@/lib/store/quiz-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function QuizAnswerGrid() {
  const {
    totalQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
  } = useQuizStore();

  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 p-4 border rounded-lg shadow-sm bg-background">
      {questionNumbers.map((index) => {
        const isCurrent = currentQuestionIndex === index;
        const isAnswered = answers.has(index);

        return (
          <Button
            key={index}
            variant={isCurrent ? "default" : "outline"}
            size="icon"
            onClick={() => setCurrentQuestionIndex(index)}
            className={cn(
              "relative flex items-center justify-center transition-colors",
              isCurrent && "ring-2 ring-primary ring-offset-2",
              // Apply green style only if answered and NOT current (current takes precedence)
              !isCurrent && isAnswered && "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900",
              !isCurrent && !isAnswered && "text-muted-foreground"
            )}
          >
            {index + 1}
          </Button>
        );
      })}
    </div>
  );
}
