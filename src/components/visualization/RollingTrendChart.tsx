import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DateRangeMode, Habit, TimePeriod } from '@/types';

interface RollingTrendChartProps {
  habit: Habit;
  period: TimePeriod;
}

interface DataPoint {
  date: string;
  daily: number;
  average: number;
}

function getDaysToGenerate(period: TimePeriod, mode: DateRangeMode): number {
  if (mode === 'rolling') {
    if (period === 'week') return 7;
    if (period === 'month') return 30;
    if (period === 'quarter') return 90;
    return 365;
  }

  // Calendar mode - get days from period start to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === 'week') {
    const dayOfWeek = today.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return daysFromMonday + 1; // Monday to today inclusive
  }

  if (period === 'month') {
    return today.getDate(); // 1st to today
  }

  if (period === 'quarter') {
    const currentMonth = today.getMonth();
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    const quarterStart = new Date(today.getFullYear(), quarterStartMonth, 1);
    return Math.floor((today.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  // Year
  const yearStart = new Date(today.getFullYear(), 0, 1);
  return Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function getAverageWindow(period: TimePeriod): number {
  if (period === 'week') return 3; // 3-day average for weekly view
  if (period === 'month') return 7; // 7-day average for monthly view
  if (period === 'quarter') return 14; // 14-day average for quarterly view
  return 30; // 30-day average for yearly view
}

function generateMockData(habit: Habit, period: TimePeriod, mode: DateRangeMode): DataPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const data: DataPoint[] = [];

  const daysToGenerate = getDaysToGenerate(period, mode);

  for (let i = daysToGenerate - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayOfWeek = date.getDay();
    const baseValue = dayOfWeek === 0 || dayOfWeek === 6 ? 40 : 70;
    const seed = (habit.id * 31 + date.getDate() * 7 + dayOfWeek) % 1000;
    const noise = ((seed * 1103515245 + 12345) % 100) / 100;
    const daily = Math.min(100, Math.max(0, baseValue + noise * 30 - 15));

    data.push({
      date: date.toISOString().split('T')[0],
      daily: Math.round(daily),
      average: 0, // Will calculate below
    });
  }

  // Calculate rolling average
  const windowSize = getAverageWindow(period);
  return data.map((point, idx) => {
    const start = Math.max(0, idx - windowSize + 1);
    const window = data.slice(start, idx + 1);
    const average = window.reduce((sum, d) => sum + d.daily, 0) / window.length;

    return {
      ...point,
      average: Math.round(average),
    };
  });
}

/**
 * Format x-axis labels based on period
 */
function formatXAxisLabel(dateStr: string, period: TimePeriod, index: number, dataLength: number): string {
  const date = new Date(dateStr);

  if (period === 'week') {
    return date.toLocaleDateString('en-GB', { weekday: 'short' });
  }

  if (period === 'month') {
    // Show every ~4 days
    return index % 4 === 0 ? date.toLocaleDateString('en-GB', { day: 'numeric' }) : '';
  }

  if (period === 'quarter') {
    // Show every ~7 days
    return index % 7 === 0 ? date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : '';
  }

  // year: show every ~30 days
  const interval = Math.max(1, Math.floor(dataLength / 12));
  return index % interval === 0 ? date.toLocaleDateString('en-GB', { month: 'short' }) : '';
}

/**
 * Custom tooltip for chart
 */
interface TooltipPayload {
  payload: DataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  averageWindow: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, averageWindow }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date).toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return (
      <div
        style={{
          background: '#f5f2ec',
          border: '1px solid #ddd8ce',
          borderRadius: 4,
          padding: '8px 12px',
          fontSize: 11,
        }}
      >
        <div style={{ color: '#5a5248', marginBottom: 4, fontWeight: 500 }}>{date}</div>
        <div style={{ color: '#9c9488', marginBottom: 2 }}>Daily: {data.daily}%</div>
        <div style={{ color: '#4a7c6f', fontWeight: 600 }}>
          {averageWindow}-day avg: {data.average}%
        </div>
      </div>
    );
  }

  return null;
};

export const RollingTrendChart: React.FC<RollingTrendChartProps> = ({ habit, period }) => {
  const [mode, setMode] = useState<DateRangeMode>('calendar');

  const data = useMemo(() => generateMockData(habit, period, mode), [habit, period, mode]);
  const averageWindow = getAverageWindow(period);

  const getPeriodLabel = () => {
    if (period === 'week') return 'This week';
    if (period === 'month') return 'This month';
    if (period === 'quarter') return 'This quarter';
    return 'This year';
  };

  return (
    <Container>
      <Header>
        <Title>{getPeriodLabel()} trend</Title>
        <ToggleContainer>
          <ToggleButton isActive={mode === 'calendar'} onClick={() => setMode('calendar')}>
            Calendar
          </ToggleButton>
          <ToggleButton isActive={mode === 'rolling'} onClick={() => setMode('rolling')}>
            Rolling
          </ToggleButton>
        </ToggleContainer>
      </Header>

      <ChartWrapper>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='#eae6de'
              vertical={false}
              horizontalPoints={[0, 25, 50, 75, 100]}
            />
            <XAxis
              dataKey='date'
              tickFormatter={(dateStr, index) => formatXAxisLabel(dateStr, period, index, data.length)}
              stroke='#9c9488'
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke='#9c9488'
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip averageWindow={averageWindow} />}
              cursor={{ stroke: '#ddd8ce', strokeWidth: 1 }}
            />

            {/* Daily activity line (subtle) */}
            <Line
              type='monotone'
              dataKey='daily'
              stroke='#ddd8ce'
              dot={false}
              strokeWidth={1}
              isAnimationActive={false}
              name='Daily activity'
            />

            {/* Rolling average line (prominent) */}
            <Line
              type='monotone'
              dataKey='average'
              stroke='#4a7c6f'
              dot={false}
              strokeWidth={2.5}
              isAnimationActive={false}
              name={`${averageWindow}-day average`}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <Legend>
        <LegendItem color='#ddd8ce'>Daily activity</LegendItem>
        <LegendItem color='#4a7c6f'>{averageWindow}-day average</LegendItem>
      </Legend>
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

const ChartWrapper = styled.div`
  width: 100%;
  height: 280px;
  margin-top: 12px;
`;

const Legend = styled.div`
  font-size: 11px;
  color: #9c9488;
  margin-top: 12px;
  line-height: 1.6;
`;

const LegendItem = styled.span`
  display: inline-block;
  margin-right: 16px;

  &::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 2px;
    background: ${(props) => props.color || '#4a7c6f'};
    margin-right: 6px;
    vertical-align: middle;
  }
`;
