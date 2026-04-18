// client/src/api/profile.ts
import { apiClient } from './client';
import type { Faculty, Course } from '../types';

export const profileApi = {
  async getProfile() {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  async updateProfile(data: { faculty?: Faculty; course?: Course }) {
    const response = await apiClient.put('/profile', data);
    return response.data;
  }
};