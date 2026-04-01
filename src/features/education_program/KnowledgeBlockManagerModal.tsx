import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
// Cập nhật import đúng interface mới
import type {
  KnowledgeBlockResponse,
  KnowledgeBlockRequest,
} from "../../services/knowledgeBlockService";
import knowledgeBlockService from "../../services/knowledgeBlockService";
import type { ApiResponse } from "../../services/api";
import type { AxiosError } from "axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  blocks: KnowledgeBlockResponse[]; // Dùng Response interface cho danh sách hiển thị
  onRefresh: () => void;
}

const KnowledgeBlockManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  blocks,
  onRefresh,
}) => {
  // State dùng Request interface cho form thêm mới
  const [newBlock, setNewBlock] = useState<KnowledgeBlockRequest>({
    id: "",
    name: "",
  });

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!newBlock.id.trim() || !newBlock.name.trim()) {
      return toast.warn("Vui lòng nhập đủ Mã và Tên khối kiến thức");
    }

    try {
      const response = await knowledgeBlockService.create(newBlock);
      if (response.status === 201 || response.status === 200) {
        toast.success(response.message || "Thêm thành công");
        setNewBlock({ id: "", name: "" }); // Reset form
        onRefresh(); // Load lại danh sách ở component cha
      }
    } catch (e: unknown) {
      // Hiển thị lỗi từ backend nếu có (ví dụ trùng mã ID)
      const err = e as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khối [${id}] không?`))
      return;

    try {
      const response = await knowledgeBlockService.delete(id);
      if (response.status === 200) {
        toast.success("Xóa khối kiến thức thành công");
        onRefresh();
      }
    } catch (e: unknown) {
      const err = e as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-700">Quản lý Khối kiến thức</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Form thêm mới */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">
                Mã khối
              </label>
              <input
                placeholder="VD: KKT_DC"
                value={newBlock.id}
                className="border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                onChange={(e) =>
                  setNewBlock({ ...newBlock, id: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">
                Tên hiển thị
              </label>
              <input
                placeholder="VD: Đại cương"
                value={newBlock.name}
                className="border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                onChange={(e) =>
                  setNewBlock({ ...newBlock, name: e.target.value })
                }
              />
            </div>
            <button
              onClick={handleAdd}
              className="col-span-2 mt-2 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
            >
              <Plus size={16} /> Thêm vào danh mục
            </button>
          </div>

          {/* Danh sách hiện có */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 ml-1 mb-2">
              DANH SÁCH HIỆN CÓ ({blocks.length})
            </p>
            <div className="max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {blocks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm italic">
                  Chưa có dữ liệu khối kiến thức
                </div>
              ) : (
                blocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex justify-between items-center p-2.5 border-b last:border-0 hover:bg-gray-50 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border">
                        {block.id}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {block.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(block.id)}
                      className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      title="Xóa khối"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 border-t text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBlockManagerModal;
