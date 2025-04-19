"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { InGamePlayer } from "@/types/game";
import { styles } from "@/app/styles/constants";
import { GameRecord } from "./types";

interface PlayerDetailClientProps {
  player: InGamePlayer;
  gameRecords: GameRecord[];
  allLogItemNames: string[];
}

export default function PlayerDetailClient({ player, gameRecords, allLogItemNames }: PlayerDetailClientProps) {
  const router = useRouter();

  // 실제 게임 기록 사용
  const displayRecords = useMemo(() => {
    return gameRecords;
  }, [gameRecords]);

  // 각 로그 아이템별 총 횟수 계산
  const totalStats = useMemo(() => {
    const totals: Record<string, number> = {};
    allLogItemNames.forEach((name) => {
      totals[name] = 0;
    });

    displayRecords.forEach((record) => {
      record.logs.forEach((log) => {
        totals[log.name] = (totals[log.name] || 0) + log.count;
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

    const averages: Record<string, number> = {};

    allLogItemNames.forEach((name) => {
      averages[name] = (totalStats[name] || 0) / gameCount;
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
    backgroundColor: "#f9fafb",
    zIndex: 30,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
          ← 돌아가기
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">{player.name}</h1>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="max-h-[70vh] overflow-auto" style={{ position: "relative" }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th style={firstColHeaderStyle} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                  게임 정보
                </th>
                {allLogItemNames.map((name) => (
                  <th key={name} style={headerStyle} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {name}
                  </th>
                ))}
                <th style={headerStyle} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총점
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayRecords.length > 0 && (
                <>
                  {/* 총 합계 행 */}
                  <tr className="bg-gray-100 font-semibold border-b-2 border-gray-300">
                    <td style={{ position: "sticky" as const, left: 0, backgroundColor: "#f3f4f6", zIndex: 10 }} className="px-6 py-4 border-r text-gray-900">
                      전체 합계
                    </td>
                    {allLogItemNames.map((name) => (
                      <td key={name} className="px-3 py-4 text-center whitespace-nowrap text-sm">
                        <span className={name === "파울" || name === "턴오버" ? "text-red-700" : "text-blue-700"}>{totalStats[name] || 0}</span>
                      </td>
                    ))}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 bg-gray-100">{totalScore}점</td>
                  </tr>

                  {/* 게임당 평균 행 */}
                  <tr className="bg-gray-50 border-b-2 border-gray-300">
                    <td style={{ position: "sticky" as const, left: 0, backgroundColor: "#f9fafb", zIndex: 10 }} className="px-6 py-4 border-r text-gray-900">
                      <div className="flex items-center text-sm">
                        <span>게임당 평균</span>
                        <span className="ml-2 text-xs text-gray-500">(총 {displayRecords.length}게임)</span>
                      </div>
                    </td>
                    {allLogItemNames.map((name) => (
                      <td key={name} className="px-3 py-4 text-center whitespace-nowrap text-sm">
                        <span className={name === "파울" || name === "턴오버" ? "text-red-600" : "text-blue-600"}>{averageStats[name]?.toFixed(1) || "0.0"}</span>
                      </td>
                    ))}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 bg-gray-50">{averageScore.toFixed(1)}점</td>
                  </tr>
                </>
              )}

              {/* 게임 기록 행들 */}
              {displayRecords.map((record) => (
                <tr key={record.gameId} className="hover:bg-gray-50">
                  <td style={normalFirstColStyle} className="px-6 py-3 border-r shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-sm truncate">{record.gameName}</span>
                      <span className="text-xs text-gray-500">
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
                    return (
                      <td key={name} className="px-3 py-3 text-center whitespace-nowrap text-sm font-medium">
                        {logItem ? (
                          <span className={name === "파울" || name === "턴오버" ? "text-red-600" : "text-blue-600"}>{logItem.count}</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">{record.totalScore}점</td>
                </tr>
              ))}

              {displayRecords.length === 0 && (
                <tr>
                  <td colSpan={allLogItemNames.length + 2} className="px-6 py-4 text-center text-gray-500">
                    기록이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
