"use client";

import React, { useEffect, useState } from 'react';
import { QuestionCard, Question } from '@/components/business/question';
import { Button } from '@/components/ui/button';
import { useQuizStore } from '@/lib/store/quiz-store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { QuizTimer } from '@/components/business/quiz/QuizTimer';
import { QuizAnswerGrid } from '@/components/business/quiz/QuizAnswerGrid';
import { ScoreCard } from '@/components/business/quiz/ScoreCard';
import { submitQuiz } from '@/actions/quiz';

interface QuizDemoClientProps {
  questions: Question[];
}

const QUIZ_DURATION_SECONDS = 300; // 5 minutes

export default function QuizDemoClient({ questions }: QuizDemoClientProps) {
  const {
    currentQuestionIndex,
    totalQuestions,
    setTotalQuestions,
    nextQuestion,
    prevQuestion,
    setAnswer: setQuizAnswer,
    answers: quizAnswers,
    resetQuiz,
    setTimer,
    submitQuiz: updateStoreWithResult,
    isSubmitted,
    score,
    results
  } = useQuizStore();

  const [loading, setLoading] = useState(false);
  const [takenDuration, setTakenDuration] = useState<number | undefined>(undefined);

  useEffect(() => {
    resetQuiz();
    setTotalQuestions(questions.length);
    setTimer(QUIZ_DURATION_SECONDS);
  }, [questions.length, setTotalQuestions, resetQuiz, setTimer]);

  const handleAnswerChange = (qId: string, val: string | string[]) => {
    if (isSubmitted) return;
    const questionIndex = questions.findIndex(q => q.id === qId);
    if (questionIndex !== -1) {
      setQuizAnswer(questionIndex, val);
    }
  };

  const handleTimeUp = () => {
    if (!isSubmitted) handleSubmit();
  };

  const handleSubmit = async () => {
    if (loading || isSubmitted) return;
    setLoading(true);
    try {
        const answersArray = Array.from(quizAnswers.entries()).map(([index, value]) => ({
            questionId: questions[index].id,
            userAnswer: value as string | string[] | number | null // Cast safely
        }));

        const duration = Math.max(0, QUIZ_DURATION_SECONDS - useQuizStore.getState().timer);
        setTakenDuration(duration);

        const result = await submitQuiz({
            answers: answersArray,
            duration,
        });

        if (result.success) {
            updateStoreWithResult({
              score: result.score,
              results: result.results
            });
        } else {
            console.error(result.error);
            alert('Failed to submit: ' + result.error);
        }
    } catch (e) {
        console.error(e);
        alert('An error occurred during submission.');
    } finally {
        setLoading(false);
    }
  };

  // Safe check for empty questions
  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
        <p>Please seed the database or add questions.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = quizAnswers.get(currentQuestionIndex);
  
  // Calculate correct count from results if available
  const correctCount = results ? Object.values(results).filter(Boolean).length : 0;

  return (
    <div className="container mx-auto py-10 max-w-3xl space-y-8">
      {isSubmitted && score !== null && (
        <ScoreCard 
            score={score} 
            totalQuestions={totalQuestions} 
            correctCount={correctCount}
            duration={takenDuration}
        />
      )}

      <div className="space-y-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quiz Mode</h1>
          <p className="text-muted-foreground">
             {isSubmitted ? 'Review Mode' : 'Answer the questions below.'}
          </p>
          <p className="text-sm">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>
        {!isSubmitted && (
            <QuizTimer initialTimeInSeconds={QUIZ_DURATION_SECONDS} onTimeUp={handleTimeUp} />
        )}
      </div>

      <div className="space-y-6">
        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            userAnswer={typeof userAnswer === 'number' ? String(userAnswer) : userAnswer}
            onAnswerChange={(val) => handleAnswerChange(currentQuestion.id, val)}
            showResult={isSubmitted}
            readOnly={isSubmitted}
          />
        )}
      </div>

      <QuizAnswerGrid />

      <div className="flex items-center justify-between gap-4 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 border rounded-lg shadow-lg">
        <Button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="sm:w-auto"
          size="lg"
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        
        {!isSubmitted ? (
            <Button
                onClick={handleSubmit}
                className="w-full sm:w-auto"
                size="lg"
                disabled={loading}
            >
                {loading ? 'Submitting...' : 'Submit & Check Answers'}
            </Button>
        ) : (
            <Button
                variant="outline"
                onClick={() => {
                    resetQuiz();
                    setTimer(QUIZ_DURATION_SECONDS);
                }}
            >
                Try Again
            </Button>
        )}
        
        <Button
          onClick={nextQuestion}
          disabled={currentQuestionIndex === totalQuestions - 1}
          className="sm:w-auto"
          size="lg"
          variant="outline"
        >
          Next <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}