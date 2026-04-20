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

  const pivotData = useMemo(() => {
    let rawList: any[] = [];
    let keyField = "";
    let scoreField = "";

    if (activeTab === "asm") {
      rawList = data.studentAssessmentResults || [];
      keyField = "assessmentName";
      scoreField = "score";
    } else if (activeTab === "clo") {
      rawList = data.studentCloResults || [];
      keyField = "cloCode";
      scoreField = "cloScore";
    } else {
      rawList = data.studentCoResults || [];
      keyField = "coCode";
      scoreField = "coScore";
    }

    const dynamicColumns = Array.from(
      new Set(rawList.map((item) => item[keyField])),
    ).sort();

    // Nhóm theo enrollmentId để tách biệt các lần học lại
    const grouped = rawList.reduce((acc: any, curr) => {
      const rowKey = curr.enrollmentId;
      if (!acc[rowKey]) {
        acc[rowKey] = {
          enrollmentId: curr.enrollmentId,
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
    { id: "asm", label: "Thành Phần", icon: <User size={14} /> },
    { id: "clo", label: "CLO", icon: <Target size={14} /> },
    { id: "co", label: "CO", icon: <BarChart3 size={14} /> },
  ];

  return (
    <div className="mt-4 bg-white rounded-xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header & Search - Đã giảm padding từ p-6 xuống p-3 */}
      <div className="p-3 border-b bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
            Chi tiết sinh viên
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
            className="pl-9 pr-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-56 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs - Giảm padding py-4 xuống py-2 */}
      <div className="flex border-b px-3 bg-white sticky top-0 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content - Giảm padding ô (cell) từ p-4 xuống p-2 */}
      <div className="max-h-[500px] overflow-auto shadow-inner">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="p-2 font-bold border-r bg-gray-100 sticky left-0 z-30 min-w-[100px]">
                MSSV
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
                key={row.enrollmentId}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                <td className="p-2 font-mono font-bold text-gray-700 border-r bg-white sticky left-0 z-10 group-hover:bg-blue-50/40">
                  {row.studentId}
                  <div className="text-[9px] text-gray-400 font-normal">
                    #{row.enrollmentId}
                  </div>
                </td>
                {pivotData.columns.map((col: any) => {
                  const score = row[col];
                  return (
                    <td key={col} className="p-2 text-center border-r">
                      {score !== undefined ? (
                        <span
                          className={`font-semibold ${score < 4 ? "text-red-500" : "text-gray-700"}`}
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
          <div className="p-10 text-center text-gray-400 italic text-sm">
            Không tìm thấy dữ liệu...
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailTables;
