'use client';

import { useEffect, useState } from 'react';
import { Game, Group, InGamePlayer, Log } from '@/types/game';
import { api } from '@/lib/axios';

interface LogSummary {
  name: string;
  count: number;
  value: number;
  logitemId: number;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number>(1);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get('/group');
        setGroup(response.data);
      } catch (err) {
        console.error('그룹 목록을 불러오는데 실패했습니다:', err);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get('/game', {
          params: {
            groupId
          }
        });
        setGames(response.data);
      } catch (err) {
        setError('게임 목록을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [groupId]);

  const handleGroupChange = (newGroupId: number) => {
    setGroupId(newGroupId);
  };

  const getPlayerLogSummary = (game: Game, playerId: number): LogSummary[] => {
    const playerLogs = game.logs.filter(log => log.playerId === playerId);
    const logSummary = new Map<string, LogSummary>();

    playerLogs.forEach(log => {
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
          logitemId: log.logitemId
        });
      }
    });

    return Array.from(logSummary.values())
      .sort((a, b) => a.logitemId - b.logitemId);
  };

  const getLogStyle = (logName: string) => {
    const negativeStats = ['파울', '턴오버'];
    if (negativeStats.includes(logName)) {
      return {
        container: 'inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100',
        badge: 'ml-1 px-1.5 py-0.5 bg-red-100 rounded-full'
      };
    }
    return {
      container: 'inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100',
      badge: 'ml-1 px-1.5 py-0.5 bg-blue-100 rounded-full'
    };
  };

  const renderPlayerLogs = (game: Game, player: InGamePlayer) => {
    const logSummary = getPlayerLogSummary(game, player.id);
    if (logSummary.length === 0) return null;

    return (
      <div className="mt-1 flex flex-wrap gap-2">
        {logSummary.map((summary) => {
          const style = getLogStyle(summary.name);
          return (
            <span 
              key={summary.name} 
              className={style.container}
            >
              {summary.name}
              <span className={style.badge}>
                {summary.count}회
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  const renderTeamPlayers = (game: Game, team: 'home' | 'away') => {
    const players = team === 'home' ? game.homePlayers : game.awayPlayers;

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h5 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">
          {team === 'home' ? '홈팀' : '어웨이팀'}
        </h5>
        {players.length > 0 ? (
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {player.name}
                  </span>
                  {renderPlayerLogs(game, player)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">등록된 선수가 없습니다.</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">게임 목록</h1>
          <select
            value={groupId}
            onChange={(e) => handleGroupChange(Number(e.target.value))}
            className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option key={group?.id} value={group?.id}>
              {group?.name}
            </option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {games.map((game) => (
          <div key={game.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
                <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                  {new Date(game.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderTeamPlayers(game, 'home')}
                {renderTeamPlayers(game, 'away')}
              </div>
            </div>
          </div>
        ))}
        
        {games.length === 0 && !loading && !error && (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="text-center">
              <p className="text-gray-500 text-lg">등록된 게임이 없습니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
