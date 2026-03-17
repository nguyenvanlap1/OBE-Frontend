import React, { useEffect, useState } from "react";
import { ShieldCheck, Target, Layers } from "lucide-react";
import type { PermissionResponse } from "../../services/permissionService";
import permissionService from "../../services/permissionService";

const RealPermissionTree: React.FC = () => {
  const [treeData, setTreeData] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await permissionService.getTree();
        setTreeData(response.data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  if (loading)
    return <div className="text-center p-20">Đang khởi tạo sơ đồ...</div>;

  return (
    <div className="p-10 bg-gray-50 min-h-screen overflow-x-auto">
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
          <ShieldCheck className="text-indigo-600" size={32} />
          Hệ Thống Phân Cấp Quyền Hạn
        </h2>
        <p className="text-gray-500 mt-2 font-medium italic">
          Luận văn tốt nghiệp - OBE System 2026
        </p>
      </div>

      {/* Container chính cho cây */}
      <div className="flex justify-center items-start gap-8">
        {treeData.map((node) => (
          <div key={node.id} className="tree-root">
            <TreeBranch node={node} />
          </div>
        ))}
      </div>

      {/* CSS bổ trợ để vẽ đường kẻ nếu không muốn cài thư viện */}
      <style>{`
        .tree-branch-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .children-wrapper {
          display: flex;
          justify-content: center;
          position: relative;
          padding-top: 2rem;
          gap: 2rem;
        }
        /* Đường kẻ dọc từ nút cha xuống */
        .line-down {
          width: 2px;
          height: 2rem;
          background-color: #e2e8f0;
          position: absolute;
          bottom: -2rem;
        }
      `}</style>
    </div>
  );
};

const TreeBranch: React.FC<{ node: PermissionResponse }> = ({ node }) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-branch-container">
      {/* Nút hiển thị thông tin */}
      <div className="relative z-10 w-64 bg-white border-2 border-indigo-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-400 transition-all text-center">
        <div className="font-bold text-gray-800 text-sm mb-1">{node.name}</div>
        <div className="text-[10px] text-indigo-500 font-mono mb-2 uppercase tracking-wider">
          {node.id}
        </div>

        {/* Scopes nhỏ bên dưới */}
        <div className="flex flex-wrap justify-center gap-1">
          {node.allowedScopes.map((s) => (
            <span
              key={s}
              className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1"
            >
              <Target size={8} /> {s}
            </span>
          ))}
        </div>

        {hasChildren && <div className="line-down mx-auto"></div>}
      </div>

      {/* Hiển thị các con theo chiều ngang */}
      {hasChildren && (
        <div className="children-wrapper">
          {node.children.map((child) => (
            <TreeBranch key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RealPermissionTree;
