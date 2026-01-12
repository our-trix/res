import React from "react";

export default function ResultsTable({ results }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="px-4 py-2">المسابقة</th>
            <th className="px-4 py-2">الفائز</th>
            <th className="px-4 py-2">الدرجة</th>
            <th className="px-4 py-2">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id} className="text-center border-t border-gray-200">
              <td className="px-4 py-2">{r.competition}</td>
              <td className="px-4 py-2">{r.winner}</td>
              <td className="px-4 py-2">{r.score}</td>
              <td className="px-4 py-2">{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
