"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Game, Group, InGamePlayer, Log } from "@/types/game";
import { api } from "@/lib/axios";
import { styles } from "./styles/constants";

interface LogSummary {
  name: string;
  count: number;
  value: number;
  logitemId: number;
}

interface TeamScore {
  score: number;
  result: "win" | "lose" | "draw";
}

interface GameScore {
  home: TeamScore;
  away: TeamScore;
}

interface PlayerStats {
  playerId: number;
  playerName: string;
  stats: LogSummary[];
}

export default function Home() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number>(1);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/all");
        setGroups(response.data);
      } catch (err) {
        console.error("그룹 목록을 불러오는데 실패했습니다:", err);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get("/game", {
          params: {
            groupId,
          },
        });
        setGames(response.data);
      } catch (err) {
        setError("게임 목록을 불러오는데 실패했습니다.");
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
    const playerLogs = game.logs.filter((log) => log.playerId === playerId);
    const logSummary = new Map<string, LogSummary>();

    playerLogs.forEach((log) => {
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
          logitemId: log.logitemId,
        });
      }
    });

    return Array.from(logSummary.values()).sort((a, b) => a.logitemId - b.logitemId);
  };

  const getLogStyle = (logName: string) => {
    const negativeStats = ["파울", "턴오버"];
    return negativeStats.includes(logName) ? styles.logs.negative : styles.logs.positive;
  };

  const renderPlayerLogs = (game: Game, player: InGamePlayer) => {
    const logSummary = getPlayerLogSummary(game, player.id);
    if (logSummary.length === 0) return null;

    return (
      <div className={styles.logs.container}>
        {logSummary.map((summary) => {
          const style = getLogStyle(summary.name);
          return (
            <span key={summary.name} className={style.container}>
              {summary.name}
              <span className={style.badge}>{summary.count}회</span>
            </span>
          );
        })}
      </div>
    );
  };

  const getPlayerAllStats = (playerId: number, playerName: string): PlayerStats => {
    const allStats = new Map<string, LogSummary>();

    games.forEach((game) => {
      const playerLogs = game.logs.filter((log) => log.playerId === playerId);
      playerLogs.forEach((log) => {
        const key = log.logitem.name;
        const existing = allStats.get(key);
        if (existing) {
          existing.count += 1;
          existing.value += log.logitem.value;
        } else {
          allStats.set(key, {
            name: key,
            count: 1,
            value: log.logitem.value,
            logitemId: log.logitemId,
          });
        }
      });
    });

    return {
      playerId,
      playerName,
      stats: Array.from(allStats.values()).sort((a, b) => b.count - a.count),
    };
  };

  const handlePlayerClick = (player: InGamePlayer) => {
    router.push(`/player/${player.id}`);
  };

  const PlayerStatsModal = () => {
    if (!selectedPlayer) return null;

    return (
      <div className={styles.modal.overlay} onClick={() => setSelectedPlayer(null)}>
        <div className={styles.modal.container} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modal.header}>
            <h3 className={styles.modal.title}>{selectedPlayer.playerName}님의 전체 기록</h3>
            <button className={styles.modal.closeButton} onClick={() => setSelectedPlayer(null)}>
              ✕
            </button>
          </div>
          <div className={styles.modal.content}>
            <div className={styles.modal.statsList}>
              {selectedPlayer.stats.map((stat) => (
                <div key={stat.logitemId} className={styles.modal.statItem}>
                  <span className={styles.modal.statName}>{stat.name}</span>
                  <span className={styles.modal.statValue}>{stat.count}회</span>
                </div>
              ))}
              {selectedPlayer.stats.length === 0 && <p className="text-gray-500 text-center py-4">기록이 없습니다.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeamPlayers = (game: Game, team: "home" | "away") => {
    const players = team === "home" ? game.homePlayers : game.awayPlayers;

    return (
      <div className={styles.team.container}>
        <h5 className={styles.team.title}>{team === "home" ? "홈팀" : "어웨이팀"}</h5>
        {players.length > 0 ? (
          <div className={styles.team.playerList}>
            {players.map((player) => (
              <div key={player.id} className={styles.team.playerItem}>
                <div className="flex flex-col">
                  <span className={styles.team.playerName} onClick={() => handlePlayerClick(player)}>
                    {player.name}
                  </span>
                  {renderPlayerLogs(game, player)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.team.noPlayer}>등록된 선수가 없습니다.</p>
        )}
      </div>
    );
  };

  const calculateGameScore = (game: Game): GameScore => {
    const homeScore = game.logs.filter((log) => game.homePlayers.some((player) => player.id === log.playerId)).reduce((sum, log) => sum + log.logitem.value, 0);

    const awayScore = game.logs.filter((log) => game.awayPlayers.some((player) => player.id === log.playerId)).reduce((sum, log) => sum + log.logitem.value, 0);

    const result = homeScore > awayScore ? { home: "win", away: "lose" } : homeScore < awayScore ? { home: "lose", away: "win" } : { home: "draw", away: "draw" };

    return {
      home: { score: homeScore, result: result.home as "win" | "lose" | "draw" },
      away: { score: awayScore, result: result.away as "win" | "lose" | "draw" },
    };
  };

  const renderGameScore = (game: Game) => {
    const score = calculateGameScore(game);

    return (
      <div className={styles.game.score.container}>
        <div className={styles.game.score.team}>
          <span className={styles.game.score.value}>{score.home.score}</span>
          <span className={styles.game.score.result[score.home.result]}>{score.home.result === "win" ? "승" : score.home.result === "lose" ? "패" : "무"}</span>
        </div>
        <span className={styles.game.score.vs}>vs</span>
        <div className={styles.game.score.team}>
          <span className={styles.game.score.value}>{score.away.score}</span>
          <span className={styles.game.score.result[score.away.result]}>{score.away.result === "win" ? "승" : score.away.result === "lose" ? "패" : "무"}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error.container}>
        <div className={styles.error.content}>
          <p className={styles.error.text}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container.main}>
      <div className={styles.container.header}>
        <div className={styles.header.wrapper}>
          <h1 className={styles.header.title}>게임 목록</h1>
          <select value={groupId} onChange={(e) => handleGroupChange(Number(e.target.value))} className={styles.header.select}>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.container.gameList}>
        {games.map((game) => (
          <div key={game.id} className={styles.game.card}>
            <div className={styles.game.header}>
              <div className={styles.game.headerContent}>
                <div className={styles.game.gameInfo}>
                  <h3 className={styles.game.title}>{game.name}</h3>
                  <span className={styles.game.date}>
                    {new Date(game.date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {renderGameScore(game)}
              </div>
            </div>

            <div className={styles.game.content}>
              <div className={styles.game.grid}>
                {renderTeamPlayers(game, "home")}
                {renderTeamPlayers(game, "away")}
              </div>
            </div>
          </div>
        ))}

        {games.length === 0 && !loading && !error && (
          <div className={styles.emptyState.container}>
            <div className={styles.emptyState.text}>
              <p className={styles.emptyState.message}>등록된 게임이 없습니다.</p>
            </div>
          </div>
        )}
      </div>

      <PlayerStatsModal />
    </div>
  );
}
