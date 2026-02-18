import React from 'react';
import styled from 'styled-components';
import { Group, Text, Stack } from '@mantine/core';
import type { Reflection, TimePeriod } from '@/types';
import { getDateRangeForPeriod } from '@/utils/habitMetrics';

interface RecurringBarriersProps {
  reflections: Reflection[];
  period: TimePeriod;
  minOccurrences?: number;
}

const Container = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #ddd8ce;
`;

const Title = styled.div`
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9c9488;
  margin-bottom: 16px;
`;

const BarrierRow = styled(Group)`
  padding: 8px 12px;
  border-radius: 6px;
  background: #eae6dc;
  margin-bottom: 8px;
`;

const Count = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  color: #9c9488;
  flex-shrink: 0;
  min-width: 24px;
`;

const Reason = styled(Text)`
  font-size: 12px;
  color: #5a5248;
`;

const EmptyState = styled(Text)`
  font-size: 12px;
  color: #9c9488;
  font-style: italic;
  line-height: 1.5;
`;

function filterReflectionsByPeriod(reflections: Reflection[], period: TimePeriod): Reflection[] {
  const { start, end } = getDateRangeForPeriod(period);

  return reflections.filter((reflection) => {
    const reflectionDate = new Date(reflection.date);
    reflectionDate.setHours(0, 0, 0, 0);
    return reflectionDate >= start && reflectionDate <= end;
  });
}

function groupReflections(reflections: Reflection[], minCount: number = 2): Array<[string, number]> {
  const counts: Record<string, number> = {};

  for (const r of reflections) {
    counts[r.reason] = (counts[r.reason] ?? 0) + 1;
  }

  return Object.entries(counts)
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1]);
}

export const RecurringBarriers: React.FC<RecurringBarriersProps> = ({ reflections, period, minOccurrences = 2 }) => {
  // Filter reflections to current period
  const periodReflections = filterReflectionsByPeriod(reflections, period);
  const grouped = groupReflections(periodReflections, minOccurrences);

  const periodLabel =
    period === 'week'
      ? 'this week'
      : period === 'month'
      ? 'this month'
      : period === 'quarter'
      ? 'this quarter'
      : 'this year';

  if (grouped.length === 0) {
    return (
      <Container>
        <Title>Recurring barriers {periodLabel}</Title>
        <EmptyState>
          {periodReflections.length === 0
            ? `No reflections ${periodLabel}.`
            : 'No recurring patterns yet. Keep reflecting to identify barriers.'}
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Recurring barriers {periodLabel}</Title>
      <Stack gap={4}>
        {grouped.map(([reason, count]) => (
          <BarrierRow key={reason} gap={8}>
            <Count>{count}×</Count>
            <Reason>{reason}</Reason>
          </BarrierRow>
        ))}
      </Stack>
    </Container>
  );
};
