export type TimePeriod = 'week' | 'month' | 'quarter' | 'year';
export type DateRangeMode = 'calendar' | 'rolling';

export type HabitType = 'Start' | 'Stop';
export type TrackingMode = 'Qualitative' | 'Quantitative';

export type HabitStatus = 'completed' | 'missed' | 'at-risk' | 'pending';

export type HiiLevel = 'Emerging' | 'Stable' | 'Internalized';

export type Reflection = {
  date: string;
  reason: string;
  suggestion: string;
};

// New: Daily activity log
export type DailyLog = {
  date: string; // ISO format: YYYY-MM-DD
  value: boolean | number; // false/true for Qualitative, number for Quantitative
  logged: boolean; // Whether user actually logged anything (vs skipped)
};

export type Habit = {
  id: number;
  name: string;
  type: HabitType;
  mode: TrackingMode;
  unit?: string;
  goal?: number; // NEW: Daily goal for quantitative habits
  logged: boolean | number;
  hiiLevel: HiiLevel;
  missedStreak: number;
  reflections: Reflection[];
  dailyLogs: DailyLog[];
};

export type DataInsight = {
  habitId: number;
  message: string;
};
