import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Question } from './types';
import { cn } from '@/lib/utils';
import { hasProvidedPracticeAnswer } from '@/lib/practice/answer-evaluation';

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
  const isCorrect = showResult ? hasProvidedPracticeAnswer(value ?? null) : false;

  return (
    <div className="space-y-3">
      <Label htmlFor={`fill-blank-answer-${question.id}`}>你的答案</Label>
      <Input
        id={`fill-blank-answer-${question.id}`}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder="请输入答案"
        className={cn(
            "max-w-md",
            showResult && (
                isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 focus-visible:ring-green-500"
                    : "border-destructive bg-destructive/10 focus-visible:ring-destructive"
            )
        )}
      />
    </div>
  );
};
