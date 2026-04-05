import type {
  ApiResponse,
  PageableRequest,
  PageResponse,
} from "../../services/api";
import api from "../../services/api";

// --- Interface cho SubDepartment (Bộ môn) ---
export interface SubDepartmentResponse {
  id: string;
  name: string;
  description: string;
  departmentId: string; // ID của khoa chủ quản
  departmentName: string; // Tên khoa để hiển thị lên AG Grid
}

export interface SubDepartmentRequest {
  id: string;
  name: string;
  description?: string;
  departmentId: string; // Bắt buộc khi tạo/cập nhật
}

export interface SubDepartmentFilterRequest {
  id?: string;
  name?: string;
  departmentId?: string; // Dùng để lọc bộ môn theo từng khoa cụ thể
  departmentName?: string;
}

// --- SubDepartment Service ---
const subDepartmentService = {
  // 1. Tạo mới bộ môn
  create: async (
    data: SubDepartmentRequest,
  ): Promise<ApiResponse<SubDepartmentResponse>> => {
    const response = await api.post("/sub-departments", data);
    return response.data;
  },

  // 2. Cập nhật bộ môn (PUT)
  update: async (
    id: string,
    data: SubDepartmentRequest,
  ): Promise<ApiResponse<SubDepartmentResponse>> => {
    const response = await api.put(`/sub-departments/${id}`, data);
    return response.data;
  },

  // 3. Tìm kiếm, lọc và phân trang
  // Lưu ý: Controller của bạn chưa show hàm search, nhưng theo pattern Spring Boot bạn đang làm
  // thì thường sẽ là POST /search kèm theo Filter Body.
  search: async (
    params: PageableRequest,
    filter: SubDepartmentFilterRequest,
  ): Promise<ApiResponse<PageResponse<SubDepartmentResponse>>> => {
    const response = await api.post("/sub-departments/search", filter, {
      params,
    });
    return response.data;
  },

  // 4. Xóa bộ môn
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/sub-departments/${id}`);
    return response.data;
  },

  getByDepartmentId: async (
    departmentId: string,
  ): Promise<ApiResponse<SubDepartmentResponse[]>> => {
    const response = await api.get(
      `/sub-departments/department/${departmentId}`,
    );
    return response.data;
  },
};

export default subDepartmentService;
