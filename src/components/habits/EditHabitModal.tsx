/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal, TextInput, NumberInput } from '@mantine/core';
import type { Habit } from '@/types';

interface EditHabitModalProps {
  opened: boolean;
  onClose: () => void;
  habit: Habit;
  onSave: (habitId: number, updates: EditHabitData) => void;
}

export interface EditHabitData {
  name: string;
  unit?: string;
  goal?: number;
}

export const EditHabitModal: React.FC<EditHabitModalProps> = ({ opened, onClose, habit, onSave }) => {
  const [name, setName] = useState(habit.name);
  const [unit, setUnit] = useState(habit.unit || '');
  const [goal, setGoal] = useState<number | undefined>(habit.goal);

  // Update form when habit changes
  useEffect(() => {
    setName(habit.name);
    setUnit(habit.unit || '');
    setGoal(habit.goal);
  }, [habit]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave(habit.id, {
      name: name.trim(),
      unit: habit.mode === 'Quantitative' ? unit || undefined : undefined,
      goal: habit.mode === 'Quantitative' ? goal : undefined,
    });

    onClose();
  };

  const isDisabled = !name.trim();
  const isQuantitative = habit.mode === 'Quantitative';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      centered
      size='sm'
      styles={{
        content: {
          background: '#f5f2ec',
          border: '1px solid #ddd8ce',
          borderRadius: 12,
        },
        body: { padding: '28px 32px 32px' },
        header: { display: 'none' },
      }}
    >
      <ModalContent>
        <ModalTitle>Edit habit</ModalTitle>
        <ModalSubtitle>Update habit details</ModalSubtitle>

        {/* Habit Name */}
        <TextInput
          label='Habit name'
          placeholder='e.g., Morning run, Read before bed'
          value={name}
          maxLength={32}
          onChange={(e) => setName(e.currentTarget.value)}
          styles={{
            label: {
              fontSize: 12,
              fontWeight: 500,
              color: '#5a5248',
              marginBottom: 8,
            },
            input: {
              background: '#ffffff',
              border: '1px solid #ddd8ce',
              borderRadius: 6,
              fontSize: 14,
              color: '#3a3530',
            },
          }}
        />

        {/* Quantitative Options */}
        {isQuantitative && (
          <QuantitativeSection>
            <TextInput
              label='Unit (optional)'
              placeholder='e.g., km, pages, min'
              value={unit}
              onChange={(e) => setUnit(e.currentTarget.value)}
              styles={{
                label: {
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#5a5248',
                  marginBottom: 8,
                },
                input: {
                  background: '#ffffff',
                  border: '1px solid #ddd8ce',
                  borderRadius: 6,
                  fontSize: 14,
                  color: '#3a3530',
                },
              }}
            />
            <NumberInput
              label='Daily goal (optional)'
              placeholder='e.g., 5, 25'
              value={goal}
              onChange={(val) => setGoal(typeof val === 'number' ? val : undefined)}
              min={0}
              step={1}
              hideControls
              styles={{
                label: {
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#5a5248',
                  marginBottom: 8,
                },
                input: {
                  background: '#ffffff',
                  border: '1px solid #ddd8ce',
                  borderRadius: 6,
                  fontSize: 14,
                  color: '#3a3530',
                },
              }}
            />
          </QuantitativeSection>
        )}

        {/* Actions */}
        <ActionButtons>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SaveButton onClick={handleSave} disabled={isDisabled}>
            Save changes
          </SaveButton>
        </ActionButtons>
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: #3a3530;
  margin: 0;
`;

const ModalSubtitle = styled.p`
  font-size: 13px;
  color: #9c9488;
  margin: -12px 0 0 0;
`;

const QuantitativeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #9c9488;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.12s ease;

  &:hover {
    color: #3a3530;
  }
`;

const SaveButton = styled.button<{ disabled: boolean }>`
  padding: 10px 20px;
  border: none;
  background: ${(props) => (props.disabled ? '#c8c0b4' : '#7a6e60')};
  color: #f5f2ec;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.12s ease;

  &:hover {
    background: ${(props) => (props.disabled ? '#c8c0b4' : '#6b5e4a')};
  }
`;
