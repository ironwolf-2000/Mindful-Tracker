import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Group, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import type { DataInsight } from '@/types';

interface DataTriggeredInsightProps {
  insight: DataInsight | null;
  onAcknowledge: () => void;
}

export const DataTriggeredInsight: React.FC<DataTriggeredInsightProps> = ({ insight, onAcknowledge }) => {
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (insight) {
      queueMicrotask(() => setVisible(true));
      queueMicrotask(() => setFading(false));
      timerRef.current = setTimeout(() => {
        setFading(true);
        setTimeout(onAcknowledge, 700);
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [insight, onAcknowledge]);

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFading(true);
    setTimeout(onAcknowledge, 700);
  };

  if (!visible || !insight) return null;

  return (
    <InsightContainer isFading={fading} onClick={handleClick}>
      <Group gap={8} wrap='nowrap'>
        <IconSparkles size={14} color='#9c8e78' style={{ flexShrink: 0 }} />
        <Text
          size='sm'
          style={{
            color: '#6b5e4a',
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}
        >
          {insight.message}
        </Text>
      </Group>
      <DismissHint>Tap to dismiss</DismissHint>
    </InsightContainer>
  );
};

const InsightContainer = styled.div<{ isFading: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  background: #f7f5f0;
  border: 1px solid #e8e3d8;
  cursor: pointer;
  opacity: ${(props) => (props.isFading ? 0 : 1)};
  transition: opacity 0.7s ease;
  user-select: none;
`;

const DismissHint = styled(Text)`
  font-size: 10px;
  color: #9c9488;
  margin-top: 4px;
`;
