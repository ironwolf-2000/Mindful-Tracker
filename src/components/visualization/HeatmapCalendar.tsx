import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Tooltip } from '@mantine/core';
import type { DateRangeMode, Habit, TimePeriod } from '@/types';

interface HeatmapCalendarProps {
  habit: Habit;
  period: TimePeriod;
}

function getDateRange(period: TimePeriod, mode: DateRangeMode): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  const end = new Date(today);

  if (mode === 'rolling') {
    // Rolling periods - go back N days from today
    if (period === 'week') {
      start.setDate(today.getDate() - 6); // Last 7 days
    } else if (period === 'month') {
      start.setDate(today.getDate() - 29); // Last 30 days
    } else if (period === 'quarter') {
      start.setDate(today.getDate() - 89); // Last 90 days
    } else {
      // year
      start.setDate(today.getDate() - 364); // Last 365 days
    }
  } else {
    // Calendar periods - current calendar period
    if (period === 'week') {
      // Start on Monday (1) instead of Sunday (0)
      const dayOfWeek = today.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(today.getDate() - daysFromMonday);
    } else if (period === 'month') {
      start.setDate(1);
    } else if (period === 'quarter') {
      const currentMonth = today.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      start.setMonth(quarterStartMonth);
      start.setDate(1);
    } else {
      // year
      start.setMonth(0);
      start.setDate(1);
    }
  }

  return { start, end };
}

function generateWeeks(start: Date, end: Date): Date[][] {
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  const current = new Date(start);

  const firstDayOfWeek = current.getDay();
  const daysFromMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  for (let i = 0; i < daysFromMonday; i++) {
    const filler = new Date(current);
    filler.setDate(filler.getDate() - (daysFromMonday - i));
    currentWeek.push(filler);
  }

  while (current <= end) {
    currentWeek.push(new Date(current));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    current.setDate(current.getDate() + 1);
  }

  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

function getIntensity(habit: Habit, date: Date): number {
  // TODO: Replace this mock logic with actual habit tracking data
  // For now, using mock intensity based on day of week + some randomness
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  // Higher intensity on weekdays, lower on weekends (example)
  const baseIntensity = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 0.7;

  // Add some pseudo-random variation based on habit id and date
  const seed = (habit.id * 31 + day * 7 + dayOfWeek) % 1000;
  const variation = ((seed * 1103515245 + 12345) % 100) / 100;

  return Math.min(1, (baseIntensity + variation * 0.3) / 1.3);
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ habit, period }) => {
  const [mode, setMode] = useState<DateRangeMode>('calendar');

  const { start, end } = useMemo(() => getDateRange(period, mode), [period, mode]);
  const weeks = useMemo(() => generateWeeks(start, end), [start, end]);

  const periodLabel =
    period === 'week' ? 'week' : period === 'month' ? 'month' : period === 'quarter' ? 'quarter' : 'year';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Container>
      <Header>
        <Title>{`Activity this ${periodLabel}`}</Title>
        <ToggleContainer>
          <ToggleButton isActive={mode === 'calendar'} onClick={() => setMode('calendar')}>
            Calendar
          </ToggleButton>
          <ToggleButton isActive={mode === 'rolling'} onClick={() => setMode('rolling')}>
            Rolling
          </ToggleButton>
        </ToggleContainer>
      </Header>

      <CalendarWrapper>
        {weeks.map((week, weekIdx) => (
          <WeekColumn key={weekIdx}>
            {week.map((date, dayIdx) => {
              const isInRange = date >= start && date <= end;
              const isBeforeOrToday = date <= today;
              const shouldShow = isInRange && isBeforeOrToday;
              const intensity = shouldShow ? getIntensity(habit, date) : 0;
              const dayLabel = date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <Tooltip key={`${weekIdx}-${dayIdx}`} label={dayLabel} position='top' withArrow>
                  <DayCell
                    intensity={shouldShow ? intensity : 0}
                    style={{
                      opacity: shouldShow ? 1 : 0.15,
                      cursor: shouldShow ? 'pointer' : 'default',
                    }}
                  />
                </Tooltip>
              );
            })}
          </WeekColumn>
        ))}
      </CalendarWrapper>

      <LegendContainer>
        <span>Less</span>
        <LegendItem>
          <LegendColor intensity={0} />
        </LegendItem>
        <LegendItem>
          <LegendColor intensity={0.25} />
        </LegendItem>
        <LegendItem>
          <LegendColor intensity={0.5} />
        </LegendItem>
        <LegendItem>
          <LegendColor intensity={0.75} />
        </LegendItem>
        <LegendItem>
          <LegendColor intensity={1} />
        </LegendItem>
        <span>More</span>
      </LegendContainer>
    </Container>
  );
};

const Container = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #ddd8ce;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.div`
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9c9488;
`;

const ToggleContainer = styled.div`
  display: flex;
  gap: 4px;
  background: #eeeae2;
  padding: 2px;
  border-radius: 6px;
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  padding: 4px 10px;
  border: none;
  background: ${(props) => (props.isActive ? '#f5f2ec' : 'transparent')};
  color: ${(props) => (props.isActive ? '#3a3530' : '#9c9488')};
  font-size: 10px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.12s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    color: #3a3530;
    background: ${(props) => (props.isActive ? '#f5f2ec' : '#e4dfd5')};
  }
`;

const CalendarWrapper = styled.div`
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

const WeekColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DayCell = styled.div<{ intensity: number }>`
  width: 24px;
  height: 24px;
  border-radius: 3px;
  background: ${(props) => {
    // Neutral gradient from light to darker
    if (props.intensity === 0) return '#f5f2ec'; // no activity
    if (props.intensity < 0.25) return '#e8e5dd'; // very low
    if (props.intensity < 0.5) return '#d4cec2'; // low
    if (props.intensity < 0.75) return '#b5a48a'; // medium
    return '#8a7d6f'; // high
  }};
  border: 1px solid #ddd8ce;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(58, 53, 48, 0.1);
    border-color: #b5a48a;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 10px;
  color: #9c9488;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LegendColor = styled.div<{ intensity: number }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${(props) => {
    if (props.intensity === 0) return '#f5f2ec';
    if (props.intensity === 0.25) return '#e8e5dd';
    if (props.intensity === 0.5) return '#d4cec2';
    if (props.intensity === 0.75) return '#b5a48a';
    return '#8a7d6f';
  }};
  border: 1px solid #ddd8ce;
`;
