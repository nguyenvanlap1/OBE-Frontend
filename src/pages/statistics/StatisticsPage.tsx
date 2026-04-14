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
import {
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  Send,
  Plus,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import {
  type CourseClassStatisticsRequest,
  type CourseSectionAnalyticsResponse,
  statisticsService,
} from "./statisticsService";
import StudentDetailTables from "./StudentDetailTables";

const OBEAnalytics: React.FC = () => {
  // 1. State cho Form Input
  const [request, setRequest] = useState<CourseClassStatisticsRequest>({
    courseId: "",
    versionNumber: 1,
    courseSectionIds: [],
    sectionAssessmentCodes: [],
    benchmarkScore: 5,
    levels: [
      { levelValue: 1, thresholdPercentage: 0, description: "Chưa đạt" },
      { levelValue: 2, thresholdPercentage: 50, description: "Đạt" },
    ],
  });

  const [rawSectionIds, setRawSectionIds] = useState("");
  const [data, setData] = useState<CourseSectionAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    assessment: true,
    clo: true,
    co: true,
  });

  // 2. Xử lý logic Form
  const handleCalculate = async () => {
    if (!request.courseId || !rawSectionIds) {
      alert("Vui lòng nhập Mã học phần và Danh sách lớp!");
      return;
    }
    setLoading(true);
    try {
      const finalRequest = {
        ...request,
        courseSectionIds: rawSectionIds
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== ""),
      };
      console.log(finalRequest);
      const res = await statisticsService.calculateOBE(finalRequest);
      console.log(res);
      setData(res.data);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi kết nối server!");
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

  // 3. Helper hiển thị biểu đồ an toàn
  // Thêm tham số filterValue và filterKey
  const prepareHistogramData = (
    results: any[] | undefined,
    scoreKey: string,
    filterKey?: string,
    filterValue?: any,
  ) => {
    const histogram = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: 0,
    }));

    if (!results || !Array.isArray(results)) return histogram;

    // Lọc dữ liệu theo mã (AssessmentCode, CLOCode, hoặc COCode)
    const filteredData =
      filterKey && filterValue
        ? results.filter((item) => item[filterKey] === filterValue)
        : results;

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
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-700 border-b pb-2">
          <LayoutDashboard size={24} /> Cấu hình phân tích OBE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Mã Học Phần (courseId)
            </label>
            <input
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="VD: CT240"
              value={request.courseId}
              onChange={(e) =>
                setRequest({ ...request, courseId: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Phiên bản
            </label>
            <input
              type="number"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              value={request.versionNumber}
              onChange={(e) =>
                setRequest({
                  ...request,
                  versionNumber: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Ngưỡng điểm đạt
            </label>
            <input
              type="number"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              value={request.benchmarkScore}
              onChange={(e) =>
                setRequest({
                  ...request,
                  benchmarkScore: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Danh sách mã lớp (phân cách bằng dấu phẩy)
          </label>
          <textarea
            placeholder="VD: L01, L02, L05"
            rows={2}
            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            value={rawSectionIds}
            onChange={(e) => setRawSectionIds(e.target.value)}
          />
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-dashed">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Cấu hình Level
            </label>
            <button
              onClick={addLevel}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-blue-700 transition-colors shadow-sm"
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
                <div className="bg-white border rounded-lg px-4 py-2 text-sm font-bold text-blue-600 shadow-sm">
                  Lvl {lvl.levelValue}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="w-20 border rounded-lg p-2 text-center focus:ring-2 focus:ring-blue-500 outline-none"
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
                  placeholder="Mô tả mức độ đạt được..."
                  className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
          className={`w-full py-3.5 rounded-xl font-black text-white tracking-widest transition-all shadow-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.98]"}`}
        >
          {loading ? "ĐANG XỬ LÝ DỮ LIỆU..." : "CHẠY PHÂN TÍCH OBE"}
        </button>
      </div>

      {/* --- PHẦN 2: HIỂN THỊ KẾT QUẢ --- */}
      {data && (
        <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">
                {data.courseName}
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                Hệ thống phân tích OBE Dashboard
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div className="px-4 border-r">
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Tổng SV
                </p>
                <p className="text-xl font-black">{data.totalStudents}</p>
              </div>
              <div className="px-4">
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Benchmark
                </p>
                <p className="text-xl font-black text-blue-600">
                  {data.benchmark}%
                </p>
              </div>
            </div>
          </div>

          {/* Table Assessment */}
          <div className="mb-8 overflow-hidden rounded-xl border shadow-sm">
            <div
              className="bg-gray-800 text-white p-4 flex justify-between items-center cursor-pointer"
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  assessment: !openSections.assessment,
                })
              }
            >
              <span className="font-bold flex items-center gap-2">
                <TableIcon size={20} /> ASSESSMENT RESULTS
              </span>
              {openSections.assessment ? <ChevronUp /> : <ChevronDown />}
            </div>
            {openSections.assessment && (
              <div className="bg-white overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="p-4 border-b text-left">Code</th>
                      <th className="p-4 border-b text-left">Tên Đánh Giá</th>
                      <th className="p-4 border-b text-center">SV Đạt</th>
                      <th className="p-4 border-b text-center">Tỉ lệ</th>
                      <th className="p-4 border-b text-center">Level</th>
                      <th className="p-4 border-b text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.assessmentResults?.map((r, i) => (
                      <tr
                        key={i}
                        className="hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-blue-600">
                          {r.assessmentCode}
                        </td>
                        <td className="p-4 font-semibold">
                          {r.assessmentName}
                        </td>
                        <td className="p-4 text-center">{r.studentsPassed}</td>
                        <td className="p-4 text-center">
                          <span className="font-black">{r.percentage}%</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black italic shadow-sm">
                            Level {r.level}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-xs italic">
                          {r.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CLO & CO Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <ResultTable
              title="CLO RESULTS"
              bgColor="bg-emerald-600"
              data={data.cloResults}
              codeKey="cloCode"
            />
            <ResultTable
              title="CO RESULTS"
              bgColor="bg-orange-600"
              data={data.coResults}
              codeKey="coCode"
            />
          </div>

          {/* Biểu đồ phổ điểm */}
          {/* --- BIỂU ĐỒ PHỔ ĐIỂM CHI TIẾT --- */}
          <div className="space-y-10">
            {/* 1. Phổ điểm theo từng Assessment */}
            <div>
              <h3 className="text-xl font-black text-blue-700 mb-6 flex items-center gap-2 uppercase">
                <Send size={20} className="rotate-90" /> Phổ điểm theo bài đánh
                giá
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.assessmentResults.map((asm) => (
                  <ChartBox
                    key={asm.assessmentCode}
                    title={asm.assessmentName}
                    data={prepareHistogramData(
                      data.studentAssessmentResults,
                      "score",
                      "assessmentCode",
                      asm.assessmentCode,
                    )}
                    color="#3b82f6"
                  />
                ))}
              </div>
            </div>

            {/* 2. Phổ điểm theo từng CLO */}
            <div>
              <h3 className="text-xl font-black text-emerald-700 mb-6 flex items-center gap-2 uppercase">
                <Send size={20} className="rotate-90" /> Phổ điểm theo CLO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.cloResults.map((clo) => (
                  <ChartBox
                    key={clo.cloCode}
                    title={`CLO: ${clo.cloCode}`}
                    data={prepareHistogramData(
                      data.studentCloResults,
                      "cloScore",
                      "cloCode",
                      clo.cloCode,
                    )}
                    color="#10b981"
                  />
                ))}
              </div>
            </div>

            {/* 3. Phổ điểm theo từng CO */}
            <div>
              <h3 className="text-xl font-black text-orange-700 mb-6 flex items-center gap-2 uppercase">
                <Send size={20} className="rotate-90" /> Phổ điểm theo CO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.coResults.map((co) => (
                  <ChartBox
                    key={co.coCode}
                    title={`CO: ${co.coCode}`}
                    data={prepareHistogramData(
                      data.studentCoResults,
                      "coScore",
                      "coCode",
                      co.coCode,
                    )}
                    color="#f59e0b"
                  />
                ))}
              </div>
            </div>
          </div>

          <StudentDetailTables data={data} />
        </div>
      )}
    </div>
  );
};

// Sub-component cho Table CLO/CO
const ResultTable = ({ title, bgColor, data, codeKey }: any) => (
  <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
    <div
      className={`${bgColor} text-white p-4 font-black tracking-widest text-sm`}
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
            <td className="p-4 font-black">{r[codeKey]}</td>
            <td className="p-4 text-center font-mono">
              {r.averageScore?.toFixed(2)}
            </td>
            <td className="p-4 text-center font-bold text-blue-600">
              {r.percentage}%
            </td>
            <td className="p-4 text-right">
              <span className="font-black italic px-2 py-1 border-2 border-gray-100 rounded text-gray-600">
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

export default OBEAnalytics;
