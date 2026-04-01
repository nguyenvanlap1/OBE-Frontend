import api from "./api";
import type { ApiResponse } from "./api";

/**
 * Interface đồng bộ hoàn toàn với PermissionTreeResponse của Backend
 */
export interface PermissionResponse {
  id: string; // ID (VD: "USER" hoặc "USER_CREATE")
  name: string; // Tên hiển thị tiếng Việt
  description: string; // Mô tả chi tiết
  allowedScopes?: string[]; // Danh sách các Scope (có thể null ở node nhóm)
  children: PermissionResponse[]; // Node con (rỗng nếu là quyền cụ thể)
}

const permissionService = {
  /**
   * Lấy sơ đồ cây phân quyền (đã được gom nhóm theo Module từ Backend)
   */
  getTree: async (): Promise<ApiResponse<PermissionResponse[]>> => {
    const response = await api.get("/permissions/tree");
    return response.data;
  },

  /**
   * Lấy danh sách phẳng (Dùng cho dropdown hoặc filter nhanh)
   * Ở đây mình map lại từ Tree để tránh viết thêm API mới ở Backend
   */
  getAllFlat: async (): Promise<PermissionResponse[]> => {
    const res =
      await api.get<ApiResponse<PermissionResponse[]>>("/permissions/tree");
    if (!res.data.data) return [];

    // Làm phẳng Tree thành danh sách các quyền cụ thể
    return res.data.data.flatMap((module) => module.children);
  },
};

export default permissionService;
