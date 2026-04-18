// client/src/api/results.ts
import { apiClient } from './client';

export const resultsApi = {
  async saveResult(data: {
    test_id: number;
    score: number;
    max_score: number;
    answers: any;
    time_spent: number;
  }) {
    const response = await apiClient.post('/results', data);
    return response.data;
  },

  async getMyResults() {
    const response = await apiClient.get('/results');
    return response.data;
  },

  async getResultById(id: number) {
    const response = await apiClient.get(`/results/${id}`);
    return response.data;
  }
};