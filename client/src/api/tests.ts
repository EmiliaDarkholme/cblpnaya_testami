// client/src/api/tests.ts
import { apiClient } from './client';
import type { Discipline, Section, Test, Question } from '../types/tests';

export const testsApi = {
  async getDisciplines(): Promise<Discipline[]> {
    const response = await apiClient.get('/tests/disciplines');
    return response.data;
  },

  async getSections(disciplineId: number): Promise<Section[]> {
    const response = await apiClient.get(`/tests/disciplines/${disciplineId}/sections`);
    return response.data;
  },

  async getTests(params?: { discipline_id?: number; section_id?: number }): Promise<Test[]> {
    const response = await apiClient.get('/tests', { params });
    return response.data;
  },

  async getTestById(id: number, mode: 'test' | 'training' = 'test') {
    const response = await apiClient.get(`/tests/${id}`, {
      params: { mode }
    });
    return response.data;
  },

  async checkAnswers(testId: number, answers: Record<number, any>) {
    const response = await apiClient.post(`/tests/${testId}/check`, { answers });
    return response.data;
  }
};