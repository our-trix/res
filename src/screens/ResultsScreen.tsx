import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ResultsScreenWeb() {
  const navigate = useNavigate();
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await fetch("http://https://trix-server-r52j.onrender.com/api/results/all-dates");
        const data: string[] = await res.json();

        // إزالة التواريخ المكررة
        const uniqueDates = Array.from(new Set(data.map((d) => d.split("T")[0])));
        // ترتيب تنازلي
        uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        setDates(uniqueDates);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDates();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📅 التواريخ المتاحة</h1>

      {dates.length === 0 && <p style={styles.info}>جارٍ تحميل التواريخ...</p>}

      {dates.map((item) => {
        const [year, month, day] = item.split("-");
        return (
          <button
            key={item}
            style={styles.dateButton}
            onClick={() => navigate(`/play-results/${year}/${month}/${day}`)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

/* =========================
   CSS INLINE
========================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: 20,
    maxWidth: 600,
    margin: "0 auto",
    backgroundColor: "#111827",
    direction: "rtl",
    textAlign: "right",
    minHeight: "100vh",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
    textAlign: "center",
  },
  info: {
    color: "gray",
    textAlign: "center",
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: "#1e40af",
    borderRadius: 10,
    padding: "15px 20px",
    marginBottom: 10,
    width: "100%",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    textAlign: "center",
    border: "none",
  },
};
