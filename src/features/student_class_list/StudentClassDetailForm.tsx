import { useRef, useState } from "react";
import { Save, Edit2, Upload, FileDown } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import logData from "../../utils/logData";
import studentClassService, {
  type StudentClassResponse,
  type StudentClassUpdateRequest,
} from "../../services/studentClassService";
import excelService from "../../services/excelService";

interface StudentClassDetailFormProps {
  data: StudentClassResponse;
  onSave?: (updatedData: StudentClassResponse) => void;
}

const StudentClassDetailForm = ({
  data,
  onSave,
}: StudentClassDetailFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(
    String(data.id).startsWith("new_") ? true : false,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Khởi tạo state từ props data
  const [formData, setFormData] = useState<StudentClassResponse>(() => ({
    ...data,
    id: data.id || "",
    name: data.name || "",
    schoolYearId: data.schoolYearId || "",
    educationProgramId: data.educationProgramId || "",
    educationProgramName: data.educationProgramName || "",
    subDepartmentName: data.subDepartmentName || "",
    departmentName: data.departmentName || "",
  }));

  const handleDownloadTemplate = async () => {
    try {
      await excelService.downloadStudentTemplate();
      toast.info("Đang tải file mẫu...");
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await excelService.importStudents(formData.id, file);
      if (response.status === 200) {
        toast.success(response.message || "Import sinh viên thành công!");
        // Reset file input để có thể chọn lại cùng 1 file nếu cần
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message || "Lỗi khi import file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (key: keyof StudentClassResponse, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Chuẩn bị payload theo interface UpdateRequest
      const payload: StudentClassUpdateRequest = {
        id: formData.id,
        name: formData.name,
        schoolYearId: formData.schoolYearId,
        educationProgramId: formData.educationProgramId,
      };

      console.log("Dữ liệu gửi đi:");
      logData(payload);

      const response = isNew
        ? await studentClassService.create(payload)
        : await studentClassService.update(payload.id, payload);

      setIsNew(false);

      if (response.status === 200 || response.status === 201) {
        toast.success("Cập nhật thông tin lớp thành công!");
        setIsEditing(false);

        if (response.data) {
          setFormData(response.data);
          onSave?.(response.data);
        }
      }
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message || "Có lỗi xảy ra khi lưu");
    }
  };

  // Helper render input đồng nhất style với CourseDetail
  const renderField = (
    label: string,
    key: keyof StudentClassResponse,
    editable: boolean = true,
  ) => {
    const isFieldEditing = isEditing && editable;

    return (
      <div className="flex items-baseline gap-2">
        <span className="min-w-[200px] text-slate-600">- {label}:</span>
        {isFieldEditing ? (
          <input
            className="flex-1 border-b border-dotted border-black outline-none px-1 bg-yellow-50 font-sans font-medium"
            value={formData[key] as string}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        ) : (
          <span className="font-bold">
            {(formData[key] as string) || "---"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-[600px] font-sans text-slate-900 shadow-sm">
      {/* Nút điều khiển */}
      {/* Nút điều khiển */}
      <div className="flex justify-between items-center mb-8 no-print">
        {/* Nhóm nút Excel */}
        <div className="flex gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
          >
            <FileDown size={14} /> Tải mẫu
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            className="hidden"
            accept=".xlsx, .xls"
          />

          <button
            disabled={isUploading || isNew}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
              isUploading
                ? "bg-slate-100 text-slate-400 border-slate-200"
                : "border-orange-500 text-orange-500 hover:bg-orange-50"
            } ${isNew ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Upload size={14} />
            {isUploading ? "Đang xử lý..." : "Import Excel"}
          </button>
        </div>

        {/* Nút Lưu/Sửa cũ */}
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
          Thông tin chi tiết lớp sinh viên
        </h2>
        <div className="w-40 h-px bg-black mx-auto mt-2"></div>
      </div>

      {/* Nội dung chính */}
      <div className="space-y-8 text-[17px] leading-relaxed">
        {/* 1. Thông tin cơ bản */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">
            1. Thông tin hành chính
          </div>
          <div className="ml-4 space-y-3">
            {renderField("Mã lớp (ID)", "id", isNew ? true : false)}{" "}
            {/* Thường ID không cho sửa */}
            {renderField("Tên lớp học", "name")}
            {renderField("Khóa / Niên khóa", "schoolYearId")}
          </div>
        </section>

        {/* 2. Chương trình đào tạo */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">
            2. Chương trình đào tạo
          </div>
          <div className="ml-4 space-y-3">
            {renderField("Mã chương trình", "educationProgramId")}
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">
                - Tên chương trình:
              </span>
              <span className="font-medium text-slate-800 italic">
                {formData.educationProgramName || "Chưa xác định"}
              </span>
            </div>
          </div>
        </section>

        {/* 3. Đơn vị quản lý */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">
            3. Đơn vị quản lý
          </div>
          <div className="ml-4 space-y-3 italic text-slate-700">
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px]">- Thuộc Bộ môn:</span>
              <span>{formData.subDepartmentName}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px]">- Thuộc Khoa:</span>
              <span>{formData.departmentName}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer ghi chú hoặc thông tin thêm nếu cần */}
      <div className="mt-20 pt-8 border-t border-slate-100 text-sm text-slate-400 text-center italic">
        Dữ liệu được trích xuất từ hệ thống quản lý sinh viên OBE
      </div>
    </div>
  );
};

export default StudentClassDetailForm;
