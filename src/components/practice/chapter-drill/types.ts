export interface Problem {
  id: string;
  type: string;
  level: number;
  question: string;
  equation: string | null;
  options: Record<string, string> | null;
  answer: string | string[] | null; // e.g. "a" or ["a", "c"]
  explanation: string | null;
  correctIndex?: number; // Helper for UI mapping
  parsedOptions?: string[]; // Helper for UI mapping
}

export interface UserStats {
  mastery: number;
  sessionTime: string;
  streak: number;
  currentProblemIndex: number;
  totalProblems: number;
}
