"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Game } from "@/types/game";
import { api } from "@/lib/axios";
import { useGroupStore } from "./stores/groupStore";
import * as S from "./styles/HomeStyles";
import { InGamePlayer } from "@/types/player";
import styled from "styled-components";

const PlayerRecordContainer = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 4px;

  &:hover {
    background-color: #f9fafb;
  }
`;

interface LogSummary {
  name: string;
  count: number;
  value: number;
  logitemId: number;
}

interface TeamScore {
  score: number;
  result: "win" | "lose" | "draw";
}

type GameScore = {
  homeScore: number;
  awayScore: number;
  homeResult: "win" | "lose" | "draw";
  awayResult: "win" | "lose" | "draw";
};

interface PlayerStats {
  playerId: number;
  playerName: string;
  stats: LogSummary[];
}

export default function Home() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);
  const { selectedGroup, setGroups } = useGroupStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/all");
        setGroups(response.data);
      } catch (err) {
        console.error("그룹 목록을 불러오는데 실패했습니다:", err);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      if (!selectedGroup) return;

      try {
        const response = await api.get("/game", {
          params: {
            groupId: selectedGroup,
          },
        });
        setGames(response.data);
      } catch (err) {
        setError("게임 목록을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [selectedGroup]);

  const getPlayerLogSummary = (game: Game, playerId: number): LogSummary[] => {
    const playerLogs = game.logs.filter((log) => log.playerId === playerId);
    const logSummary = new Map<string, LogSummary>();

    playerLogs.forEach((log) => {
      const key = log.logitem.name;
      const existing = logSummary.get(key);
      if (existing) {
        existing.count += 1;
        existing.value += log.logitem.value;
      } else {
        logSummary.set(key, {
          name: key,
          count: 1,
          value: log.logitem.value,
          logitemId: log.logitemId,
        });
      }
    });

    return Array.from(logSummary.values()).sort((a, b) => a.logitemId - b.logitemId);
  };

  const getPlayerScore = (game: Game, playerId: number): number => {
    return game.logs.filter((log) => log.playerId === playerId).reduce((sum, log) => sum + log.logitem.value, 0);
  };

  const renderPlayerLogs = (game: Game, player: InGamePlayer) => {
    const logSummary = getPlayerLogSummary(game, player.id);
    if (logSummary.length === 0) return null;

    return (
      <S.LogContainer>
        {logSummary.map((summary) => {
          const isNegative = ["파울", "턴오버"].includes(summary.name);
          return (
            <S.LogBadge key={summary.name} isNegative={isNegative}>
              {summary.name}
              <S.BadgeCount>{summary.count}회</S.BadgeCount>
            </S.LogBadge>
          );
        })}
      </S.LogContainer>
    );
  };

  const handlePlayerClick = (player: InGamePlayer) => {
    router.push(`/player/${player.id}`);
  };

  const PlayerStatsModal = () => {
    if (!selectedPlayer) return null;

    return (
      <S.ModalOverlay onClick={() => setSelectedPlayer(null)}>
        <S.ModalContainer onClick={(e) => e.stopPropagation()}>
          <S.ModalHeader>
            <S.ModalTitle>{selectedPlayer.playerName}님의 전체 기록</S.ModalTitle>
            <S.CloseButton onClick={() => setSelectedPlayer(null)}>✕</S.CloseButton>
          </S.ModalHeader>
          <S.ModalContent>
            <S.StatsList>
              {selectedPlayer.stats.map((stat) => (
                <S.StatItem key={stat.logitemId}>
                  <S.StatName>{stat.name}</S.StatName>
                  <S.StatValue>{stat.count}회</S.StatValue>
                </S.StatItem>
              ))}
              {selectedPlayer.stats.length === 0 && <p style={{ color: "#6B7280", textAlign: "center", padding: "1rem" }}>기록이 없습니다.</p>}
            </S.StatsList>
          </S.ModalContent>
        </S.ModalContainer>
      </S.ModalOverlay>
    );
  };

  const renderTeamPlayers = (game: Game, team: "home" | "away") => {
    const players = team === "home" ? game.homePlayers : game.awayPlayers;

    // 득점 순으로 정렬
    const sortedPlayers = [...players].sort((a, b) => {
      const scoreA = getPlayerScore(game, a.id);
      const scoreB = getPlayerScore(game, b.id);
      return scoreB - scoreA; // 내림차순 정렬
    });

    return (
      <S.TeamContainer>
        <S.TeamTitle>{team === "home" ? "홈팀" : "어웨이팀"}</S.TeamTitle>
        {sortedPlayers.length > 0 ? (
          <S.PlayerList>
            {sortedPlayers.map((player) => (
              <S.PlayerItem key={player.id}>
                <PlayerRecordContainer
                  onClick={() => handlePlayerClick(player)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handlePlayerClick(player);
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <S.PlayerName>{player.name}</S.PlayerName>
                    <div
                      style={{
                        backgroundColor: "#FEF3C7",
                        color: "#B45309",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                      }}
                    >
                      {getPlayerScore(game, player.id)}점
                    </div>
                  </div>
                  {renderPlayerLogs(game, player)}
                </PlayerRecordContainer>
              </S.PlayerItem>
            ))}
          </S.PlayerList>
        ) : (
          <S.NoPlayer>등록된 선수가 없습니다.</S.NoPlayer>
        )}
      </S.TeamContainer>
    );
  };

  const calculateGameScore = (game: Game) => {
    const homeScore = game.logs.filter((log) => game.homePlayers.some((player) => player.id === log.playerId)).reduce((sum, log) => sum + log.logitem.value, 0);
    const awayScore = game.logs.filter((log) => game.awayPlayers.some((player) => player.id === log.playerId)).reduce((sum, log) => sum + log.logitem.value, 0);

    let homeResult: "win" | "lose" | "draw";
    let awayResult: "win" | "lose" | "draw";

    if (homeScore > awayScore) {
      homeResult = "win";
      awayResult = "lose";
    } else if (homeScore < awayScore) {
      homeResult = "lose";
      awayResult = "win";
    } else {
      homeResult = "draw";
      awayResult = "draw";
    }

    return {
      homeScore,
      awayScore,
      homeResult,
      awayResult,
    };
  };

  const renderGameScore = (game: Game) => {
    const { homeScore, awayScore, homeResult, awayResult } = calculateGameScore(game);

    return (
      <S.GameScoreContainer>
        <S.TeamScoreWrapper result={homeResult}>
          <S.ScoreValue>{homeScore}</S.ScoreValue>
          <S.ResultText result={homeResult}>{homeResult === "win" ? "승리" : homeResult === "lose" ? "패배" : "무승부"}</S.ResultText>
        </S.TeamScoreWrapper>
        <S.VsText>VS</S.VsText>
        <S.TeamScoreWrapper result={awayResult}>
          <S.ScoreValue>{awayScore}</S.ScoreValue>
          <S.ResultText result={awayResult}>{awayResult === "win" ? "승리" : awayResult === "lose" ? "패배" : "무승부"}</S.ResultText>
        </S.TeamScoreWrapper>
      </S.GameScoreContainer>
    );
  };

  if (!mounted) {
    return null;
  }

  if (!selectedGroup) {
    return (
      <S.NoGroupContainer>
        <S.NoGroupContent>
          <S.NoGroupTitle>그룹을 선택해주세요</S.NoGroupTitle>
          <S.NoGroupText>상단의 그룹 선택 메뉴에서 원하는 그룹을 선택하면 해당 그룹의 게임 기록을 볼 수 있습니다.</S.NoGroupText>
          <S.UpArrow>↑</S.UpArrow>
        </S.NoGroupContent>
      </S.NoGroupContainer>
    );
  }

  if (loading) {
    return (
      <S.LoadingContainer>
        <S.LoadingSpinner />
      </S.LoadingContainer>
    );
  }

  if (error) {
    return <S.ErrorContainer>{error}</S.ErrorContainer>;
  }

  return (
    <S.Container>
      <S.GameList>
        {games
          .filter(game => game.status === 'FINISHED')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((game) => (
            <S.GameCard key={game.id}>
              <S.GameHeader>
                <S.GameHeaderContent>
                  <S.GameInfo>
                    <S.TitleContainer>
                      <S.GameTitle>{game.name}</S.GameTitle>
                      <S.GameDate>
                        {new Date(game.date).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                        })}
                      </S.GameDate>
                    </S.TitleContainer>
                    {renderGameScore(game)}
                  </S.GameInfo>
                </S.GameHeaderContent>
              </S.GameHeader>
              <S.GameContent>
                <S.GameGrid>
                  {renderTeamPlayers(game, "home")}
                  {renderTeamPlayers(game, "away")}
                </S.GameGrid>
              </S.GameContent>
            </S.GameCard>
          ))}
        {games.filter(game => game.status === 'FINISHED').length === 0 && !loading && !error && (
          <S.EmptyState>완료된 게임이 없습니다.</S.EmptyState>
        )}
      </S.GameList>
      <PlayerStatsModal />
    </S.Container>
  );
}
