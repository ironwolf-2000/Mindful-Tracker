import React from 'react';
import styled from 'styled-components';
import { IconPlus } from '@tabler/icons-react';
import type { Habit } from '@/types';
import { HII_META } from '@/const';

interface HabitSelectorProps {
  habits: Habit[];
  selectedHabitId: number;
  onSelectHabit: (id: number) => void;
  onAddHabit: () => void;
  isOpen: boolean;
}

// ─── Styled Components ────────────────────────────────────────────────────────

const Sidebar = styled.nav<{ isOpen: boolean }>`
  width: ${(props) => (props.isOpen ? '220px' : '60px')};
  flex-shrink: 0;
  background: #eeeae2;
  border-right: 1px solid #ddd8ce;
  display: flex;
  flex-direction: column;
  padding: 28px 0 20px;
  transition: width 0.2s ease;
  overflow: hidden;
`;

const Header = styled.div`
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
  justify-content: space-between;
`;

const AppName = styled.span<{ isOpen: boolean }>`
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transition: opacity 0.2s ease;
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

const HabitList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HabitButton = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s ease;
  border: none;
  background: ${(props) => (props.isActive ? '#ddd8ce' : 'transparent')};
  text-align: left;
  width: 100%;

  &:hover {
    background: #e4dfd5;
  }
`;

const HabitName = styled.span<{ isOpen: boolean }>`
  font-size: 13px;
  font-weight: 400;
  color: #3a3530;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transition: opacity 0.2s ease;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HabitDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const Footer = styled.div`
  padding: 0 12px;
`;

const AddButton = styled.button`
  margin: 0;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px dashed #c0bab0;
  background: transparent;
  color: #8a8278;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.12s ease, color 0.12s ease;
  width: 100%;

  &:hover {
    border-color: #8a8278;
    color: #3a3530;
  }
`;

const AddButtonLabel = styled.span<{ isOpen: boolean }>`
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transition: opacity 0.2s ease;
  white-space: nowrap;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export const HabitSelector: React.FC<HabitSelectorProps> = ({
  habits,
  selectedHabitId,
  onSelectHabit,
  onAddHabit,
  isOpen,
}) => {
  const appName = 'Forma';

  return (
    <Sidebar isOpen={isOpen}>
      {/* Header with toggle */}
      <Header>
        <AppName isOpen={isOpen}>{appName}</AppName>
        <ToggleButton
          onClick={() => {
            // This should be handled by parent component
            // Just here for reference
          }}
          aria-label='Toggle sidebar'
        >
          {isOpen ? '◀' : '▶'}
        </ToggleButton>
      </Header>

      {/* Habit list */}
      <HabitList>
        {habits.map((habit) => (
          <HabitButton
            key={habit.id}
            isActive={selectedHabitId === habit.id}
            onClick={() => onSelectHabit(habit.id)}
            title={habit.name}
          >
            <HabitName isOpen={isOpen}>{habit.name}</HabitName>
            <HabitDot style={{ background: HII_META[habit.hiiLevel].color }} />
          </HabitButton>
        ))}
      </HabitList>

      {/* Footer with add button */}
      <Footer>
        <AddButton onClick={onAddHabit}>
          <IconPlus size={12} />
          <AddButtonLabel isOpen={isOpen}>Add habit</AddButtonLabel>
        </AddButton>
      </Footer>
    </Sidebar>
  );
};
