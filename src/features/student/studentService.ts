import api from "../../services/api";
import type {
  ApiResponse,
  PageableRequest,
  PageResponse,
} from "../../services/api";

// --- Interfaces cho Student (Sinh viên) ---
export interface StudentResponse {
  id: string;
  fullName: string;
  gender: string;
  studentClassesId: string[];
  educationProgramId: string[];
  educationProgramName: string[];
  subDepartmentId: string[];
  subDepartmentName: string[];
  departmentId: string[];
  departmentName: string[];
}

export interface StudentCreateRequest {
  id: string;
  fullName: string;
  gender: string;
  studentClassesId: string[];
}

export interface StudentUpdateRequest {
  id: string;
  fullName: string;
  gender: string;
  studentClassesId: string[];
}

export interface StudentFilterRequest {
  id?: string;
  fullName?: string;
  gender?: string;
  studentClassesId?: string[];
  educationProgramId?: string[];
  educationProgramName?: string[];
  subDepartmentId?: string[];
  subDepartmentName?: string[];
  departmentId?: string[];
  departmentName?: string[];
}

// --- Student Service ---
const studentService = {
  // 1. Tạo mới sinh viên
  create: async (
    data: StudentCreateRequest,
  ): Promise<ApiResponse<StudentResponse>> => {
    const response = await api.post("/students", data);
    return response.data;
  },

  // 2. Cập nhật thông tin sinh viên (PUT)
  update: async (
    id: string,
    data: StudentUpdateRequest,
  ): Promise<ApiResponse<StudentResponse>> => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  // 3. Tìm kiếm, lọc và phân trang (Sử dụng POST /search)
  search: async (
    params: PageableRequest,
    filter: StudentFilterRequest,
  ): Promise<ApiResponse<PageResponse<StudentResponse>>> => {
    const response = await api.post("/students/search", filter, {
      params, // page, size, sort
    });
    return response.data;
  },

  // 4. Xóa sinh viên
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

export default studentService;
