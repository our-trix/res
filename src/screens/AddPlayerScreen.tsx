import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DatabaseUrl } from "../App";

interface Player {
  id: number;
  name: string;
}

export default function AddPlayerWeb() {
  const navigate = useNavigate();

  /* =========================
     ADD PLAYER (OLD)
  ========================= */
  const [playerName, setPlayerName] = useState("");

  /* =========================
     EDIT PLAYER (NEW)
  ========================= */
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | "">("");
  const [newPlayerName, setNewPlayerName] = useState("");

  /* =========================
     FETCH PLAYERS
  ========================= */
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${DatabaseUrl}/players`);
      const data = await res.json();
      setPlayers(data);
    } catch {
      window.alert("خطأ: فشل في جلب اللاعبين");
    }
  };

  /* =========================
     ADD PLAYER SUBMIT
  ========================= */
  const handleAddPlayer = async () => {
    const name = playerName.trim();

    if (!name) {
      return window.alert("تنبيه: يرجى إدخال اسم اللاعب");
    }

    if (players.some((p) => p.name === name)) {
      return window.alert("تنبيه: اسم اللاعب موجود مسبقًا");
    }

    try {
      const res = await fetch(`${DatabaseUrl}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error();

      window.alert("تمت إضافة اللاعب بنجاح");
      setPlayerName("");
      fetchPlayers();
    } catch {
      window.alert("خطأ: فشل في إضافة اللاعب");
    }
  };

  /* =========================
     EDIT PLAYER LOGIC
  ========================= */
  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const trimmedNewName = newPlayerName.trim();

  const nameExists =
    trimmedNewName &&
    players.some(
      p =>
        p.name === trimmedNewName &&
        p.id !== selectedPlayerId
    );

  const canSaveEdit =
    selectedPlayerId !== "" &&
    trimmedNewName.length > 0 &&
    !nameExists &&
    trimmedNewName !== selectedPlayer?.name;

  const handleEditPlayer = async () => {
    if (!canSaveEdit) return;

    try {
      const res = await fetch(
        `${DatabaseUrl}/players/${selectedPlayerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedNewName }),
        }
      );

      if (!res.ok) throw new Error();

      window.alert("تم تعديل اسم اللاعب بنجاح");
      setSelectedPlayerId("");
      setNewPlayerName("");
      fetchPlayers();
    } catch {
      window.alert("خطأ: فشل تعديل اسم اللاعب");
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.container}>
      {/* ================= ADD PLAYER ================= */}
      <label style={styles.label}>اسم اللاعب</label>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="أدخل اسم اللاعب"
        style={styles.input}
      />
      <button onClick={handleAddPlayer} style={styles.button}>
        إضافة اللاعب
      </button>

      {/* ================= DIVIDER ================= */}
      <hr style={styles.divider} />

      {/* ================= EDIT PLAYER ================= */}
      <label style={styles.label}>
        ادخل اسم اللاعب المراد تعديله
      </label>

      <select
        value={selectedPlayerId}
        onChange={(e) => {
          const id = Number(e.target.value);
          setSelectedPlayerId(id);
          const player = players.find(p => p.id === id);
          setNewPlayerName(player ? player.name : "");
        }}
        style={styles.select}
      >
        <option value="">-- اختر لاعبًا --</option>
        {players.map(player => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={newPlayerName}
        onChange={(e) => setNewPlayerName(e.target.value)}
        placeholder="اكتب الاسم الجديد"
        disabled={selectedPlayerId === ""}
        style={{
          ...styles.input,
          backgroundColor:
            selectedPlayerId === "" ? "#eee" : "#fff",
        }}
      />

      {nameExists && (
        <div style={styles.error}>
          هذا الاسم موجود مسبقًا
        </div>
      )}

      <button
        onClick={handleEditPlayer}
        disabled={!canSaveEdit}
        style={{
          ...styles.button,
          backgroundColor: canSaveEdit ? "#2196F3" : "#999",
          cursor: canSaveEdit ? "pointer" : "not-allowed",
        }}
      >
        حفظ التعديل
      </button>
    </div>
  );
}

/* =========================
   CSS
========================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "420px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
    direction: "rtl",
    textAlign: "right",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "bold",
    display: "block",
  },
  input: {
    width: "97%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    fontSize: "15px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#4CAF50",
  },
  divider: {
    margin: "30px 0",
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginBottom: "10px",
  },
};
