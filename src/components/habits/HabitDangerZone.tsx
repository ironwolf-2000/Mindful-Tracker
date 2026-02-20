import React, { useState } from 'react';
import styled from 'styled-components';
import { Modal, Tooltip } from '@mantine/core';
import { IconTrash, IconAlertTriangle } from '@tabler/icons-react';

interface HabitDangerZoneProps {
  habitName: string;
  onDelete: () => void;
  isPrototypeHabit?: boolean;
}

export const HabitDangerZone: React.FC<HabitDangerZoneProps> = ({ habitName, onDelete, isPrototypeHabit = false }) => {
  const [confirmOpened, setConfirmOpened] = useState(false);

  return (
    <>
      <Container>
        <Title>Danger zone</Title>
        <Content>
          <Description>
            Once you delete a habit, there is no going back. All tracking data and reflections will be permanently
            removed.
          </Description>
          <Tooltip
            label={isPrototypeHabit ? 'Prototype habits cannot be deleted' : undefined}
            position='top'
            withArrow
            disabled={!isPrototypeHabit}
          >
            <DeleteButton onClick={() => !isPrototypeHabit && setConfirmOpened(true)} disabled={isPrototypeHabit}>
              <IconTrash size={14} />
              Delete this habit
            </DeleteButton>
          </Tooltip>
        </Content>
      </Container>

      {/* Confirmation Modal */}
      <Modal
        opened={confirmOpened}
        onClose={() => setConfirmOpened(false)}
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
          <WarningIcon>
            <IconAlertTriangle size={32} color='#b87d5c' />
          </WarningIcon>
          <ModalTitle>Delete "{habitName}"?</ModalTitle>
          <ModalText>
            This action cannot be undone. All your tracking data, reflections, and progress for this habit will be
            permanently deleted.
          </ModalText>
          <ModalActions>
            <CancelButton onClick={() => setConfirmOpened(false)}>Cancel</CancelButton>
            <ConfirmDeleteButton
              onClick={() => {
                onDelete();
                setConfirmOpened(false);
              }}
            >
              <IconTrash size={14} />
              Delete permanently
            </ConfirmDeleteButton>
          </ModalActions>
        </ModalContent>
      </Modal>
    </>
  );
};

const Container = styled.div`
  padding: 24px 32px;
  border-top: 2px solid #e8d5d0;
  background: #faf8f4;
`;

const Title = styled.div`
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #b87d5c;
  margin-bottom: 12px;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Description = styled.div`
  font-size: 12px;
  color: #7a6e60;
  line-height: 1.5;
  flex: 1;
`;

const DeleteButton = styled.button<{ disabled?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${(props) => (props.disabled ? '#e8dcd8' : '#d8c0b8')};
  background: transparent;
  color: ${(props) => (props.disabled ? '#c8c0b4' : '#b87d5c')};
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.12s ease;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.disabled ? 'transparent' : '#f0e5e0')};
    border-color: ${(props) => (props.disabled ? '#e8dcd8' : '#b87d5c')};
    color: ${(props) => (props.disabled ? '#c8c0b4' : '#a5685c')};
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
`;

const WarningIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #3a3530;
  margin: 0;
`;

const ModalText = styled.p`
  font-size: 13px;
  color: #7a6e60;
  line-height: 1.6;
  margin: 0;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #ddd8ce;
  background: transparent;
  color: #5a5248;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    background: #faf8f4;
  }
`;

const ConfirmDeleteButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: #b87d5c;
  color: #f5f2ec;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.12s ease;

  &:hover {
    background: #a5685c;
  }
`;
