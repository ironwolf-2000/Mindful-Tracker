import React, { useState } from 'react';
import styled from 'styled-components';
import { IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import type { Habit, DataInsight } from '@/types';
import { Text } from '@mantine/core';
import { initialHabits, sessionInsight, HII_META } from '@/const';
import { HabitDetail } from './components/habitDetail/HabitDetail';

export const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [selectedHabitId, setSelectedHabitId] = useState<number>(initialHabits[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [insight, setInsight] = useState<DataInsight | null>(sessionInsight);

  const selectedHabit = habits.find((h) => h.id === selectedHabitId) ?? habits[0];

  const handleHabitChange = (id: number, val: boolean | number) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, logged: val } : h)));
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
          {habits.map((h) => (
            <SidebarItem
              key={h.id}
              $isOpen={sidebarOpen}
              $isActive={selectedHabitId === h.id}
              onClick={() => setSelectedHabitId(h.id)}
              title={h.name}
            >
              {sidebarOpen && <SidebarItemName>{h.name}</SidebarItemName>}
              <SidebarItemDot style={{ background: HII_META[h.hiiLevel].color }} />
            </SidebarItem>
          ))}
        </SidebarHabits>
        <div style={{ padding: '0 12px' }}>
          <SidebarAddButton $isOpen={sidebarOpen}>
            <IconPlus size={14} />
            {sidebarOpen && <span style={{ textWrap: 'nowrap' }}>Add habit</span>}
          </SidebarAddButton>
        </div>
      </Sidebar>

      <MainContent>
        <HabitDetail
          habit={selectedHabit}
          onHabitChange={handleHabitChange}
          sessionInsight={insight?.habitId === selectedHabitId ? insight : null}
          onInsightAcknowledge={() => setInsight(null)}
        />
      </MainContent>
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
