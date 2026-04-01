import { useState } from "react";
import { Save, Edit2, X, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import roleService from "../../services/roleService";
import type {
  RoleResponseDetail,
  RoleRequest,
  RolePermissionResponse,
} from "../../services/roleService";
import logData from "../../utils/logData";
import PermissionTree from "./PermissionTree";

interface RoleDetailFormProps {
  data: RoleResponseDetail;
  onSave?: (updatedData: RoleResponseDetail) => void;
}

const RoleDetailForm = ({ data, onSave }: RoleDetailFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(
    String(data.id).startsWith("new_") ? true : false,
  );

  // Khởi tạo state từ data truyền vào
  const [formData, setFormData] = useState<RoleResponseDetail>(() => ({
    id: data.id || "",
    name: data.name || "",
    description: data.description || "",
    rolePermissionResponses: data.rolePermissionResponses || [],
  }));

  const handleChange = (key: keyof RoleResponseDetail, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePermissionsChange = (
    newPermissions: RolePermissionResponse[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      // Lưu ý: Backend cần map lại hoặc bạn có thể lưu trực tiếp nếu Interface khớp
      rolePermissionResponses: newPermissions.map((p) => ({
        permissionId: p.permissionId,
        permissionName: p.permissionName,
        scopeType: p.scopeType,
        roleId: formData.id,
      })),
    }));
  };

  // Xóa một quyền khỏi danh sách tạm thời trên UI
  const removePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      rolePermissionResponses: prev.rolePermissionResponses.filter(
        (rp) => rp.permissionId !== permissionId,
      ),
    }));
  };

  const handleSave = async () => {
    try {
      /**
       * Map từ RoleResponseDetail (UI) sang RoleRequest (Backend DTO)
       * Backend cần mảng: rolePermissionRequests
       */
      const payload: RoleRequest = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        rolePermissionRequests: formData.rolePermissionResponses.map((rp) => ({
          roleId: formData.id,
          permissionId: rp.permissionId,
          scopeType: rp.scopeType,
        })),
      };

      logData(payload);

      const response = isNew
        ? await roleService.create(payload)
        : await roleService.update(formData.id, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Cập nhật thông tin vai trò thành công!");
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
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-[600px] shadow-sm text-slate-900 font-sans">
      {/* Nút điều khiển */}
      <div className="flex justify-end mb-8 no-print font-sans">
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
          Hồ sơ chi tiết vai trò hệ thống
        </h2>
        <div className="w-40 h-px bg-black mx-auto mt-2"></div>
      </div>

      <div className="space-y-10 text-[17px]">
        {/* 1. Thông tin định danh */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4 font-sans">
            1. Thông tin định danh
          </div>
          <div className="ml-4 space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">
                - Mã vai trò (ID):
              </span>
              {isNew && isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1 font-bold"
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                />
              ) : (
                <span className="font-bold">{formData.id}</span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="min-w-[200px] text-slate-600">
                - Tên vai trò:
              </span>
              {isEditing ? (
                <input
                  className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 flex-1 font-bold"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              ) : (
                <span className="font-bold text-blue-800 uppercase">
                  {formData.name}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 2. Mô tả & Quyền hạn */}
        <section className="space-y-4">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4 font-sans">
            2. Mô tả & Quyền hạn
          </div>
          <div className="ml-4 space-y-6">
            <div className="flex items-start gap-2">
              <span className="min-w-[200px] text-slate-600">
                - Mô tả nhiệm vụ:
              </span>
              {isEditing ? (
                <textarea
                  className="border border-dotted border-black outline-none p-2 bg-yellow-50 flex-1 min-h-[60px]"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              ) : (
                <span className="italic flex-1">
                  {formData.description || "Chưa có mô tả"}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-slate-700 font-serif font-medium">
                - Danh sách quyền hạn trực thuộc
              </span>
              <div className="border border-slate-200 rounded-sm">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="border-b border-slate-200 p-2 text-left">
                        Quyền hạn
                      </th>
                      <th className="border-b border-slate-200 p-2 text-left">
                        Phạm vi
                      </th>
                      {isEditing && (
                        <th className="border-b border-slate-200 p-2 w-10"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.rolePermissionResponses.map((rp) => (
                      <tr key={rp.permissionId}>
                        <td className="p-2 border-b border-slate-100 font-medium">
                          {rp.permissionName || rp.permissionId}
                        </td>
                        <td className="p-2 border-b border-slate-100">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 uppercase">
                            {rp.scopeType}
                          </span>
                        </td>
                        {isEditing && (
                          <td className="p-2 border-b border-slate-100 text-center">
                            <X
                              size={14}
                              className="cursor-pointer text-red-500"
                              onClick={() => removePermission(rp.permissionId)}
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isEditing && (
                <div className="mt-8 border-t pt-8">
                  <h3 className="text-lg font-bold mb-4 font-sans text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-blue-600" />
                    Điều chỉnh quyền hạn chi tiết
                  </h3>
                  <PermissionTree
                    selectedPermissions={formData.rolePermissionResponses.map(
                      (rp) => ({
                        roleId: rp.roleId,
                        permissionId: rp.permissionId,
                        permissionName: rp.permissionName,
                        scopeType: rp.scopeType,
                      }),
                    )}
                    onChange={handlePermissionsChange}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RoleDetailForm;
