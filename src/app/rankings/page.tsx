"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useGroupStore } from "../stores/groupStore";
import { api } from "../lib/axios";
import { PlayerRanking } from "@/types/player";

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

        // 그룹이 있고 선택된 그룹이 없는 경우에만 첫 번째 그룹 선택
        if (groupData.length > 0 && !selectedGroup) {
          setSelectedGroup(groupData[0].id);
        }
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
        const logItems = logItemsResponse.data as LogItemData[];

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
                  // value가 0인 경우 횟수만 사용, 그 외에는 value를 곱함
                  const totalValue = logItem.value === 0 ? stats.totalCount : stats.totalCount * Math.abs(logItem.value);
                  const avgValue = stats.games.size > 0 ? totalValue / stats.games.size : 0;

                  return {
                    playerId,
                    playerName: player.name,
                    teamId: player.teamId,
                    position: player.position,
                    number: player.number,
                    value: logItem.value,
                    totalCount: totalValue,
                    avgPerGame: avgValue,
                    gamesPlayed: stats.games.size,
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

        setRankings([scoreRanking, ...rankingsData]);
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
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">그룹을 선택해주세요</h2>
          <p className="text-gray-600 mb-4">상단의 그룹 선택 메뉴에서 원하는 그룹을 선택하면 해당 그룹의 랭킹을 볼 수 있습니다.</p>
          <div className="animate-bounce text-4xl text-gray-400">↑</div>
        </div>
      </div>
    );
  }

  // 로딩 중인 경우의 UI
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 에러가 발생한 경우의 UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-600 mb-4">오류가 발생했습니다</h3>
            <p className="text-gray-600">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
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
    <div className="container mx-auto px-4 py-8 min-h-screen bg-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">선수 랭킹</h1>
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === "total" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-800"}`}
            onClick={() => setSelectedTab("total")}
          >
            합계
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === "average" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-800"}`}
            onClick={() => setSelectedTab("average")}
          >
            평균
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRankings.map((ranking) => {
          const isNegativeStat = ranking.value < 0;
          const isExpanded = expandedItems.has(ranking.id);
          const displayPlayers = isExpanded ? ranking.players : ranking.players.slice(0, 3);
          const hasValue = ranking.name === "득점";

          const ExpandButton = () => (
            <button onClick={() => toggleExpand(ranking.id)} className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none flex items-center gap-1">
              {isExpanded ? (
                <>
                  접기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  더보기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          );

          return (
            <div key={ranking.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className={`px-4 py-3 ${isNegativeStat ? "bg-red-50" : "bg-green-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${isNegativeStat ? "text-red-700" : "text-green-700"}`}>{ranking.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${isNegativeStat ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} font-medium`}>
                      {ranking.players.length > 0 ? `${ranking.players.length}명` : "기록 없음"}
                    </span>
                  </div>
                  {ranking.players.length > 3 && <ExpandButton />}
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {displayPlayers.length > 0 ? (
                  <>
                    {displayPlayers.map((player, index) => (
                      <div key={player.playerId} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 text-gray-500 text-sm">{index + 1}</span>
                          <div>
                            <Link href={`/player/${player.playerId}`} className="font-medium text-gray-900 hover:text-blue-600">
                              {player.playerName}
                            </Link>
                            <div className="text-sm text-gray-500">
                              {player.position} #{player.number}
                            </div>
                          </div>
                        </div>
                        <div className={`font-medium ${isNegativeStat ? "text-red-600" : "text-green-600"}`}>
                          {selectedTab === "total"
                            ? `${hasValue ? player.totalCount : player.value === 0 ? player.totalCount : player.totalCount! / Math.abs(player.value)}${hasValue ? "점" : "회"}`
                            : `${
                                hasValue
                                  ? player.avgPerGame?.toFixed(1)
                                  : player.value === 0
                                  ? player.avgPerGame?.toFixed(1)
                                  : (player.avgPerGame! / Math.abs(player.value)).toFixed(1)
                              }${hasValue ? "점" : "회"}`}
                        </div>
                      </div>
                    ))}
                    {ranking.players.length > 3 && (
                      <div className="px-4 py-2 bg-gray-50">
                        <button
                          onClick={() => toggleExpand(ranking.id)}
                          className="w-full text-sm text-gray-500 hover:text-gray-700 focus:outline-none flex items-center justify-center gap-1"
                        >
                          {isExpanded ? "간단히 보기" : `더보기 (${ranking.players.length - 3}명)`}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">기록이 없습니다.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
