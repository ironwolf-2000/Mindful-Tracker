import React from 'react';
import styled from 'styled-components';
import { Button, Checkbox, NumberInput, Text, Tooltip } from '@mantine/core';
import type { Habit, TimePeriod } from '@/types';
import { HII_META } from '@/const';
import { IconSparkles, IconEdit } from '@tabler/icons-react';

interface HabitDetailHeaderProps {
  habit: Habit;
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  loggingValue: boolean | number;
  onLoggingChange: (val: boolean | number) => void;
  hiiScore: number;
  onOpenReflection?: () => void;
  onOpenEdit?: () => void;
  isPrototypeHabit?: boolean;
}

function getHabitTypeLabel(type: 'Start' | 'Stop', mode: 'Qualitative' | 'Quantitative'): string {
  if (type === 'Start') {
    return mode === 'Qualitative' ? 'Build habit' : 'Track progress';
  } else {
    return mode === 'Qualitative' ? 'Limit behavior' : 'Track reduction';
  }
}

function getHabitTypeColor(type: 'Start' | 'Stop'): string {
  return type === 'Start' ? '#4a7c6f' : '#b87d5c';
}

export const HabitDetailHeader: React.FC<HabitDetailHeaderProps> = ({
  habit,
  selectedPeriod,
  onPeriodChange,
  loggingValue,
  onLoggingChange,
  hiiScore,
  onOpenReflection,
  onOpenEdit,
  isPrototypeHabit = false,
}) => {
  const typeLabel = getHabitTypeLabel(habit.type, habit.mode);
  const typeColor = getHabitTypeColor(habit.type);
  const hiiMeta = HII_META[habit.hiiLevel];
  const hasPatternAlert = habit.missedStreak >= 2;
  const showGoal = habit.mode === 'Quantitative' && habit.goal;

  const getHiiTooltip = () => {
    return `${hiiMeta.desc}. Your habit is ${hiiScore}/100 internalized.`;
  };

  return (
    <>
      <Header>
        <LeftSection>
          <TitleRow>
            <HabitName>{habit.name}</HabitName>
            <Tooltip label={getHiiTooltip()} position='top' withArrow multiline maw={220}>
              <HiiBadge style={{ background: hiiMeta.bg, color: hiiMeta.color }}>
                <BadgeLabel>{habit.hiiLevel}</BadgeLabel>
                <BadgeDivider />
                <BadgeScore>{hiiScore}</BadgeScore>
              </HiiBadge>
            </Tooltip>
            {onOpenEdit && (
              <Tooltip
                label={isPrototypeHabit ? 'Prototype habits cannot be edited' : 'Edit habit'}
                position='top'
                withArrow
              >
                <EditButton onClick={onOpenEdit} disabled={isPrototypeHabit}>
                  <IconEdit size={16} />
                </EditButton>
              </Tooltip>
            )}
          </TitleRow>
          <TypeBadge style={{ color: typeColor }}>{typeLabel}</TypeBadge>
        </LeftSection>

        <PeriodSelector>
          <PeriodButton isActive={selectedPeriod === 'week'} onClick={() => onPeriodChange('week')}>
            Week
          </PeriodButton>
          <PeriodButton isActive={selectedPeriod === 'month'} onClick={() => onPeriodChange('month')}>
            Month
          </PeriodButton>
          <PeriodButton isActive={selectedPeriod === 'quarter'} onClick={() => onPeriodChange('quarter')}>
            Quarter
          </PeriodButton>
          <PeriodButton isActive={selectedPeriod === 'year'} onClick={() => onPeriodChange('year')}>
            Year
          </PeriodButton>
        </PeriodSelector>
      </Header>

      <LoggingBar>
        <LoggingLabel>
          <DateLabel>Today</DateLabel>
          <span>Log activity</span>
        </LoggingLabel>

        <InputSection>
          {habit.mode === 'Qualitative' ? (
            <Checkbox
              checked={loggingValue as boolean}
              onChange={(e) => onLoggingChange(e.currentTarget.checked)}
              size='md'
              color='gray'
              label='Done'
            />
          ) : (
            <>
              <NumberInput
                value={loggingValue as number}
                onChange={(val) => onLoggingChange(typeof val === 'number' ? val : 0)}
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
              {showGoal && (
                <GoalLabel>
                  / {habit.goal} {habit.unit}
                </GoalLabel>
              )}
              {!showGoal && habit.unit && (
                <Text size='sm' c='dimmed' style={{ whiteSpace: 'nowrap' }}>
                  {habit.unit}
                </Text>
              )}
            </>
          )}
        </InputSection>
      </LoggingBar>

      {hasPatternAlert && onOpenReflection && (
        <PatternAlert>
          <AlertContent>
            <AlertIcon>🔍</AlertIcon>
            <AlertText>
              You've missed <strong>{habit.name.toLowerCase()}</strong> for {habit.missedStreak} days in a row.
            </AlertText>
          </AlertContent>
          <Button
            size='xs'
            onClick={onOpenReflection}
            style={{
              background: '#7a6e60',
              color: '#f5f2ec',
              fontSize: 11,
              height: 28,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            leftSection={<IconSparkles size={12} />}
          >
            Reflect
          </Button>
        </PatternAlert>
      )}
    </>
  );
};

const Header = styled.div`
  padding: 24px 32px 20px;
  border-bottom: 1px solid #ddd8ce;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  column-gap: 20px;
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HabitName = styled.h1`
  font-size: 28px;
  font-weight: 500;
  color: #3a3530;
  margin: 0;
  line-height: 1.2;
`;

const HiiBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 5px;
  cursor: default;
`;

const BadgeLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const BadgeDivider = styled.div`
  width: 1px;
  height: 14px;
  background: currentColor;
  opacity: 0.3;
`;

const BadgeScore = styled.span`
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const TypeBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 6px;
`;

const PeriodButton = styled.button<{ isActive: boolean }>`
  height: 28px;
  font-size: 11px;
  padding: 0 12px;
  border: 1px solid ${(props) => (props.isActive ? '#b5a48a' : '#ddd8ce')};
  background: ${(props) => (props.isActive ? '#f0ebe0' : 'transparent')};
  color: ${(props) => (props.isActive ? '#5a5248' : '#9c9488')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.12s ease;
  font-weight: 500;

  &:hover {
    border-color: #b5a48a;
    background: ${(props) => (props.isActive ? '#f0ebe0' : '#faf8f4')};
  }
`;

const LoggingBar = styled.div`
  padding: 14px 32px;
  border-bottom: 1px solid #ddd8ce;
  background: #faf8f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LoggingLabel = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 13px;
  color: #5a5248;
  font-weight: 500;
`;

const DateLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9c9488;
`;

const InputSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PatternAlert = styled.div`
  padding: 12px 32px;
  background: #f0ebe0;
  border-bottom: 1px solid #ddd8ce;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const AlertContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const AlertIcon = styled.span`
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
`;

const AlertText = styled.div`
  font-size: 12px;
  color: #6b5e4a;
  line-height: 1.4;

  strong {
    font-weight: 600;
  }
`;

const GoalLabel = styled.span`
  font-size: 11px;
  color: #9c9488;
  white-space: nowrap;
`;

const EditButton = styled.button<{ disabled?: boolean }>`
  width: 28px;
  height: 28px;
  border: 1px solid ${(props) => (props.disabled ? '#e0dcd4' : '#ddd8ce')};
  background: transparent;
  color: ${(props) => (props.disabled ? '#c8c0b4' : '#9c9488')};
  border-radius: 5px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s ease;

  &:hover {
    background: ${(props) => (props.disabled ? 'transparent' : '#faf8f4')};
    border-color: ${(props) => (props.disabled ? '#e0dcd4' : '#b5a48a')};
    color: ${(props) => (props.disabled ? '#c8c0b4' : '#5a5248')};
  }
`;
