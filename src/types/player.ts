export interface Player {
  id: number;
  name: string;
  number: number;  // 등번호
  groupId: number;
  teamId: string;
  position: string;
  image?: string;
}

export interface Team {
  id: number;
  name: string;
  players: Player[];
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
