import React from 'react';
import styled from 'styled-components';
import { Group, Text, Stack } from '@mantine/core';
import type { Reflection } from '@/types';

interface RecurringBarriersProps {
  reflections: Reflection[];
  minOccurrences?: number;
}

// ─── Styled Components ────────────────────────────────────────────────────────

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

// ─── Helper function ────────────────────────────────────────────────────────

function groupReflections(reflections: Reflection[], minCount: number = 3): Array<[string, number]> {
  const counts: Record<string, number> = {};

  for (const r of reflections) {
    counts[r.reason] = (counts[r.reason] ?? 0) + 1;
  }

  return Object.entries(counts)
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1]);
}

// ─── Component ────────────────────────────────────────────────────────────────

export const RecurringBarriers: React.FC<RecurringBarriersProps> = ({ reflections, minOccurrences = 3 }) => {
  const grouped = groupReflections(reflections, minOccurrences);

  if (grouped.length === 0) {
    return (
      <Container>
        <Title>Recurring barriers</Title>
        <EmptyState>Patterns will emerge after you log a few reflections.</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Recurring barriers</Title>
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
