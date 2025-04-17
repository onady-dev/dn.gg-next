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

// export interface InGamePlayer extends Player {
//   team: 'HOME' | 'AWAY';
//   records?: GameRecord[];
// }

export interface Game {
  id: number;
  date: string;
  name: string;
  homePlayers: InGamePlayer[];
  awayPlayers: InGamePlayer[];
  logs: Log[];
}

export interface InGamePlayer {
  id: number;
  name: string;
  team: 'home' | 'away';
}

export interface Log {
  id: number;
  groupId: number;
  gameId: number;
  playerId: number;
  logitemId: number;
  game: Game;
  logitem: LogItem;
  player: Player;
}

export interface LogItem {
  id: number;
  groupId: number;
  name: string;
  value: number;
}

export interface Group {
  id: number;
  name: string;
} 