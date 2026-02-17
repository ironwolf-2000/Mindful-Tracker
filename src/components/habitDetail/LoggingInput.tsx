import React from 'react';
import styled from 'styled-components';
import { Checkbox, NumberInput, Text } from '@mantine/core';
import type { Habit } from '@/types';

interface LoggingInputProps {
  habit: Habit;
  value: boolean | number;
  onChange: (val: boolean | number) => void;
  dateLabel: string; // e.g., "Today" or "March 15, 2025"
}

const Container = styled.div`
  padding: 16px 32px;
  border-bottom: 1px solid #ddd8ce;
  background: #faf8f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
`;

const DateLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9c9488;
`;

const HabitLabel = styled.span`
  font-size: 13px;
  color: #5a5248;
  font-weight: 500;
`;

const InputSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export const LoggingInput: React.FC<LoggingInputProps> = ({ habit, value, onChange, dateLabel }) => {
  return (
    <Container>
      <LeftSection>
        <DateLabel>{dateLabel}</DateLabel>
        <HabitLabel>{habit.name}</HabitLabel>
      </LeftSection>

      <InputSection>
        {habit.mode === 'Qualitative' ? (
          <Checkbox
            checked={value as boolean}
            onChange={(e) => onChange(e.currentTarget.checked)}
            size='md'
            color='gray'
            label='Done'
          />
        ) : (
          <>
            <NumberInput
              value={value as number}
              onChange={(val) => onChange(typeof val === 'number' ? val : 0)}
              min={0}
              step={1}
              size='sm'
              hideControls
              placeholder='0'
              styles={{
                input: {
                  width: 60,
                  height: 32,
                  fontSize: 14,
                  border: '1px solid #d8d2c8',
                  borderRadius: 4,
                  textAlign: 'right',
                  background: '#f5f2ec',
                  color: '#3a3530',
                  padding: '0 8px',
                },
              }}
            />
            {habit.unit && (
              <Text size='sm' c='dimmed' style={{ whiteSpace: 'nowrap' }}>
                {habit.unit}
              </Text>
            )}
          </>
        )}
      </InputSection>
    </Container>
  );
};
