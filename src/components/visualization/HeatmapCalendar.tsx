import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Tooltip, Modal, Stack } from '@mantine/core';
import type { DateRangeMode, Habit, TimePeriod, Reflection } from '@/types';
import { getActivityForDate } from '@/utils/habitMetrics';

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
    if (period === 'week') {
      start.setDate(today.getDate() - 6);
    } else if (period === 'month') {
      start.setDate(today.getDate() - 29);
    } else if (period === 'quarter') {
      start.setDate(today.getDate() - 89);
    } else {
      start.setDate(today.getDate() - 364);
    }
  } else {
    if (period === 'week') {
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

function getIntensityFromValue(
  value: boolean | number | null,
  mode: 'Qualitative' | 'Quantitative',
  goal?: number,
): number {
  if (value === null) return 0;

  if (mode === 'Qualitative') {
    return value ? 1 : 0;
  }

  const numValue = value as number;
  if (numValue === 0) return 0;

  const targetValue = goal || 50;
  return Math.min(1, numValue / targetValue);
}

function getReflectionsForDate(reflections: Reflection[], date: Date): Reflection[] {
  const dateStr = date.toISOString().split('T')[0];
  return reflections.filter((r) => r.date === dateStr);
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ habit, period }) => {
  const [mode, setMode] = useState<DateRangeMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalReflections, setModalReflections] = useState<Reflection[]>([]);

  const { start, end } = useMemo(() => getDateRange(period, mode), [period, mode]);
  const weeks = useMemo(() => generateWeeks(start, end), [start, end]);

  const periodLabel =
    period === 'week' ? 'week' : period === 'month' ? 'month' : period === 'quarter' ? 'quarter' : 'year';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDayClick = (date: Date) => {
    const reflections = getReflectionsForDate(habit.reflections, date);
    if (reflections.length > 0) {
      setSelectedDate(date);
      setModalReflections(reflections);
    }
  };

  const closeModal = () => {
    setSelectedDate(null);
    setModalReflections([]);
  };

  return (
    <>
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

                // Get real activity from dailyLogs
                const activityValue = shouldShow ? getActivityForDate(habit.dailyLogs, date) : null;
                const intensity = getIntensityFromValue(activityValue, habit.mode, habit.goal);

                const dayReflections = getReflectionsForDate(habit.reflections, date);
                const hasReflection = dayReflections.length > 0;
                const dayLabel = date.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <Tooltip key={`${weekIdx}-${dayIdx}`} label={dayLabel} position='top' withArrow>
                    <DayCellWrapper>
                      <DayCell
                        intensity={shouldShow ? intensity : 0}
                        style={{
                          opacity: shouldShow ? 1 : 0.15,
                          cursor: shouldShow && hasReflection ? 'pointer' : 'default',
                        }}
                        onClick={() => shouldShow && handleDayClick(date)}
                      />
                      {shouldShow && hasReflection && <ReflectionDot />}
                    </DayCellWrapper>
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

      {/* Reflection Modal */}
      <Modal
        opened={selectedDate !== null}
        onClose={closeModal}
        title={null}
        centered
        size='sm'
        styles={{
          content: {
            background: '#f5f2ec',
            border: '1px solid #ddd8ce',
            borderRadius: 12,
          },
          body: { padding: '20px 24px' },
          header: { display: 'none' },
        }}
      >
        {selectedDate && (
          <Stack gap={16}>
            <div>
              <ModalDate>
                {selectedDate.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </ModalDate>
              <ModalTitle>Reflections for this day</ModalTitle>
            </div>

            <Stack gap={10}>
              {modalReflections.map((reflection, idx) => (
                <ReflectionCard key={idx}>
                  <ReasonText>{reflection.reason}</ReasonText>
                  {reflection.suggestion && <SuggestionText>💡 {reflection.suggestion}</SuggestionText>}
                </ReflectionCard>
              ))}
            </Stack>
          </Stack>
        )}
      </Modal>
    </>
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

const DayCellWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
`;

const DayCell = styled.div<{ intensity: number }>`
  width: 100%;
  height: 100%;
  border-radius: 3px;
  background: ${(props) => {
    if (props.intensity === 0) return '#f5f2ec';
    if (props.intensity < 0.25) return '#e8e5dd';
    if (props.intensity < 0.5) return '#d4cec2';
    if (props.intensity < 0.75) return '#b5a48a';
    return '#8a7d6f';
  }};
  border: 1px solid #ddd8ce;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(58, 53, 48, 0.1);
    border-color: #b5a48a;
  }
`;

const ReflectionDot = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #b87d5c;
  border: 1px solid #f5f2ec;
  pointer-events: none;
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

const ModalDate = styled.div`
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9c9488;
  margin-bottom: 4px;
`;

const ModalTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #3a3530;
`;

const ReflectionCard = styled.div`
  padding: 10px 12px;
  border-radius: 6px;
  background: #faf8f4;
  border: 1px solid #eae6de;
`;

const ReasonText = styled.div`
  font-size: 12px;
  color: #5a5248;
  font-weight: 500;
  margin-bottom: 4px;
`;

const SuggestionText = styled.div`
  font-size: 11px;
  color: #7a8278;
`;
