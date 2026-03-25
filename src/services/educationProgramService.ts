import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

export interface EducationProgramRequest {
  id: string;
  name: string;
  educationLevel: string;
  requiredCredits: number;
  subDepartmentId: string;
  schoolYearIds: string[];
}

// Interface cho việc cập nhật chi tiết (PO, PLO, Mapping)
export interface EducationProgramRequestUpdateDetail {
  id: string;
  name: string;
  educationLevel: string;
  requiredCredits: number;
  subDepartmentId: string;
  schoolYearIds: string[];

  pos: {
    id: number | null; // null nếu là tạo mới
    poCode: string;
    content: string;
  }[];

  plos: {
    id: number | null;
    ploCode: string;
    content: string;
  }[];

  ploPoMappings: {
    ploCode: string;
    poCode: string;
    weight: number;
  }[];
}

export interface EducationProgramResponse {
  id: string;
  name: string;
  educationLevel: string;
  requiredCredits: number;
  subDepartmentId: string;
  subDepartmentName: string;
  departmentId: string;
  departmentName: string;
  schoolYearIds: string[];
  totalCourses: number;
}

export interface EducationProgramFilterRequest {
  id?: string;
  name?: string;
  educationLevel?: string;
  subDepartmentId?: string;
  departmentId?: string;
  schoolYearId?: string;
}

// Chi tiết PO, PLO, Mapping cho view Detail
export interface EducationProgramResponseDetail {
  id: string;
  name: string;
  educationLevel: string;
  requiredCredits: number;
  subDepartmentId: string;
  subDepartmentName: string;

  schoolYearIds: string[];
  // Danh sách mục tiêu đào tạo (PO)
  pos: {
    id: number;
    poCode: string;
    content: string;
  }[];

  // Danh sách chuẩn đầu ra chương trình (PLO)
  plos: {
    id: number;
    ploCode: string;
    content: string;
  }[];

  // Danh sách mapping giữa PLO và PO
  ploPoMappings: {
    ploId: number;
    ploCode: string;
    poId: number;
    poCode: string;
    weight: number;
  }[];
}

// --- Service Implementation ---

const educationProgramService = {
  // 1. Tạo mới chương trình đào tạo
  create: async (
    data: EducationProgramRequest,
  ): Promise<ApiResponse<EducationProgramResponse>> => {
    const response = await api.post("/education-programs", data);
    return response.data;
  },

  // 2. Tìm kiếm, lọc và phân trang (POST /search)
  search: async (
    params: PageableRequest,
    filter: EducationProgramFilterRequest,
  ): Promise<ApiResponse<PageResponse<EducationProgramResponse>>> => {
    const response = await api.post("/education-programs/search", filter, {
      params,
    });
    return response.data;
  },

  // 3. Lấy chi tiết chương trình (bao gồm PO/PLO/Mapping)
  getById: async (
    id: string,
  ): Promise<ApiResponse<EducationProgramResponseDetail>> => {
    const response = await api.get(`/education-programs/${id}`);
    return response.data;
  },

  // 4. Cập nhật chương trình
  update: async (
    id: string,
    data: EducationProgramRequest,
  ): Promise<ApiResponse<EducationProgramResponse>> => {
    const response = await api.put(`/education-programs/${id}`, data);
    return response.data;
  },

  // 5. Xóa chương trình
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/education-programs/${id}`);
    return response.data;
  },

  // 6. Thêm học phần vào chương trình (Query Params)
  addCourse: async (
    programId: string,
    courseId: string,
    versionNumber?: number,
  ): Promise<ApiResponse<void>> => {
    const response = await api.post(
      `/education-programs/${programId}/courses`,
      null,
      {
        params: { courseId, versionNumber },
      },
    );
    return response.data;
  },

  // 7. Xóa học phần khỏi chương trình (Query Params)
  removeCourse: async (
    programId: string,
    courseId: string,
    versionNumber: number,
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete(
      `/education-programs/${programId}/courses`,
      {
        params: { courseId, versionNumber },
      },
    );
    return response.data;
  },

  updateDetail: async (
    id: string,
    data: EducationProgramRequestUpdateDetail,
  ): Promise<ApiResponse<EducationProgramResponseDetail>> => {
    const response = await api.put(`/education-programs/${id}/detail`, data);
    return response.data;
  },
};

export default educationProgramService;
