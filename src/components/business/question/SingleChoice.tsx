import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { QuestionContent } from './QuestionContent';
import { Question } from './types';
import { cn } from '@/lib/utils';

interface SingleChoiceProps {
  question: Question;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  showResult?: boolean;
}

export const SingleChoice: React.FC<SingleChoiceProps> = ({
  question,
  value,
  onChange,
  disabled,
  showResult
}) => {
  if (!question.options) return null;

  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      className="gap-3"
    >
      {Object.entries(question.options).map(([key, label]) => {
        const isSelected = value === key;
        // Check correctness if showResult is on.
        // Assuming question.answer is a string for Single Choice.
        const isCorrectAnswer = question.answer === key;
        const isWrongSelection = isSelected && !isCorrectAnswer;

        let itemClassName = "flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer";
        
        if (showResult) {
             if (isCorrectAnswer) {
                 itemClassName = cn(itemClassName, "border-green-500 bg-green-50 dark:bg-green-900/20");
             } else if (isWrongSelection) {
                 itemClassName = cn(itemClassName, "border-destructive bg-destructive/10");
             } else {
                 itemClassName = cn(itemClassName, "border-input opacity-60");
             }
        } else {
             itemClassName = cn(itemClassName, isSelected ? "border-primary bg-primary/5" : "border-input hover:bg-accent hover:text-accent-foreground");
        }

        return (
          <div key={key} className={itemClassName} onClick={() => !disabled && onChange?.(key)}>
            <RadioGroupItem value={key} id={`option-${key}`} className="mt-1" />
            <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer font-normal pointer-events-none">
               <div className="flex gap-2">
                 <span className="font-semibold min-w-[1.2rem]">{key}.</span>
                 <QuestionContent content={label} className="prose-none m-0 p-0 leading-normal" />
               </div>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
};
