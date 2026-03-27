import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

// --- Interfaces cho StudentClass (Lớp sinh viên) ---
export interface StudentClassResponse {
  id: string;
  name: string;
  schoolYearId: string; // Khóa học (VD: K48)
  educationProgramId: string;
  educationProgramName: string;
  subDepartmentId: string;
  subDepartmentName: string;
  departmentId: string;
  departmentName: string;
}

export interface StudentClassCreateRequest {
  id: string;
  name: string;
  schoolYearId: string;
  educationProgramId: string;
}

export interface StudentClassUpdateRequest {
  id: string;
  name: string;
  schoolYearId: string;
  educationProgramId: string;
}

export interface StudentClassFilterRequest {
  id?: string;
  name?: string;
  schoolYearId?: string;
  educationProgramId?: string;
  educationProgramName?: string;
  subDepartmentId?: string;
  subDepartmentName?: string;
  departmentId?: string;
  departmentName?: string;
}

// --- StudentClass Service ---
const studentClassService = {
  // 1. Tạo mới lớp sinh viên
  create: async (
    data: StudentClassCreateRequest,
  ): Promise<ApiResponse<StudentClassResponse>> => {
    const response = await api.post("/student-classes", data);
    return response.data;
  },

  // 2. Cập nhật thông tin lớp sinh viên (PUT)
  update: async (
    id: string,
    data: StudentClassUpdateRequest,
  ): Promise<ApiResponse<StudentClassResponse>> => {
    const response = await api.put(`/student-classes/${id}`, data);
    return response.data;
  },

  // 3. Tìm kiếm, lọc và phân trang (Sử dụng POST /search theo pattern của bạn)
  search: async (
    params: PageableRequest,
    filter: StudentClassFilterRequest,
  ): Promise<ApiResponse<PageResponse<StudentClassResponse>>> => {
    const response = await api.post("/student-classes/search", filter, {
      params, // Các tham số page, size, sort truyền qua query string
    });
    return response.data;
  },

  // 4. Xóa lớp sinh viên
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/student-classes/${id}`);
    return response.data;
  },
};

export default studentClassService;
