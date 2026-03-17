import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

// --- Interface riêng cho Department ---
export interface DepartmentResponse {
  id: string;
  name: string;
  description: string;
}

export interface DepartmentRequest {
  id: string;
  name: string;
  description?: string;
}

export interface DepartmentFilterRequest {
  id?: string;
  name?: string;
}

// --- Department Service ---
const departmentService = {
  // 1. Tạo mới
  create: async (
    data: DepartmentRequest,
  ): Promise<ApiResponse<DepartmentResponse>> => {
    const response = await api.post("/departments", data);
    return response.data;
  },

  // 2. Cập nhật (PUT)
  update: async (
    id: string,
    data: DepartmentRequest,
  ): Promise<ApiResponse<DepartmentResponse>> => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  // 3. Tìm kiếm và phân trang
  search: async (
    params: PageableRequest,
    filter: DepartmentFilterRequest,
  ): Promise<ApiResponse<PageResponse<DepartmentResponse>>> => {
    const response = await api.post("/departments/search", filter, { params });
    return response.data;
  },

  // 4. Xóa
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

export default departmentService;
