/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Send, Plus, Trash2, Users } from "lucide-react";
import {
  statisticsService,
  type StudentClassStatisticsRequest,
} from "./statisticsService";
import StudentClassDetailTables from "./StudentClassDetailTables";
import CourseSummaryCard from "./CourseSummaryCard";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import { toast } from "react-toastify";

const StudentClassOBEAnalytics: React.FC = () => {
  // 1. State cho Form Input
  // Thêm programId vào state khởi tạo
  const [request, setRequest] = useState<StudentClassStatisticsRequest>({
    programId: "", // Mới bổ sung
    studentClassIds: [],
    benchmarkScore: 5, // Mặc định theo backend yêu cầu
    levels: [
      { levelValue: 1, thresholdPercentage: 0, description: "Chưa đạt" },
      { levelValue: 2, thresholdPercentage: 50, description: "Đạt" },
    ],
  });

  const [rawClassIds, setRawClassIds] = useState("");
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // 2. Xử lý logic Form
  const handleCalculate = async () => {
    if (!request.programId || !rawClassIds) {
      alert("Vui lòng nhập đầy đủ Mã chương trình và Danh sách mã lớp!");
      return;
    }
    setLoading(true);
    try {
      const finalRequest = {
        ...request,
        studentClassIds: rawClassIds
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== ""),
      };

      // Gọi đúng service với request đủ programId
      const res =
        await statisticsService.calculateStudentClassesOBE(finalRequest);
      setData(res.data);
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addLevel = () => {
    setRequest({
      ...request,
      levels: [
        ...request.levels,
        {
          levelValue: request.levels.length + 1,
          thresholdPercentage: 0,
          description: "",
        },
      ],
    });
  };

  // 3. Helper hiển thị biểu đồ
  const prepareHistogramData = (
    results: any[] | undefined,
    scoreKey: string,
    filterKey: string,
    filterValue: any,
  ) => {
    const histogram = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: 0,
    }));

    if (!results || !Array.isArray(results)) return histogram;

    const filteredData = results.filter(
      (item) => item[filterKey] === filterValue,
    );

    filteredData.forEach((item) => {
      const val = item[scoreKey];
      if (val !== undefined && val !== null) {
        const roundedScore = Math.min(10, Math.max(0, Math.round(val)));
        histogram[roundedScore].count += 1;
      }
    });
    return histogram;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* --- PHẦN 1: FORM NHẬP LIỆU --- */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-700 border-b pb-2">
          <Users size={24} /> Thống kê OBE theo Lớp Sinh Viên
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Mã Chương Trình (Program ID)
            </label>
            <input
              placeholder="VD: IT001"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={request.programId}
              onChange={(e) =>
                setRequest({ ...request, programId: e.target.value })
              }
            />
          </div>

          {/* BỔ SUNG: Ngưỡng điểm đạt (Benchmark) */}
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Ngưỡng đạt (0-10)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="10"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
              value={request.benchmarkScore}
              onChange={(e) => {
                const val = e.target.value;
                setRequest({
                  ...request,
                  benchmarkScore: val === "" ? ("" as any) : parseFloat(val),
                });
              }}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Danh sách Mã Lớp Sinh Viên (cách nhau bởi dấu phẩy)
            </label>
            <input
              placeholder="VD: DI21V7A1, DI21V7A2"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={rawClassIds}
              onChange={(e) => setRawClassIds(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-dashed">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Cấu hình Ngưỡng Đạt (Levels)
            </label>
            <button
              onClick={addLevel}
              className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={16} /> Thêm Level
            </button>
          </div>
          <div className="space-y-3">
            {request.levels.map((lvl, index) => (
              <div
                key={index}
                className="flex gap-3 items-center animate-in slide-in-from-left-2"
              >
                <div className="bg-white border rounded-lg px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm">
                  Lvl {lvl.levelValue}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="w-20 border rounded-lg p-2 text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={lvl.thresholdPercentage}
                    onChange={(e) => {
                      const newLvls = [...request.levels];
                      newLvls[index].thresholdPercentage =
                        parseInt(e.target.value) || 0;
                      setRequest({ ...request, levels: newLvls });
                    }}
                  />
                  <span className="text-gray-400 font-bold">%</span>
                </div>
                <input
                  placeholder="Mô tả mức độ..."
                  className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={lvl.description}
                  onChange={(e) => {
                    const newLvls = [...request.levels];
                    newLvls[index].description = e.target.value;
                    setRequest({ ...request, levels: newLvls });
                  }}
                />
                <button
                  onClick={() =>
                    setRequest({
                      ...request,
                      levels: request.levels.filter((_, i) => i !== index),
                    })
                  }
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-black text-white tracking-widest transition-all shadow-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 active:scale-[0.98]"
          }`}
        >
          {loading ? "ĐANG TỔNG HỢP DỮ LIỆU..." : "XUẤT BÁO CÁO PO/PLO"}
        </button>
      </div>

      {/* --- PHẦN 2: HIỂN THỊ KẾT QUẢ --- */}
      {data && (
        <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
          {/* --- PHẦN HEADER KẾT QUẢ CHO LỚP/CHƯƠNG TRÌNH --- */}
          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4">
            <div>
              {/* Hiển thị Tên chương trình đào tạo */}
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-800">
                {data.educationProgramName}
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                Mã chương trình:{" "}
                <span className="font-bold text-gray-700">
                  {data.educationProgramId}
                </span>
              </p>
            </div>

            {/* Thẻ số liệu tổng quát */}
            <div className="flex gap-4">
              {/* HIỂN THỊ TỔNG SINH VIÊN TRONG LỚP/KHÓA */}
              <div className="bg-indigo-50 px-8 py-3 rounded-2xl border border-indigo-100 text-center shadow-sm">
                <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mb-1">
                  Tổng sinh viên thống kê
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Users size={20} className="text-indigo-600" />
                  <p className="text-3xl font-black text-indigo-700">
                    {data.totalStudents}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-800">
                KẾT QUẢ PHÂN TÍCH LỚP
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                Tổng hợp PO & PLO toàn khóa học
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-bold">
                Tổng số sinh viên
              </p>
              <p className="text-2xl font-black text-indigo-600">
                {data.totalStudents}
              </p>
            </div>
          </div>

          {/* Table PO & PLO Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <ResultTable
              title="PO RESULTS (Program Outcomes)"
              bgColor="bg-indigo-600"
              data={data.poResults}
              codeKey="poCode"
            />
            <ResultTable
              title="PLO RESULTS (Program Learning Outcomes)"
              bgColor="bg-purple-600"
              data={data.ploResults}
              codeKey="ploCode"
            />
          </div>

          {/* Biểu đồ phổ điểm */}
          <div className="space-y-10">
            {/* Phổ điểm PO */}
            <div>
              <h3 className="text-xl font-black text-indigo-700 mb-6 flex items-center gap-2 uppercase">
                <Send size={20} className="rotate-90" /> Phổ điểm theo PO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.poResults.map((po: any) => (
                  <ChartBox
                    key={po.poCode}
                    title={`PO: ${po.poCode}`}
                    data={prepareHistogramData(
                      data.studentPoResults,
                      "poScore",
                      "poCode",
                      po.poCode,
                    )}
                    color="#4f46e5"
                  />
                ))}
              </div>
            </div>

            {/* Phổ điểm PLO */}
            <div>
              <h3 className="text-xl font-black text-purple-700 mb-6 flex items-center gap-2 uppercase">
                <Send size={20} className="rotate-90" /> Phổ điểm theo PLO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.ploResults.map((plo: any) => (
                  <ChartBox
                    key={plo.ploCode}
                    title={`PLO: ${plo.ploCode}`}
                    data={prepareHistogramData(
                      data.studentPloResults,
                      "ploScore",
                      "ploCode",
                      plo.ploCode,
                    )}
                    color="#9333ea"
                  />
                ))}
              </div>
            </div>
          </div>
          {/* --- PHẦN 3: CHI TIẾT TỪNG MÔN HỌC --- */}
          {data.courseSummaries && data.courseSummaries.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tight">
                <div className="h-8 w-2 bg-slate-800 rounded-full"></div>
                Phân tích chi tiết theo môn học
              </h3>

              {/* Vòng lặp hiển thị danh sách môn học */}
              <div className="space-y-2">
                {data.courseSummaries.map((course: any) => (
                  <CourseSummaryCard key={course.courseId} course={course} />
                ))}
              </div>
            </div>
          )}
          <StudentClassDetailTables data={data} />
        </div>
      )}
    </div>
  );
};

// Sub-component cho Table PO/PLO
const ResultTable = ({ title, bgColor, data, codeKey }: any) => (
  <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
    <div
      className={`${bgColor} text-white p-4 font-black tracking-widest text-sm uppercase`}
    >
      {title}
    </div>
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-bold">
        <tr>
          <th className="p-3 text-left">Mã</th>
          <th className="p-3 text-center">Điểm TB</th>
          <th className="p-3 text-center">Tỉ lệ Đạt</th>
          <th className="p-3 text-right">Mức Độ</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {data?.map((r: any, i: number) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="p-4 font-black text-gray-700">{r[codeKey]}</td>
            <td className="p-4 text-center font-mono">
              {r.averageScore?.toFixed(2)}
            </td>
            <td className="p-4 text-center font-bold text-indigo-600">
              {r.percentage}%
            </td>
            <td className="p-4 text-right">
              <span className="font-black italic px-2 py-1 border-2 border-gray-100 rounded text-gray-500">
                Lvl {r.level}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Sub-component cho Biểu đồ
const ChartBox = ({ title, data, color }: any) => (
  <div className="bg-white p-6 border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <h4 className="text-center font-black text-gray-500 uppercase text-xs mb-6 tracking-widest italic">
      Phổ điểm {title}
    </h4>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="score"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: "bold" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="count" fill={color} radius={[6, 6, 0, 0]} barSize={25}>
            {data.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count > 0 ? color : "#f1f5f9"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default StudentClassOBEAnalytics;
