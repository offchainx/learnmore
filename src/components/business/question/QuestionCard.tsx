'use client'

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionContent } from './QuestionContent';
import { SingleChoice } from './SingleChoice';
import { MultiChoice } from './MultiChoice';
import { FillBlank } from './FillBlank';
import { QuestionCardProps } from './types';
import { cn } from '@/lib/utils';
import { HelpCircle, CircleCheck, CircleX } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { hasProvidedPracticeAnswer, isRelaxedPracticeAnswerCorrect } from '@/lib/practice/answer-evaluation';

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  showResult = false,
  readOnly = false,
  showExplanation = true,
  className,
  headerAction
}) => {
  const isCorrect = React.useMemo(() => {
    if (!showResult) return undefined;
    return isRelaxedPracticeAnswerCorrect(question.type, userAnswer ?? null, question.answer ?? null);
  }, [question, userAnswer, showResult]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
           <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]">
             {question.type.replace('_', ' ')}
           </Badge>
           {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
        <QuestionContent content={question.content} className="text-lg font-medium" />
      </CardHeader>
      <CardContent>
        {(question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE' || question.type === 'MCQ') && (
          <SingleChoice 
            question={question} 
            value={typeof userAnswer === 'string' ? userAnswer : undefined} 
            onChange={onAnswerChange as (v: string) => void}
            disabled={readOnly || showResult}
            showResult={showResult}
          />
        )}
        {question.type === 'MULTIPLE_CHOICE' && (
          <MultiChoice
            question={question}
            value={Array.isArray(userAnswer) ? userAnswer : null}
            onChange={onAnswerChange as (v: string[]) => void}
            disabled={readOnly || showResult}
            showResult={showResult}
          />
        )}
        {question.type === 'FILL_BLANK' && (
            <FillBlank
                question={question}
                value={typeof userAnswer === 'string' ? userAnswer : undefined}
                onChange={onAnswerChange as (v: string) => void}
                disabled={readOnly || showResult}
                showResult={showResult}
            />
        )}
        {question.type === 'ESSAY' && (
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground" htmlFor={`essay-answer-${question.id}`}>
                    你的答案
                </label>
                <Textarea
                    id={`essay-answer-${question.id}`}
                    value={typeof userAnswer === 'string' ? userAnswer : ''}
                    onChange={(event) => onAnswerChange?.(event.target.value)}
                    disabled={readOnly || showResult}
                    placeholder="请在这里输入你的作答"
                    className={cn(
                        'min-h-32 resize-y',
                        showResult &&
                          (hasProvidedPracticeAnswer(userAnswer ?? null)
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 focus-visible:ring-green-500'
                            : 'border-destructive bg-destructive/10 focus-visible:ring-destructive')
                    )}
                />
            </div>
        )}
      </CardContent>
      {showResult && (
        <CardFooter className="flex-col items-start gap-4 border-t bg-muted/30 p-6">
            <div className="flex items-center gap-2 font-medium">
                {isCorrect ? (
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-500">
                        <CircleCheck className="h-5 w-5" />
                        回答正确
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-destructive">
                        <CircleX className="h-5 w-5" />
                        回答错误
                    </span>
                )}
            </div>

            <div className="grid w-full gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-borderTone bg-background/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        你的答案
                    </div>
                    <div className="mt-2 text-sm font-medium text-foreground">
                        {Array.isArray(userAnswer)
                          ? userAnswer.join('、') || '未作答'
                          : userAnswer || '未作答'}
                    </div>
                </div>
                {question.answer !== undefined && question.answer !== null ? (
                    <div className="rounded-xl border border-borderTone bg-background/70 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            标准答案
                        </div>
                        <div className="mt-2 text-sm font-medium text-foreground">
                            {Array.isArray(question.answer)
                              ? question.answer.join('、')
                              : String(question.answer)}
                        </div>
                    </div>
                ) : null}
            </div>
            
            {showExplanation && question.explanation && (
                <div className="w-full space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <HelpCircle className="h-4 w-4" />
                        题目解析
                    </div>
                    <QuestionContent content={question.explanation} className="text-sm text-muted-foreground" />
                </div>
            )}
        </CardFooter>
      )}
    </Card>
  );
};
