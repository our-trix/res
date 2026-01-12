import React, { useEffect, useState } from "react";

type Team = {
  id: number;
  name: string;
};

type TeamStats = {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: string;
  mostPlayedAgainst: string | null;
  minWinRounds: number | null;
  minLoseRounds: number | null;
};

const TeamStatisticsScreen: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     Load Teams
  ========================= */
  useEffect(() => {
    fetch("http://https://trix-server-r52j.onrender.com/api/teams")
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(() => {});
  }, []);

  /* =========================
     Load Stats on Change
  ========================= */
  useEffect(() => {
    if (!selectedTeamId) {
      setStats(null);
      return;
    }

    setLoading(true);
    fetch(`http://https://trix-server-r52j.onrender.com/api/stats/team/${selectedTeamId}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [selectedTeamId]);

  return (
    <div className="container">
      <h1 className="title">إحصائيات الفريق</h1>

      {/* Picker */}
      <select
        className="teamPicker"
        value={selectedTeamId}
        onChange={(e) =>
          setSelectedTeamId(e.target.value ? Number(e.target.value) : "")
        }
      >
        <option value="">اختر فريقًا</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
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
          <StatItem label="أكثر فريق لعب ضده" value={stats.mostPlayedAgainst ?? "-"} />
          <StatItem label="أقل عدد جولات في فوز" value={stats.minWinRounds ?? "-"} />
          <StatItem label="أقل عدد جولات في خسارة" value={stats.minLoseRounds ?? "-"} />
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

export default TeamStatisticsScreen;
