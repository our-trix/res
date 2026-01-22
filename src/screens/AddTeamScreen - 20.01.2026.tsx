import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DatabaseUrl } from "../App";

interface Team {
  id: number;
  name: string;
}

interface Player {
  id: number;
  name: string;
  teams: Team[];
}

export default function AddTeamPageWeb() {
  const navigate = useNavigate(); // ✅ hook للتنقل

  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [player1, setPlayer1] = useState<number | null>(null);
  const [player2, setPlayer2] = useState<number | null>(null);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${DatabaseUrl}/players-with-teams`);
      const data = await res.json();
      setPlayers(data);
    } catch {
      alert("خطأ: فشل في جلب اللاعبين");
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${DatabaseUrl}/teams`);
      const data = await res.json();
      setTeams(data);
    } catch {
      alert("خطأ: فشل في جلب الفرق");
    }
  };

  // =========================
  // VALIDATION
  // =========================
  const playersInSameTeam = (p1: Player, p2: Player) => {
    return p1.teams.some((t1) => p2.teams.some((t2) => t1.id === t2.id));
  };

  const handleSubmit = async () => {
    if (!teamName.trim()) {
      return alert("تنبيه: يرجى إدخال اسم الفريق");
    }

    if (teams.some((t) => t.name === teamName.trim())) {
      return alert("تنبيه: اسم الفريق موجود مسبقًا");
    }

    if (!player1 || !player2) {
      return alert("تنبيه: يرجى اختيار لاعبين");
    }

    if (player1 === player2) {
      return alert("تنبيه: يجب اختيار لاعبين مختلفين");
    }

    const p1 = players.find((p) => p.id === player1)!;
    const p2 = players.find((p) => p.id === player2)!;

    if (playersInSameTeam(p1, p2)) {
      return alert("تنبيه: هذان اللاعبان موجودان مسبقًا في فريق");
    }

    // =========================
    // CREATE TEAM
    // =========================
    try {
      const res = await fetch(`${DatabaseUrl}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          playerIds: [player1, player2],
        }),
      });

      if (!res.ok) throw new Error();

      alert("نجاح: تم إنشاء الفريق بنجاح");
      navigate("/"); // ✅ العودة للصفحة الرئيسية
    } catch {
      alert("خطأ: فشل في إنشاء الفريق");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.container}>
      <h2>إضافة فريق جديد</h2>

      <label style={styles.label}>اسم الفريق</label>
      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="أدخل اسم الفريق"
        style={styles.input}
      />

      <label style={styles.label}>اللاعب الأول</label>
      <select
        value={player1 ?? ""}
        onChange={(e) => setPlayer1(Number(e.target.value))}
        style={styles.select}
      >
        <option value="">اختر لاعبًا</option>
        {players
          .filter((p) => p.id !== player2)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
      </select>

      <label style={styles.label}>اللاعب الثاني</label>
      <select
        value={player2 ?? ""}
        onChange={(e) => setPlayer2(Number(e.target.value))}
        style={styles.select}
      >
        <option value="">اختر لاعبًا</option>
        {players
          .filter((p) => p.id !== player1)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
      </select>

      <button onClick={handleSubmit} style={styles.button}>
        إضافة الفريق
      </button>
    </div>
  );
}

/* =========================
   Styles
========================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
    direction: "rtl", // ✅ دعم RTL
    textAlign: "right",
  },
  input: {
    width: "97%",
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  select: {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 12,
    backgroundColor: "#1e293b",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  label: {
    display: "block",
    marginTop: 10,
    marginBottom: 6,
  },
};
