import React, { useState, useEffect } from "react";
import { Save, Edit2, X } from "lucide-react";
import type { ApiResponse } from "../../services/api";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";

interface DynamicFormProps<T> {
  data: T;
  title?: string;
  onSave: (updatedData: T) => void;
  excludeFields?: string[];
  fieldLabels?: Partial<Record<keyof T, string>>; // Thêm cái này để truyền tên tiếng Việt
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynamicEntityForm = <T extends Record<string, any>>({
  data,
  title = "Thông tin chi tiết",
  onSave,
  excludeFields = [],
  fieldLabels = {}, // Mặc định là object rỗng
}: DynamicFormProps<T>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<T>(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Gọi hàm onSave được truyền từ cha và đợi kết quả
      await onSave(formData);

      // Nếu không có lỗi, đóng chế độ edit
      setIsEditing(false);
    } catch (error: unknown) {
      // Lỗi ở đây thường đã được toast ở hàm onSave của cha,
      // nhưng ta vẫn giữ catch để tránh crash ứng dụng
      console.error("Save error:", error);
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    }
  };

  // Ưu tiên lấy từ fieldLabels, không có mới nội suy
  const getLabel = (key: keyof T) => {
    if (fieldLabels[key]) return fieldLabels[key];

    return String(key)
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
            Thông tin thực thể hệ thống
          </p>
        </div>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-all ${
            isEditing
              ? "bg-blue-700 text-white hover:bg-blue-800"
              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
          {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
        {(Object.keys(formData) as Array<keyof T>)
          .filter((key) => !excludeFields.includes(key as string))
          .map((key) => {
            const value = formData[key];
            return (
              <div key={String(key)} className="space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-tight">
                  {getLabel(key)}
                </label>

                {isEditing ? (
                  typeof value === "boolean" ? (
                    <div className="flex items-center h-9">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleChange(key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <input
                      type={typeof value === "number" ? "number" : "text"}
                      value={value ?? ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all bg-white"
                    />
                  )
                ) : (
                  <div className="py-2 px-0 text-sm text-slate-800 border-b border-transparent">
                    {value?.toString() || (
                      <span className="text-slate-400 italic font-light text-xs">
                        (Trống)
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Footer */}
      {isEditing && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              setFormData(data);
              setIsEditing(false);
            }}
            className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
          >
            <X size={14} /> HỦY BỎ
          </button>
        </div>
      )}
    </div>
  );
};

export default DynamicEntityForm;
