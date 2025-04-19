export interface Player {
  id: string;
  name: string;
  teamId: string;
  position: string;
  number: number;
  image?: string;
}

export interface PlayerRanking {
  playerId: string;
  playerName: string;
  teamId: string;
  position: string;
  number: string;
  value: number;
  totalCount?: number;
  avgPerGame?: number;
  totalScore?: number;
  avgScore?: number;
  gamesPlayed?: number;
}
