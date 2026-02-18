import { IconClockHour4, IconBolt, IconMoodSad, IconWind, IconDots } from '@tabler/icons-react';
import type { DataInsight, Habit, HiiLevel, DailyLog, Reflection } from './types';
import { calculateMissedStreak } from './utils/habitMetrics';

// Helper to generate daily logs for past N days
function generateDailyLogs(
  habitId: number,
  days: number,
  mode: 'Qualitative' | 'Quantitative',
  consistencyTarget: number, // 0-100: how often should they complete it
): DailyLog[] {
  const logs: DailyLog[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Determine if this day should be completed based on consistency target
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Slightly lower completion on weekends
    const adjustedTarget = isWeekend ? consistencyTarget * 0.7 : consistencyTarget;

    // Add some randomness but trend toward target
    const seed = (habitId * 31 + i * 7) % 1000;
    const random = ((seed * 1103515245 + 12345) % 100) / 100;
    const shouldComplete = random < adjustedTarget / 100;

    if (mode === 'Qualitative') {
      logs.push({
        date: dateStr,
        value: shouldComplete,
        logged: true,
      });
    } else {
      // For quantitative, generate a realistic value
      if (shouldComplete) {
        // Generate value based on habit type
        let value: number;
        if (habitId === 1) {
          // Running: 3-8 km
          value = 3 + Math.floor(random * 6);
        } else if (habitId === 2) {
          // Reading: 10-40 pages
          value = 10 + Math.floor(random * 31);
        } else {
          // Generic
          value = Math.floor(random * 50);
        }
        logs.push({
          date: dateStr,
          value,
          logged: true,
        });
      } else {
        logs.push({
          date: dateStr,
          value: 0,
          logged: true,
        });
      }
    }
  }

  return logs;
}

// Generate reflections for missed days with patterns
function generateReflections(logs: DailyLog[], habitId: number): Reflection[] {
  const reflections: Reflection[] = [];
  const reasons = ['Time constraint', 'Low energy', 'Emotional state', 'Environmental trigger'];
  const suggestions = [
    'Earlier scheduling',
    'Shorter session',
    'Find an alternative',
    'Remove the trigger',
    'Rest and retry',
  ];

  // Find missed days
  const missedDays = logs.filter((log) => {
    if (typeof log.value === 'boolean') return !log.value;
    return log.value === 0;
  });

  // Add reflections for some missed days (not all)
  const reflectionCount = Math.min(5, Math.floor(missedDays.length * 0.3));

  for (let i = 0; i < reflectionCount; i++) {
    const missedDay = missedDays[Math.floor(Math.random() * missedDays.length)];
    const reasonIdx = (habitId * i) % reasons.length;
    const suggestionIdx = (habitId * i + 1) % suggestions.length;

    reflections.push({
      date: missedDay.date,
      reason: reasons[reasonIdx],
      suggestion: suggestions[suggestionIdx],
    });
  }

  return reflections.sort((a, b) => a.date.localeCompare(b.date));
}

// Generate mock habits with 90 days of data
const runningLogs = generateDailyLogs(1, 90, 'Quantitative', 75); // 75% consistency
const readingLogs = generateDailyLogs(2, 90, 'Quantitative', 85); // 85% consistency
const meditationLogs = generateDailyLogs(3, 90, 'Qualitative', 60); // 60% consistency

export const initialHabits: Habit[] = [
  {
    id: 1,
    name: 'Running',
    type: 'Start',
    mode: 'Quantitative',
    unit: 'km',
    goal: 5, // NEW: 5km per day goal
    logged: runningLogs[runningLogs.length - 1]?.value || 0,
    hiiLevel: 'Stable',
    missedStreak: calculateMissedStreak(runningLogs),
    dailyLogs: runningLogs,
    reflections: generateReflections(runningLogs, 1),
  },
  {
    id: 2,
    name: 'Reading',
    type: 'Start',
    mode: 'Quantitative',
    unit: 'pages',
    goal: 25, // NEW: 25 pages per day goal
    logged: readingLogs[readingLogs.length - 1]?.value || 0,
    hiiLevel: 'Internalized',
    missedStreak: calculateMissedStreak(readingLogs),
    dailyLogs: readingLogs,
    reflections: generateReflections(readingLogs, 2),
  },
  {
    id: 3,
    name: 'Meditation',
    type: 'Start',
    mode: 'Qualitative',
    unit: undefined,
    goal: undefined, // Qualitative habits don't need numeric goals
    logged: (meditationLogs[meditationLogs.length - 1]?.value as boolean) || false,
    hiiLevel: 'Emerging',
    missedStreak: calculateMissedStreak(meditationLogs),
    dailyLogs: meditationLogs,
    reflections: generateReflections(meditationLogs, 3),
  },
];

export const sessionInsight: DataInsight = {
  habitId: 1,
  message: 'You act like someone who runs.',
};

export const HII_META: Record<HiiLevel, { color: string; bg: string; desc: string }> = {
  Emerging: { color: '#7A8B99', bg: '#F0F3F5', desc: 'Building the foundation' },
  Stable: { color: '#4A7C6F', bg: '#EEF5F2', desc: 'Reliably part of your life' },
  Internalized: { color: '#3D5FA0', bg: '#EEF1F9', desc: 'This is who you are now' },
};

export const REFLECTION_REASONS = [
  { label: 'Time constraint', icon: <IconClockHour4 size={14} /> },
  { label: 'Low energy', icon: <IconBolt size={14} /> },
  { label: 'Emotional state', icon: <IconMoodSad size={14} /> },
  { label: 'Environmental trigger', icon: <IconWind size={14} /> },
  { label: 'Other', icon: <IconDots size={14} /> },
];

export const REFLECTION_SUGGESTIONS = [
  'Earlier scheduling',
  'Shorter session',
  'Find an alternative',
  'Remove the trigger',
  'Rest and retry',
  'Other',
];
