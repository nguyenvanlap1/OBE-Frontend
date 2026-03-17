import api from "./api";
import type { ApiResponse } from "./api";

// --- Interface cho Permission ---
export interface PermissionResponse {
  id: string;
  name: string;
  description: string;
  allowedScopes: string[];
  children: PermissionResponse[]; // Cấu trúc đệ quy để vẽ cây
}

// --- Permission Service ---
const permissionService = {
  /**
   * Lấy sơ đồ cây phân quyền hoàn chỉnh
   * Dùng để hiển thị trong các trang quản lý vai trò (Roles) hoặc phân quyền người dùng
   */
  getTree: async (): Promise<ApiResponse<PermissionResponse[]>> => {
    const response = await api.get("/permissions/tree");
    return response.data;
  },

  /**
   * Lấy danh sách phẳng (nếu cần dùng cho các component đơn giản như Select/Dropdown)
   */
  getAll: async (): Promise<ApiResponse<PermissionResponse[]>> => {
    const response = await api.get("/permissions/all");
    return response.data;
  },
};

export default permissionService;
