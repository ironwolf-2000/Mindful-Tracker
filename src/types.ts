export type TimePeriod = 'week' | 'month' | 'quarter' | 'year';
export type DateRangeMode = 'calendar' | 'rolling';

export type HabitType = 'Start' | 'Stop';
export type TrackingMode = 'Qualitative' | 'Quantitative';

export type HiiLevel = 'Emerging' | 'Stable' | 'Internalized';

export type Reflection = {
  date: string;
  reason: string;
  suggestion: string;
};

export type Habit = {
  id: number;
  name: string;
  type: HabitType;
  mode: TrackingMode;
  unit?: string;
  logged: boolean | number;
  hiiLevel: HiiLevel;
  missedStreak: number;
  reflections: Reflection[];
};

export type DataInsight = {
  habitId: number;
  message: string;
};
