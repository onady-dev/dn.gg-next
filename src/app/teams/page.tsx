"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import type { Player, Team as TeamType } from "@/types/player";
import PlayerCard from "./components/PlayerCard";
import { useGroupStore } from "../stores/groupStore";
import { api } from "@/lib/axios";
import EmptyState from "../components/EmptyState";
import NoGroupSelected from "../components/NoGroupSelected";

const TeamsPage = () => {
  const { selectedGroup } = useGroupStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TeamType[]>(() => {
    // 초기 로드 시 로컬스토리지에서 팀 데이터 불러오기
    if (typeof window !== 'undefined' && selectedGroup) {
      const savedTeams = localStorage.getItem(`teams_group_${selectedGroup}`);
      return savedTeams ? JSON.parse(savedTeams) : [];
    }
    return [];
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [loading, setLoading] = useState(true);

  // 팀 데이터 저장 함수
  const saveTeamsToLocalStorage = (teamsData: TeamType[]) => {
    if (selectedGroup) {
      localStorage.setItem(`teams_group_${selectedGroup}`, JSON.stringify(teamsData));
    }
  };

  // 선수 목록과 팀 데이터를 로드하는 함수
  const loadData = async () => {
    if (!selectedGroup) return;
    
    setLoading(true);
    try {
      // 선수 목록 로드
      const response = await api.get(`/player?groupId=${selectedGroup}`);
      const allPlayers = response.data;
      
      // 저장된 팀 데이터 로드
      const savedTeams = localStorage.getItem(`teams_group_${selectedGroup}`);
      let currentTeams = savedTeams ? JSON.parse(savedTeams) : [];
      
      // 팀 데이터가 현재 그룹의 것인지 확인
      const teamsForCurrentGroup = currentTeams.filter((team: TeamType) => {
        // 팀의 선수들이 현재 그룹의 선수들인지 확인
        const teamPlayerIds = team.players.map((player: Player) => player.id);
        return teamPlayerIds.every(playerId => 
          allPlayers.some((player: Player) => player.id === playerId)
        );
      });

      // 팀 데이터가 변경되었다면 업데이트
      if (teamsForCurrentGroup.length !== currentTeams.length) {
        currentTeams = teamsForCurrentGroup;
        localStorage.setItem(`teams_group_${selectedGroup}`, JSON.stringify(teamsForCurrentGroup));
      }

      setTeams(teamsForCurrentGroup);

      // 팀에 포함된 선수들의 ID 목록 생성
      const teamPlayerIds = teamsForCurrentGroup.flatMap((team: TeamType) => 
        team.players.map((player: Player) => player.id)
      );

      // 팀에 포함되지 않은 선수들만 필터링
      const availablePlayers = allPlayers.filter(
        (player: Player) => !teamPlayerIds.includes(player.id)
      );

      setPlayers(availablePlayers);
    } catch (error) {
      console.error("데이터를 불러오는데 실패했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 그룹이 변경될 때마다 해당 그룹의 팀 데이터 로드
  useEffect(() => {
    if (selectedGroup) {
      const savedTeams = localStorage.getItem(`teams_group_${selectedGroup}`);
      setTeams(savedTeams ? JSON.parse(savedTeams) : []);
      loadData();
    }
    setSelectedPlayers([]);
  }, [selectedGroup]);

  const handlePlayerClick = (player: Player) => {
    if (selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleAddToTeam = (teamId: number) => {
    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          players: [...team.players, ...selectedPlayers],
        };
      }
      return team;
    });
    setTeams(updatedTeams);
    saveTeamsToLocalStorage(updatedTeams);
    setPlayers(players.filter((p) => !selectedPlayers.find((sp) => sp.id === p.id)));
    setSelectedPlayers([]);
  };

  const handleRemoveFromTeam = (teamId: number, player: Player) => {
    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          players: team.players.filter((p) => p.id !== player.id),
        };
      }
      return team;
    });
    setTeams(updatedTeams);
    saveTeamsToLocalStorage(updatedTeams);
    setPlayers([...players, player]);
  };

  const handleAddPlayer = async () => {
    if (!selectedGroup || !newPlayerName || !newPlayerNumber) return;

    try {
      const response = await api.post("/player", {
        groupId: selectedGroup,
        name: newPlayerName,
        backnumber: newPlayerNumber,
      });
      setPlayers([...players, response.data]);
      setIsAddModalOpen(false);
      setNewPlayerName("");
      setNewPlayerNumber("");
    } catch (error) {
      console.error("선수 추가에 실패했습니다:", error);
    }
  };

  const handleAddTeam = () => {
    if (!newTeamName) return;

    const newTeamId = Math.max(...teams.map((t) => t.id), 0) + 1;
    const updatedTeams = [...teams, { id: newTeamId, name: newTeamName, players: [] }];
    setTeams(updatedTeams);
    saveTeamsToLocalStorage(updatedTeams);
    setNewTeamName("");
    setIsAddTeamModalOpen(false);
  };

  const handleResetTeams = async () => {
    if (window.confirm("팀 구성을 초기화하시겠습니까? 모든 팀과 선수 구성이 삭제됩니다.")) {
      setTeams([]);
      if (selectedGroup) {
        localStorage.removeItem(`teams_group_${selectedGroup}`);
        try {
          const response = await api.get(`/player?groupId=${selectedGroup}`);
          setPlayers(response.data);
        } catch (error) {
          console.error("선수 목록을 불러오는데 실패했습니다:", error);
        }
      }
    }
  };

  if (loading) return <div>로딩 중...</div>;
  
  if (!selectedGroup) {
    return <NoGroupSelected />;
  }
  
  return (
    <Container>
      <Header>
        <Title>팀 관리</Title>
        <ButtonGroup>
          <AddPlayerButton onClick={() => setIsAddModalOpen(true)}>선수 추가</AddPlayerButton>
          <AddTeamButton onClick={() => setIsAddTeamModalOpen(true)}>팀 추가</AddTeamButton>
          <ResetButton onClick={handleResetTeams}>팀 구성 초기화</ResetButton>
        </ButtonGroup>
      </Header>
      <Content>
        <Section>
          <SectionTitle>선수 목록</SectionTitle>
          <PlayerList>
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} isSelected={selectedPlayers.some((p) => p.id === player.id)} onClick={() => handlePlayerClick(player)} />
            ))}
          </PlayerList>
        </Section>
        <Section>
          <SectionTitle>팀 구성</SectionTitle>
          <TeamContainer>
            {teams.map((team) => (
              <Team key={team.id}>
                <TeamHeader>
                  <TeamTitle>{team.name}</TeamTitle>
                  {selectedPlayers.length > 0 && <AddToTeamButton onClick={() => handleAddToTeam(team.id)}>선수 추가</AddToTeamButton>}
                </TeamHeader>
                <TeamPlayerList>
                  {team.players.map((player) => (
                    <PlayerCard key={player.id} player={player} onClick={() => handleRemoveFromTeam(team.id, player)} />
                  ))}
                </TeamPlayerList>
              </Team>
            ))}
          </TeamContainer>
        </Section>
      </Content>

      {isAddModalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>선수 추가</ModalTitle>
            <Input type="text" placeholder="선수 이름" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} />
            <Input type="number" placeholder="등번호" value={newPlayerNumber} onChange={(e) => setNewPlayerNumber(e.target.value)} />
            <ModalButtons>
              <ModalButton onClick={handleAddPlayer}>추가</ModalButton>
              <ModalButton onClick={() => setIsAddModalOpen(false)}>취소</ModalButton>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}

      {isAddTeamModalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>팀 추가</ModalTitle>
            <Input type="text" placeholder="팀 이름" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
            <ModalButtons>
              <ModalButton onClick={handleAddTeam}>추가</ModalButton>
              <ModalButton onClick={() => setIsAddTeamModalOpen(false)}>취소</ModalButton>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default TeamsPage;

const Container = styled.div`
  padding: 1rem;
  margin-top: 4rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 10;
  align-items: center;

  @media (min-width: 768px) {
    flex-wrap: nowrap;
    justify-content: space-between;
    gap: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: bold;
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
  justify-content: flex-end;

  @media (min-width: 768px) {
    flex-wrap: nowrap;
  }
`;

const Button = styled.button`
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex: 0 0 auto;

  @media (min-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

const AddPlayerButton = styled(Button)`
  background-color: #4CAF50;
  color: white;
  border: none;
  
  &:hover {
    background-color: #45a049;
  }
`;

const AddTeamButton = styled(Button)`
  background-color: #2196F3;
  color: white;
  border: none;
  
  &:hover {
    background-color: #1e88e5;
  }
`;

const ResetButton = styled(Button)`
  background-color: #f44336;
  color: white;
  border: none;
  
  &:hover {
    background-color: #e53935;
  }
`;

const TeamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const AddToTeamButton = styled(Button)`
  background-color: #4CAF50;
  color: white;
  border: none;
  font-size: 0.9rem;
  padding: 0.3rem 0.8rem;
  
  &:hover {
    background-color: #45a049;
  }
`;

const Content = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 768px) {
    gap: 1.5rem;
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 1.25rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const PlayerList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.375rem;
  padding: 0.375rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
    padding: 0.75rem;
  }
`;

const TeamContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }
`;

const Team = styled.div`
  background: #f8fafc;
  border-radius: 0.375rem;
  padding: 0.5rem;

  @media (min-width: 640px) {
    padding: 0.75rem;
  }
`;

const TeamTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const TeamPlayerList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.375rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
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
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    
    &:hover {
      background-color: var(--primary-dark);
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: var(--bg-hover);
    }
  }
`;