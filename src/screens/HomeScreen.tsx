import React from "react";
import { useNavigate } from "react-router-dom";

const HomeScreenWeb: React.FC = () => {
  const navigate = useNavigate();

  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎮 إدارة المسابقات</h1>

      {/* إنشاء/ تعديل فريق  */}
      <div style={styles.buttonWrapper}>
        <button
          style={{ ...styles.button, backgroundColor: "#3b82f6" }}
          onClick={() => navigate("/new-team")}
        >
          🏆 إنشاء/ تعديل فريق 
        </button>
      </div>

      {/* إضافة/ تعديل لاعب  */}
      <div style={styles.buttonWrapper}>
        <button
          style={{ ...styles.button, backgroundColor: "#f59e0b" }}
          onClick={() => navigate("/new-player")}
        >
          🧑‍🤝‍🧑   إضافة/ تعديل لاعب 
        </button>
      </div>

      {/* نتائج الألعاب */}
      <div style={styles.buttonWrapper}>
        <button
          style={{ ...styles.button, backgroundColor: "#8b5cf6" }}
          onClick={() => navigate(`/results/${year}/${month}/${day}`)}
        >
          📊 نتائج الألعاب
        </button>
      </div>

      {/* الإحصائيات */}
      <div style={styles.buttonWrapper}>
        <button
          style={{ ...styles.button, backgroundColor: "#ef4444" }}
          onClick={() => navigate("/statistics")}
        >
          📈 إحصائيات
        </button>
      </div>
    </div>
  );
};

/* ================== Styles ================== */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: 20,
    maxWidth: 600,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    direction: "rtl", // تأكيد RTL
    textAlign: "right",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
    textAlign: "center",
  },
  buttonWrapper: {
    margin: "10px 0",
  },
  button: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: 10,
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
  },
};

export default HomeScreenWeb;
