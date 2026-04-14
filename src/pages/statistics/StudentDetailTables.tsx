import React, { useState, useMemo } from "react";
import { Search, User, Target, BarChart3 } from "lucide-react";

interface Props {
  data: {
    studentAssessmentResults: any[];
    studentCloResults: any[];
    studentCoResults: any[];
  };
}

const StudentDetailTables: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<"asm" | "clo" | "co">("asm");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Xử lý logic để chuyển dữ liệu từ hàng dọc sang hàng ngang (Pivot Table)
  const pivotData = useMemo(() => {
    let rawList: any[] = [];
    let keyField = ""; // Mã bài kiểm tra/CLO/CO
    let scoreField = ""; // Trường chứa điểm

    if (activeTab === "asm") {
      rawList = data.studentAssessmentResults;
      keyField = "assessmentName";
      scoreField = "score";
    } else if (activeTab === "clo") {
      rawList = data.studentCloResults;
      keyField = "cloCode";
      scoreField = "cloScore";
    } else {
      rawList = data.studentCoResults;
      keyField = "coCode";
      scoreField = "coScore";
    }

    // Lấy danh sách duy nhất các cột (Ví dụ: Bài 1, Bài 2 hoặc CLO1, CLO2...)
    const dynamicColumns = Array.from(
      new Set(rawList.map((item) => item[keyField])),
    ).sort();

    // Nhóm dữ liệu theo StudentId
    const grouped = rawList.reduce((acc: any, curr) => {
      const studentId = curr.studentId;
      if (!acc[studentId]) {
        acc[studentId] = { studentId };
      }
      acc[studentId][curr[keyField]] = curr[scoreField];
      return acc;
    }, {});

    // Chuyển object về mảng và lọc theo tìm kiếm
    const filteredList = Object.values(grouped).filter((s: any) =>
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return { columns: dynamicColumns, rows: filteredList };
  }, [activeTab, data, searchTerm]);

  const tabs = [
    { id: "asm", label: "Điểm Thành Phần", icon: <User size={16} /> },
    { id: "clo", label: "Điểm CLO", icon: <Target size={16} /> },
    { id: "co", label: "Điểm CO", icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="mt-12 bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Search */}
      <div className="p-6 border-b bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
            Bảng kê chi tiết sinh viên
          </h3>
          <p className="text-sm text-gray-500 italic">
            Dữ liệu tổng hợp theo cột
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm MSSV..."
            className="pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b px-6 bg-white sticky top-0 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="max-h-[600px] overflow-auto shadow-inner">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="p-4 font-black border-r bg-gray-100 sticky left-0 z-30">
                MSSV
              </th>
              {pivotData.columns.map((col: any) => (
                <th
                  key={col}
                  className="p-4 text-center min-w-[120px] whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {pivotData.rows.map((row: any, i) => (
              <tr
                key={i}
                className="hover:bg-blue-50/50 transition-colors group"
              >
                <td className="p-4 font-mono font-bold text-gray-700 border-r bg-white sticky left-0 z-10 group-hover:bg-blue-50/50">
                  {row.studentId}
                </td>
                {pivotData.columns.map((col: any) => {
                  const score = row[col];
                  return (
                    <td key={col} className="p-4 text-center">
                      {score !== undefined ? (
                        <span
                          className={`font-bold ${score < 4 ? "text-red-500" : "text-gray-700"}`}
                        >
                          {typeof score === "number" ? score.toFixed(1) : score}
                        </span>
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
          <div className="p-20 text-center text-gray-400 italic">
            Không tìm thấy dữ liệu phù hợp...
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailTables;
