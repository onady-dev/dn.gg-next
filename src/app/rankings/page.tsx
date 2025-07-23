"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useGroupStore } from "../stores/groupStore";
import { api } from "../lib/axios";
import { PlayerRanking } from "@/types/player";
import * as S from "./styles/RankingStyles";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import EmptyState from "../components/EmptyState";
import NoGroupSelected from "../components/NoGroupSelected";

interface LogItemRanking {
  id: number;
  name: string;
  value: number;
  players: PlayerRanking[];
  isExpanded?: boolean;
  totalCount?: number;
  avgPerGame?: number;
  totalScore?: number;
  avgScore?: number;
  gamesPlayed?: number;
}

interface LogItem {
  playerId: string;
  gameId: string;
  logitem: {
    id: number;
    name: string;
    value: number;
  };
}

interface LogItemData {
  id: number;
  name: string;
  value: number;
}

interface PlayerStats {
  totalCount: number;
  totalScore: number;
  games: Set<string>;
}

export default function Rankings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLogItem, setSelectedLogItem] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<"total" | "average">("total");
  const [rankings, setRankings] = useState<LogItemRanking[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const { selectedGroup, setSelectedGroup, groups, setGroups } = useGroupStore();

  // 그룹 목록 가져오기
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/all");
        const groupData = response.data;
        setGroups(groupData);
      } catch (err) {
        console.error("그룹 데이터를 불러오는데 실패했습니다:", err);
        setError("그룹 데이터를 불러오는데 실패했습니다.");
      }
    };

    fetchGroups();
  }, []);

  // 펼치기/접기 토글 함수
  const toggleExpand = (rankingId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rankingId)) {
        newSet.delete(rankingId);
      } else {
        newSet.add(rankingId);
      }
      return newSet;
    });
  };

  // 플레이어별 통계 계산
  const calculatePlayerStats = (logs: LogItem[]) => {
    const stats = new Map<string, PlayerStats>();

    logs.forEach((log) => {
      const playerStats = stats.get(log.playerId) || {
        totalCount: 0,
        totalScore: 0,
        games: new Set<string>(),
      };

      playerStats.totalCount += 1;
      playerStats.totalScore += log.logitem.value;
      playerStats.games.add(log.gameId);
      stats.set(log.playerId, playerStats);
    });

    return stats;
  };

  // 랭킹 데이터 가져오기
  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedGroup) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. 로그 아이템 목록 가져오기
        const logItemsResponse = await api.get(`/logitem?groupId=${selectedGroup}`);
        if (!logItemsResponse.data || !Array.isArray(logItemsResponse.data)) {
          throw new Error("로그 아이템 데이터 형식이 올바르지 않습니다.");
        }
        const logItems = (logItemsResponse.data as LogItemData[]).filter((item) => !item.name.includes("자유투"));

        // 2. 각 로그 아이템별 로그 데이터 가져오기
        const rankingsData = await Promise.all(
          logItems.map(async (logItem) => {
            // 로그 데이터 가져오기
            const logsResponse = await api.get(`/log/logitem?groupId=${selectedGroup}&logitemId=${logItem.id}`);
            const logs = logsResponse.data as LogItem[];

            // 플레이어별 통계 계산
            const playerStats = calculatePlayerStats(logs);

            // 플레이어 정보 가져오기
            const players = await Promise.all(
              Array.from(playerStats.entries()).map(async ([playerId, stats]) => {
                try {
                  const playerResponse = await api.get(`/player/${playerId}`);
                  const player = playerResponse.data;
                  const totalGamesPlayedResponse = await api.get(`/player/total-games-played/${playerId}`);
                  const totalGamesPlayed = totalGamesPlayedResponse.data;
                  const totalValue = stats.totalCount;
                  // value가 0인 경우 횟수만 사용, 그 외에는 value를 곱함
                  const avgValue = totalGamesPlayed > 0 ? totalValue / totalGamesPlayed : 0;

                  return {
                    playerId,
                    playerName: player.name,
                    teamId: player.teamId,
                    position: player.position,
                    number: player.backnumber,
                    value: logItem.value,
                    totalCount: totalValue,
                    avgPerGame: avgValue,
                    gamesPlayed: totalGamesPlayed,
                  } as PlayerRanking;
                } catch (err) {
                  console.error(`플레이어 정보를 불러오는데 실패했습니다 (ID: ${playerId}):`, err);
                  return null;
                }
              })
            );

            // 정렬
            const validPlayers = players.filter((p): p is PlayerRanking => p !== null);
            const sortedPlayers = [...validPlayers].sort((a, b) => {
              if (logItem.value < 0) {
                return selectedTab === "total" ? a.totalCount! - b.totalCount! : a.avgPerGame! - b.avgPerGame!;
              }
              return selectedTab === "total" ? b.totalCount! - a.totalCount! : b.avgPerGame! - a.avgPerGame!;
            });

            return {
              id: logItem.id,
              name: logItem.name,
              value: logItem.value,
              players: sortedPlayers,
            };
          })
        );

        // 득점 랭킹 추가
        const allLogs = await Promise.all(
          logItems.map(async (logItem) => {
            const logsResponse = await api.get(`/log/logitem?groupId=${selectedGroup}&logitemId=${logItem.id}`);
            return logsResponse.data as LogItem[];
          })
        );
        const flattenedLogs = allLogs.flat();
        const playerStats = calculatePlayerStats(flattenedLogs);
        const allPlayers = rankingsData.flatMap((r) => r.players);

        const scoreRanking: LogItemRanking = {
          id: -1,
          name: "득점",
          value: 1,
          players: Array.from(playerStats.entries())
            .map(([playerId, stats]) => {
              const player = allPlayers.find((p) => p.playerId === playerId);
              if (!player) return null;

              const extendedPlayer: PlayerRanking = {
                ...player,
                totalCount: stats.totalScore,
                avgPerGame: stats.games.size > 0 ? stats.totalScore / stats.games.size : 0,
                totalScore: stats.totalScore,
                avgScore: stats.games.size > 0 ? stats.totalScore / stats.games.size : 0,
                gamesPlayed: stats.games.size,
              };

              return extendedPlayer;
            })
            .filter((p): p is PlayerRanking => p !== null)
            .sort((a, b) => (selectedTab === "total" ? b.totalScore! - a.totalScore! : b.avgScore! - a.avgScore!)),
        };

        // 득점 데이터가 있을 때만 추가
        const hasScoreData = scoreRanking.players.length > 0 && scoreRanking.players.some(p => p.totalScore! > 0);
        setRankings(hasScoreData ? [scoreRanking, ...rankingsData] : rankingsData);
      } catch (err) {
        console.error("랭킹 데이터를 불러오는데 실패했습니다:", err);
        setError("랭킹 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [selectedGroup, selectedTab]);

  const handleLogItemClick = (logItemId: number) => {
    setSelectedLogItem(selectedLogItem === logItemId ? null : logItemId);
  };

  // 그룹이 선택되지 않은 경우의 UI
  if (!selectedGroup && !loading) {
    return <NoGroupSelected />;
  }

  // 로딩 중인 경우의 UI
  if (loading) {
    return (
      <S.Container>
        <S.LoadingSpinner>로딩 중...</S.LoadingSpinner>
      </S.Container>
    );
  }

  // 에러가 발생한 경우의 UI
  if (error) {
    return (
      <S.Container>
        <S.ErrorMessage>{error}</S.ErrorMessage>
      </S.Container>
    );
  }

  if (rankings.length === 0) {
    return <EmptyState message="등록된 랭킹 데이터가 없습니다." />;
  }

  const filteredRankings = rankings
    .filter((ranking): ranking is LogItemRanking => ranking !== null)
    .sort((a, b) => {
      if (selectedTab === "average") {
        return (b.avgPerGame ?? 0) - (a.avgPerGame ?? 0);
      }
      return (b.totalCount ?? 0) - (a.totalCount ?? 0);
    });

  return (
    <S.Container>
      <S.Header>
        <S.TabContainer>
          <S.TabButton isSelected={selectedTab === "total"} onClick={() => setSelectedTab("total")}>
            전체 기록
          </S.TabButton>
          <S.TabButton isSelected={selectedTab === "average"} onClick={() => setSelectedTab("average")}>
            게임당 평균
          </S.TabButton>
        </S.TabContainer>
      </S.Header>

      {filteredRankings.map((ranking) => (
        <S.RankingCard key={ranking.id}>
          <S.RankingHeader isExpanded={expandedItems.has(ranking.id)} onClick={() => toggleExpand(ranking.id)}>
            <S.RankingTitle>
              {ranking.name}
              {ranking.players.length > 3 && (expandedItems.has(ranking.id) ? <FiChevronUp /> : <FiChevronDown />)}
            </S.RankingTitle>
          </S.RankingHeader>

          <S.TopThree>
            {ranking.players.slice(0, 3).map((player, index) => (
              <Link key={player.playerId} href={`/player/${player.playerId}`} style={{ textDecoration: "none" }}>
                <S.PlayerItem isTop>
                  <S.Rank isTop>{index + 1}</S.Rank>
                  <S.PlayerInfo>
                    <S.PlayerName>{player.playerName}</S.PlayerName>
                    <S.PlayerBadge>
                      {player.position} #{player.number}
                    </S.PlayerBadge>
                  </S.PlayerInfo>
                  <S.StatValue isPositive={ranking.value >= 0}>
                    {selectedTab === "total"
                      ? `${player.totalCount}${ranking.name === "득점" ? "점" : "회"}`
                      : `${player.avgPerGame?.toFixed(1)}${ranking.name === "득점" ? "점" : "회"}`}
                  </S.StatValue>
                </S.PlayerItem>
              </Link>
            ))}
          </S.TopThree>

          <S.RankingContent isExpanded={expandedItems.has(ranking.id)}>
            <S.PlayerList>
              {ranking.players.slice(3).map((player, index) => (
                <Link key={player.playerId} href={`/player/${player.playerId}`} style={{ textDecoration: "none" }}>
                  <S.PlayerItem>
                    <S.Rank>{index + 4}</S.Rank>
                    <S.PlayerInfo>
                      <S.PlayerName>{player.playerName}</S.PlayerName>
                      <S.PlayerBadge>
                        {player.position} #{player.number}
                      </S.PlayerBadge>
                    </S.PlayerInfo>
                    <S.StatValue isPositive={ranking.value >= 0}>
                      {selectedTab === "total"
                        ? `${player.totalCount}${ranking.name === "득점" ? "점" : "회"}`
                        : `${player.avgPerGame?.toFixed(1)}${ranking.name === "득점" ? "점" : "회"}`}
                    </S.StatValue>
                  </S.PlayerItem>
                </Link>
              ))}
            </S.PlayerList>
          </S.RankingContent>
        </S.RankingCard>
      ))}
    </S.Container>
  );
}
