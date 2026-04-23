import { GraduationCap, LayoutDashboard, Users } from "lucide-react";
import CourseOBEAnalytics from "./CourseOBEAnalytics";
import StudentClassOBEAnalytics from "./StudentClassOBEAnalytics";
import { useState } from "react";

const OBEDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"course" | "class">("course");

  return (
    // h-screen: Cố định chiều cao bằng toàn bộ màn hình
    // overflow-hidden: Chặn con lăn tổng của cả trang web
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Menu Điều Hướng - Chiều cao cố định (h-16) */}
      <div className="bg-white shadow-sm z-10 flex-none">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 text-blue-700 font-black text-xl">
              <LayoutDashboard size={28} />
              <span>OBE SYSTEM</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("course")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === "course"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <GraduationCap size={20} /> Phân tích Học phần
              </button>

              <button
                onClick={() => setActiveTab("class")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === "class"
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Users size={20} /> Phân tích Lớp SV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung Component - Tự động lấp đầy phần còn lại (flex-1) */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 max-w-7xl mx-auto w-full">
          {/* Tab Học phần - Con lăn riêng biệt */}
          <div
            className={`${
              activeTab === "course" ? "flex" : "hidden"
            } flex-col h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300`}
          >
            <div className="animate-in fade-in duration-500">
              <CourseOBEAnalytics />
            </div>
          </div>

          {/* Tab Lớp SV - Con lăn riêng biệt */}
          <div
            className={`${
              activeTab === "class" ? "flex" : "hidden"
            } flex-col h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300`}
          >
            <div className="animate-in fade-in duration-500">
              <StudentClassOBEAnalytics />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OBEDashboard;
