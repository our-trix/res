import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import HomeScreen from "./screens/HomeScreen";
import ResultsScreen from "./screens/ResultsScreen";
// MatchRounds تم التعليق لأنها غير مطلوبة في النسخة النهائية للويب
// import MatchRounds from "./screens/AddMatchRoundsScreen";
import NewPlayer from "./screens/AddPlayerScreen";
import NewTeam from "./screens/AddTeamScreen";
import Statistics from "./screens/StatisticsScreen";
import PlayResults from "./screens/PlayResultsScreen";
import TeamStatistics from "./screens/TeamStatistics";
import PlayerStatistics from "./screens/PlayerStatistics";
import GeneralStatistics from "./screens/GeneralStatistics";

export const DatabaseUrl = "https://trix-server-r52j.onrender.com/api";

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          {/* الصفحة الرئيسية */}
          <Route path="/" element={<HomeScreen />} />

          {/* صفحة النتائج مع params */}
          <Route path="/results/:year/:month/:day" element={<ResultsScreen />} />

          {/* إضافة لاعب جديد */}
          <Route path="/new-player" element={<NewPlayer />} />

          {/* إضافة فريق جديد */}
          <Route path="/new-team" element={<NewTeam />} />

          {/* الإحصائيات العامة */}
          <Route path="/statistics" element={<Statistics />} />

          {/* إحصائيات الفريق */}
          <Route path="/team-statistics" element={<TeamStatistics />} />

          {/* إحصائيات اللاعب */}
          <Route path="/player-statistics" element={<PlayerStatistics />} />

          {/* الإحصائيات العامة */}
          <Route path="/general-statistics" element={<GeneralStatistics />} />

          {/* نتائج اللعب */}
          <Route path="/play-results/:year/:month/:day" element={<PlayResults />} />

          {/* أي رابط غير موجود يعيد للصفحة الرئيسية */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
