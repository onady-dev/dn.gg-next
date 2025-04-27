"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import type { Game, LogItem, Log } from "@/types/game";
import type { Team } from "@/types/player";
import { useGroupStore } from "../stores/groupStore";
import { api } from "@/lib/axios";

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
`;

const CreateGameButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--hover-color);
  }
`;

const Content = styled.div`
  display: grid;
  gap: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const GameList = styled.div`
  display: grid;
  gap: 1rem;
`;

const GameHistoryList = styled.div`
  display: grid;
  gap: 1rem;
`;

const GameCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const GameName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
`;

const GameDate = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const GameTeams = styled.div`
  margin-bottom: 1rem;
`;

const TeamName = styled.span`
  font-size: 1rem;
  color: #4b5563;
`;

const GameActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.375rem 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--hover-color);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 400px;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  font-size: 1rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:first-child {
    background-color: var(--primary-color);
    color: white;

    &:hover {
      background-color: var(--hover-color);
    }
  }

  &:last-child {
    background-color: #f3f4f6;
    color: var(--text-color);

    &:hover {
      background-color: #e5e7eb;
    }
  }
`;

const GamesPage = () => {
  const { selectedGroup } = useGroupStore();
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>(() => {
    if (typeof window !== "undefined") {
      const savedTeams = localStorage.getItem(`teams_${selectedGroup}`);
      return savedTeams ? JSON.parse(savedTeams) : [];
    }
    return [];
  });
  const [logItems, setLogItems] = useState<LogItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<{ teamA?: Team; teamB?: Team }>({});
  const [gameName, setGameName] = useState("");

  useEffect(() => {
    if (selectedGroup) {
      loadGames();
      // 로컬스토리지에서 팀 데이터 불러오기
      const savedTeams = localStorage.getItem(`teams_${selectedGroup}`);
      if (savedTeams) {
        setTeams(JSON.parse(savedTeams));
      }
      loadLogItems();
    }
  }, [selectedGroup]);

  // 팀 데이터가 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    if (selectedGroup && teams.length > 0) {
      localStorage.setItem(`teams_${selectedGroup}`, JSON.stringify(teams));
    }
  }, [teams, selectedGroup]);

  const loadGames = async () => {
    try {
      const response = await api.get(`/game?groupId=${selectedGroup}`);
      setGames(response.data);
    } catch (error) {
      console.error("게임 목록을 불러오는데 실패했습니다:", error);
    }
  };

  const loadLogItems = async () => {
    try {
      const response = await api.get(`/logitem?groupId=${selectedGroup}`);
      setLogItems(response.data);
    } catch (error) {
      console.error("로그 아이템을 불러오는데 실패했습니다:", error);
    }
  };

  const handleCreateGame = async () => {
    if (!selectedGroup || !gameName || !selectedTeams.teamA || !selectedTeams.teamB) return;

    try {
      const response = await api.post("/game", {
        groupId: selectedGroup,
        name: gameName,
        teams: {
          teamA: selectedTeams.teamA.players,
          teamB: selectedTeams.teamB.players,
        },
        status: "READY",
      });
      setGames([...games, response.data]);
      setIsCreateModalOpen(false);
      setGameName("");
      setSelectedTeams({});
    } catch (error) {
      console.error("게임 생성에 실패했습니다:", error);
    }
  };

  const handleStartGame = async (gameId: number) => {
    try {
      await api.patch(`/game/${gameId}`, {
        status: "IN_PROGRESS",
      });
      loadGames();
    } catch (error) {
      console.error("게임 시작에 실패했습니다:", error);
    }
  };

  const handleFinishGame = async (gameId: number) => {
    try {
      await api.patch(`/game/${gameId}`, {
        status: "FINISHED",
      });
      loadGames();
    } catch (error) {
      console.error("게임 종료에 실패했습니다:", error);
    }
  };

  return (
    <Container>
      <Header>
        <Title>게임 관리</Title>
        <CreateGameButton onClick={() => setIsCreateModalOpen(true)}>새 게임 생성</CreateGameButton>
      </Header>
      <Content>
        <Section>
          <SectionTitle>진행 중인 게임</SectionTitle>
          <GameList>
            {games
              .filter((game) => game.status === "IN_PROGRESS")
              .map((game) => (
                <GameCard key={game.id}>
                  <GameInfo>
                    <GameName>{game.name}</GameName>
                    <GameDate>{new Date(game.date).toLocaleDateString()}</GameDate>
                  </GameInfo>
                  <GameTeams>
                    <TeamName>
                      {game.homePlayers[0]?.name} vs {game.awayPlayers[0]?.name}
                    </TeamName>
                  </GameTeams>
                  <GameActions>
                    <ActionButton onClick={() => handleFinishGame(game.id)}>게임 종료</ActionButton>
                  </GameActions>
                </GameCard>
              ))}
          </GameList>
        </Section>
        <Section>
          <SectionTitle>최근 게임 기록</SectionTitle>
          <GameHistoryList>
            {games
              .filter((game) => game.status === "FINISHED")
              .map((game) => (
                <GameCard key={game.id}>
                  <GameInfo>
                    <GameName>{game.name}</GameName>
                    <GameDate>{new Date(game.date).toLocaleDateString()}</GameDate>
                  </GameInfo>
                  <GameTeams>
                    <TeamName>
                      {game.homePlayers[0]?.name} vs {game.awayPlayers[0]?.name}
                    </TeamName>
                  </GameTeams>
                </GameCard>
              ))}
          </GameHistoryList>
        </Section>
      </Content>

      {isCreateModalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>새 게임 생성</ModalTitle>
            <Input type="text" placeholder="게임 이름" value={gameName} onChange={(e) => setGameName(e.target.value)} />
            <Select
              value={selectedTeams.teamA?.id || ""}
              onChange={(e) => {
                const team = teams.find((t) => t.id === Number(e.target.value));
                setSelectedTeams({ ...selectedTeams, teamA: team });
              }}
            >
              <option value="">Home팀 선택</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id} disabled={team.id === selectedTeams.teamB?.id}>
                  {team.name}
                </option>
              ))}
            </Select>
            <Select
              value={selectedTeams.teamB?.id || ""}
              onChange={(e) => {
                const team = teams.find((t) => t.id === Number(e.target.value));
                setSelectedTeams({ ...selectedTeams, teamB: team });
              }}
            >
              <option value="">Away팀 선택</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id} disabled={team.id === selectedTeams.teamA?.id}>
                  {team.name}
                </option>
              ))}
            </Select>
            <ModalButtons>
              <ModalButton onClick={handleCreateGame}>생성</ModalButton>
              <ModalButton onClick={() => setIsCreateModalOpen(false)}>취소</ModalButton>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default GamesPage;
