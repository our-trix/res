import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Player {
  id: number;
  name: string;
}

export default function AddPlayerWeb() {
  const navigate = useNavigate(); // ✅ hook للتنقل

  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);

  /* =========================
     FETCH PLAYERS
  ========================= */
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/players");
      const data = await res.json();
      setPlayers(data);
    } catch {
      window.alert("خطأ: فشل في جلب اللاعبين");
    }
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    const name = playerName.trim();

    if (!name) {
      return window.alert("تنبيه: يرجى إدخال اسم اللاعب");
    }

    if (players.some((p) => p.name === name)) {
      return window.alert("تنبيه: اسم اللاعب موجود مسبقًا");
    }

    try {
      const res = await fetch("http://localhost:3000/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error();

      window.alert("نجاح: تمت إضافة اللاعب بنجاح");
      navigate("/"); // ✅ العودة للصفحة الرئيسية
    } catch {
      window.alert("خطأ: فشل في إضافة اللاعب");
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.container}>
      <label style={styles.label}>اسم اللاعب</label>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="أدخل اسم اللاعب"
        style={styles.input}
      />
      <button onClick={handleSubmit} style={styles.button}>
        إضافة اللاعب
      </button>
    </div>
  );
}

/* =========================
   CSS INLINE
========================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
    direction: "rtl", // ✅ دعم RTL
    textAlign: "right",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    fontSize: "16px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
