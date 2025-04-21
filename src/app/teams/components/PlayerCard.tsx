"use client";

import React from 'react';
import styled from 'styled-components';
import { Player } from '@/types/player';

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  onClick?: () => void;
}

const PlayerCard = ({ player, isSelected, onClick }: PlayerCardProps) => {
  return (
    <Container onClick={onClick} isSelected={isSelected}>
      <Number>{player.number}</Number>
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