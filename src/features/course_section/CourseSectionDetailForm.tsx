import { useState } from "react";
import { Save, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import logData from "../../utils/logData";
import courseSectionService, {
  type CourseSectionResponse,
  type CourseSectionUpdateRequest,
} from "../../services/courseSectionService";

interface CourseSectionDetailFormProps {
  data: CourseSectionResponse;
}

const CourseSectionDetailForm = ({ data }: CourseSectionDetailFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(
    String(data.id).startsWith("new_") ? true : false,
  );

  // Khởi tạo state từ props data
  const [formData, setFormData] = useState<CourseSectionResponse>(() => ({
    ...data,
    id: data.id || "",
    semesterTerm: data.semesterTerm || 1,
    semesterAcademicYear: data.semesterAcademicYear || "",
    courseId: data.courseId || "",
    courseVersionName: data.courseVersionName || "",
    versionNumber: data.versionNumber || 1,
    lecturerId: data.lecturerId || "",
    lecturerName: data.lecturerName || "",
    subDepartmentName: data.subDepartmentName || "",
  }));

  const handleChange = (
    key: keyof CourseSectionResponse,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Chuẩn bị payload theo interface UpdateRequest (Mapping dữ liệu từ Form sang DTO)
      const payload: CourseSectionUpdateRequest = {
        id: formData.id,
        semesterTerm: Number(formData.semesterTerm),
        semesterAcademicYear: formData.semesterAcademicYear,
        courseId: formData.courseId,
        versionNumber: Number(formData.versionNumber),
        lecturerId: formData.lecturerId,
      };

      console.log("Dữ liệu gửi đi (CourseSection):");
      logData(payload);

      // Xử lý logic Create hoặc Update dựa trên trạng thái isNew
      const response = isNew
        ? await courseSectionService.create(payload)
        : await courseSectionService.update(payload.id, payload);

      if (response.data) {
        setFormData(response.data);
      }
      setIsNew(false);

      if (response.status === 200 || response.status === 201) {
        console.log("Dữ liệu nhận về");
        logData(response);
        toast.success("Cập nhật thông tin lớp học phần thành công!");
        setIsEditing(false);
      }
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message || "Có lỗi xảy ra khi lưu lớp học phần");
    }
  };

  // Helper render input đồng nhất style với StudentClassDetailForm
  const renderField = (
    label: string,
    key: keyof CourseSectionResponse,
    editable: boolean = true,
    type: "text" | "number" = "text",
  ) => {
    const isFieldEditing = isEditing && editable;

    return (
      <div className="flex items-baseline gap-2">
        <span className="min-w-[220px] text-slate-600">- {label}:</span>
        {isFieldEditing ? (
          <input
            type={type}
            className="flex-1 border-b border-dotted border-black outline-none px-1 bg-yellow-50 font-sans font-medium"
            value={formData[key] as string | number}
            onChange={(e) =>
              handleChange(
                key,
                type === "number" ? Number(e.target.value) : e.target.value,
              )
            }
          />
        ) : (
          <span className="font-bold">
            {formData[key]?.toString() || "---"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-[600px] font-sans text-slate-900 shadow-sm border border-slate-100">
      {/* Nút điều khiển */}
      <div className="flex justify-end mb-8 no-print">
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium border transition-colors ${
            isEditing
              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
          {isEditing ? "Lưu thay đổi" : "Sửa thông tin"}
        </button>
      </div>

      {/* Tiêu đề */}
      <div className="text-center mb-12">
        <h2 className="text-xl font-bold uppercase tracking-widest">
          Chi tiết lớp học phần (OBE)
        </h2>
        <div className="w-40 h-px bg-black mx-auto mt-2"></div>
      </div>

      {/* Nội dung chính */}
      <div className="space-y-8 text-[17px] leading-relaxed">
        {/* 1. Thông tin hành chính lớp học */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4 text-blue-800">
            1. Thông tin định danh lớp học
          </div>
          <div className="ml-4 space-y-3">
            {renderField("Mã lớp học phần (ID)", "id", isNew)}
            {renderField("Học kỳ (1/2/3)", "semesterTerm", true, "number")}
            {renderField("Năm học (VD: 2025-2026)", "semesterAcademicYear")}
          </div>
        </section>

        {/* 2. Thông tin học phần & Giảng viên */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4 text-blue-800">
            2. Học phần & Giảng viên phụ trách
          </div>
          <div className="ml-4 space-y-3">
            {renderField("Mã học phần", "courseId", isNew)}
            {renderField("Số hiệu phiên bản", "versionNumber", isNew, "number")}
            <div className="flex items-baseline gap-2 italic text-slate-500 text-sm ml-2">
              <span>
                * Tên phiên bản: {formData.courseVersionName || "Chưa xác định"}
              </span>
            </div>
            <div className="mt-4">
              {renderField("Mã giảng viên", "lecturerId")}
              <div className="flex items-baseline gap-2 mt-1">
                <span className="min-w-[220px] text-slate-600">
                  - Họ tên giảng viên:
                </span>
                <span className="font-medium text-slate-800 italic">
                  {formData.lecturerName || "---"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Đơn vị quản lý */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4 text-blue-800">
            3. Đơn vị quản lý
          </div>
          <div className="ml-4 space-y-3 italic text-slate-700">
            <div className="flex items-baseline gap-2">
              <span className="min-w-[220px]">- Thuộc Bộ môn:</span>
              <span>{formData.subDepartmentName || "Chưa có thông tin"}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-slate-100 text-sm text-slate-400 text-center italic">
        Dữ liệu được trích xuất từ hệ thống quản lý học thuật OBE
      </div>
    </div>
  );
};

export default CourseSectionDetailForm;
