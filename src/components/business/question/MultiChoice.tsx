import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { QuestionContent } from './QuestionContent';
import { Question } from './types';
import { cn } from '@/lib/utils';

interface MultiChoiceProps {
  question: Question;
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  showResult?: boolean;
}

export const MultiChoice: React.FC<MultiChoiceProps> = ({
  question,
  value = [],
  onChange,
  disabled,
  showResult
}) => {
  if (!question.options) return null;

  const handleCheckedChange = (checked: boolean, key: string) => {
    if (!onChange) return;
    if (checked) {
      onChange([...value, key]);
    } else {
      onChange(value.filter((v) => v !== key));
    }
  };

  return (
    <div className="grid gap-3">
      {Object.entries(question.options).map(([key, label]) => {
        const isSelected = value.includes(key);
        // Assuming question.answer is string[] for Multi Choice, or we need to parse it if it comes as string (should be handled by parent or types)
        // In types.ts: answer?: string | string[] | null;
        // We assume here that for MULTIPLE_CHOICE it's an array or we treat it as one.
        const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer as string];
        const isCorrectAnswer = correctAnswers.includes(key);
        const isWrongSelection = isSelected && !isCorrectAnswer;

        let itemClassName = "flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer";

        if (showResult) {
            if (isCorrectAnswer) {
                // Highlight correct answers (whether selected or not)
                itemClassName = cn(itemClassName, "border-green-500 bg-green-50 dark:bg-green-900/20");
            } else if (isWrongSelection) {
                // Highlight wrong selections
                itemClassName = cn(itemClassName, "border-destructive bg-destructive/10");
            } else {
                itemClassName = cn(itemClassName, "border-input opacity-60");
            }
       } else {
            itemClassName = cn(itemClassName, isSelected ? "border-primary bg-primary/5" : "border-input hover:bg-accent hover:text-accent-foreground");
       }

        return (
          <div 
            key={key} 
            className={itemClassName}
            onClick={() => {
                if (!disabled) {
                    handleCheckedChange(!isSelected, key);
                }
            }}
          >
            <Checkbox 
                id={`option-${key}`} 
                checked={isSelected} 
                onCheckedChange={(c) => handleCheckedChange(c as boolean, key)}
                disabled={disabled}
                className="mt-1"
            />
            <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer font-normal pointer-events-none">
               <div className="flex gap-2">
                 <span className="font-semibold min-w-[1.2rem]">{key}.</span>
                 <QuestionContent content={label} className="prose-none m-0 p-0 leading-normal" />
               </div>
            </Label>
          </div>
        );
      })}
    </div>
  );
};
