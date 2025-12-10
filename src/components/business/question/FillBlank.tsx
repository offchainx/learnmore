import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Question } from './types';
import { cn } from '@/lib/utils';

interface FillBlankProps {
  question: Question;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  showResult?: boolean;
}

export const FillBlank: React.FC<FillBlankProps> = ({
  question,
  value,
  onChange,
  disabled,
  showResult
}) => {
  // Simple exact match check for styling
  const isCorrect = Array.isArray(question.answer) 
    ? question.answer.includes(value || '')
    : question.answer === value;

  return (
    <div className="space-y-3">
      <Label htmlFor="fill-blank-answer">Your Answer</Label>
      <Input
        id="fill-blank-answer"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer here..."
        className={cn(
            "max-w-md",
            showResult && (
                isCorrect 
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 focus-visible:ring-green-500" 
                    : "border-destructive bg-destructive/10 focus-visible:ring-destructive"
            )
        )}
      />
      {showResult && !isCorrect && question.answer && (
          <div className="text-sm text-muted-foreground">
              Correct Answer: <span className="font-medium text-foreground">
                {Array.isArray(question.answer) ? question.answer.join(' or ') : question.answer}
              </span>
          </div>
      )}
    </div>
  );
};
