import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

// --- Interface cho Course & CourseVersion ---
export interface CourseResponse {
  id: string;
  defaultName: string;
  subDepartmentId: string;
  versionNumber: number;
  name: string;
  credits: number;
  fromDate: string; // ISO Date string
  toDate: string | null;
}

export interface CourseResponseDetail {
  courseId: string;
  defaultName: string;
  subDepartmentId: string;
  subDepartmentName: string;
  versionNumber: number;
  credits: number;
  fromDate: string;
  toDate: string | null;

  cos: {
    id: number;
    code: string; // Bổ sung mã CO (CO1, CO2...)
    content: string; // Đổi từ description -> content
  }[];

  clos: {
    id: number;
    code: string; // Bổ sung mã CLO (CLO1, CLO2...)
    content: string; // Đổi từ description -> content
  }[];

  assessments: {
    id: number;
    name: string;
    regulation: string; // Bổ sung quy định (Bắt buộc/Tùy chọn)
    weight: number;
  }[];

  coCloMappings: {
    coId: number;
    cloId: number;
    weight: number;
  }[];

  assessmentCloMappings: {
    assessmentId: number;
    cloId: number;
    weight: number;
  }[];
}

export interface CourseCreateRequest {
  id: string;
  defaultName: string;
  subDepartmentId: string;
  credits: number;
  fromDate: string;
  toDate?: string;
}

export interface CourseUpdateRequest extends CourseCreateRequest {
  versionNumber: number;
  name: string;
  isNewVersion: boolean; // Để xác định ghi đè hay tạo version mới
}

// Interface đại diện cho CourseUpdateRequestDetail ở Back-end
export interface CourseUpdateRequestDetail {
  courseId: string;
  defaultName: string;
  subDepartmentId: string;
  versionNumber: number;
  credits: number;
  fromDate: string;
  toDate: string | null;

  cos: {
    id: number | null; // null nếu là thêm mới hàng trong bảng
    code: string;
    content: string;
  }[];

  clos: {
    id: number | null;
    code: string;
    content: string;
  }[];

  assessments: {
    id: number | null;
    name: string;
    regulation: string;
    weight: number;
  }[];

  coCloMappings: {
    coId: number;
    cloId: number;
    weight: number;
  }[];

  assessmentCloMappings: {
    assessmentId: number;
    cloId: number;
    weight: number;
  }[];
}

export interface CourseFilterRequest {
  id?: string;
  defaultName?: string;
  subDepartmentId?: string;
  departmentId?: string;
  educationProgramId?: string;
  versionNumber?: number;
  name?: string;
  credits?: number;
  fromDate?: string;
  toDate?: string;
}

// --- Course Service ---
const courseService = {
  // 1. Tạo mới học phần (và version đầu tiên)
  create: async (
    data: CourseCreateRequest,
  ): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.post("/courses", data);
    return response.data;
  },

  // BỔ SUNG: Tạo CHI TIẾT đề cương cho học phần mới hoàn toàn
  createDetail: async (
    data: CourseUpdateRequestDetail,
  ): Promise<ApiResponse<CourseResponseDetail>> => {
    // Gọi đến endpoint @PostMapping("/detail") vừa thêm ở Controller
    const response = await api.post("/courses/detail", data);
    return response.data;
  },

  // 2. Cập nhật học phần hoặc tạo phiên bản mới
  update: async (
    data: CourseUpdateRequest,
  ): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.put("/courses", data);
    return response.data;
  },

  // 8. Cập nhật CHI TIẾT học phần (CO, CLO, Matrix...)
  updateDetail: async (
    data: CourseUpdateRequestDetail,
  ): Promise<ApiResponse<CourseResponseDetail>> => {
    // Gọi đến endpoint @PutMapping("/detail") mà chúng ta vừa viết ở Controller
    const response = await api.put("/courses/detail", data);
    return response.data;
  },

  // 3. Tìm kiếm và phân trang
  search: async (
    params: PageableRequest,
    filter: CourseFilterRequest,
  ): Promise<ApiResponse<PageResponse<CourseResponse>>> => {
    const response = await api.post("/courses/search", filter, { params });
    return response.data;
  },

  // 7. Lấy chi tiết học phần, bao gồm cả ma trận ánh xạ (CO-CLO, Assessment-CLO)
  getDetail: async (
    id: string,
    versionNumber: number,
  ): Promise<ApiResponse<CourseResponseDetail>> => {
    const response = await api.get(
      `/courses/${id}/versions/${versionNumber}/detail`,
    );
    return response.data;
  },

  // 4. Lấy lịch sử tất cả phiên bản của 1 học phần
  getAllVersions: async (
    id: string,
  ): Promise<ApiResponse<CourseResponse[]>> => {
    const response = await api.get(`/courses/${id}/versions`);
    return response.data;
  },

  // 5. Xóa một phiên bản cụ thể
  deleteVersion: async (
    id: string,
    versionNumber: number,
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete(
      `/courses/${id}/versions/${versionNumber}`,
    );
    return response.data;
  },

  // 6. Xóa toàn bộ học phần (tất cả các version)
  deleteFullCourse: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};

export default courseService;
