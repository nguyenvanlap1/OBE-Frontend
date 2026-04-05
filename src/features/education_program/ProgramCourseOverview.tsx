import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Settings } from "lucide-react"; // Icon để mở quản lý
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import educationProgramService, {
  type ProgramCourseDetailListResponse,
} from "./educationProgramService";
import knowledgeBlockService, {
  type KnowledgeBlockResponse,
} from "../../services/knowledgeBlockService"; // Import service mới
import ProgramCourseTableAgGrid from "./ProgramCourseTableAgGrid";
import KnowledgeBlockManagerModal from "./KnowledgeBlockManagerModal"; // Import Modal

interface Props {
  programId: string; // Chỉ nhận ID chương trình
}

const ProgramCourseOverview: React.FC<Props> = ({ programId }) => {
  const [data, setData] = useState<ProgramCourseDetailListResponse | null>(
    null,
  );
  const [kbList, setKbList] = useState<KnowledgeBlockResponse[]>([]); // State quản lý danh sách khối
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State đóng/mở modal

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch danh sách Khối kiến thức (dùng để truyền vào AgGrid dropdown)
  const fetchKB = useCallback(async () => {
    try {
      const response = await knowledgeBlockService.getAll();
      if (response.status === 200) {
        setKbList(response.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh mục khối kiến thức:", err);
    }
  }, []);

  // 2. Fetch danh sách học phần của chương trình
  const fetchCourseData = useCallback(async () => {
    if (!programId) return;

    setLoading(true);
    try {
      const response = await educationProgramService.getCourses(programId);

      if (response.status === 200) {
        setData(response.data);
        setError(null);
      } else {
        const msg = response.message || "Không thể tải danh sách học phần";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<null>>;
      const msg = axiosError.response?.data?.message || "Lỗi kết nối hệ thống";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  // Gọi cả 2 khi component mount
  useEffect(() => {
    fetchCourseData();
    fetchKB();
  }, [fetchCourseData, fetchKB]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-400 animate-pulse font-medium">
        Đang tải danh sách học phần...
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-100">
        {error}
      </div>
    );

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Header với nút Quản lý */}
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Chi tiết học phần chương trình
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="Quản lý danh mục Khối kiến thức"
            >
              <Settings size={18} />
            </button>
          </h2>
          <p className="text-sm text-gray-500">
            Quản lý danh sách môn học và phân bổ khối kiến thức cho chương trình
            đào tạo.
          </p>
        </div>
      </div>

      {/* Bảng AgGrid sử dụng dữ liệu KB từ service */}
      <ProgramCourseTableAgGrid
        programData={data}
        knowledgeBlocks={kbList}
        onRefresh={fetchCourseData}
      />

      {/* Modal Quản lý danh mục */}
      <KnowledgeBlockManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        blocks={kbList}
        onRefresh={fetchKB} // Khi thêm/xóa ở Modal thì cập nhật lại list cho AgGrid
      />
    </div>
  );
};

export default ProgramCourseOverview;
