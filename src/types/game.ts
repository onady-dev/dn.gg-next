export interface Player {
  id: number;
  groupId: number;
  name: string;
  backnumber?: string;
}

export interface GameRecord {
  id: number;
  playerId: number;
  gameId: number;
  type: string;
  value: number;
  timestamp: string;
}

export interface InGamePlayer extends Player {
  team: 'HOME' | 'AWAY';
  records?: GameRecord[];
}

export interface Game {
  id: number;
  groupId: number;
  date: string;
  name: string;
  players?: InGamePlayer[];
}

export interface Group {
  id: number;
  name: string;
} 