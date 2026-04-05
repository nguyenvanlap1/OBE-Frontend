import { useState } from "react";
import { Save, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import departmentService, {
  type DepartmentRequest,
  type DepartmentResponse,
} from "./departmentService";

interface DepartmentDetailFormProps {
  data: DepartmentResponse;
  onSave?: (updatedData: DepartmentResponse) => void;
}

const DepartmentDetailForm = ({ data, onSave }: DepartmentDetailFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  // Kiểm tra xem đây có phải là tạo mới không (dựa trên prefix 'new_')
  const [isNew, setIsNew] = useState(
    String(data.id).startsWith("new_") ? true : false,
  );

  const [formData, setFormData] = useState<DepartmentResponse>(() => ({
    id: data.id || "",
    name: data.name || "",
    description: data.description || "",
  }));

  const handleChange = (key: keyof DepartmentResponse, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const payload: DepartmentRequest = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
      };

      const response = isNew
        ? await departmentService.create(payload)
        : await departmentService.update(payload.id, payload);

      // Lưu ý: Tùy vào cấu trúc ApiResponse của bạn, có thể cần check response.status hoặc response.code
      if (response) {
        toast.success(
          isNew
            ? "Tạo phòng ban thành công!"
            : "Cập nhật phòng ban thành công!",
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
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-[500px] shadow-sm text-slate-900">
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
        <h2 className="text-xl font-bold uppercase tracking-widest">
          Chi tiết đơn vị / Khoa
        </h2>
        <div className="w-40 h-px bg-black mx-auto mt-2"></div>
      </div>

      <div className="space-y-8 text-[17px]">
        {/* 1. Thông tin chung */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">
            1. Thông tin cơ bản
          </div>
          <div className="ml-4 space-y-4">
            {/* Mã phòng ban */}
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">- Mã đơn vị:</span>
              {isNew && isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1"
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                  placeholder="Nhập mã đơn vị..."
                />
              ) : (
                <span className="font-bold">{formData.id}</span>
              )}
            </div>

            {/* Tên phòng ban */}
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">
                - Tên đơn vị:
              </span>
              {isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nhập tên khoa/phòng ban..."
                />
              ) : (
                <span className="font-bold">{formData.name}</span>
              )}
            </div>
          </div>
        </section>

        {/* 2. Mô tả chi tiết */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">
            2. Mô tả chức năng
          </div>
          <div className="ml-4">
            {isEditing ? (
              <textarea
                className="w-full min-h-[120px] p-3 border border-dotted border-black outline-none bg-yellow-50 resize-none"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Nhập mô tả về đơn vị..."
              />
            ) : (
              <div className="italic text-slate-700 leading-relaxed">
                {formData.description || "Chưa có mô tả cho đơn vị này."}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DepartmentDetailForm;
