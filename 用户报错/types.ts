export interface User {
  id: string;
  name: string;
  avatar: string;
  role?: string;
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  IN_REVIEW = 'IN_REVIEW',
}

export enum IssueType {
  ANSWER_WRONG = 'ANSWER_WRONG',
  TYPO_ERROR = 'TYPO_ERROR',
  IMAGE_MISSING = 'IMAGE_MISSING',
}

export interface Question {
  id: string;
  text: string;
  subject: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface Report {
  id: string;
  user: User;
  timestamp: string; // e.g., "2 mins ago"
  issueType: IssueType;
  question: Question;
  status: ReportStatus;
  comment?: string;
  userSuggestedOptionId?: string;
  systemCorrectOptionId?: string;
}

export interface Stats {
  pendingCount: number;
  pendingChange: number;
  resolvedToday: number;
  resolvedRate: number;
  avgResolutionTime: number; // in hours
  avgResolutionChange: number; // in minutes
}