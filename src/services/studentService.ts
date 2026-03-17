import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

// --- Interface cho Sinh viên ---
export interface StudentResponse {
  id: string;
  fullName: string;
  gender: string;
  educationProgramIds: string[];
}

export interface StudentRequest {
  id: string;
  fullName: string;
  gender: string;
  educationProgramIds: string[];
}

export interface StudentFilterRequest {
  id?: string;
  fullName?: string;
  gender?: string;
  educationProgramId?: string; // Quan trọng để lọc theo ngành (OBE)
}

// --- Student Service ---
const studentService = {
  // 1. Lấy danh sách (Phân trang + Lọc)
  getAll: async (
    params: PageableRequest,
    filter: StudentFilterRequest,
  ): Promise<ApiResponse<PageResponse<StudentResponse>>> => {
    // Chuyển filter thành query params
    const response = await api.get("/students", {
      params: { ...params, ...filter },
    });
    return response.data;
  },

  // 2. Tạo mới
  create: async (
    data: StudentRequest,
  ): Promise<ApiResponse<StudentResponse>> => {
    const response = await api.post("/students", data);
    return response.data;
  },

  // 3. Cập nhật
  update: async (
    id: string,
    data: StudentRequest,
  ): Promise<ApiResponse<StudentResponse>> => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  // 4. Xóa
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

export default studentService;
