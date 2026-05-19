
export const STORAGE_KEYS = {
  HABIT_NAME: 'recovery_tracker_habit_name',
  START_DATE: 'recovery_tracker_start_date',
  HABIT_COLOR: 'recovery_tracker_habit_color',
  RESET_DATES: 'recovery_tracker_reset_dates',
};

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
