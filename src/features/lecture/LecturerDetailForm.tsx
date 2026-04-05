import { useState } from "react";
import { Save, Edit2, X, Plus } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import lecturerService from "../../services/lecturerService";
import type {
  LecturerResponse,
  LecturerRequest,
} from "../../services/lecturerService";
import logData from "../../utils/logData";

interface LecturerDetailFormProps {
  data: LecturerResponse;
  onSave?: (updatedData: LecturerResponse) => void;
}

const LecturerDetailForm = ({ data, onSave }: LecturerDetailFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(
    String(data.id).startsWith("new_") ? true : false,
  );

  const [formData, setFormData] = useState<LecturerResponse>(() => ({
    id: data.id || "",
    fullName: data.fullName || "",
    gender: data.gender || "Nam",
    subDepartmentIds: data.subDepartmentIds || [],
    subDepartmentNames: data.subDepartmentNames || [], // Thêm dòng này
  }));

  // State tạm để nhập mã bộ môn mới
  const [newSubDeptInput, setNewSubDeptInput] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: keyof LecturerResponse, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addSubDeptId = () => {
    const val = newSubDeptInput.trim();
    if (val && !formData.subDepartmentIds.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        subDepartmentIds: [...prev.subDepartmentIds, val],
      }));
      setNewSubDeptInput("");
    }
  };

  const removeSubDeptId = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subDepartmentIds: prev.subDepartmentIds.filter((item) => item !== id),
    }));
  };

  const handleSave = async () => {
    try {
      const payload: LecturerRequest = {
        id: formData.id,
        fullName: formData.fullName,
        gender: formData.gender,
        subDepartmentIds: formData.subDepartmentIds,
      };

      console.log("Dữ liệu gửi đi (Lecturer):");
      logData(payload);

      const response = isNew
        ? await lecturerService.create(payload)
        : await lecturerService.update(payload.id, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Cập nhật thông tin giảng viên thành công!");
        setIsEditing(false);
        setIsNew(false);
        if (response.data) {
          setFormData(response.data);
          onSave?.(response.data);
        }
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message || "Có lỗi xảy ra khi lưu giảng viên");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-[600px] shadow-sm text-slate-900 border border-slate-100 font-sans">
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
          {isEditing ? "Lưu thông tin" : "Chỉnh sửa"}
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-xl font-bold uppercase tracking-widest text-blue-900">
          Hồ sơ chi tiết giảng viên
        </h2>
        <div className="w-40 h-px bg-blue-900 mx-auto mt-2"></div>
      </div>

      <div className="space-y-10 text-[17px]">
        {/* 1. Thông tin cá nhân */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4 text-blue-800">
            1. Thông tin cá nhân
          </div>
          <div className="ml-4 space-y-5">
            <div className="flex items-baseline gap-2">
              <span className="min-w-[220px] text-slate-600">
                - Mã số giảng viên:
              </span>
              {isNew && isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1 font-medium"
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                />
              ) : (
                <span className="font-bold text-slate-800">{formData.id}</span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="min-w-[220px] text-slate-600">
                - Họ và tên giảng viên:
              </span>
              {isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1 font-medium"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
              ) : (
                <span className="font-bold text-slate-800">
                  {formData.fullName}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="min-w-[220px] text-slate-600">- Giới tính:</span>
              {isEditing ? (
                <select
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 font-medium"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              ) : (
                <span className="font-bold text-slate-800">
                  {formData.gender}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 2. Đơn vị công tác */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4 text-blue-800">
            2. Đơn vị công tác
          </div>
          <div className="ml-4 space-y-4">
            <div className="flex items-start gap-2">
              <span className="min-w-[220px] text-slate-600">
                - Các bộ môn trực thuộc:
              </span>
              <div className="flex-1 flex flex-wrap gap-2">
                {formData.subDepartmentIds.map((deptId) => (
                  <span
                    key={deptId}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-200 flex items-center gap-2"
                  >
                    {deptId}
                    {isEditing && (
                      <X
                        size={14}
                        className="cursor-pointer hover:text-red-500 transition-colors"
                        onClick={() => removeSubDeptId(deptId)}
                      />
                    )}
                  </span>
                ))}

                {isEditing && (
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Mã bộ môn..."
                      className="text-sm border-b border-blue-400 outline-none w-28 bg-yellow-50 px-1 italic"
                      value={newSubDeptInput}
                      onChange={(e) => setNewSubDeptInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSubDeptId()}
                    />
                    <button
                      onClick={addSubDeptId}
                      className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-shadow shadow-sm"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                )}

                {formData.subDepartmentIds.length === 0 && !isEditing && (
                  <span className="italic text-red-400">
                    Chưa gán đơn vị công tác
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-slate-100 text-sm text-slate-400 text-center italic">
        Thông tin giảng viên được quản lý bởi hệ thống OBE - Workflow
      </div>
    </div>
  );
};

export default LecturerDetailForm;
