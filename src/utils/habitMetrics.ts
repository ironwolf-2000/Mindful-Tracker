import type { DailyLog, Habit, HabitStatus, HabitType, TimePeriod } from '@/types';

/**
 * Get date range for a given period
 */
export function getDateRangeForPeriod(period: TimePeriod): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  const start = new Date(today);

  if (period === 'week') {
    // Monday of current week
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    start.setDate(today.getDate() - daysFromMonday);
  } else if (period === 'month') {
    // 1st of current month
    start.setDate(1);
  } else if (period === 'quarter') {
    // 1st of current quarter (Q1=Jan, Q2=Apr, Q3=Jul, Q4=Oct)
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
  } else {
    // 1st of January of current year
    start.setMonth(0, 1);
  }

  return { start, end };
}

/**
 * Filter logs within a date range
 */
export function filterLogsByPeriod(logs: DailyLog[], period: TimePeriod): DailyLog[] {
  const { start, end } = getDateRangeForPeriod(period);

  return logs.filter((log) => {
    const logDate = new Date(log.date + 'T00:00:00');
    logDate.setHours(0, 0, 0, 0);
    return logDate >= start && logDate <= end;
  });
}

export function calculateConsistency(
  logs: DailyLog[],
  period: TimePeriod,
  habitType: HabitType,
  goal?: number,
): number {
  const filteredLogs = filterLogsByPeriod(logs, period);
  if (filteredLogs.length === 0) return 0;

  const completedDays = filteredLogs.filter((log) => {
    if (typeof log.value === 'boolean') {
      return habitType === 'Start' ? log.value === true : log.value === false;
    }

    const numValue = log.value as number;

    if (goal !== undefined && goal > 0) {
      return habitType === 'Start' ? numValue >= goal : numValue <= goal;
    }

    return habitType === 'Start' ? numValue > 0 : numValue === 0;
  }).length;

  return Math.round((completedDays / filteredLogs.length) * 100);
}

export function calculateRecoveryLatency(logs: DailyLog[], period: TimePeriod, habitType: HabitType): number {
  const filteredLogs = filterLogsByPeriod(logs, period);
  if (filteredLogs.length < 2) return 0;

  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const lapses: number[] = [];
  let currentLapse = 0;

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];

    // Determine if this day was "missed" based on habit type
    let isMissed: boolean;
    if (typeof log.value === 'boolean') {
      isMissed = habitType === 'Start' ? !log.value : log.value;
    } else {
      isMissed = habitType === 'Start' ? log.value === 0 : log.value > 0;
    }

    if (isMissed) {
      currentLapse++;
    } else if (currentLapse > 0) {
      lapses.push(currentLapse);
      currentLapse = 0;
    }
  }

  if (lapses.length === 0) return 0;

  const avgLapse = lapses.reduce((sum, l) => sum + l, 0) / lapses.length;
  return parseFloat(avgLapse.toFixed(1));
}

export function calculateStability(logs: DailyLog[], period: TimePeriod, habitType: HabitType): number {
  const filteredLogs = filterLogsByPeriod(logs, period);
  if (filteredLogs.length < 7) return 0;

  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weekMap = new Map<string, DailyLog[]>();

  sortedLogs.forEach((log) => {
    const d = new Date(log.date + 'T00:00:00');
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
    weekMap.get(weekKey)!.push(log);
  });

  const weeklyCompletions = Array.from(weekMap.values()).map((week) => {
    const completed = week.filter((l) => {
      if (typeof l.value === 'boolean') {
        return habitType === 'Start' ? l.value : !l.value;
      }
      return habitType === 'Start' ? l.value > 0 : l.value === 0;
    }).length;
    return (completed / week.length) * 100;
  });

  if (weeklyCompletions.length < 2) return 0;

  const mean = weeklyCompletions.reduce((sum, v) => sum + v, 0) / weeklyCompletions.length;
  const variance = weeklyCompletions.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / weeklyCompletions.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 1;

  const stability = Math.max(0, Math.min(100, (1 - cv) * 100));

  return Math.round(stability);
}

/**
 * Get activity value for a specific date
 */
export function getActivityForDate(logs: DailyLog[], date: Date): boolean | number | null {
  const dateStr = date.toISOString().split('T')[0];
  const log = logs.find((l) => l.date === dateStr);
  return log ? log.value : null;
}

export function calculateMissedStreak(logs: DailyLog[], habitType: 'Start' | 'Stop'): number {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  for (const log of sortedLogs) {
    let isMissed: boolean;
    if (typeof log.value === 'boolean') {
      isMissed = habitType === 'Start' ? !log.value : log.value;
    } else {
      isMissed = habitType === 'Start' ? log.value === 0 : log.value > 0;
    }

    if (isMissed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getTodayStatus(habit: Habit): HabitStatus {
  const today = new Date().toISOString().split('T')[0];
  const todayLog = habit.dailyLogs.find((log) => log.date === today);

  if (!todayLog) return 'pending'; // No data for today yet

  // Check if completed
  const isCompleted = habit.mode === 'Qualitative' ? todayLog.value === true : (todayLog.value as number) > 0;

  if (isCompleted) return 'completed';

  // Check if at-risk (missed 2+ days in a row)
  if (habit.missedStreak >= 2) return 'at-risk';

  return 'missed';
}

export function getStatusColor(status: HabitStatus): string {
  switch (status) {
    case 'completed':
      return '#4a7c6f'; // Green
    case 'at-risk':
      return '#b87d5c'; // Red/orange
    case 'missed':
      return '#9c9488'; // Gray
    case 'pending':
      return '#d4cec2'; // Light gray
  }
}
