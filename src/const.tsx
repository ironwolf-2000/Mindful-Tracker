import { IconClockHour4, IconBolt, IconMoodSad, IconWind, IconDots } from '@tabler/icons-react';
import type { DataInsight, Habit, HiiLevel, Reflection } from './types';

export const mockReflections: Reflection[] = [
  { date: '2025-01-14', reason: 'Low energy', suggestion: 'Sleep earlier' },
  { date: '2025-01-21', reason: 'Time constraint', suggestion: 'Morning session' },
  { date: '2025-02-03', reason: 'Low energy', suggestion: 'Shorter route' },
  { date: '2025-02-10', reason: 'Environmental trigger', suggestion: 'Indoor alternative' },
  { date: '2025-02-17', reason: 'Low energy', suggestion: 'Rest day' },
];

export const initialHabits: Habit[] = [
  {
    id: 1,
    name: 'Running',
    type: 'Start',
    mode: 'Quantitative',
    unit: 'km',
    logged: 0,
    hiiLevel: 'Stable',
    missedStreak: 0,
    reflections: mockReflections,
  },
  {
    id: 2,
    name: 'Reading',
    type: 'Start',
    mode: 'Quantitative',
    unit: 'pages',
    logged: 12,
    hiiLevel: 'Internalized',
    missedStreak: 0,
    reflections: [
      { date: '2025-01-08', reason: 'Emotional state', suggestion: 'Light reading' },
      { date: '2025-01-22', reason: 'Emotional state', suggestion: 'Short chapter only' },
    ],
  },
  {
    id: 3,
    name: 'Meditation',
    type: 'Start',
    mode: 'Qualitative',
    unit: undefined,
    logged: false,
    hiiLevel: 'Emerging',
    missedStreak: 2,
    reflections: [
      { date: '2025-02-01', reason: 'Low energy', suggestion: 'Morning session' },
      { date: '2025-02-08', reason: 'Time constraint', suggestion: 'Shorter session' },
    ],
  },
  {
    id: 4,
    name: 'Social media',
    type: 'Stop',
    mode: 'Quantitative',
    unit: 'min',
    logged: 47,
    hiiLevel: 'Emerging',
    missedStreak: 0,
    reflections: [
      { date: '2025-01-16', reason: 'Emotional state', suggestion: 'Walk instead' },
      { date: '2025-01-30', reason: 'Environmental trigger', suggestion: 'App timer' },
      { date: '2025-02-08', reason: 'Emotional state', suggestion: 'Journaling' },
    ],
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
