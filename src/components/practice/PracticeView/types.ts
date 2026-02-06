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
