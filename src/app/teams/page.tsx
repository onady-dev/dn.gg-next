"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import type { Player, Team as TeamType } from "@/types/player";
import PlayerCard from "./components/PlayerCard";
import { useGroupStore } from "../stores/groupStore";
import { api } from "@/lib/axios";

const TeamsPage = () => {
  const { selectedGroup } = useGroupStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");

  useEffect(() => {
    if (selectedGroup) {
      loadPlayers();
    }
  }, [selectedGroup]);

  const loadPlayers = async () => {
    try {
      const response = await api.get(`/player?groupId=${selectedGroup}`);
      setPlayers(response.data);
    } catch (error) {
      console.error("선수 목록을 불러오는데 실패했습니다:", error);
    }
  };

  const handlePlayerClick = (player: Player) => {
    if (selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleAddToTeam = (teamId: number) => {
    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            players: [...team.players, ...selectedPlayers],
          };
        }
        return team;
      })
    );
    setPlayers(players.filter((p) => !selectedPlayers.find((sp) => sp.id === p.id)));
    setSelectedPlayers([]);
  };

  const handleRemoveFromTeam = (teamId: number, player: Player) => {
    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            players: team.players.filter((p) => p.id !== player.id),
          };
        }
        return team;
      })
    );
    setPlayers([...players, player]);
  };

  const handleAddPlayer = async () => {
    if (!selectedGroup || !newPlayerName || !newPlayerNumber) return;

    try {
      const response = await api.post("/player", {
        groupId: selectedGroup,
        name: newPlayerName,
        number: parseInt(newPlayerNumber),
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
    setTeams([...teams, { id: newTeamId, name: newTeamName, players: [] }]);
    setNewTeamName("");
    setIsAddTeamModalOpen(false);
  };

  return (
    <Container>
      <Header>
        <Title>팀 관리</Title>
        <ButtonGroup>
          <AddTeamButton onClick={() => setIsAddTeamModalOpen(true)}>팀 추가</AddTeamButton>
          <AddPlayerButton onClick={() => setIsAddModalOpen(true)}>선수 추가</AddPlayerButton>
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

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;

  @media (min-width: 640px) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  white-space: nowrap;

  @media (min-width: 640px) {
    font-size: 2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;

  @media (min-width: 640px) {
    width: auto;
    gap: 1rem;
  }
`;

const AddTeamButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background-color 0.2s;

  @media (min-width: 640px) {
    flex: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  &:hover {
    background-color: var(--hover-color);
  }
`;

const AddPlayerButton = styled(AddTeamButton)``;

const Content = styled.div`
  display: grid;
  gap: 2rem;
`;

const Section = styled.section`
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

const PlayerList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
  padding: 0.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
`;

const TeamContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
`;

const Team = styled.div`
  background: #f8fafc;
  border-radius: 0.375rem;
  padding: 0.75rem;

  @media (min-width: 640px) {
    padding: 1rem;
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
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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

const TeamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const AddToTeamButton = styled.button`
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

export default TeamsPage;
