import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Stack } from '@mantine/core';
import type { Habit, DataInsight, Reflection, TimePeriod } from '@/types';
import { HabitDetailHeader } from './HabitDetailHeader';
import { HIIExplainer } from './HIIExplainer';
import { RecurringBarriers } from './RecurringBarriers';
import { DataTriggeredInsight } from '../shared/DataTriggeredInsight';
import { ReflectionModal } from '../reflection/ReflectionModal';
import { EditHabitModal, type EditHabitData } from '../habits/EditHabitModal';
import { HabitDangerZone } from '../habits/HabitDangerZone';
import { HeatmapCalendar } from '../visualization/HeatmapCalendar';
import { RollingTrendChart } from '../visualization/RollingTrendChart';
import { useDisclosure } from '@mantine/hooks';
import { calculateConsistency, calculateRecoveryLatency, calculateStability } from '@/utils/habitMetrics';

interface HabitDetailProps {
  habit: Habit;
  onHabitChange: (id: number, val: boolean | number) => void;
  sessionInsight: DataInsight | null;
  onInsightAcknowledge: () => void;
  onPeriodChange?: (period: TimePeriod) => void;
  onEditHabit: (habitId: number, updates: EditHabitData) => void;
  onDeleteHabit: (habitId: number) => void;
  isPrototypeHabit: boolean;
}

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

function calculateHIIScore(consistency: number, recoveryLatency: number, stability: number): number {
  const consistencyScore = consistency * 0.5;
  const recoveryScore = Math.max(0, (1 - recoveryLatency / 7) * 100) * 0.3;
  const stabilityScore = stability * 0.2;

  return Math.round(consistencyScore + recoveryScore + stabilityScore);
}

export const HabitDetail: React.FC<HabitDetailProps> = ({
  habit,
  onHabitChange,
  sessionInsight,
  onInsightAcknowledge,
  onPeriodChange,
  onEditHabit,
  onDeleteHabit,
  isPrototypeHabit,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [reflectionOpened, { open: openReflection, close: closeReflection }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [reflectionReason, setReflectionReason] = useState<string>('');
  const [reflectionSuggestion, setReflectionSuggestion] = useState<string>('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);

  const consistency = calculateConsistency(habit.dailyLogs, selectedPeriod);
  const recoveryLatency = calculateRecoveryLatency(habit.dailyLogs, selectedPeriod);
  const stability = calculateStability(habit.dailyLogs, selectedPeriod);
  const hiiScore = calculateHIIScore(consistency, recoveryLatency, stability);

  useEffect(() => {
    const loaded = loadReflections(habit.id);
    queueMicrotask(() => setReflections(loaded));
  }, [habit.id]);

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

    saveReflection(habit.id, newReflection);
    setReflections((prev) => [...prev, newReflection]);

    setReflectionSaved(true);
    setTimeout(() => {
      closeReflection();
      setReflectionReason('');
      setReflectionSuggestion('');
      setReflectionSaved(false);
    }, 2500);
  };

  const handleOpenReflection = () => {
    setReflectionReason('');
    setReflectionSuggestion('');
    setReflectionSaved(false);
    openReflection();
  };

  const allReflections = [...habit.reflections, ...reflections];

  return (
    <DetailContainer>
      <HabitDetailHeader
        habit={habit}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        loggingValue={habit.logged}
        onLoggingChange={(val) => onHabitChange(habit.id, val)}
        hiiScore={hiiScore}
        onOpenReflection={handleOpenReflection}
        onOpenEdit={openEditModal}
        isPrototypeHabit={isPrototypeHabit}
      />

      <Stack gap={0}>
        {sessionInsight && (
          <InsightWrapper>
            <DataTriggeredInsight insight={sessionInsight} onAcknowledge={onInsightAcknowledge} />
          </InsightWrapper>
        )}

        <HIIExplainer
          consistency={consistency}
          recoveryLatency={recoveryLatency}
          stability={stability}
          period={selectedPeriod}
        />

        <HeatmapCalendar habit={habit} period={selectedPeriod} />

        <RollingTrendChart habit={habit} period={selectedPeriod} />

        <RecurringBarriers reflections={allReflections} period={selectedPeriod} />

        <HabitDangerZone
          habitName={habit.name}
          onDelete={() => onDeleteHabit(habit.id)}
          isPrototypeHabit={isPrototypeHabit}
        />
      </Stack>

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

      <EditHabitModal opened={editModalOpened} onClose={closeEditModal} habit={habit} onSave={onEditHabit} />
    </DetailContainer>
  );
};

const DetailContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #f5f2ec;
`;

const InsightWrapper = styled.div`
  padding: 20px 32px;
  border-bottom: 1px solid #ddd8ce;
`;
