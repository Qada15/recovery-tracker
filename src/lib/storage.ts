export const STORAGE_KEYS = {
  HABITS: 'recovery_tracker_habits',
  ACTIVE_HABIT_ID: 'recovery_tracker_active_id',
  LANGUAGE: 'recovery_tracker_language',
  THEME: 'recovery_tracker_theme',
  USER_PROFILE: 'recovery_tracker_user_profile',
};

export interface UserProfile {
  name: string;
  surname: string;
  birthDate: string;
  gender: 'male' | 'female' | '';
  photoURL?: string;
  coverPhotoURL?: string;
}

export interface Habit {
  id: string;
  name: string;
  startDate: string;
  resetDates: string[];
  color: string;
  icon?: string;
}

export function saveToStorage(key: string, value: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

export function getFromStorage(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

export function clearAllStorage() {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    window.location.href = '/';
  }
}
