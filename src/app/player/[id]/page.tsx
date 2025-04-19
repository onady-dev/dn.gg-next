import React from "react";
import { InGamePlayer, LogItem } from "@/types/game";
import axios from "axios";
import { GameRecord } from "./types";
import PlayerDetailClient from "./PlayerDetailClient";

interface PlayerLog {
  id: number;
  gameId: number;
  playerId: number;
  logitemId: number;
  logitem: LogItem;
  game: {
    id: number;
    name: string;
    date: string;
  };
}

interface PageParams {
  id: string;
}

// 서버에서 사용할 API 인스턴스
const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010",
  headers: {
    "Content-Type": "application/json",
  },
});

// 이 함수는 서버 컴포넌트입니다
export default async function PlayerDetailPage({ params }: { params: PageParams }) {
  const playerId = params.id;

  try {
    // 로그 아이템, 선수 정보, 선수 로그를 동시에 가져옵니다
    const [playerResponse, logsResponse, logItemsResponse] = await Promise.all([
      serverApi.get(`/player/${playerId}`),
      serverApi.get(`/log/player/${playerId}`),
      serverApi.get("/logitem"),
    ]);

    const player = playerResponse.data;
    const allLogItems = logItemsResponse.data;

    // 게임별로 로그 그룹화
    const logsByGame = new Map<number, PlayerLog[]>();

    logsResponse.data.forEach((log: PlayerLog) => {
      const gameId = log.gameId;
      if (!logsByGame.has(gameId)) {
        logsByGame.set(gameId, []);
      }
      logsByGame.get(gameId)?.push(log);
    });

    // 게임별 기록 생성
    const records: GameRecord[] = [];

    logsByGame.forEach((logs, gameId) => {
      if (logs.length === 0) return;

      const gameInfo = logs[0].game;
      const logSummary = new Map<string, { count: number; value: number }>();

      logs.forEach((log) => {
        const key = log.logitem.name;
        const existing = logSummary.get(key);
        if (existing) {
          existing.count += 1;
          existing.value += log.logitem.value;
        } else {
          logSummary.set(key, {
            count: 1,
            value: log.logitem.value,
          });
        }
      });

      const totalScore = logs.reduce((sum, log) => sum + log.logitem.value, 0);

      records.push({
        gameId: gameInfo.id,
        gameName: gameInfo.name,
        gameDate: gameInfo.date,
        logs: Array.from(logSummary.entries()).map(([name, stats]) => ({
          name,
          count: stats.count,
          value: stats.value,
        })),
        totalScore,
      });
    });

    // 날짜 순으로 정렬
    const gameRecords = records.sort((a: GameRecord, b: GameRecord) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime());

    // 모든 로그 아이템 이름 목록 추출
    const allLogItemNames = allLogItems.map((item: LogItem) => item.name);

    return (
      <div className="min-h-screen">
        <PlayerDetailClient player={player} gameRecords={gameRecords} allLogItemNames={allLogItemNames} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching player data:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">데이터를 불러오는데 실패했습니다</h2>
          <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }
}
