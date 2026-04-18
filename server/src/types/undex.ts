// server/src/types/index.ts
export interface User {
  id: number;
  telegram_id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  faculty: string | null;
  course: number | null;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  faculty: string;
  course: number;
  subject: string;
  time_limit: number;
  questions: Question[];
  created_at: string;
}

export interface Question {
  id: number;
  text: string;
  type: 'single' | 'multiple' | 'open';
  options?: string[];
  correct: string | string[];
  explanation?: string;
}

export interface TestResult {
  id: number;
  user_id: number;
  test_id: number;
  score: number;
  max_score: number;
  answers: any;
  time_spent: number;
  created_at: string;
}