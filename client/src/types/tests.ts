// client/src/types/tests.ts
export interface Discipline {
  id: number;
  name: string;
  faculty: string;
  course: number;
  description: string;
  tests_count: number;
}

export interface Section {
  id: number;
  discipline_id: number;
  name: string;
  description: string;
  tests_count: number;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  discipline_name: string;
  section_name?: string;
  time_limit: number;
  questions_count: number;
}

export interface Question {
  id: number;
  text: string;
  type: 'single' | 'multiple' | 'open';
  options?: string[];
  correct?: string | string[];
  explanation?: string;
}