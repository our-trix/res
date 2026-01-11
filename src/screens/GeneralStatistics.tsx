import React, { useEffect, useState } from "react";

type StatisticsMode = "teams" | "players";

type GeneralStatisticItem = {
  id: number;
  name: string;
  value: number;
};

type GeneralStatisticBlock = {
  key: string;
  title: string;
  unit: "%" | "count" | "average";
  highlightLabel: string;
  list: GeneralStatisticItem[];
};

const GeneralStatisticsScreen: React.FC = () => {
  const [mode, setMode] = useState<StatisticsMode>("teams");
  const [statistics, setStatistics] = useState<GeneralStatisticBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /* =========================
     Load Statistics
  ========================= */
  useEffect(() => {
    setLoading(true);
    setStatistics([]);

    fetch(`http://localhost:3000/api/stats/general?type=${mode}`)
      .then((res) => res.json())
      .then((data) => setStatistics(data))
      .catch((err) => console.log("Failed to load general statistics", err))
      .finally(() => setLoading(false));
  }, [mode]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatValue = (value: number, unit: string) =>
    unit === "%" ? `${value}%` : value;

  return (
    <div className="container">
      <h1 className="title">الإحصائيات العامة</h1>

      {/* Picker */}
      <select
        className="modePicker"
        value={mode}
        onChange={(e) => setMode(e.target.value as StatisticsMode)}
      >
        <option value="teams">إحصائيات الفرق</option>
        <option value="players">إحصائيات اللاعبين</option>
      </select>

      {/* Loading */}
      {loading && <div className="loading">جارٍ التحميل...</div>}

      {/* Statistics */}
      {!loading &&
        statistics.map((stat) => {
          const bestItem = stat.list[0];
          const isExpanded = expanded[stat.key];

          return (
            <div key={stat.key} className="card">
              <h2 className="cardTitle">{stat.title}</h2>

              {/* Best Result */}
              {bestItem && (
                <div className="highlightRow">
                  <span className="name">{bestItem.name}</span>
                  <span className="value">
                    {formatValue(bestItem.value, stat.unit)}
                  </span>
                </div>
              )}

              {/* Toggle Button */}
              <button
                className="toggleButton"
                onClick={() => toggleExpand(stat.key)}
              >
                {isExpanded ? "إخفاء القائمة" : "إظهار القائمة كاملة"}
              </button>

              {/* Full List */}
              {isExpanded &&
                stat.list.map((item, index) => (
                  <div key={item.id} className="listRow">
                    <span>{index + 1}</span>
                    <span className="name">{item.name}</span>
                    <span>{formatValue(item.value, stat.unit)}</span>
                  </div>
                ))}
            </div>
          );
        })}
    </div>
  );
};

export default GeneralStatisticsScreen;
