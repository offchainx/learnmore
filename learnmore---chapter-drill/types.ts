
export interface Problem {
  id: number;
  type: string;
  level: number;
  question: string;
  equation: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserStats {
  mastery: number;
  sessionTime: string;
  streak: number;
  currentProblemIndex: number;
  totalProblems: number;
}
