import type { DailyLog, Habit, HabitStatus, TimePeriod } from '@/types';

/**
 * Get date range for a given period
 */
export function getDateRangeForPeriod(period: TimePeriod): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  const start = new Date(today);

  if (period === 'week') {
    start.setDate(today.getDate() - 6); // Last 7 days
  } else if (period === 'month') {
    start.setDate(today.getDate() - 29); // Last 30 days
  } else if (period === 'quarter') {
    start.setDate(today.getDate() - 89); // Last 90 days
  } else {
    start.setDate(today.getDate() - 364); // Last 365 days
  }

  return { start, end };
}

/**
 * Filter logs within a date range
 */
export function filterLogsByPeriod(logs: DailyLog[], period: TimePeriod): DailyLog[] {
  const { start, end } = getDateRangeForPeriod(period);

  return logs.filter((log) => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    return logDate >= start && logDate <= end;
  });
}

/**
 * Calculate consistency: percentage of days the habit was completed
 * For Qualitative: % of days logged as true
 * For Quantitative: % of days with value > 0
 */
export function calculateConsistency(logs: DailyLog[], period: TimePeriod): number {
  const filteredLogs = filterLogsByPeriod(logs, period);
  if (filteredLogs.length === 0) return 0;

  const completedDays = filteredLogs.filter((log) => {
    if (typeof log.value === 'boolean') {
      return log.value === true;
    }
    return log.value > 0;
  }).length;

  return Math.round((completedDays / filteredLogs.length) * 100);
}

/**
 * Calculate recovery latency: average days to resume after missing
 * Logic: Find gaps (consecutive missed days), then calculate average time to resume
 */
export function calculateRecoveryLatency(logs: DailyLog[], period: TimePeriod): number {
  const filteredLogs = filterLogsByPeriod(logs, period);
  if (filteredLogs.length < 2) return 0;

  // Sort logs by date
  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const lapses: number[] = [];
  let currentLapse = 0;

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];
    const isMissed = typeof log.value === 'boolean' ? !log.value : log.value === 0;

    if (isMissed) {
      currentLapse++;
    } else if (currentLapse > 0) {
      // Resumed after a lapse
      lapses.push(currentLapse);
      currentLapse = 0;
    }
  }

  if (lapses.length === 0) return 0;

  const avgLapse = lapses.reduce((sum, l) => sum + l, 0) / lapses.length;
  return parseFloat(avgLapse.toFixed(1));
}

/**
 * Calculate stability: inverse of coefficient of variation
 * Measures consistency of weekly completion rates
 */
export function calculateStability(logs: DailyLog[], period: TimePeriod): number {
  const filteredLogs = filterLogsByPeriod(logs, period);
  if (filteredLogs.length < 7) return 0;

  // Group logs by week
  const weeklyCompletions: number[] = [];
  let currentWeek: DailyLog[] = [];

  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedLogs.forEach((log, index) => {
    currentWeek.push(log);

    if (currentWeek.length === 7 || index === sortedLogs.length - 1) {
      const completed = currentWeek.filter((l) => {
        if (typeof l.value === 'boolean') return l.value;
        return l.value > 0;
      }).length;

      weeklyCompletions.push((completed / currentWeek.length) * 100);
      currentWeek = [];
    }
  });

  if (weeklyCompletions.length < 2) return 0;

  // Calculate coefficient of variation (CV)
  const mean = weeklyCompletions.reduce((sum, v) => sum + v, 0) / weeklyCompletions.length;
  const variance = weeklyCompletions.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / weeklyCompletions.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 1;

  // Convert to stability: lower CV = higher stability
  // CV of 0 = 100% stable, CV of 1+ = 0% stable
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

/**
 * Calculate current missed streak
 */
export function calculateMissedStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;

  // Sort logs by date descending (most recent first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  for (const log of sortedLogs) {
    const isMissed = typeof log.value === 'boolean' ? !log.value : log.value === 0;

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
