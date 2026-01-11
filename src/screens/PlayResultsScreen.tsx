import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Player {
  name: string;
}

interface Team {
  name?: string;
  players: Player[];
}

interface Round {
  id: number;
  round_number: number;
  game_type: string;
  round_score: string;
}

interface Match {
  id: number;
  teamA: Team;
  teamB: Team;
  starterName?: string;
  winnerName?: string;
  final_score: string;
  rounds: Round[];
  notes?: string;
}

export default function PlayResultsScreenWeb() {
  const { year, month, day } = useParams<{ year: string; month: string; day: string }>();
  const navigate = useNavigate();

  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoundsMap, setShowRoundsMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `http://192.168.2.107:3000/api/results?year=${year}&month=${month}&day=${day}`
        );

        if (!res.ok) throw new Error("فشل جلب النتائج من السيرفر");

        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message || "حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [year, month, day]);

  const toggleRounds = (matchId: number) => {
    setShowRoundsMap((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏆 نتائج المسابقات</h1>
      <p style={styles.subtitle}>
        {day}-{month}-{year}
      </p>

      {loading && <p style={styles.info}>جارٍ تحميل النتائج...</p>}
      {error && <p style={{ ...styles.info, color: "red" }}>حدث خطأ: {error}</p>}
      {!loading && !error && results.length === 0 && <p style={styles.info}>لا توجد نتائج لهذا اليوم</p>}

      {results.map((match) => (
        <div key={match.id} style={styles.card}>
          <div style={styles.row}>
            <p style={styles.team}>
              {match.teamA.players.map((p) => p.name).join(" + ")}
              {match.teamA.name ? ` (${match.teamA.name})` : ""}
            </p>
            <p style={styles.vs}>VS</p>
            <p style={styles.team}>
              {match.teamB.players.map((p) => p.name).join(" + ")}
              {match.teamB.name ? ` (${match.teamB.name})` : ""}
            </p>
          </div>

          <p style={styles.text}>🎮 بدأ اللعب: {match.starterName ?? "غير محدد"}</p>
          <p style={styles.text}>🏆 الفائز: {match.winnerName ?? "لم يُحدد"}</p>
          <p style={styles.text}>📊 النتيجة النهائية: {match.final_score}</p>

          <button style={styles.toggleButton} onClick={() => toggleRounds(match.id)}>
            {showRoundsMap[match.id] ? "إخفاء التفاصيل" : "عرض تفاصيل الجولات"}
          </button>

          {showRoundsMap[match.id] &&
            match.rounds.map((r) => (
              <div key={r.id} style={styles.round}>
                <p style={styles.roundText}>
                  الجولة {r.round_number} – {r.game_type} : {r.round_score}
                </p>
              </div>
            ))}

          {match.notes && <p style={styles.notes}>📝 ملاحظات: {match.notes}</p>}
        </div>
      ))}

      <button style={styles.backButton} onClick={() => navigate(-1)}>
        العودة
      </button>
    </div>
  );
}

/* =========================
   CSS INLINE
========================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: 20, maxWidth: 800, margin: "0 auto", direction: "rtl", textAlign: "right" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5, color: "black", textAlign: "center" },
  subtitle: { fontSize: 18, marginBottom: 20, color: "black", textAlign: "center" },
  info: { fontSize: 16, marginBottom: 10, color: "gray" },
  card: {
    width: "100%",
    padding: 15,
    backgroundColor: "#334155",
    borderRadius: 10,
    marginBottom: 15,
    color: "white",
  },
  row: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  team: { fontWeight: "bold", width: "45%", textAlign: "center" },
  vs: { color: "gray", fontWeight: "bold", textAlign: "center" },
  text: { marginBottom: 3 },
  round: { padding: 6, marginTop: 3, marginBottom: 3, backgroundColor: "#1e293b", borderRadius: 6 },
  roundText: { fontSize: 14 },
  notes: { marginTop: 5 },
  backButton: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#dc2626",
    borderRadius: 10,
    width: "100%",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  toggleButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    textAlign: "center",
  },
};
