import React, { useState } from 'react';
import { Modal, Stack, Text, Box, Group, Button, Divider, Textarea } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { REFLECTION_REASONS, REFLECTION_SUGGESTIONS } from '@/const';

interface ReflectionModalProps {
  opened: boolean;
  onClose: () => void;
  habitId: number;
  habitName: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  suggestion: string;
  onSuggestionChange: (suggestion: string) => void;
  onSave: () => void;
  isSaved: boolean;
  isDisabled: boolean;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  opened,
  onClose,
  habitName,
  reason,
  onReasonChange,
  suggestion,
  onSuggestionChange,
  onSave,
  isSaved,
  isDisabled,
}) => {
  const [customReason, setCustomReason] = useState('');
  const [customSuggestion, setCustomSuggestion] = useState('');

  const isReasonOther = reason === 'Other';
  const isSuggestionOther = suggestion === 'Other';

  const handleReasonClick = (label: string) => {
    onReasonChange(label);
    if (label !== 'Other') {
      setCustomReason('');
    }
  };

  const handleSuggestionClick = (label: string) => {
    onSuggestionChange(label);
    if (label !== 'Other') {
      setCustomSuggestion('');
    }
  };

  const handleSave = () => {
    // Replace "Other" with custom text if provided
    if (isReasonOther && customReason) {
      onReasonChange(customReason);
    }
    if (isSuggestionOther && customSuggestion) {
      onSuggestionChange(customSuggestion);
    }
    onSave();
  };

  const isDisabledFinal = isDisabled || (isReasonOther && !customReason.trim());

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
      {isSaved ? (
        <Stack align='center' gap={12} py={24}>
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#eef5f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconCheck size={20} color='#4a7c6f' />
          </Box>
          <Text size='sm' c='dimmed' style={{ fontStyle: 'italic' }}>
            Reflection saved. Understanding your barriers helps build lasting habits.
          </Text>
        </Stack>
      ) : (
        <Stack gap={20}>
          {/* Header */}
          <div>
            <Text
              size='xs'
              tt='uppercase'
              style={{
                letterSpacing: '0.08em',
                color: '#9c9488',
                marginBottom: 6,
              }}
            >
              Understanding what got in the way
            </Text>
            <Text
              style={{
                fontFamily: 'Lora, serif',
                fontSize: 18,
                fontWeight: 400,
                color: '#3a3530',
                lineHeight: 1.4,
              }}
            >
              You missed {habitName}. Take a moment to reflect on what happened.
            </Text>
          </div>

          <Divider color='#DDD8CE' />

          {/* Question 1: What made it difficult? */}
          <div>
            <Text size='sm' fw={500} mb={10} style={{ color: '#5a5248' }}>
              What got in the way?
            </Text>
            <Stack gap={6}>
              {REFLECTION_REASONS.map(({ label, icon }) => (
                <Box
                  key={label}
                  onClick={() => handleReasonClick(label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: `1px solid ${reason === label ? '#b5a48a' : '#ddd8ce'}`,
                    background: reason === label ? '#f0ebe0' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    userSelect: 'none',
                  }}
                >
                  <Box style={{ color: '#9c8e78' }}>{icon}</Box>
                  <Text size='xs' style={{ color: '#5a5248' }}>
                    {label}
                  </Text>
                </Box>
              ))}
              {isReasonOther && (
                <Textarea
                  placeholder='Describe what got in the way...'
                  value={customReason}
                  onChange={(e) => setCustomReason(e.currentTarget.value)}
                  minRows={2}
                  autoFocus
                  styles={{
                    input: {
                      background: '#f5f2ec',
                      border: '1px solid #ddd8ce',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#5a5248',
                    },
                  }}
                />
              )}
            </Stack>
          </div>

          {/* Question 2: What would help next time? */}
          <div>
            <Text size='sm' fw={500} mb={10} style={{ color: '#5a5248' }}>
              What might help next time?
            </Text>
            <Stack gap={6}>
              {REFLECTION_SUGGESTIONS.map((s) => (
                <Box
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: `1px solid ${suggestion === s ? '#b5a48a' : '#ddd8ce'}`,
                    background: suggestion === s ? '#f0ebe0' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    userSelect: 'none',
                  }}
                >
                  <Text size='xs' style={{ color: '#5a5248' }}>
                    {s}
                  </Text>
                </Box>
              ))}
              {isSuggestionOther && (
                <Textarea
                  placeholder='What could help you succeed next time?'
                  value={customSuggestion}
                  onChange={(e) => setCustomSuggestion(e.currentTarget.value)}
                  minRows={2}
                  styles={{
                    input: {
                      background: '#f5f2ec',
                      border: '1px solid #ddd8ce',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#5a5248',
                    },
                  }}
                />
              )}
            </Stack>
          </div>

          {/* Actions */}
          <Group justify='flex-end' gap={8} mt={4}>
            <Button
              variant='subtle'
              size='sm'
              onClick={onClose}
              style={{
                color: '#9c9488',
                fontSize: 12,
                border: 'none',
                background: 'transparent',
              }}
            >
              Skip
            </Button>
            <Button
              size='sm'
              disabled={isDisabledFinal}
              onClick={handleSave}
              style={{
                background: isDisabledFinal ? '#c8c0b4' : '#7a6e60',
                color: '#f5f2ec',
                fontSize: 12,
                border: 'none',
                borderRadius: 4,
                cursor: isDisabledFinal ? 'not-allowed' : 'pointer',
                transition: 'background 0.12s ease',
              }}
            >
              Save reflection
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};
