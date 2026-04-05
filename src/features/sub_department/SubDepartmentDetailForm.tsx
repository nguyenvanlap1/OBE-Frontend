import { useState } from "react";
import { Save, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import subDepartmentService, {
  type SubDepartmentRequest,
  type SubDepartmentResponse,
} from "./subDepartmentService";

interface SubDepartmentDetailFormProps {
  data: SubDepartmentResponse;
  onSave?: (updatedData: SubDepartmentResponse) => void;
}

const SubDepartmentDetailForm = ({
  data,
  onSave,
}: SubDepartmentDetailFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Kiểm tra tạo mới dựa trên id giả định "new_" từ component cha
  const [isNew, setIsNew] = useState(
    String(data.id).startsWith("new_") ? true : false,
  );

  const [formData, setFormData] = useState<SubDepartmentResponse>(() => ({
    id: data.id || "",
    name: data.name || "",
    description: data.description || "",
    departmentId: data.departmentId || "",
    departmentName: data.departmentName || "",
  }));

  const handleChange = (key: keyof SubDepartmentResponse, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Validation cơ bản
    if (!formData.id || !formData.departmentId) {
      toast.error("Vui lòng nhập đầy đủ mã bộ môn và mã khoa");
      return;
    }

    try {
      const payload: SubDepartmentRequest = {
        id: formData.id.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        departmentId: formData.departmentId.trim(),
      };

      const response = isNew
        ? await subDepartmentService.create(payload)
        : await subDepartmentService.update(payload.id, payload);

      if (response) {
        toast.success(
          isNew ? "Tạo bộ môn thành công!" : "Cập nhật bộ môn thành công!",
        );
        setIsEditing(false);
        setIsNew(false);

        if (response.data) {
          setFormData(response.data);
          onSave?.(response.data);
        }
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message || "Có lỗi xảy ra khi lưu");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-[500px] shadow-sm text-slate-900 border border-slate-100">
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

      <div className="text-center mb-12">
        <h2 className="text-xl font-bold uppercase tracking-widest text-blue-800">
          Chi tiết Bộ môn
        </h2>
        <div className="w-40 h-px bg-blue-800 mx-auto mt-2"></div>
      </div>

      <div className="space-y-8 text-[17px]">
        {/* 1. Thông tin cơ bản */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">
            1. Thông tin định danh
          </div>
          <div className="ml-4 space-y-5">
            {/* Mã bộ môn */}
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-500 font-medium">
                - Mã bộ môn:
              </span>
              {isNew && isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1 focus:bg-yellow-100 uppercase"
                  value={formData.id}
                  onChange={(e) =>
                    handleChange("id", e.target.value.toUpperCase())
                  }
                  placeholder="VD: BM_CNTT"
                />
              ) : (
                <span className="font-bold text-slate-800">{formData.id}</span>
              )}
            </div>

            {/* Tên bộ môn */}
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-500 font-medium">
                - Tên bộ môn:
              </span>
              {isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1 focus:bg-yellow-100"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nhập tên bộ môn..."
                />
              ) : (
                <span className="font-bold text-slate-800">
                  {formData.name}
                </span>
              )}
            </div>

            {/* Mã Khoa (Thay Dropdown bằng Input) */}
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-500 font-medium">
                - Mã khoa chủ quản:
              </span>
              {isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1 focus:bg-yellow-100 uppercase"
                  value={formData.departmentId}
                  onChange={(e) =>
                    handleChange("departmentId", e.target.value.toUpperCase())
                  }
                  placeholder="VD: CNTT"
                />
              ) : (
                <span className="font-bold text-blue-700">
                  {formData.departmentId}{" "}
                  {formData.departmentName
                    ? `- ${formData.departmentName}`
                    : ""}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 2. Mô tả */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">
            2. Chức năng & Nhiệm vụ
          </div>
          <div className="ml-4">
            {isEditing ? (
              <textarea
                className="w-full min-h-[120px] p-3 border border-dotted border-black outline-none bg-yellow-50 resize-none focus:bg-yellow-100"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Nhập mô tả chi tiết về bộ môn..."
              />
            ) : (
              <div className="italic text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-r-lg border-l-2 border-slate-200">
                {formData.description || "Chưa có thông tin mô tả."}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SubDepartmentDetailForm;
