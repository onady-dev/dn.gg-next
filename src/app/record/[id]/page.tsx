"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import { Game, LogItem } from "@/types/game";
import { api } from "@/lib/axios";

const Container = styled.div`
  padding: 0.5rem;
  position: relative;
  height: 100vh; /* 전체 높이 고정 */
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 스크롤 방지 */

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
  margin-bottom: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 스크롤 방지 */
`;

const GameInfoHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const GameName = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  
  span.score {
    min-width: 1.5rem;
    text-align: center;
  }
  
  span.vs {
    margin: 0 0.75rem;
    font-size: 1rem;
    color: #6b7280;
    font-weight: 500;
  }
`;

const TeamsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.75fr 1fr; /* 3열 그리드로 변경 */
  gap: 0.5rem;
  flex: 1;
  height: calc(100% - 140px); /* 헤더(80px) + 되돌리기 버튼 컨테이너(60px) 높이를 제외 */
  overflow: hidden; /* 스크롤 방지 */
`;

const TeamSection = styled.div`
  margin-top: 0.5rem;
  &:nth-child(1) {
    /* 홈팀 섹션 스타일 */
    .team-header {
      justify-content: flex-start;
      
      h3 {
        order: 1;
        margin-right: 0.5rem;
        margin-left: 0;
      }
    }
    
    /* 홈팀 버튼 스타일 */
    .player-list, .log-items {
      justify-items: start;
    }
  }
  
  &:nth-child(3) {
    /* 어웨이팀 섹션 스타일 */
    .team-header {
      justify-content: flex-end;
      text-align: right;
      
      h3 {
        order: 2;
        margin-right: 0;
        margin-left: 0.5rem;
      }
    }
    
    /* 어웨이팀 버튼 스타일 */
    .player-list, .log-items {
      justify-items: end;
    }
    
    /* 어웨이팀 버튼 내부 텍스트 정렬 */
    button {
      text-align: center;
    }
  }
`;

const PlayerList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 한 줄에 3개씩 */
  gap: 0.5rem;
  overflow-y: auto; /* 필요한 경우 선수 목록만 스크롤 허용 */
  max-height: 100%;
  padding: 0.25rem;
`;

const PlayerButton = styled.button<{ isSelected: boolean }>`
  padding: 0.75rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s;
  background-color: ${props => props.isSelected ? 'var(--primary-color)' : '#f3f4f6'};
  color: ${props => props.isSelected ? 'white' : '#374151'};
  height: 3rem;
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
  width: 100%;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'var(--hover-color)' : '#e5e7eb'};
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.75rem 0.5rem;
  }
`;

const LogItemsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 한 줄에 3개씩 */
  gap: 0.5rem;
  overflow-y: auto;
  max-height: 100%;
  padding: 0.25rem;
`;

const LogItemButton = styled.button<{ isSelected: boolean }>`
  padding: 0.75rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  text-align: center;
  transition: all 0.2s;
  background-color: ${props => props.isSelected ? 'var(--primary-color)' : '#f3f4f6'};
  color: ${props => props.isSelected ? 'white' : '#374151'};
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
  word-break: break-word;
  width: 100%;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'var(--hover-color)' : '#e5e7eb'};
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.75rem 0.5rem;
  }
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  height: 2rem;
  
  h3 {
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0;
    margin-right: 0.5rem;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  color: #374151;
  transition: all 0.2s;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  
  &:hover {
    background-color: #e5e7eb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
  }
`;

const LogHistoryContainer = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 0.75rem;
  height: 100%;
  overflow-y: auto; /* 로그 영역만 스크롤 허용 */
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LogHistoryItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  font-size: 0.75rem;
  
  &:nth-child(odd) {
    background-color: #f3f4f6;
  }
`;

const LogHistoryPlayerName = styled.span`
  font-weight: 500;
  margin-right: 0.5rem;
`;

const LogHistoryActionName = styled.span`
  color: #4b5563;
`;

const LogHistoryTime = styled.span`
  color: #9ca3af;
  font-size: 0.75rem;
  margin-left: auto;
`;

const HistoryButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 0.25rem 0;
  height: 20px;
  align-items: center;
`;

const HistoryButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
  color: #374151;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  
  &:hover {
    background-color: #e5e7eb;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
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
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [undoStack, setUndoStack] = useState<Game[]>([]);
  const [redoStack, setRedoStack] = useState<Game[]>([]);

  const fetchGameData = async () => {
    try {
      // 먼저 게임 데이터를 가져옵니다
      const gameResponse = await api.get(`/game/${params.id}`);
      console.log(gameResponse.data);
      setGame(gameResponse.data);
      
      // 게임 데이터를 받은 후 logItems를 가져옵니다
      const logItemsResponse = await api.get(`/logitem?groupId=${gameResponse.data.groupId}`);
      setLogItems(logItemsResponse.data);
    } catch (error) {
      console.error("데이터를 불러오는데 실패했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

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
        height: 100vh !important;
      }
      .full-height {
        height: calc(100vh - 2rem) !important;
        display: flex;
        flex-direction: column;
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
    if (params.id) {
      fetchGameData();
    }
  }, [params.id]);

  // 로그에서 스코어 계산
  useEffect(() => {
    if (!game) return;
    
    let home = 0;
    let away = 0;
    
    // 게임 로그에서 스코어 계산
    game.logs?.forEach(log => {
      // 플레이어가 어느 팀인지 확인
      const isHomePlayer = game.homePlayers.some(p => p.id === log.playerId);
      const logItem = logItems.find(item => item.id === log.logitemId);
      
      if (logItem) {
        if (isHomePlayer) {
          home += logItem.value;
        } else {
          away += logItem.value;
        }
      }
    });
    
    setHomeScore(home);
    setAwayScore(away);
  }, [game, logItems]);

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
    
    const logItem = logItems.find(item => item.id === logItemId);
    if (!logItem) return;
    
    const isHomeTeam = selectedTeam === 'home';
    
    try {
      // 로그 저장
      const response = await api.post("/log", {
        gameId: game.id,
        playerId: selectedPlayer,
        logitemId: logItemId,
        groupId: game.groupId
      });
      
      // 스코어 업데이트
      if (isHomeTeam) {
        setHomeScore(prev => prev + logItem.value);
      } else {
        setAwayScore(prev => prev + logItem.value);
      }

      // 게임 로그 업데이트
      if (game.logs) {
        setGame(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            logs: [...prev.logs, {
              ...response.data,
              game: prev,
              logitem: logItem
            }]
          };
        });
      }

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

  // 로그 데이터를 처리하는 함수
  const getProcessedLogs = () => {
    if (!game || !game.logs) return [];
    
    return [...game.logs]
      .map(log => {
        const player = [...game.homePlayers, ...game.awayPlayers].find(p => p.id === log.playerId);
        const logItem = logItems.find(item => item.id === log.logitemId);
        return {
          ...log,
          playerName: player?.name || '알 수 없음',
          actionName: logItem?.name || '알 수 없음',
          team: game.homePlayers.some(p => p.id === log.playerId) ? 'home' : 'away'
        };
      })
      .reverse(); // 최근 기록이 위에 오도록 역순 정렬
  };

  // 실행 취소
  const handleUndo = async () => {
    if (!game || !game.logs || game.logs.length === 0) return;
    
    try {
      // 백엔드 API 호출하여 마지막 로그 삭제
      await api.delete(`/log/game/${game.id}/undo`);
      
      // 현재 게임 상태를 redo 스택에 저장
      setRedoStack(prev => [...prev, game]);
      
      // 게임 데이터 새로고침
      await fetchGameData();
    } catch (error) {
      console.error("로그 삭제에 실패했습니다:", error);
      alert("로그 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 다시 실행
  const handleRedo = async () => {
    if (redoStack.length === 0 || !params.id) return;
    
    try {
      // redo 스택에서 마지막 상태 가져오기
      const nextState = redoStack[redoStack.length - 1];
      // 백엔드 API 호출하여 로그 다시 생성
      await api.post(`/log/game/${params.id}/redo`);
      
      // redo 스택에서 사용한 상태 제거
      setRedoStack(prev => prev.slice(0, -1));
      
      // 게임 데이터 새로고침
      await fetchGameData();
    } catch (error) {
      console.error("로그 다시 생성에 실패했습니다:", error);
      alert("로그 다시 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (!game) return <div>게임을 찾을 수 없습니다.</div>;

  return (
    <Container className="full-height">
      <BackButton onClick={() => router.back()}>뒤로 가기</BackButton>
      <GameInfoHeader>
        <GameName>{game.name}</GameName>
        <ScoreDisplay>
          <span className="score">{homeScore}</span>
          <span className="vs">vs</span>
          <span className="score">{awayScore}</span>
        </ScoreDisplay>
      </GameInfoHeader>
      
      
      
      <TeamsContainer>
        {/* 홈팀 영역 */}
        <TeamSection>
          <TeamHeader className="team-header">
            {selectedTeam !== 'home' ? (
              <h3>홈팀</h3>
            ) : (
              <CancelButton onClick={handleCancel}>취소</CancelButton>
            )}
          </TeamHeader>
          {selectedTeam !== 'home' ? (
            <PlayerList className="player-list">
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
            <LogItemsContainer className="log-items">
              {logItems.map((item) => (
                <LogItemButton
                  key={item.id}
                  isSelected={selectedLogItem === item.id}
                  onClick={() => handleLogItemSelect(item.id)}
                >
                  {item.name}
                </LogItemButton>
              ))}
            </LogItemsContainer>
          )}
        </TeamSection>
        
        {/* 로그 히스토리 컴포넌트 - 가운데 배치 */}
        
        <LogHistoryContainer>
        <HistoryButtonContainer>
        <HistoryButton 
          onClick={handleUndo}
          disabled={!game?.logs || game.logs.length === 0}
          title="되돌리기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        </HistoryButton>
        <HistoryButton 
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          title="앞으로 돌리기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
          </svg>
        </HistoryButton>
      </HistoryButtonContainer>
          {getProcessedLogs().map((log, index) => (
            <LogHistoryItem key={log.id || index}>
              <LogHistoryPlayerName style={{
                color: log.team === 'home' ? 'var(--primary-color)' : '#ef4444'
              }}>
                {log.playerName}
              </LogHistoryPlayerName>
              <LogHistoryActionName>{log.actionName}</LogHistoryActionName>
            </LogHistoryItem>
          ))}
          {getProcessedLogs().length === 0 && (
            <LogHistoryItem>기록된 로그가 없습니다.</LogHistoryItem>
          )}
        </LogHistoryContainer>

        {/* 어웨이팀 영역 */}
        <TeamSection>
          <TeamHeader className="team-header">
            {selectedTeam !== 'away' ? (
              <h3>어웨이팀</h3>
            ) : (
              <CancelButton onClick={handleCancel}>취소</CancelButton>
            )}
          </TeamHeader>
          {selectedTeam !== 'away' ? (
            <PlayerList className="player-list">
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
            <LogItemsContainer className="log-items">
              {logItems.map((item) => (
                <LogItemButton
                  key={item.id}
                  isSelected={selectedLogItem === item.id}
                  onClick={() => handleLogItemSelect(item.id)}
                >
                  {item.name}
                </LogItemButton>
              ))}
            </LogItemsContainer>
          )}
        </TeamSection>
      </TeamsContainer>
    </Container>
  );
} 