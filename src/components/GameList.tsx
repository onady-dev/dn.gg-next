import { Game, InGamePlayer } from '@/types/game';
import { formatDate } from '@/utils/dateUtils';

interface GameListProps {
  games: Game[];
}

export function GameList({ games }: GameListProps) {
  return (
    <div className="space-y-6">
      {games.map((game) => (
        <div key={game.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">{game.name}</h3>
              <span className="text-sm text-gray-600">
                {formatDate(game.date)}
              </span>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">선수 목록</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">팀</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {game.players.map((player) => (
                    <tr key={player.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {player.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.backnumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.team}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 