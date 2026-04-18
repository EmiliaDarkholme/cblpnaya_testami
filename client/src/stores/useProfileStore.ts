// client/src/stores/useProfileStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Faculty, Course, Theme } from '../types';

interface ProfileState {
  faculty: Faculty;
  course: Course;
  theme: Theme;
  isProfileComplete: boolean;

  setFaculty: (faculty: Faculty) => void;
  setCourse: (course: Course) => void;
  setTheme: (theme: Theme) => void;
  completeProfile: () => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      faculty: null,
      course: null,
      theme: 'light',
      isProfileComplete: false,

      setFaculty: (faculty) => set({ faculty }),
      setCourse: (course) => set({ course }),
      setTheme: (theme) => set({ theme }),
      completeProfile: () => set({ isProfileComplete: true }),

      resetProfile: () => {
        localStorage.removeItem('username');
        set({
          faculty: null,
          course: null,
          isProfileComplete: false
        });
      },
    }),
    {
      name: 'med-test-profile',
    }
  )
);