
export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_BLANK = 'FILL_BLANK',
  ESSAY = 'ESSAY'
}

export interface ParsedQuestion {
  id?: string; 
  content: string;
  type: string; // Compatible with 'SINGLE_CHOICE' | ...
  options?: Record<string, string>;
  answer: string | string[];
  explanation: string;
  difficulty?: number;
  rawText?: string;
  uncertainSegments?: string[];
  createdAt?: number;
}

export type ParserState = 'IDLE' | 'PROCESSING' | 'REVIEW' | 'SUCCESS';
