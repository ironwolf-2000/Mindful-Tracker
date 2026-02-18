import React, { useState } from 'react';
import styled from 'styled-components';
import { Modal, TextInput, NumberInput, Switch, Tooltip } from '@mantine/core';
import { IconCheck, IconTrendingUp, IconInfoCircle } from '@tabler/icons-react';
import type { HabitType, TrackingMode } from '@/types';

interface AddHabitModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (habitData: NewHabitData) => void;
}

export interface NewHabitData {
  name: string;
  type: HabitType;
  mode: TrackingMode;
  unit?: string;
  goal?: number;
  populateWithData: boolean;
}

const HABIT_TYPES = [
  {
    type: 'Start' as HabitType,
    mode: 'Qualitative' as TrackingMode,
    icon: <IconCheck size={20} />,
    label: 'Build',
    sublabel: 'Check-in',
    description:
      'Build a new habit by checking off completion each day. Example: Meditate daily, Exercise 3x per week.',
  },
  {
    type: 'Stop' as HabitType,
    mode: 'Qualitative' as TrackingMode,
    icon: <IconCheck size={20} />,
    label: 'Reduce',
    sublabel: 'Check-in',
    description:
      'Limit unwanted behaviors by tracking when you do them. Example: No social media after 9pm, Skip dessert on weekdays.',
  },
  {
    type: 'Start' as HabitType,
    mode: 'Quantitative' as TrackingMode,
    icon: <IconTrendingUp size={20} />,
    label: 'Build',
    sublabel: 'Measure',
    description: 'Build a habit by tracking specific amounts. Example: Run 5km daily, Read 25 pages per day.',
  },
  {
    type: 'Stop' as HabitType,
    mode: 'Quantitative' as TrackingMode,
    icon: <IconTrendingUp size={20} />,
    label: 'Reduce',
    sublabel: 'Measure',
    description:
      'Reduce unwanted behaviors by tracking amounts. Example: Limit screen time to 2hrs/day, Max 3 coffees per day.',
  },
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ opened, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<HabitType>('Start');
  const [selectedMode, setSelectedMode] = useState<TrackingMode>('Qualitative');
  const [unit, setUnit] = useState('');
  const [goal, setGoal] = useState<number | undefined>(undefined);
  const [populateWithData, setPopulateWithData] = useState(false);

  const isQuantitative = selectedMode === 'Quantitative';

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      type: selectedType,
      mode: selectedMode,
      unit: isQuantitative ? unit || undefined : undefined,
      goal: isQuantitative ? goal : undefined,
      populateWithData,
    });

    // Reset form
    setName('');
    setSelectedType('Start');
    setSelectedMode('Qualitative');
    setUnit('');
    setGoal(undefined);
    setPopulateWithData(false);
    onClose();
  };

  const handleTypeSelect = (type: HabitType, mode: TrackingMode) => {
    setSelectedType(type);
    setSelectedMode(mode);
  };

  const isDisabled = !name.trim();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      centered
      size='md'
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
        <ModalTitle>Create new habit</ModalTitle>
        <ModalSubtitle>Choose how you want to track this habit</ModalSubtitle>

        {/* 2x2 Grid Selection */}
        <TypeGrid>
          {HABIT_TYPES.map((habitType) => {
            const isSelected = habitType.type === selectedType && habitType.mode === selectedMode;

            return (
              <Tooltip
                key={`${habitType.type}-${habitType.mode}`}
                label={habitType.description}
                position='top'
                multiline
                maw={280}
                withArrow
              >
                <TypeCard $isSelected={isSelected} onClick={() => handleTypeSelect(habitType.type, habitType.mode)}>
                  <TypeIcon $isSelected={isSelected}>{habitType.icon}</TypeIcon>
                  <TypeLabel>{habitType.label}</TypeLabel>
                  <TypeSublabel>{habitType.sublabel}</TypeSublabel>
                </TypeCard>
              </Tooltip>
            );
          })}
        </TypeGrid>

        {/* Habit Name */}
        <TextInput
          label='Habit name'
          placeholder='e.g., Morning run, Read before bed'
          value={name}
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
            <InputRow>
              <TextInput
                label='Unit (optional)'
                placeholder='e.g., km, pages, min'
                value={unit}
                onChange={(e) => setUnit(e.currentTarget.value)}
                style={{ flex: 1 }}
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
                style={{ flex: 1 }}
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
            </InputRow>
          </QuantitativeSection>
        )}

        {/* Populate with data toggle */}
        <PopulateSection>
          <Switch
            checked={populateWithData}
            onChange={(e) => setPopulateWithData(e.currentTarget.checked)}
            label={
              <SwitchLabel>
                <span>Populate with sample data</span>
                <Tooltip
                  label='Generates 90 days of realistic activity data for testing. Only available in prototype.'
                  position='top'
                  multiline
                  maw={240}
                  withArrow
                >
                  <InfoIconWrapper>
                    <IconInfoCircle size={14} />
                  </InfoIconWrapper>
                </Tooltip>
              </SwitchLabel>
            }
            color='gray'
            styles={{
              track: {
                cursor: 'pointer',
              },
            }}
          />
        </PopulateSection>

        {/* Actions */}
        <ActionButtons>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SaveButton onClick={handleSave} disabled={isDisabled}>
            Create habit
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

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const TypeCard = styled.button<{ $isSelected: boolean }>`
  padding: 16px;
  border-radius: 8px;
  border: 2px solid ${(props) => (props.$isSelected ? '#b5a48a' : '#ddd8ce')};
  background: ${(props) => (props.$isSelected ? '#f0ebe0' : '#ffffff')};
  cursor: pointer;
  transition: all 0.12s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;

  &:hover {
    border-color: #b5a48a;
    background: ${(props) => (props.$isSelected ? '#f0ebe0' : '#faf8f4')};
  }
`;

const TypeIcon = styled.div<{ $isSelected: boolean }>`
  color: ${(props) => (props.$isSelected ? '#5a5248' : '#9c9488')};
  transition: color 0.12s ease;
`;

const TypeLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #3a3530;
  margin-top: 4px;
`;

const TypeSublabel = styled.div`
  font-size: 11px;
  color: #9c9488;
`;

const QuantitativeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 12px;
`;

const PopulateSection = styled.div`
  padding: 12px;
  background: #faf8f4;
  border-radius: 6px;
  border: 1px solid #eae6de;
`;

const SwitchLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #5a5248;
`;

const InfoIconWrapper = styled.span`
  display: inline-flex;
  color: #9c9488;
  cursor: help;
  align-items: center;

  &:hover {
    color: #5a5248;
  }
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
