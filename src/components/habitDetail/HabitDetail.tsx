import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Stack } from '@mantine/core';
import type { Habit, DataInsight, Reflection, TimePeriod } from '@/types';
import { HabitDetailHeader } from './HabitDetailHeader';
import { HIIExplainer } from './HIIExplainer';
import { RecurringBarriers } from './RecurringBarriers';
import { ReflectionHistory } from './ReflectionHistory';
import { DataTriggeredInsight } from '../shared/DataTriggeredInsight';
import { ReflectionModal } from '../reflection/ReflectionModal';
import { HeatmapCalendar } from '../visualization/HeatmapCalendar';
import { RollingTrendChart } from '../visualization/RollingTrendChart';
import { useDisclosure } from '@mantine/hooks';

interface HabitDetailProps {
  habit: Habit;
  onHabitChange: (id: number, val: boolean | number) => void;
  sessionInsight: DataInsight | null;
  onInsightAcknowledge: () => void;
  onPeriodChange?: (period: TimePeriod) => void;
}

const DetailContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #f5f2ec;
`;

const ScrollContent = styled(Stack)`
  padding-bottom: 40px;
`;

const InsightWrapper = styled.div`
  padding: 20px 32px;
  border-bottom: 1px solid #ddd8ce;
`;

const STORAGE_KEY = 'habit_reflections';

function loadReflections(habitId: number): Reflection[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const allReflections = JSON.parse(stored);
    return allReflections[habitId] || [];
  } catch (error) {
    console.error('Failed to load reflections:', error);
    return [];
  }
}

function saveReflection(habitId: number, reflection: Reflection): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allReflections = stored ? JSON.parse(stored) : {};

    if (!allReflections[habitId]) {
      allReflections[habitId] = [];
    }

    allReflections[habitId].push(reflection);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allReflections));
  } catch (error) {
    console.error('Failed to save reflection:', error);
  }
}

function getMockHIIData(period: TimePeriod) {
  const baseData = {
    recoveryLatency: 2.3,
  };

  if (period === 'week') {
    return { ...baseData, consistency: 71, stability: 82 };
  }

  if (period === 'month') {
    return { ...baseData, consistency: 68, stability: 75 };
  }

  if (period === 'quarter') {
    return { ...baseData, consistency: 65, stability: 68 };
  }

  return { ...baseData, consistency: 64, stability: 65 };
}

export const HabitDetail: React.FC<HabitDetailProps> = ({
  habit,
  onHabitChange,
  sessionInsight,
  onInsightAcknowledge,
  onPeriodChange,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [reflectionOpened, { open: openReflection, close: closeReflection }] = useDisclosure(false);
  const [reflectionReason, setReflectionReason] = useState<string>('');
  const [reflectionSuggestion, setReflectionSuggestion] = useState<string>('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);

  const hiiData = getMockHIIData(selectedPeriod);

  // Load reflections from localStorage
  useEffect(() => {
    const loaded = loadReflections(habit.id);
    queueMicrotask(() => setReflections(loaded));
  }, [habit.id]);

  // Notify parent when period changes
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const handleSaveReflection = () => {
    if (!reflectionReason) return;

    const newReflection: Reflection = {
      date: new Date().toISOString().split('T')[0],
      reason: reflectionReason,
      suggestion: reflectionSuggestion,
    };

    // Save to localStorage
    saveReflection(habit.id, newReflection);

    // Update local state
    setReflections((prev) => [...prev, newReflection]);

    setReflectionSaved(true);
    setTimeout(() => {
      closeReflection();
      setReflectionReason('');
      setReflectionSuggestion('');
      setReflectionSaved(false);
    }, 2500); // Increased from 1200ms to 2500ms
  };

  const handleOpenReflection = () => {
    setReflectionReason('');
    setReflectionSuggestion('');
    setReflectionSaved(false);
    openReflection();
  };

  // Merge stored reflections with habit reflections
  const allReflections = [...habit.reflections, ...reflections];

  return (
    <DetailContainer>
      <HabitDetailHeader
        habit={habit}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        loggingValue={habit.logged}
        onLoggingChange={(val) => onHabitChange(habit.id, val)}
      />

      <ScrollContent gap={0}>
        {sessionInsight && (
          <InsightWrapper>
            <DataTriggeredInsight insight={sessionInsight} onAcknowledge={onInsightAcknowledge} />
          </InsightWrapper>
        )}

        <HIIExplainer
          habitName={habit.name}
          hiiLevel={habit.hiiLevel}
          consistency={hiiData.consistency}
          recoveryLatency={hiiData.recoveryLatency}
          stability={hiiData.stability}
          period={selectedPeriod}
        />

        <HeatmapCalendar habit={habit} period={selectedPeriod} />

        <RollingTrendChart habit={habit} period={selectedPeriod} />

        <RecurringBarriers reflections={allReflections} />

        <ReflectionHistory
          habit={{ ...habit, reflections: allReflections }}
          onOpenReflectionModal={handleOpenReflection}
        />
      </ScrollContent>

      <ReflectionModal
        opened={reflectionOpened}
        onClose={closeReflection}
        habitId={habit.id}
        habitName={habit.name}
        reason={reflectionReason}
        onReasonChange={setReflectionReason}
        suggestion={reflectionSuggestion}
        onSuggestionChange={setReflectionSuggestion}
        onSave={handleSaveReflection}
        isSaved={reflectionSaved}
        isDisabled={!reflectionReason}
      />
    </DetailContainer>
  );
};
