import { useState } from "react";
import { Save, Edit2, X } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import studentService from "../../services/studentService";
import type {
  StudentResponse,
  StudentUpdateRequest,
  StudentCreateRequest,
} from "../../services/studentService";
import logData from "../../utils/logData";

interface StudentDetailFormProps {
  data: StudentResponse;
  onSave?: (updatedData: StudentResponse) => void;
}

const StudentDetailForm = ({ data, onSave }: StudentDetailFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(
    String(data.id).startsWith("new_") ? true : false,
  );
  const [formData, setFormData] = useState<StudentResponse>(() => ({
    id: data.id || "",
    fullName: data.fullName || "",
    gender: data.gender || "Nam",
    // Khởi tạo tất cả các mảng để tránh lỗi .join() hoặc .map()
    studentClassesId: data.studentClassesId || [],
    educationProgramId: data.educationProgramId || [],
    educationProgramName: data.educationProgramName || [],
    subDepartmentId: data.subDepartmentId || [],
    subDepartmentName: data.subDepartmentName || [],
    departmentId: data.departmentId || [],
    departmentName: data.departmentName || [],
  }));

  // State tạm để nhập mã lớp mới trước khi thêm vào danh sách
  const [newClassInput, setNewClassInput] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: keyof StudentResponse, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Thêm mã lớp vào danh sách
  const addClassId = () => {
    if (
      newClassInput.trim() &&
      !formData.studentClassesId.includes(newClassInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        studentClassesId: [...prev.studentClassesId, newClassInput.trim()],
      }));
      setNewClassInput("");
    }
  };

  // Xóa mã lớp khỏi danh sách
  const removeClassId = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      studentClassesId: prev.studentClassesId.filter((item) => item !== id),
    }));
  };

  const handleSave = async () => {
    try {
      const payload: StudentCreateRequest | StudentUpdateRequest = {
        id: formData.id,
        fullName: formData.fullName,
        gender: formData.gender,
        studentClassesId: formData.studentClassesId,
      };

      console.log("Giữ liệu trước khi gửi");
      logData(payload);

      const response = isNew
        ? await studentService.create(payload as StudentCreateRequest)
        : await studentService.update(
            payload.id,
            payload as StudentUpdateRequest,
          );

      if (response.status === 200 || response.status === 201) {
        toast.success("Cập nhật thông tin sinh viên thành công!");
        setIsEditing(false);
        setIsNew(false);
        if (response.data) {
          setFormData(response.data);
          onSave?.(response.data);
        }
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi lưu");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-[600px] shadow-sm text-slate-900">
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
          {isEditing ? "Lưu hồ sơ" : "Chỉnh sửa"}
        </button>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-xl font-bold uppercase tracking-widest">
          Hồ sơ chi tiết sinh viên
        </h2>
        <div className="w-40 h-px bg-black mx-auto mt-2"></div>
      </div>

      <div className="space-y-8 text-[17px]">
        {/* 1. Thông tin cá nhân */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">
            1. Thông tin cá nhân
          </div>
          <div className="ml-4 space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">
                - Mã số sinh viên:
              </span>
              {isNew && isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1"
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                />
              ) : (
                <span className="font-bold">{formData.id}</span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">- Họ và tên:</span>
              {isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
              ) : (
                <span className="font-bold">{formData.fullName}</span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">- Giới tính:</span>
              {isEditing ? (
                <select
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              ) : (
                <span className="font-bold">{formData.gender}</span>
              )}
            </div>
          </div>
        </section>

        {/* 2. Đơn vị đào tạo (Xử lý mảng/Set) */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">
            2. Đơn vị đào tạo
          </div>
          <div className="ml-4 space-y-4">
            <div className="flex items-start gap-2">
              <span className="min-w-[200px] text-slate-600">
                - Các lớp tham gia:
              </span>
              <div className="flex-1 flex flex-wrap gap-2">
                {formData.studentClassesId.map((classId) => (
                  <span
                    key={classId}
                    className="bg-slate-100 px-2 py-1 rounded text-sm font-bold flex items-center gap-1"
                  >
                    {classId}
                    {isEditing && (
                      <X
                        size={12}
                        className="cursor-pointer text-red-500"
                        onClick={() => removeClassId(classId)}
                      />
                    )}
                  </span>
                ))}
                {isEditing && (
                  <div className="flex gap-1">
                    <input
                      placeholder="Nhập mã lớp..."
                      className="text-sm border-b border-black outline-none w-24 bg-yellow-50"
                      value={newClassInput}
                      onChange={(e) => setNewClassInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addClassId()}
                    />
                    <button
                      onClick={addClassId}
                      className="text-xs bg-blue-100 px-1 rounded"
                    >
                      +
                    </button>
                  </div>
                )}
                {formData.studentClassesId.length === 0 && !isEditing && (
                  <span className="italic">Chưa tham gia lớp nào</span>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">
                - Chương trình đào tạo:
              </span>
              <span className="font-medium italic">
                {formData.educationProgramName?.join(", ") || "---"}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">
                - Thuộc khoa:
              </span>
              <span className="font-medium italic">
                {formData.departmentName?.join(", ") || "---"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDetailForm;
