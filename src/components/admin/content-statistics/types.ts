export interface Reviewer {
  id: string;
  name: string;
  avatar: string;
  role: string;
  reviews: number;
  accuracy: number;
  status: 'Active' | 'Away' | 'Offline';
}

export interface StatItem {
  id: string;
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  trend?: {
    value: string;
    isPositive: boolean;
    text: string;
  };
  progress?: number;
  description?: string;
  isCircular?: boolean;
}

export interface SubjectData {
  subject: string;
  value: number;
  fullMark: number;
}

export interface DifficultyData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  total: number;
  [key: string]: string | number; // 索引签名，兼容 recharts ChartDataInput 类型
}
