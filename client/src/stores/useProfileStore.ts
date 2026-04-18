// client/src/stores/useProfileStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { profileApi } from '../api/profile';
import { authApi } from '../api/auth';
import type { Faculty, Course, Theme } from '../types';

interface ProfileState {
  // Данные с сервера
  serverUser: any | null;

  // Локальные данные (тема, флаги)
  faculty: Faculty;
  course: Course;
  theme: Theme;
  isProfileComplete: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFaculty: (faculty: Faculty) => void;
  setCourse: (course: Course) => void;
  setTheme: (theme: Theme) => void;
  completeProfile: () => void;
  resetProfile: () => void;

  // API Actions
  fetchProfile: () => Promise<void>;
  saveProfileToServer: (faculty: Faculty, course: Course) => Promise<void>;
  loginWithTelegram: (telegramUser: any) => Promise<void>;
  logout: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      serverUser: null,
      faculty: null,
      course: null,
      theme: 'light',
      isProfileComplete: false,
      isLoading: false,
      error: null,

      setFaculty: (faculty) => set({ faculty }),
      setCourse: (course) => set({ course }),
      setTheme: (theme) => set({ theme }),

      completeProfile: () => set({ isProfileComplete: true }),

      resetProfile: () => {
        authApi.logout();
        set({
          faculty: null,
          course: null,
          isProfileComplete: false,
          serverUser: null
        });
      },

      // API методы
      loginWithTelegram: async (telegramUser) => {
        set({ isLoading: true, error: null });
        try {
          const userData = await authApi.loginViaTelegram({
            telegram_id: telegramUser.id,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
          });

          set({
            serverUser: userData,
            faculty: userData.faculty,
            course: userData.course,
            isProfileComplete: !!(userData.faculty && userData.course),
            isLoading: false
          });
        } catch (error: any) {
          console.error('Ошибка авторизации:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      fetchProfile: async () => {
        if (!authApi.isAuthenticated()) return;

        set({ isLoading: true });
        try {
          const profile = await profileApi.getProfile();
          set({
            serverUser: profile,
            faculty: profile.faculty,
            course: profile.course,
            isProfileComplete: !!(profile.faculty && profile.course),
            isLoading: false
          });
        } catch (error: any) {
          console.error('Ошибка загрузки профиля:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      saveProfileToServer: async (faculty, course) => {
  // Временно сохраняем только локально, без сервера
  set({
    faculty,
    course,
    isProfileComplete: true,
    isLoading: false
  });

  // Опционально: пробуем сервер, но не ждём ответа
  try {
    await profileApi.updateProfile({ faculty, course });
  } catch (error) {
    console.log('Сервер недоступен, данные сохранены локально');
  }
}

      logout: () => {
        authApi.logout();
        set({
          serverUser: null,
          faculty: null,
          course: null,
          isProfileComplete: false
        });
      },
    }),
    {
      name: 'med-test-profile',
      partialize: (state) => ({
        theme: state.theme,
        isProfileComplete: state.isProfileComplete,
      }),
    }
  )
);