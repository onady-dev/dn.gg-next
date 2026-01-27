"use client";

import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Player } from '@/types/player';

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
}

const PlayerCard = ({ player, isSelected, onClick, onLongPress }: PlayerCardProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const handleMouseDown = useCallback(() => {
    isLongPressRef.current = false;
    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress?.();
    }, 500); // 500ms 길게 누르기
  }, [onLongPress]);

  const handleMouseUp = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // 길게 누르기가 아니었다면 일반 클릭 이벤트 실행
    if (!isLongPressRef.current) {
      onClick?.();
    }
  }, [onClick]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseDown();
  }, [handleMouseDown]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

  return (
    <Container 
      isSelected={isSelected}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Number>{player.backnumber}</Number>
      <Name>{player.name}</Name>
    </Container>
  );
};

const Container = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: ${props => props.isSelected ? 'var(--primary-color)' : 'white'};
  color: ${props => props.isSelected ? 'white' : 'var(--text-color)'};
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.isSelected ? 'var(--primary-color)' : 'var(--border-color)'};
  font-size: 0.875rem;

  &:hover {
    border-color: var(--primary-color);
  }
`;

const Number = styled.span`
  font-weight: 600;
  min-width: 1.5rem;
`;

const Name = styled.span`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default PlayerCard; 