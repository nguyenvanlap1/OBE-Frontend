import api from "./api";
import type { ApiResponse } from "./api";

/**
 * --- INTERFACES FOR REQUESTS ---
 */
export interface KnowledgeBlockRequest {
  id: string; // Mã khối kiến thức (Ví dụ: KKT_DC)
  name: string; // Tên khối kiến thức (Ví dụ: Khối kiến thức đại cương)
}

/**
 * --- INTERFACES FOR RESPONSES ---
 */
export interface KnowledgeBlockResponse {
  id: string;
  name: string;
}

/**
 * --- SERVICE IMPLEMENTATION ---
 */
const knowledgeBlockService = {
  // 1. Lấy toàn bộ danh sách khối kiến thức
  getAll: async (): Promise<ApiResponse<KnowledgeBlockResponse[]>> => {
    const response = await api.get("/knowledge-blocks");
    return response.data;
  },

  // 2. Lấy chi tiết một khối kiến thức theo ID
  getById: async (id: string): Promise<ApiResponse<KnowledgeBlockResponse>> => {
    const response = await api.get(`/knowledge-blocks/${id}`);
    return response.data;
  },

  // 3. Tạo mới khối kiến thức
  create: async (
    data: KnowledgeBlockRequest,
  ): Promise<ApiResponse<KnowledgeBlockResponse>> => {
    const response = await api.post("/knowledge-blocks", data);
    return response.data;
  },

  // 4. Cập nhật khối kiến thức
  update: async (
    id: string,
    data: KnowledgeBlockRequest,
  ): Promise<ApiResponse<KnowledgeBlockResponse>> => {
    const response = await api.put(`/knowledge-blocks/${id}`, data);
    return response.data;
  },

  // 5. Xóa khối kiến thức
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/knowledge-blocks/${id}`);
    return response.data;
  },
};

export default knowledgeBlockService;
