import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import type { Habit, DataInsight, DailyLog } from '@/types';
import { Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { initialHabits, sessionInsight } from '@/const';
import { HabitDetail } from './components/habitDetail/HabitDetail';
import { AddHabitModal, type NewHabitData } from './components/habits/AddHabitModal';
import { type EditHabitData } from './components/habits/EditHabitModal';
import { getStatusColor, getTodayStatus, calculateMissedStreak } from './utils/habitMetrics';

const STORAGE_KEY = 'user_habits';
const PROTOTYPE_HABIT_IDS = [1, 2, 3];

function loadHabits(): Habit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialHabits;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load habits:', error);
    return initialHabits;
  }
}

function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error('Failed to save habits:', error);
  }
}

function generateDailyLogs(
  habitId: number,
  days: number,
  mode: 'Qualitative' | 'Quantitative',
  goal?: number,
): DailyLog[] {
  const logs: DailyLog[] = [];
  const today = new Date();
  const consistencyTarget = 70;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const adjustedTarget = isWeekend ? consistencyTarget * 0.7 : consistencyTarget;

    const seed = (habitId * 31 + i * 7) % 1000;
    const random = ((seed * 1103515245 + 12345) % 100) / 100;
    const shouldComplete = random < adjustedTarget / 100;

    if (mode === 'Qualitative') {
      logs.push({
        date: dateStr,
        value: shouldComplete,
        logged: true,
      });
    } else {
      if (shouldComplete) {
        const targetValue = goal || 25;
        const value = Math.max(1, Math.floor(targetValue * (0.7 + random * 0.6)));
        logs.push({
          date: dateStr,
          value,
          logged: true,
        });
      } else {
        logs.push({
          date: dateStr,
          value: 0,
          logged: true,
        });
      }
    }
  }

  return logs;
}

export const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [selectedHabitId, setSelectedHabitId] = useState<number>(habits[0]?.id || 1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [insight, setInsight] = useState<DataInsight | null>(sessionInsight);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);

  const selectedHabit = habits.find((h) => h.id === selectedHabitId) ?? habits[0];

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const handleHabitChange = (id: number, val: boolean | number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;

        const today = new Date().toISOString().split('T')[0];

        // Update or create today's log
        const updatedLogs = [...h.dailyLogs];
        const todayLogIndex = updatedLogs.findIndex((log) => log.date === today);

        if (todayLogIndex >= 0) {
          // Update existing log
          updatedLogs[todayLogIndex] = {
            ...updatedLogs[todayLogIndex],
            value: val,
            logged: true,
          };
        } else {
          // Create new log for today
          updatedLogs.push({
            date: today,
            value: val,
            logged: true,
          });
          // Sort by date
          updatedLogs.sort((a, b) => a.date.localeCompare(b.date));
        }

        // Recalculate missed streak
        const newMissedStreak = calculateMissedStreak(updatedLogs, h.type);

        return {
          ...h,
          logged: val,
          dailyLogs: updatedLogs,
          missedStreak: newMissedStreak,
        };
      }),
    );
  };

  const handleAddHabit = (habitData: NewHabitData) => {
    const newId = Math.max(...habits.map((h) => h.id), 0) + 1;

    const dailyLogs: DailyLog[] = habitData.populateWithData
      ? generateDailyLogs(newId, 90, habitData.mode, habitData.goal)
      : [];

    const todayValue = habitData.populateWithData
      ? dailyLogs[dailyLogs.length - 1]?.value || (habitData.mode === 'Qualitative' ? false : 0)
      : habitData.mode === 'Qualitative'
      ? false
      : 0;

    const newHabit: Habit = {
      id: newId,
      name: habitData.name,
      type: habitData.type,
      mode: habitData.mode,
      unit: habitData.unit,
      goal: habitData.goal,
      logged: todayValue,
      hiiLevel: 'Emerging',
      missedStreak: calculateMissedStreak(dailyLogs, habitData.type),
      reflections: [],
      dailyLogs,
    };

    setHabits((prev) => [...prev, newHabit]);
    setSelectedHabitId(newId);
  };

  const handleEditHabit = (habitId: number, updates: EditHabitData) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              name: updates.name,
              unit: updates.unit,
              goal: updates.goal,
            }
          : h,
      ),
    );
  };

  const handleDeleteHabit = (habitId: number) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));

    const remainingHabits = habits.filter((h) => h.id !== habitId);
    if (remainingHabits.length > 0) {
      setSelectedHabitId(remainingHabits[0].id);
    }
  };

  return (
    <Shell>
      <Sidebar $isOpen={sidebarOpen}>
        <SidebarHeader $isOpen={sidebarOpen}>
          {sidebarOpen && (
            <Text fz='lg' fw={600}>
              Mindful Tracker
            </Text>
          )}
          <ToggleButton onClick={() => setSidebarOpen(!sidebarOpen)} aria-label='Toggle sidebar'>
            {sidebarOpen ? <IconChevronLeft size={24} /> : <IconChevronRight size={24} />}
          </ToggleButton>
        </SidebarHeader>
        <SidebarHabits>
          {habits.map((h) => {
            const status = getTodayStatus(h);
            const statusColor = getStatusColor(status);

            return (
              <SidebarItem
                key={h.id}
                $isOpen={sidebarOpen}
                $isActive={selectedHabitId === h.id}
                onClick={() => setSelectedHabitId(h.id)}
                title={`${h.name} - ${status}`}
              >
                {sidebarOpen && <SidebarItemName>{h.name}</SidebarItemName>}
                <SidebarItemDot style={{ background: statusColor }} />
              </SidebarItem>
            );
          })}
        </SidebarHabits>
        <div style={{ padding: '0 12px' }}>
          <SidebarAddButton $isOpen={sidebarOpen} onClick={openAddModal}>
            <IconPlus size={14} />
            {sidebarOpen && <span style={{ textWrap: 'nowrap' }}>Add habit</span>}
          </SidebarAddButton>
        </div>
      </Sidebar>

      <MainContent>
        <HabitDetail
          key={selectedHabit.id}
          habit={selectedHabit}
          onHabitChange={handleHabitChange}
          sessionInsight={insight?.habitId === selectedHabitId ? insight : null}
          onInsightAcknowledge={() => setInsight(null)}
          onEditHabit={handleEditHabit}
          onDeleteHabit={handleDeleteHabit}
          isPrototypeHabit={PROTOTYPE_HABIT_IDS.includes(selectedHabit.id)}
        />
      </MainContent>

      <AddHabitModal opened={addModalOpened} onClose={closeAddModal} onSave={handleAddHabit} />
    </Shell>
  );
};

const Shell = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f5f2ec;
  color: #3a3530;
`;

const Sidebar = styled.nav<{ $isOpen: boolean }>`
  width: ${(props) => (props.$isOpen ? '240px' : '60px')};
  flex-shrink: 0;
  background: #eeeae2;
  border-right: 1px solid #ddd8ce;
  display: flex;
  flex-direction: column;
  padding: 28px 0 20px;
  transition: width 0.2s ease;
  overflow: hidden;
`;

const SidebarHeader = styled.div<{ $isOpen: boolean }>`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: #3a3530;
  padding: 0 20px 24px;
  border-bottom: 1px solid #ddd8ce;
  white-space: nowrap;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isOpen ? 'space-between' : 'center')};
`;

const ToggleButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9c9488;
  transition: color 0.12s ease;
  flex-shrink: 0;

  &:hover {
    color: #3a3530;
  }
`;

const SidebarHabits = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SidebarItem = styled.button<{ $isOpen: boolean; $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isOpen ? 'space-between' : 'center')};
  padding: 0 10px;
  height: 35px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s ease;
  border: none;
  background: ${(props) => (props.$isActive ? '#ddd8ce' : 'transparent')};
  text-align: left;
  width: 100%;

  &:hover {
    background: #e4dfd5;
  }
`;

const SidebarItemName = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: #3a3530;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 8px;
`;

const SidebarItemDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const SidebarAddButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 0 10px;
  height: ${(props) => (props.$isOpen ? '40px' : '35px')};
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d4cfc4;
  background: #f5f2ec;
  color: #6b6459;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.12s ease;
  margin-top: 8px;

  &:hover {
    background: #eeeae2;
    border-color: #c0bab0;
    color: #3a3530;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
