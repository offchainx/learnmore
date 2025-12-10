export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ESSAY';

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: Record<string, string> | null;
  answer?: string | string[] | null;
  explanation?: string | null;
}

export interface QuestionCardProps {
  question: Question;
  userAnswer?: string | string[] | null;
  onAnswerChange?: (value: string | string[]) => void;
  showResult?: boolean;
  readOnly?: boolean;
  className?: string;
}
