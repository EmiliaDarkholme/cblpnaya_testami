// client/src/api/auth.ts
import { apiClient } from './client';

export interface TelegramUser {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export const authApi = {
  async loginViaTelegram(user: TelegramUser) {
    console.log('Отправка запроса авторизации:', user);
    const response = await apiClient.post('/auth/telegram', user);
    const { token, user: userData } = response.data;
    localStorage.setItem('auth_token', token);
    console.log('Токен сохранён:', token);
    return userData;
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};