"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import { Game, LogItem } from "@/types/game";
import { api } from "@/lib/axios";

const Container = styled.div`
  padding: 0.5rem;
  position: relative;
  min-height: 100vh;
  background-color: var(--background-color);

  @media (min-width: 768px) {
    padding: 1rem;
  }
`;

const BackButton = styled.button`
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  transition: background-color 0.2s;
  z-index: 1000;

  &:hover {
    background-color: #e5e7eb;
  }

  @media (min-width: 768px) {
    top: 1.5rem;
    right: 1.5rem;
  }
`;

const GameInfo = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const GameName = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const TeamsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const TeamSection = styled.div`
  h3 {
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
`;

const PlayerList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
`;

const PlayerButton = styled.button<{ isSelected: boolean }>`
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: ${props => props.isSelected ? 'var(--primary-color)' : '#f3f4f6'};
  color: ${props => props.isSelected ? 'white' : '#374151'};
  height: 3rem;
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};

  &:hover {
    background-color: ${props => props.isSelected ? 'var(--hover-color)' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

const LogSection = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const LogItemsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const LogItemButton = styled.button<{ isSelected: boolean }>`
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
  transition: all 0.2s;
  background-color: ${props => props.isSelected ? 'var(--primary-color)' : '#f3f4f6'};
  color: ${props => props.isSelected ? 'white' : '#374151'};
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};

  &:hover {
    background-color: ${props => props.isSelected ? 'var(--hover-color)' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  h3 {
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0;
    margin-right: 0.5rem;
  }
`;

const CancelButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: #374151;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e5e7eb;
    transform: translateY(-1px);
  }
`;

export default function RecordPage() {
  const router = useRouter();
  const params = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [logItems, setLogItems] = useState<LogItem[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [selectedLogItem, setSelectedLogItem] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);

  // 전역 헤더를 숨기는 useEffect
  useEffect(() => {
    // 헤더 숨기기
    document.body.classList.add('hide-header');
    
    // 컴포넌트 언마운트 시 클래스 제거
    return () => {
      document.body.classList.remove('hide-header');
    };
  }, []);

  // 스타일 요소 추가
  useEffect(() => {
    // 스타일 태그 생성
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      body.hide-header header {
        display: none !important;
      }
      body.hide-header {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      body.hide-header main {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }
    `;
    
    // head에 스타일 태그 추가
    document.head.appendChild(styleTag);
    
    // 컴포넌트 언마운트 시 스타일 태그 제거
    return () => {
      if (styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }
    };
  }, []);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // 먼저 게임 데이터를 가져옵니다
        const gameResponse = await api.get(`/game/${params.id}`);
        setGame(gameResponse.data);
        
        // 게임 데이터를 받은 후 logItems를 가져옵니다
        const logItemsResponse = await api.get(`/logitem?groupId=${gameResponse.data.groupId}`);
        console.log(logItemsResponse.data);
        setLogItems(logItemsResponse.data);
      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchGameData();
    }
  }, [params.id]);

  const handlePlayerSelect = (playerId: number, team: 'home' | 'away') => {
    // 이미 선택된 선수를 다시 클릭하면 선택 해제
    if (selectedPlayer === playerId) {
      setSelectedPlayer(null);
      setSelectedTeam(null);
      setSelectedLogItem(null);
    } else {
      setSelectedPlayer(playerId);
      setSelectedTeam(team);
    }
  };

  const handleLogItemSelect = (logItemId: number) => {
    setSelectedLogItem(selectedLogItem === logItemId ? null : logItemId);
    
    if (selectedLogItem !== logItemId) {
      // 선택한 LogItem이 변경되면 즉시 기록 저장
      handleRecordLog(logItemId);
    }
  };

  const handleRecordLog = async (logItemId: number) => {
    if (!selectedPlayer || !game) return;

    try {
      await api.post("/log", {
        gameId: game.id,
        playerId: selectedPlayer,
        logitemId: logItemId,
        groupId: game.groupId
      });

      // 기록 성공 후 선택 초기화
      setSelectedPlayer(null);
      setSelectedTeam(null);
      setSelectedLogItem(null);

    } catch (error) {
      console.error("기록 저장에 실패했습니다:", error);
      alert("기록 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel = () => {
    setSelectedPlayer(null);
    setSelectedTeam(null);
    setSelectedLogItem(null);
  };

  if (loading) return <div>로딩 중...</div>;
  if (!game) return <div>게임을 찾을 수 없습니다.</div>;

  return (
    <Container>
      <BackButton onClick={() => router.back()}>뒤로 가기</BackButton>
      <GameInfo>
        <GameName>{game.name}</GameName>
        <TeamsContainer>
          {/* 홈팀 영역 */}
          <TeamSection>
            <TeamHeader>
              <h3>홈팀</h3>
              {selectedTeam === 'home' && (
                <CancelButton onClick={handleCancel}>취소</CancelButton>
              )}
            </TeamHeader>
            {selectedTeam !== 'home' ? (
              <PlayerList>
                {game.homePlayers.map((player) => (
                  <PlayerButton
                    key={player.id}
                    isSelected={selectedPlayer === player.id}
                    onClick={() => handlePlayerSelect(player.id, 'home')}
                  >
                    {player.name}
                  </PlayerButton>
                ))}
              </PlayerList>
            ) : (
              <LogItemsContainer>
                {logItems.map((item) => (
                  <LogItemButton
                    key={item.id}
                    isSelected={selectedLogItem === item.id}
                    onClick={() => handleLogItemSelect(item.id)}
                  >
                    {item.name} ({item.value}점)
                  </LogItemButton>
                ))}
              </LogItemsContainer>
            )}
          </TeamSection>

          {/* 어웨이팀 영역 */}
          <TeamSection>
            <TeamHeader>
              <h3>어웨이팀</h3>
              {selectedTeam === 'away' && (
                <CancelButton onClick={handleCancel}>취소</CancelButton>
              )}
            </TeamHeader>
            {selectedTeam !== 'away' ? (
              <PlayerList>
                {game.awayPlayers.map((player) => (
                  <PlayerButton
                    key={player.id}
                    isSelected={selectedPlayer === player.id}
                    onClick={() => handlePlayerSelect(player.id, 'away')}
                  >
                    {player.name}
                  </PlayerButton>
                ))}
              </PlayerList>
            ) : (
              <LogItemsContainer>
                {logItems.map((item) => (
                  <LogItemButton
                    key={item.id}
                    isSelected={selectedLogItem === item.id}
                    onClick={() => handleLogItemSelect(item.id)}
                  >
                    {item.name} ({item.value}점)
                  </LogItemButton>
                ))}
              </LogItemsContainer>
            )}
          </TeamSection>
        </TeamsContainer>
      </GameInfo>
    </Container>
  );
} 