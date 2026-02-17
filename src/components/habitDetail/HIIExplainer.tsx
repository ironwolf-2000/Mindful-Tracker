import React from 'react';
import styled from 'styled-components';
import { Stack, Progress, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { HiiLevel, TimePeriod } from '@/types';
import { HII_META } from '@/const';

interface HIIExplainerProps {
  habitName: string;
  hiiLevel: HiiLevel;
  consistency: number; // 0-100: active days / total days
  recoveryLatency: number; // average days to resume after lapse
  stability: number; // 0-100: inverse of variability (higher = more stable)
  period: TimePeriod;
}

export const HIIExplainer: React.FC<HIIExplainerProps> = ({
  habitName,
  hiiLevel,
  consistency,
  recoveryLatency,
  stability,
  period,
}) => {
  const meta = HII_META[hiiLevel];
  const periodLabel =
    period === 'week'
      ? 'this week'
      : period === 'month'
      ? 'this month'
      : period === 'quarter'
      ? 'this quarter'
      : 'this year';

  return (
    <Container>
      <Title>Habit Internalization Index</Title>

      <MainStatement>
        <strong>{habitName}</strong> is becoming <strong>{meta.desc.toLowerCase()}</strong>.
      </MainStatement>

      <Stack gap={0}>
        <MetricRow>
          <MetricLabel>
            <Label>Consistency</Label>
            <Tooltip label='Percentage of days you completed this habit' position='top' withArrow>
              <InfoIcon />
            </Tooltip>
            <Value>{Math.round(consistency)}%</Value>
          </MetricLabel>
          <ProgressBar value={consistency} color='#4a7c6f' />
          <Description>
            Active {Math.round(consistency)}% of days {periodLabel}
          </Description>
        </MetricRow>

        <MetricRow>
          <MetricLabel>
            <Label>Recovery speed</Label>
            <Tooltip label='Average days to resume after you miss' position='top' withArrow>
              <InfoIcon />
            </Tooltip>
            <Value>{recoveryLatency.toFixed(1)} days</Value>
          </MetricLabel>
          <ProgressBar value={Math.min(100, (1 - recoveryLatency / 7) * 100)} color='#3d5fa0' />
          <Description>Resume faster = stronger habit</Description>
        </MetricRow>

        <MetricRow>
          <MetricLabel>
            <Label>Stability</Label>
            <Tooltip label='How consistent your weekly activity is' position='top' withArrow>
              <InfoIcon />
            </Tooltip>
            <Value>{Math.round(stability)}%</Value>
          </MetricLabel>
          <ProgressBar value={stability} color='#7a8b99' />
          <Description>Higher = fewer ups and downs</Description>
        </MetricRow>
      </Stack>
    </Container>
  );
};

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

const MainStatement = styled.div`
  font-size: 14px;
  color: #5a5248;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const MetricRow = styled.div`
  margin-bottom: 20px;
`;

const MetricLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
`;

const Label = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #5a5248;
`;

const Value = styled.span`
  font-size: 12px;
  color: #3a3530;
  font-weight: 600;
`;

const InfoIcon = styled(IconInfoCircle)`
  color: #9c9488;
  width: 14px;
  height: 14px;
  cursor: help;
`;

const ProgressBar = styled(Progress)`
  height: 6px;
  border-radius: 3px;
`;

const Description = styled.span`
  font-size: 11px;
  color: #9c9488;
  margin-top: 4px;
  display: block;
`;
