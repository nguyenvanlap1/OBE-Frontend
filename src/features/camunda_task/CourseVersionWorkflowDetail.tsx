import { useState, useEffect } from "react";
import {
  FileText,
  User,
  Activity,
  Calendar,
  Hash,
  Bookmark,
} from "lucide-react";
import type { ProcessInstanceResponseDTO } from "./service/workflowCommonService";
import CourseWorkflowInputForm from "./CourseWorkflowInputForm";

interface CourseVersionWorkflowDetailProps {
  data: ProcessInstanceResponseDTO;
}

const CourseVersionWorkflowDetail = ({
  data,
}: CourseVersionWorkflowDetailProps) => {
  // 1. Dùng useState để quản lý dữ liệu hiển thị (có thể chỉnh sửa sau này)
  const [workflowData, setWorkflowData] =
    useState<ProcessInstanceResponseDTO>(data);

  // 2. useEffect để cập nhật lại state khi người dùng chọn tab/quy trình khác
  useEffect(() => {
    setWorkflowData(data);
  }, [data]);

  useEffect(() => {
    // LOG DEBUG: Kiểm tra dữ liệu thô từ props truyền vào
    console.group("--- Debug Workflow Data ---");
    console.log("Dữ liệu gốc (props data):", data);
    console.log("Giá trị isMyTask:", data?.isMyTask);
    console.log("Kiểu dữ liệu của isMyTask:", typeof data?.isMyTask);
    console.log(
      "Người đang được gán (currentAssignee):",
      data?.currentAssignee,
    );
    console.groupEnd();

    // Thêm đoạn này để soi lỗi
    console.group("--- Kiểm tra điều kiện hiển thị Form ---");
    console.log("1. isMyTask:", workflowData.isMyTask);
    console.log("2. processId hiện tại:", workflowData.processId);
    console.log(
      "   So sánh với target:",
      workflowData.processId === "update_course_version_task",
    );
    console.log("3. taskId:", workflowData.taskId);
    console.groupEnd();

    setWorkflowData(data);
  }, [data]);

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-[700px] shadow-sm text-slate-900 border border-slate-100 my-4 rounded-sm">
      {/* Header Hồ sơ */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 right-0 opacity-10">
          <Bookmark size={80} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-800">
          Thông tin chi tiết quy trình
        </h2>
        <p className="text-slate-500 mt-2 font-medium">
          Hệ thống quản lý Outcome-Based Education (OBE)
        </p>
        <div className="w-32 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="space-y-12 text-[17px]">
        {/* 1. Trạng thái thực thi */}
        <section>
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-4 mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-wide">
            <Activity size={20} className="text-blue-600" />
            1. Trạng thái thực thi
          </div>

          <div className="grid grid-cols-1 gap-6 ml-6">
            <div className="flex items-center gap-4 group">
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                <Hash
                  size={18}
                  className="text-slate-400 group-hover:text-blue-500"
                />
              </div>
              <span className="min-w-[180px] text-slate-500">
                Mã tiến trình (ID):
              </span>
              <span className="font-mono text-sm bg-slate-100 px-3 py-1 rounded border border-slate-200">
                {workflowData.processInstanceId}
              </span>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                <FileText
                  size={18}
                  className="text-slate-400 group-hover:text-blue-500"
                />
              </div>
              <span className="min-w-[180px] text-slate-500">
                Tên quy trình:
              </span>
              <span className="font-bold text-slate-700">
                {workflowData.processName}
              </span>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                <Activity
                  size={18}
                  className="text-slate-400 group-hover:text-blue-500"
                />
              </div>
              <span className="min-w-[180px] text-slate-500">
                Bước hiện tại:
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">
                {workflowData.taskName?.toUpperCase()}
              </span>
            </div>
          </div>
        </section>

        {/* 2. Nội dung thay đổi (Mockup) */}
        <section>
          <div className="font-bold text-lg border-l-4 border-orange-500 pl-4 mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-wide">
            <FileText size={20} className="text-orange-500" />
            2. Nội dung thay đổi
          </div>
          <div className="ml-6">
            <div className="p-6 bg-slate-50 border-l-2 border-slate-200 rounded-r-xl italic text-slate-600 leading-relaxed shadow-sm">
              Dữ liệu chi tiết về phiên bản học phần sẽ được tải tại đây.
            </div>
          </div>
        </section>

        {/* 3. Trách nhiệm xử lý - ĐÃ SỬA LOGIC DÙNG myTask */}
        <section>
          <div className="font-bold text-lg border-l-4 border-purple-600 pl-4 mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-wide">
            <User size={20} className="text-purple-600" />
            3. Trách nhiệm xử lý
          </div>

          <div className="grid grid-cols-1 gap-6 ml-6">
            <div className="flex items-center gap-4">
              <span className="min-w-[180px] text-slate-500">
                Vai trò của bạn:
              </span>
              {workflowData.isMyTask ? (
                <div className="flex items-center gap-2 text-orange-600 font-black italic animate-pulse">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  BẠN LÀ NGƯỜI DUYỆT BƯỚC NÀY
                </div>
              ) : (
                <span className="text-slate-400 font-medium">
                  Bạn không có quyền xử lý ở bước hiện tại
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 group">
              <span className="min-w-[180px] text-slate-500">
                Người thực hiện:
              </span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 uppercase">
                  {workflowData.currentAssignee?.substring(0, 2) || "SY"}
                </div>
                <span className="font-semibold text-slate-700">
                  {workflowData.isMyTask
                    ? "Bạn (admin)"
                    : workflowData.currentAssignee || "Hệ thống"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="min-w-[180px] text-slate-500">
                Thời hạn dự kiến:
              </span>
              <span className="text-slate-700">
                Trong vòng 24h kể từ khi nhận task
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-sm italic">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          Ngày khởi tạo:{" "}
          {new Date(workflowData.createTime).toLocaleDateString("vi-VN")}
        </div>
        <div>Mã định danh: {workflowData.taskDefinitionKey || "N/A"}</div>
      </div>
      {workflowData.isMyTask &&
        workflowData.processDefinitionKey === "update_course_version_task" &&
        workflowData.taskId && ( // Thêm kiểm tra taskId ở đây
          <CourseWorkflowInputForm taskId={workflowData.taskId} />
        )}
    </div>
  );
};

export default CourseVersionWorkflowDetail;
