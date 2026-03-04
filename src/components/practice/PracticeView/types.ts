import type { ExamForecast, HiveNode } from '@/lib/practice/types';

export interface DbSubject {
  id: string;
  name: string;
  icon?: string | null;
}

export interface DbChapterStats {
  totalAttempts: number;
  correctCount: number;
  masteryLevel: number;
  questionCount: number;
  recentAttempts?: number;
  recentCorrectRate?: number;
  monthlyCorrectRate?: number;
}

export interface DbChapter {
  id: string;
  title: string;
  subjectId: string;
  parentId: string | null;
  order: number;
  stats: DbChapterStats;
}

export interface DbPastPaper {
  id: string;
  title: string;
  sourcePaper: string | null;
  sourceYear: number | null;
  questionCount: number;
  status: string;
  updatedAt: string;
}

export interface PracticeSubjectData {
  chapters: DbChapter[];
  pastPapers: DbPastPaper[];
  knowledgeHive: HiveNode[];
  examForecast: ExamForecast | null;
}
