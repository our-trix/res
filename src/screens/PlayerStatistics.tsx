import React, { useEffect, useState } from "react";

type Player = {
  id: number;
  name: string;
};

type PlayerStats = {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: string;
  mostPlayedAgainst: string | null;
  minWinRounds: number | null;
  minLoseRounds: number | null;
};

const PlayerStatisticsScreen: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | "">("");
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     Load Players
  ========================= */
  useEffect(() => {
    fetch("http://https://trix-server-r52j.onrender.com/api/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch(() => {});
  }, []);

  /* =========================
     Load Stats on Change
  ========================= */
  useEffect(() => {
    if (!selectedPlayerId) {
      setStats(null);
      return;
    }

    setLoading(true);
    fetch(`http://https://trix-server-r52j.onrender.com/api/stats/player/${selectedPlayerId}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [selectedPlayerId]);

  return (
    <div className="container">
      <h1 className="title">إحصائيات اللاعب</h1>

      {/* Picker */}
      <select
        className="playerPicker"
        value={selectedPlayerId}
        onChange={(e) =>
          setSelectedPlayerId(e.target.value ? Number(e.target.value) : "")
        }
      >
        <option value="">اختر لاعبًا</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>

      {/* Loading */}
      {loading && <div className="loading">جارٍ التحميل...</div>}

      {/* Stats */}
      {stats && !loading && (
        <div className="statsContainer">
          <StatItem label="عدد المشاركات" value={stats.totalMatches} />
          <StatItem label="عدد مرات الفوز" value={stats.wins} />
          <StatItem label="عدد مرات الخسارة" value={stats.losses} />
          <StatItem label="نسبة الفوز" value={`${stats.winRate}%`} />
          <StatItem
            label="أكثر لاعب لعب ضده"
            value={stats.mostPlayedAgainst ?? "-"}
          />
          <StatItem
            label="أقل عدد جولات في فوز"
            value={stats.minWinRounds ?? "-"}
          />
          <StatItem
            label="أقل عدد جولات في خسارة"
            value={stats.minLoseRounds ?? "-"}
          />
        </div>
      )}
    </div>
  );
};

/* =========================
   Reusable Stat Row
========================= */
const StatItem = ({ label, value }: { label: string; value: any }) => (
  <div className="statItem">
    <span className="statLabel">{label}</span>
    <span className="statValue">{value}</span>
  </div>
);

export default PlayerStatisticsScreen;
