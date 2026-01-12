import React from "react";
import { useNavigate } from "react-router-dom";
import "./StatisticsScreen.css"; // سنستخدم CSS خارجي للتنسيق

const StatisticsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="title">صفحة الإحصائيات</h1>

      <button className="button" onClick={() => navigate("/team-statistics")}>
        إحصائيات فريق
      </button>

      <button className="button" onClick={() => navigate("/player-statistics")}>
        إحصائيات لاعب
      </button>

      <button className="button" onClick={() => navigate("/general-statistics")}>
        إحصائيات عامة
      </button>
    </div>
  );
};

export default StatisticsScreen;
