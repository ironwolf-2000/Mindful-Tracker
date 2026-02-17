import React from 'react';
import styled from 'styled-components';
import { Stack, Button } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import type { Habit } from '@/types';

interface ReflectionHistoryProps {
  habit: Habit;
  onOpenReflectionModal: () => void;
  maxItems?: number;
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

const ReflectionCard = styled.div`
  padding: 12px;
  border-radius: 6px;
  background: #f3f0ea;
  border: 1px solid #eae6de;
  margin-bottom: 8px;
`;

const DateSpan = styled.div`
  font-size: 10px;
  color: #9c9488;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
`;

const ReasonSpan = styled.div`
  font-size: 12px;
  color: #5a5248;
  font-weight: 500;
  margin-bottom: 4px;
`;

const SuggestionSpan = styled.div`
  font-size: 11px;
  color: #7a8278;
  margin-top: 4px;
`;

const PatternAlert = styled.div`
  padding: 12px;
  border-radius: 6px;
  background: #f0ebe0;
  border: 1px solid #ddd3c0;
  margin-bottom: 16px;
`;

const AlertTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #6b5e4a;
  margin-bottom: 8px;
`;

const AlertText = styled.div`
  font-size: 11px;
  color: #7a8278;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const EmptyStateText = styled.div`
  font-size: 12px;
  color: #9c9488;
  font-style: italic;
  line-height: 1.5;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export const ReflectionHistory: React.FC<ReflectionHistoryProps> = ({ habit, onOpenReflectionModal, maxItems = 5 }) => {
  const hasPatternAlert = habit.missedStreak >= 2;
  const recentReflections = habit.reflections.slice(-maxItems).reverse();

  return (
    <Container>
      <Title>Reflections</Title>

      <Stack gap={12}>
        {/* Pattern Alert */}
        {hasPatternAlert && (
          <PatternAlert>
            <AlertTitle>🔍 Pattern detected</AlertTitle>
            <AlertText>
              You've missed {habit.name.toLowerCase()} for {habit.missedStreak} days in a row. Want to reflect on what's
              getting in the way?
            </AlertText>
            <Button
              size='xs'
              onClick={onOpenReflectionModal}
              style={{
                background: '#7a6e60',
                color: '#f5f2ec',
                fontSize: 11,
                height: 28,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              leftSection={<IconSparkles size={12} />}
            >
              Reflect
            </Button>
          </PatternAlert>
        )}

        {/* Recent Reflections */}
        {recentReflections.length === 0 ? (
          <EmptyStateText>No reflections yet. When you miss this habit, you'll be prompted to reflect.</EmptyStateText>
        ) : (
          recentReflections.map((reflection, idx) => {
            const formattedDate = new Date(reflection.date).toLocaleDateString('en-GB', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <ReflectionCard key={`${reflection.date}-${idx}`}>
                <DateSpan>{formattedDate}</DateSpan>
                <ReasonSpan>{reflection.reason}</ReasonSpan>
                {reflection.suggestion && <SuggestionSpan>💡 {reflection.suggestion}</SuggestionSpan>}
              </ReflectionCard>
            );
          })
        )}
      </Stack>
    </Container>
  );
};
