import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Shield,
  ShieldCheck,
  Info,
} from "lucide-react";
import type { PermissionResponse } from "../../services/permissionService";
import permissionService from "../../services/permissionService";
import type { ApiResponse } from "../../services/api";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
const PermissionTree = () => {
  const [treeData, setTreeData] = useState<PermissionResponse[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await permissionService.getTree();
        if (response.status === 200) {
          setTreeData(response.data);
          // Mặc định mở rộng module đầu tiên
          if (response.data.length > 0)
            setExpandedModules([response.data[0].id]);
        }
      } catch (error: unknown) {
        const err = error as AxiosError<ApiResponse<void>>;
        toast(err.message);
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

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải sơ đồ phân quyền...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <ShieldCheck className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-gray-800">
          Cấu hình chi tiết quyền hạn
        </h2>
      </div>

      <div className="space-y-4">
        {treeData.map((module) => (
          <div
            key={module.id}
            className="border rounded-lg overflow-hidden border-gray-200"
          >
            {/* Module Header */}
            <div
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                expandedModules.includes(module.id)
                  ? "bg-blue-50"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex items-center gap-3">
                {expandedModules.includes(module.id) ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-blue-500" />
                  <span className="font-semibold text-gray-700 uppercase tracking-wider text-sm">
                    {module.name}
                  </span>
                </div>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-white border rounded-full text-gray-500">
                {module.children.length} quyền
              </span>
            </div>

            {/* Actions List (Children) */}
            {expandedModules.includes(module.id) && (
              <div className="bg-white divide-y divide-gray-100">
                {module.children.map((permission) => (
                  <div
                    key={permission.id}
                    className="p-4 hover:bg-slate-50 transition-all flex items-start justify-between group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={permission.id}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <label
                          htmlFor={permission.id}
                          className="font-medium text-gray-800 cursor-pointer"
                        >
                          {permission.name}
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 ml-6 mt-1 flex items-center gap-1">
                        <Info
                          size={14}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        {permission.description}
                      </p>
                    </div>

                    {/* Scope Display */}
                    <div className="flex gap-1">
                      {permission.allowedScopes?.map((scope) => (
                        <span
                          key={scope}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionTree;
