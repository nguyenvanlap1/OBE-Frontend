/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { Search, Award, GraduationCap } from "lucide-react";

interface Props {
  data: {
    studentPoResults: any[];
    studentPloResults: any[];
  };
}

const StudentClassDetailTables: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<"po" | "plo">("po");
  const [searchTerm, setSearchTerm] = useState("");

  const pivotData = useMemo(() => {
    let rawList: any[] = [];
    let keyField = "";
    let scoreField = "";

    if (activeTab === "po") {
      rawList = data.studentPoResults || [];
      keyField = "poCode";
      scoreField = "poScore";
    } else {
      rawList = data.studentPloResults || [];
      keyField = "ploCode";
      scoreField = "ploScore";
    }

    // Lấy danh sách các cột (Mã PO hoặc Mã PLO) duy nhất
    const dynamicColumns = Array.from(
      new Set(rawList.map((item) => item[keyField])),
    ).sort((a: any, b: any) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );

    // Nhóm theo studentId (Vì ở cấp độ Lớp/Ngành, studentId là duy nhất)
    const grouped = rawList.reduce((acc: any, curr) => {
      const rowKey = curr.studentId;
      if (!acc[rowKey]) {
        acc[rowKey] = {
          studentId: curr.studentId,
        };
      }
      acc[rowKey][curr[keyField]] = curr[scoreField];
      return acc;
    }, {});

    const filteredList = Object.values(grouped).filter((s: any) =>
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return { columns: dynamicColumns, rows: filteredList };
  }, [activeTab, data, searchTerm]);

  const tabs = [
    { id: "po", label: "PO (Program Outcomes)", icon: <Award size={14} /> },
    {
      id: "plo",
      label: "PLO (Program Learning Outcomes)",
      icon: <GraduationCap size={14} />,
    },
  ];

  return (
    <div className="mt-6 bg-white rounded-xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header & Search */}
      <div className="p-3 border-b bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-indigo-800 uppercase tracking-tight">
            Bảng điểm chi tiết PO/PLO
          </h3>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Tìm MSSV..."
            className="pl-9 pr-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-56 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-3 bg-white sticky top-0 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="max-h-[500px] overflow-auto shadow-inner">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="p-3 font-bold border-r bg-gray-100 sticky left-0 z-30 min-w-[120px]">
                Mã Sinh Viên
              </th>
              {pivotData.columns.map((col: any) => (
                <th
                  key={col}
                  className="p-2 text-center min-w-[80px] whitespace-nowrap border-r"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {pivotData.rows.map((row: any) => (
              <tr
                key={row.studentId}
                className="hover:bg-indigo-50/40 transition-colors group"
              >
                <td className="p-3 font-mono font-bold text-gray-700 border-r bg-white sticky left-0 z-10 group-hover:bg-indigo-50/40">
                  {row.studentId}
                </td>
                {pivotData.columns.map((col: any) => {
                  const score = row[col];
                  return (
                    <td key={col} className="p-2 text-center border-r">
                      {score !== undefined ? (
                        <div className="flex flex-col items-center">
                          <span
                            className={`font-bold text-sm ${score < 5 ? "text-red-500" : "text-indigo-700"}`}
                          >
                            {score.toFixed(2)}
                          </span>
                          <div className="w-8 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${score < 5 ? "bg-red-400" : "bg-indigo-400"}`}
                              style={{ width: `${(score / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {pivotData.rows.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic text-sm">
            Không tìm thấy dữ liệu sinh viên...
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassDetailTables;
