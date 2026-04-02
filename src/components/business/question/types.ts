import type { ReactNode } from 'react';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ESSAY' | 'TRUE_FALSE' | 'MCQ';

export interface QuestionMaterialGroup {
  id: string;
  title?: string | null;
  material: string;
  imageUrls?: string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: Record<string, string> | null;
  answer?: string | string[] | null;
  explanation?: string | null;
  group?: QuestionMaterialGroup | null;
}

export interface QuestionCardProps {
  question: Question;
  userAnswer?: string | string[] | null;
  onAnswerChange?: (value: string | string[]) => void;
  showResult?: boolean;
  readOnly?: boolean;
  showExplanation?: boolean;
  className?: string;
  headerAction?: ReactNode;
}
