'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Question, QuestionType } from '@prisma/client';
import { submitQuiz, QuizSubmissionResult } from '@/actions/quiz';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface QuizViewProps {
  chapterId: string;
  questions: Question[];
  onComplete?: () => void;
}

export function QuizView({ chapterId, questions, onComplete }: QuizViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);

  const handleSingleChoiceChange = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleMultipleChoiceChange = (qId: string, value: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[qId] as string[]) || [];
      if (checked) {
        return { ...prev, [qId]: [...current, value] };
      } else {
        return { ...prev, [qId]: current.filter((v) => v !== value) };
      }
    });
  };

  const handleInputChange = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
      }));

      const res = await submitQuiz({
        chapterId,
        answers: formattedAnswers,
        duration: 60, // Placeholder duration
      });

      setResult(res);
      if (res.success && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Quiz submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No questions available for this quiz.</div>;
  }

  if (result) {
    return (
      <div className="space-y-8">
        <Card className="border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-emerald-600 dark:text-emerald-400">
              Quiz Completed!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <div className="text-5xl font-bold">{Math.round(result.score || 0)}%</div>
            <p className="text-muted-foreground">
              You answered {result.correctCount} out of {result.totalQuestions} correctly.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => setResult(null)} variant="outline">Review Answers</Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {questions.map((q, index) => {
            const isCorrect = result.results?.[q.id];
            return (
              <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2 text-base">
                    <span className="font-mono text-muted-foreground">Q{index + 1}.</span>
                    <div className="flex-1">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {q.content}
                      </ReactMarkdown>
                    </div>
                    {isCorrect ? <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" /> : <XCircle className="text-red-500 w-5 h-5 shrink-0" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Show User Answer vs Correct Answer could go here */}
                  {!isCorrect && q.explanation && (
                    <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
                      <p className="font-semibold mb-1">Explanation:</p>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {q.explanation}
                      </ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {questions.map((q, index) => {
        const options = q.options as Record<string, string> | null;
        
        return (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="flex items-start gap-2 text-base">
                <span className="font-mono text-muted-foreground">Q{index + 1}.</span>
                <div className="flex-1 prose dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {q.content}
                  </ReactMarkdown>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {q.type === QuestionType.SINGLE_CHOICE && options && (
                <RadioGroup onValueChange={(val) => handleSingleChoiceChange(q.id, val)} value={answers[q.id] as string}>
                  {Object.entries(options).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent transition-colors">
                      <RadioGroupItem value={key} id={`${q.id}-${key}`} />
                      <Label htmlFor={`${q.id}-${key}`} className="flex-1 cursor-pointer">{key}. {value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {q.type === QuestionType.MULTIPLE_CHOICE && options && (
                <div className="space-y-2">
                   {Object.entries(options).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent transition-colors">
                      <Checkbox 
                        id={`${q.id}-${key}`} 
                        checked={(answers[q.id] as string[] || []).includes(key)}
                        onCheckedChange={(checked) => handleMultipleChoiceChange(q.id, key, checked as boolean)}
                      />
                      <Label htmlFor={`${q.id}-${key}`} className="flex-1 cursor-pointer">{key}. {value}</Label>
                    </div>
                  ))}
                </div>
              )}

              {(q.type === QuestionType.FILL_BLANK || q.type === QuestionType.ESSAY) && (
                <Input 
                  placeholder="Type your answer here..." 
                  value={answers[q.id] as string || ''}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full md:w-auto">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Answers
        </Button>
      </div>
    </div>
  );
}
