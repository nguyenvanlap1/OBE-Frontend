import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

/**
 * --- INTERFACES FOR REQUESTS ---
 */

export interface CourseVersionFilterRequest {
  courseId?: string;
  versionNumber?: number;
  credits?: number;
  courseName?: string;
  active?: boolean;
  subDepartmentId?: string;
  departmentId?: string;
  educationProgramId?: string;
}

export interface CourseVersionRequestCreateFirstDetail {
  courseId: string;
  name: string;
  subDepartmentId: string;
  credits: number;
  fromDate: string; // LocalDate mapping to string (ISO format)
  toDate?: string;
  cos: CoRequest[];
  clos: CloRequest[];
  assessments: AssessmentRequest[];
  coCloMappings: CoCloMappingRequest[];
  assessmentCloMappings: AssessmentCloMappingRequest[];
}

export interface CourseVersionRequestCreateDetail {
  courseId: string;
  name: string;
  credits: number;
  fromDate: string;
  toDate?: string;
  cos: CoRequest[];
  clos: CloRequest[];
  assessments: AssessmentRequest[];
  coCloMappings: CoCloMappingRequest[];
  assessmentCloMappings: AssessmentCloMappingRequest[];
}

export interface CourseVersionRequestUpdateDetail {
  courseId: string;
  subDepartmentId: string;
  versionNumber: number;
  name: string;
  credits: number;
  fromDate: string;
  toDate?: string;
  cos: (CoRequest & { id: number | null })[];
  clos: (CloRequest & { id: number | null })[];
  assessments: (AssessmentRequest & { id: number | null })[];
  coCloMappings: CoCloMappingRequest[];
  assessmentCloMappings: AssessmentCloMappingRequest[];
}

// Sub-interfaces cho Request
interface CoRequest {
  coCode: string;
  content: string;
}

interface CloRequest {
  cloCode: string;
  content: string;
}

interface AssessmentRequest {
  assessmentCode: string;
  name: string;
  regulation: string;
  weight: number;
}

interface CoCloMappingRequest {
  coCode: string;
  cloCode: string;
  weight: number;
}

interface AssessmentCloMappingRequest {
  assessmentCode: string;
  cloCode: string;
  weight: number;
}

/**
 * --- INTERFACES FOR RESPONSES ---
 */

export interface CourseVersionResponse {
  versionNumber: number;
  credits: number;
  fromDate: string;
  toDate: string | null;
  courseId: string;
  courseName: string;
  subDepartmentId: string;
  departmentId: string;
  departmentName: string;
  departmentDescription: string;
}

export interface CourseVersionResponseDetail {
  courseId: string;
  subDepartmentId: string;
  subDepartmentName: string;
  departmentId: string;
  departmentName: string;
  versionNumber: number;
  name: string;
  credits: number;
  fromDate: string;
  toDate: string | null;
  cos: { id: number; coCode: string; content: string }[];
  clos: { id: number; cloCode: string; content: string }[];
  assessments: {
    id: number;
    assessmentCode: string;
    name: string;
    regulation: string;
    weight: number;
  }[];
  coCloMappings: {
    coCode: string;
    cloCode: string;
    weight: number;
  }[];
  assessmentCloMappings: {
    assessmentCode: string;
    assessmentName: string;
    cloCode: string;
    weight: number;
  }[];
}

/**
 * --- SERVICE IMPLEMENTATION ---
 */

const courseVersionService = {
  // 1. Tìm kiếm và phân trang
  search: async (
    params: PageableRequest,
    filter: CourseVersionFilterRequest,
  ): Promise<ApiResponse<PageResponse<CourseVersionResponse>>> => {
    const response = await api.post("/course-versions/search", filter, {
      params,
    });
    return response.data;
  },

  // 2. Lấy chi tiết phiên bản (Dựa trên Path Variables /{courseId}/{versionNumber})
  getDetail: async (
    courseId: string,
    versionNumber: number,
  ): Promise<ApiResponse<CourseVersionResponseDetail>> => {
    const response = await api.get(
      `/course-versions/${courseId}/${versionNumber}`,
    );
    return response.data;
  },

  // 3. Tạo học phần và phiên bản đầu tiên
  createFirst: async (
    data: CourseVersionRequestCreateFirstDetail,
  ): Promise<ApiResponse<CourseVersionResponseDetail>> => {
    const response = await api.post("/course-versions/first", data);
    return response.data;
  },

  // 4. Tạo phiên bản kế tiếp
  createNext: async (
    data: CourseVersionRequestCreateDetail,
  ): Promise<ApiResponse<CourseVersionResponseDetail>> => {
    const response = await api.post("/course-versions/next", data);
    return response.data;
  },

  // 5. Cập nhật chi tiết phiên bản
  update: async (
    data: CourseVersionRequestUpdateDetail,
  ): Promise<ApiResponse<CourseVersionResponseDetail>> => {
    const response = await api.put("/course-versions", data);
    return response.data;
  },

  // 6. Xóa phiên bản
  delete: async (
    courseId: string,
    versionNumber: number,
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete(
      `/course-versions/${courseId}/${versionNumber}`,
    );
    return response.data;
  },
};

export default courseVersionService;
