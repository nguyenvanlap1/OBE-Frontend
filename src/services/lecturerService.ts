import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

/**
 * --- INTERFACES FOR REQUESTS ---
 */

export interface LecturerFilterRequest {
  id?: string;
  fullName?: string;
  gender?: string;
  subDepartmentId?: string; // Lọc giảng viên theo bộ môn
}

export interface LecturerRequest {
  id: string; // Mã giảng viên (NotBlank)
  fullName: string; // Họ tên (NotBlank)
  gender: string; // Giới tính (NotBlank)
  subDepartmentIds: string[]; // Set<String> trong Java tương ứng string array (NotEmpty)
}

/**
 * --- INTERFACES FOR RESPONSES ---
 */

export interface LecturerResponse {
  id: string;
  fullName: string;
  gender: string;
  subDepartmentIds: string[]; // Danh sách mã bộ môn trực thuộc
}

/**
 * --- SERVICE IMPLEMENTATION ---
 */

const lecturerService = {
  // 1. Lấy danh sách giảng viên (Phân trang và Lọc)
  // Lưu ý: Java dùng @GetMapping nên params sẽ được truyền qua query string
  search: async (
    params: PageableRequest,
    filter: LecturerFilterRequest,
  ): Promise<ApiResponse<PageResponse<LecturerResponse>>> => {
    const response = await api.get("/lecturers", {
      params: {
        ...params,
        ...filter, // Gộp filter vào query params theo cấu trúc của Controller
      },
    });
    return response.data;
  },

  // 2. Tạo giảng viên mới
  create: async (
    data: LecturerRequest,
  ): Promise<ApiResponse<LecturerResponse>> => {
    const response = await api.post("/lecturers", data);
    return response.data;
  },

  // 3. Cập nhật thông tin giảng viên
  update: async (
    id: string,
    data: LecturerRequest,
  ): Promise<ApiResponse<LecturerResponse>> => {
    const response = await api.put(`/lecturers/${id}`, data);
    return response.data;
  },

  // 4. Xóa giảng viên
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/lecturers/${id}`);
    return response.data;
  },
};

export default lecturerService;
