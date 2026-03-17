import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Layers,
  Target,
  Info,
} from "lucide-react";
import type { PermissionResponse } from "../../services/permissionService";
import permissionService from "../../services/permissionService";

const PermissionTree: React.FC = () => {
  const [treeData, setTreeData] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await permissionService.getTree();
        setTreeData(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy cây phân quyền:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-gray-500">
        <div className="animate-spin mr-3">
          <Layers size={20} />
        </div>
        Đang tải sơ đồ phân quyền...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <ShieldCheck className="text-indigo-600" size={28} />
          Sơ đồ cây phân quyền hệ thống
        </h2>
        <span className="text-sm text-gray-400 font-medium">
          Sprint 2 - OBE System
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        {treeData.length > 0 ? (
          treeData.map((node) => <TreeNode key={node.id} node={node} />)
        ) : (
          <p className="text-center text-gray-500 py-10">
            Không có dữ liệu phân quyền.
          </p>
        )}
      </div>
    </div>
  );
};

// Component con xử lý đệ quy
const TreeNode: React.FC<{ node: PermissionResponse }> = ({ node }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="mb-2">
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all group border border-transparent hover:border-gray-200">
        {/* Toggle Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mt-1 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )
          ) : (
            <div className="w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-800 group-hover:text-indigo-600">
              {node.name}
            </span>
            <code className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase font-mono">
              {node.id}
            </code>
          </div>

          <div className="flex items-center gap-1 text-gray-500 mt-1">
            <Info size={14} />
            <p className="text-sm italic">{node.description}</p>
          </div>

          {/* Scopes */}
          <div className="flex flex-wrap gap-2 mt-2">
            {node.allowedScopes.map((scope) => (
              <span
                key={scope}
                className="text-[10px] flex items-center gap-1 bg-white text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-200 shadow-sm"
              >
                <Target size={10} /> {scope}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Children Container (Recursive) */}
      {hasChildren && isOpen && (
        <div className="ml-8 mt-1 border-l-2 border-indigo-100 pl-4 space-y-1">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionTree;
