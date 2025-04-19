"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GameRecord, Player } from "./types";
import { styles } from "@/app/styles/constants";

interface PlayerDetailClientProps {
  player: Player;
  gameRecords: GameRecord[];
  allLogItemNames: string[];
}

export default function PlayerDetailClient({ player, gameRecords, allLogItemNames }: PlayerDetailClientProps) {
  const router = useRouter();

  // 실제 게임 기록 사용
  const displayRecords = useMemo(() => {
    return gameRecords;
  }, [gameRecords]);

  // 각 로그 아이템별 총 횟수와 점수 계산
  const totalStats = useMemo(() => {
    const totals: Record<string, { count: number; score: number }> = {};
    allLogItemNames.forEach((name) => {
      totals[name] = { count: 0, score: 0 };
    });

    displayRecords.forEach((record) => {
      record.logs.forEach((log) => {
        totals[log.name].count += log.count;
        totals[log.name].score += log.value;
      });
    });

    return totals;
  }, [displayRecords, allLogItemNames]);

  // 총 점수
  const totalScore = useMemo(() => {
    return displayRecords.reduce((sum, record) => sum + record.totalScore, 0);
  }, [displayRecords]);

  // 게임당 평균 계산
  const averageStats = useMemo(() => {
    const gameCount = displayRecords.length;
    if (gameCount === 0) return {};

    const averages: Record<string, { count: number; score: number }> = {};

    allLogItemNames.forEach((name) => {
      averages[name] = {
        count: (totalStats[name].count || 0) / gameCount,
        score: (totalStats[name].score || 0) / gameCount,
      };
    });

    return averages;
  }, [totalStats, displayRecords.length, allLogItemNames]);

  // 게임당 평균 점수
  const averageScore = useMemo(() => {
    const gameCount = displayRecords.length;
    return gameCount > 0 ? totalScore / gameCount : 0;
  }, [totalScore, displayRecords.length]);

  // 테이블 헤더 스타일
  const headerStyle = {
    position: "sticky" as const,
    top: 0,
    backgroundColor: "#ffffff",
    zIndex: 30,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  // 첫 번째 열 헤더 스타일
  const firstColHeaderStyle = {
    ...headerStyle,
    position: "sticky" as const,
    left: 0,
    zIndex: 40,
  };

  // 일반 행 첫 번째 열 스타일
  const normalFirstColStyle = {
    position: "sticky" as const,
    left: 0,
    backgroundColor: "#ffffff",
    zIndex: 10,
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-white">
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{player.name}</h1>
          <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
            {player.position} #{player.number}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr>
                <th
                  scope="col"
                  style={firstColHeaderStyle}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[200px] bg-gray-50 border-b border-gray-100"
                >
                  게임 정보
                </th>
                {allLogItemNames.map((name) => (
                  <th
                    key={name}
                    style={headerStyle}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-b border-gray-100"
                  >
                    {name}
                  </th>
                ))}
                <th scope="col" style={headerStyle} className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                  총점
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayRecords.map((record) => (
                <tr key={record.gameId} className="hover:bg-blue-50/30 transition-colors duration-150">
                  <td style={normalFirstColStyle} className="px-6 py-4 whitespace-nowrap group-hover:bg-blue-50/30">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{record.gameName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(record.gameDate).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </td>
                  {allLogItemNames.map((name) => {
                    const logItem = record.logs.find((log) => log.name === name);
                    const count = logItem?.count || 0;
                    return (
                      <td key={name} className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${count > 0 ? "text-blue-600" : "text-gray-400"} font-medium`}>{count > 0 ? `${count}회` : "-"}</span>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${record.totalScore < 0 ? "text-red-500" : "text-blue-600"}`}>{record.totalScore}점</span>
                  </td>
                </tr>
              ))}
              {/* 총계 행 */}
              <tr className="bg-gray-50/70">
                <td style={{ ...normalFirstColStyle, backgroundColor: "rgb(249 250 251 / 0.7)" }} className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">전체 기록</span>
                </td>
                {allLogItemNames.map((name) => {
                  const stats = totalStats[name];
                  return (
                    <td key={name} className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${stats.count > 0 ? "text-blue-600" : "text-gray-400"}`}>{stats.count > 0 ? `${stats.count}회` : "-"}</span>
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${totalScore < 0 ? "text-red-500" : "text-blue-600"}`}>{totalScore}점</span>
                </td>
              </tr>
              {/* 평균 행 */}
              <tr className="bg-blue-50/50">
                <td style={{ ...normalFirstColStyle, backgroundColor: "rgb(239 246 255 / 0.5)" }} className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">게임당 평균</span>
                </td>
                {allLogItemNames.map((name) => {
                  const stats = averageStats[name] || { count: 0, score: 0 };
                  return (
                    <td key={name} className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${stats.count > 0 ? "text-blue-600" : "text-gray-400"}`}>
                        {stats.count > 0 ? `${stats.count.toFixed(1)}회` : "-"}
                      </span>
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${averageScore < 0 ? "text-red-500" : "text-blue-600"}`}>{averageScore.toFixed(1)}점</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
