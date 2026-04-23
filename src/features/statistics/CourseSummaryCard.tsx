/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  ListChecks,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import type { CourseSummary } from "./statisticsService";

interface Props {
  course: CourseSummary;
}

const CourseSummaryCard: React.FC<Props> = ({ course }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-4 hover:shadow-md transition-all duration-300">
      {/* Header môn học - Có thể click để đóng/mở */}
      <div
        className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
          isOpen
            ? "bg-slate-800 text-white"
            : "bg-white text-slate-800 hover:bg-slate-50"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`${isOpen ? "bg-white/20" : "bg-slate-100"} p-2 rounded-lg transition-colors`}
          >
            <BookOpen
              size={20}
              className={isOpen ? "text-white" : "text-slate-600"}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-widest opacity-70">
                {course.courseId}
              </span>
              {/* Badge Level tổng quát nếu cần, ở đây hiển thị tên môn */}
            </div>
            <h3 className="text-base font-bold leading-tight">
              {course.courseName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase opacity-60">
              Trạng thái:
            </span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded border ${isOpen ? "border-white/30" : "border-slate-200"}`}
            >
              {isOpen ? "ĐANG XEM CHI TIẾT" : "NHẤN ĐỂ XEM"}
            </span>
          </div>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Nội dung chi tiết - Hiển thị khi isOpen = true */}
      {isOpen && (
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
          {/* Cột 1: Assessments */}
          <MiniResultTable
            title="Thành phần điểm"
            icon={<ListChecks size={16} />}
            data={course.assessments}
            codeKey="assessmentName"
          />

          {/* Cột 2: CLO */}
          <MiniResultTable
            title="Kết quả CLO"
            icon={<CheckCircle size={16} />}
            data={course.clos}
            codeKey="cloCode"
            color="text-emerald-600"
            borderColor="border-emerald-100"
          />

          {/* Cột 3: CO */}
          <MiniResultTable
            title="Kết quả CO"
            icon={<BarChart2 size={16} />}
            data={course.cos}
            codeKey="coCode"
            color="text-amber-600"
            borderColor="border-amber-100"
          />
        </div>
      )}
    </div>
  );
};

// Component bảng nhỏ hiển thị Level
const MiniResultTable = ({
  title,
  icon,
  data,
  codeKey,
  color = "text-indigo-600",
  borderColor = "border-gray-100",
}: any) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 mb-3 text-gray-500 font-bold text-[11px] uppercase tracking-widest border-b pb-2">
      {icon} {title}
    </div>
    <div className="space-y-2">
      {data?.map((item: any, idx: number) => (
        <div
          key={idx}
          className={`flex items-center justify-between bg-gray-50 p-3 rounded-xl border ${borderColor} transition-all hover:bg-white hover:shadow-sm`}
        >
          <div className="flex flex-col">
            <span className="font-bold text-gray-700 text-sm">
              {item[codeKey]}
            </span>
            {/* HIỂN THỊ LEVEL Ở ĐÂY */}
            <div className="flex items-center gap-1 mt-1">
              <Award size={10} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase italic">
                Level {item.level || 0}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className={`font-black text-base ${color}`}>
              {item.averageScore?.toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              Đạt: {item.percentage}%
            </div>
          </div>
        </div>
      ))}
      {(!data || data.length === 0) && (
        <div className="text-xs text-gray-400 italic py-4 text-center">
          Không có dữ liệu
        </div>
      )}
    </div>
  </div>
);

export default CourseSummaryCard;
