'use client';

import { useEffect, useState } from 'react';
import { Game, Group, InGamePlayer } from '@/types/game';
import { api } from '@/lib/axios';

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number>(1);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get('/group');
        setGroups(response.data);
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

  const renderPlayerRecords = (player: InGamePlayer) => {
    if (!player.records || player.records.length === 0) return null;

    return (
      <div className="ml-4 text-sm text-gray-600">
        {player.records.map((record) => (
          <span key={record.id} className="mr-2">
            {record.type}: {record.value}
          </span>
        ))}
      </div>
    );
  };

  const renderTeamPlayers = (game: Game, team: 'HOME' | 'AWAY') => {
    const teamPlayers = game.players?.filter(player => player.team === team) || [];

    return (
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700 mb-2">
          {team === 'HOME' ? '홈팀' : '어웨이팀'}
        </h5>
        {teamPlayers.length > 0 ? (
          teamPlayers.map((player) => (
            <div key={player.id} className="flex items-start">
              <span className="text-sm font-medium">
                {player.name}
                {player.backnumber && ` (#${player.backnumber})`}
              </span>
              {renderPlayerRecords(player)}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">등록된 선수가 없습니다.</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">게임 목록</h1>
          <select
            value={groupId}
            onChange={(e) => handleGroupChange(Number(e.target.value))}
            className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {games.map((game) => (
        <div key={game.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">{game.name}</h3>
              <span className="text-sm text-gray-600">
                {new Date(game.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-8">
              {renderTeamPlayers(game, 'HOME')}
              {renderTeamPlayers(game, 'AWAY')}
            </div>
          </div>
        </div>
      ))}
      
      {games.length === 0 && !loading && !error && (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-center">등록된 게임이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
