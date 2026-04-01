import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import permissionService from "../../services/permissionService";
import type { PermissionResponse } from "../../services/permissionService";
import type { RolePermissionResponse } from "../../services/roleService";

interface PermissionTreeProps {
  // Danh sách các quyền đã có sẵn (dùng khi Edit)
  selectedPermissions: RolePermissionResponse[];
  // Hàm callback để trả dữ liệu về Form cha
  onChange: (updatedPermissions: RolePermissionResponse[]) => void;
}

const PermissionTree = ({
  selectedPermissions,
  onChange,
}: PermissionTreeProps) => {
  const [treeData, setTreeData] = useState<PermissionResponse[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await permissionService.getTree();
        if (response.status === 200) {
          setTreeData(response.data);
          if (response.data.length > 0)
            setExpandedModules([response.data[0].id]);
        }
      } catch (error) {
        console.error("Lỗi lấy cây quyền hạn", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  // Logic xử lý khi tích chọn Checkbox
  const handleCheckPermission = (
    permission: PermissionResponse,
    isChecked: boolean,
  ) => {
    if (isChecked) {
      // Thêm mới: Lấy scope đầu tiên làm mặc định
      const newPermission: RolePermissionResponse = {
        permissionId: permission.id,
        scopeType: permission.allowedScopes?.[0] || "SYSTEM",
        roleId: "",
        permissionName: permission.name,
      };
      onChange([...selectedPermissions, newPermission]);
    } else {
      // Xóa khỏi danh sách chọn
      onChange(
        selectedPermissions.filter((p) => p.permissionId !== permission.id),
      );
    }
  };

  // Logic xử lý khi thay đổi Scope (nếu một quyền có nhiều scope)
  const handleScopeChange = (permissionId: string, newScope: string) => {
    const updated = selectedPermissions.map((p) =>
      p.permissionId === permissionId ? { ...p, scopeType: newScope } : p,
    );
    onChange(updated);
  };

  if (loading)
    return <div className="p-10 text-center text-gray-400">Đang tải...</div>;

  return (
    <div className="space-y-4 font-sans">
      {treeData.map((module) => (
        <div
          key={module.id}
          className="border rounded-lg overflow-hidden border-slate-200 shadow-sm"
        >
          {/* Module Header */}
          <div
            className={`flex items-center justify-between p-3 cursor-pointer ${
              expandedModules.includes(module.id) ? "bg-slate-50" : "bg-white"
            }`}
            onClick={() => toggleModule(module.id)}
          >
            <div className="flex items-center gap-3">
              {expandedModules.includes(module.id) ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              <span className="font-bold text-slate-700 text-sm uppercase tracking-tight">
                {module.name}
              </span>
            </div>
            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
              {module.children.length} quyền
            </span>
          </div>

          {/* Children Permissions */}
          {expandedModules.includes(module.id) && (
            <div className="bg-white divide-y divide-slate-100 border-t">
              {module.children.map((permission) => {
                const isSelected = selectedPermissions.some(
                  (p) => p.permissionId === permission.id,
                );
                const currentSelection = selectedPermissions.find(
                  (p) => p.permissionId === permission.id,
                );

                return (
                  <div
                    key={permission.id}
                    className="p-4 flex items-start justify-between hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="flex gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleCheckPermission(permission, e.target.checked)
                        }
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <div>
                        <label
                          className={`font-medium text-sm ${isSelected ? "text-blue-700" : "text-slate-700"}`}
                        >
                          {permission.name}
                        </label>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {permission.description}
                        </p>
                      </div>
                    </div>

                    {/* Scope Selector: Chỉ hiện khi đã tích chọn quyền */}
                    {isSelected && (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                        {permission.allowedScopes?.map((scope) => (
                          <button
                            key={scope}
                            onClick={() =>
                              handleScopeChange(permission.id, scope)
                            }
                            className={`text-[10px] font-extrabold px-2 py-1 rounded border transition-all ${
                              currentSelection?.scopeType === scope
                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                : "bg-white text-slate-400 border-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {scope}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PermissionTree;
