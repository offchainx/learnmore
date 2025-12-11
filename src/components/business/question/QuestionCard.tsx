import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionContent } from './QuestionContent';
import { SingleChoice } from './SingleChoice';
import { MultiChoice } from './MultiChoice';
import { FillBlank } from './FillBlank';
import { QuestionCardProps } from './types';
import { cn } from '@/lib/utils';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  showResult = false,
  readOnly = false,
  className
}) => {
  const isCorrect = React.useMemo(() => {
    if (!showResult) return undefined;
    if (question.type === 'SINGLE_CHOICE') {
      return userAnswer === question.answer;
    }
    if (question.type === 'MULTIPLE_CHOICE') {
        const answerArr = Array.isArray(question.answer) ? question.answer : [question.answer as string];
        const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer as string];
        
        if (!userArr) return false;
        
        if (answerArr.length !== userArr.length) return false;
        const sortedAnswer = [...answerArr].sort();
        const sortedUser = [...userArr].sort();
        return sortedAnswer.every((val, index) => val === sortedUser[index]);
    }
    if (question.type === 'FILL_BLANK') {
        const val = userAnswer as string;
        if (Array.isArray(question.answer)) {
            return question.answer.includes(val);
        }
        return question.answer === val;
    }
    return false;
  }, [question, userAnswer, showResult]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
           <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
           {/* Difficulty stars could go here */}
        </div>
        <QuestionContent content={question.content} className="text-lg font-medium" />
      </CardHeader>
      <CardContent>
        {question.type === 'SINGLE_CHOICE' && (
          <SingleChoice 
            question={question} 
            value={userAnswer as string} 
            onChange={onAnswerChange as (v: string) => void}
            disabled={readOnly || showResult}
            showResult={showResult}
          />
        )}
        {question.type === 'MULTIPLE_CHOICE' && (
          <MultiChoice
            question={question}
            value={userAnswer as string[]}
            onChange={onAnswerChange as (v: string[]) => void}
            disabled={readOnly || showResult}
            showResult={showResult}
          />
        )}
        {question.type === 'FILL_BLANK' && (
            <FillBlank
                question={question}
                value={userAnswer as string}
                onChange={onAnswerChange as (v: string) => void}
                disabled={readOnly || showResult}
                showResult={showResult}
            />
        )}
        {question.type === 'ESSAY' && (
            <div className="p-4 bg-muted rounded-md text-muted-foreground text-sm">
                This question type is not fully supported in this preview yet.
            </div>
        )}
      </CardContent>
      {showResult && (
        <CardFooter className="flex-col items-start gap-4 border-t bg-muted/30 p-6">
            <div className="flex items-center gap-2 font-medium">
                {isCorrect ? (
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                        Correct
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-destructive">
                        <XCircle className="h-5 w-5" />
                        Incorrect
                    </span>
                )}
            </div>
            
            {question.explanation && (
                <div className="w-full space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <HelpCircle className="h-4 w-4" />
                        Explanation
                    </div>
                    <QuestionContent content={question.explanation} className="text-sm text-muted-foreground" />
                </div>
            )}
        </CardFooter>
      )}
    </Card>
  );
};
