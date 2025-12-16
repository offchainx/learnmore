export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  grade: number;
  level: number;
  xp: number;
  streak: number;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  lastLesson: string;
  masteryLevel: number;
}
