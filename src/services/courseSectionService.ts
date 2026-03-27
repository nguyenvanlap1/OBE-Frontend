import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

/**
 * --- INTERFACES FOR REQUESTS & RESPONSES ---
 */

export interface CourseSectionResponseDetail {
  id: string;
  semesterTerm: number;
  semesterAcademicYear: string;

  // Thông tin học phần
  courseId: string;
  courseVersionName: string;
  versionNumber: number;

  // Thông tin giảng viên & đơn vị
  lecturerId: string;
  lecturerName: string;
  subDepartmentId: string;
  subDepartmentName: string;

  /**
   * Cấu hình các cột điểm của môn học (Header của bảng điểm)
   */
  assessmentResponses: {
    assessmentCode: string; // GK, CK, BT1...
    name: string;
    regulation: string;
    weight: number;
  }[];

  /**
   * Danh sách sinh viên và điểm số tương ứng (Body của bảng điểm)
   */
  enrollmentResponses: {
    id: number;
    studentId: string;
    studentFullName: string;

    // Chi tiết từng đầu điểm của sinh viên
    grades: {
      id: number;
      assessmentCode: string;
      score: number | null;
    }[];
  }[];
}

export interface GradeRequest {
  enrollmentId: string;
  assessmentCode: string; // GK, CK, BT1...
  score: number;
}

export interface GradeResponse {
  id?: number;
  assessmentCode: string;
  score: number;
  weight?: number;
}

export interface EnrollmentResponse {
  id: number;
  studentId: string;
  studentFullName: string;
  grades: GradeResponse[];
}

export interface CourseSectionResponse {
  id: string;
  semesterTerm: number;
  semesterAcademicYear: string;
  courseId: string;
  courseVersionName: string;
  versionNumber: number;
  lecturerId: string;
  lecturerName: string;
  subDepartmentId: string;
  subDepartmentName: string;
}

export interface CourseSectionCreateRequest {
  id: string;
  semesterTerm: number;
  semesterAcademicYear: string;
  courseId: string;
  versionNumber: number;
  lecturerId: string;
}

export type CourseSectionUpdateRequest = CourseSectionCreateRequest;

export interface CourseSectionFilterRequest {
  id?: string;
  semesterTerm?: number;
  semesterAcademicYear?: string;
  courseId?: string;
  courseVersionName?: string;
  versionNumber?: number;
  lecturerId?: string;
  lecturerName?: string;
  subDepartmentId?: string;
  subDepartmentName?: string;
}

/**
 * --- SERVICE IMPLEMENTATION ---
 */

const courseSectionService = {
  // 1. Tìm kiếm và phân trang lớp học phần
  search: async (
    params: PageableRequest,
    filter: CourseSectionFilterRequest,
  ): Promise<ApiResponse<PageResponse<CourseSectionResponse>>> => {
    const response = await api.post("/course-sections/search", filter, {
      params,
    });
    return response.data;
  },

  // 10. Lấy chi tiết lớp học phần (bao gồm cấu hình điểm và DS sinh viên)
  getDetail: async (
    id: string,
  ): Promise<ApiResponse<CourseSectionResponseDetail>> => {
    const response = await api.get(`/course-sections/${id}`);
    return response.data;
  },

  // 2. Tạo lớp học phần mới
  create: async (
    data: CourseSectionCreateRequest,
  ): Promise<ApiResponse<CourseSectionResponse>> => {
    const response = await api.post("/course-sections", data);
    return response.data;
  },

  // 3. Cập nhật thông tin lớp học phần
  update: async (
    id: string,
    data: CourseSectionUpdateRequest,
  ): Promise<ApiResponse<CourseSectionResponse>> => {
    const response = await api.put(`/course-sections/${id}`, data);
    return response.data;
  },

  // 4. Xóa lớp học phần
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/course-sections/${id}`);
    return response.data;
  },

  /**
   * --- QUẢN LÝ SINH VIÊN & ĐIỂM SỐ ---
   */

  // 5. Thêm sinh viên vào lớp học phần
  addStudent: async (
    sectionId: string,
    studentId: string,
  ): Promise<ApiResponse<void>> => {
    const response = await api.post(
      `/course-sections/${sectionId}/students/${studentId}`,
    );
    return response.data;
  },

  // 6. Xóa sinh viên khỏi lớp học phần
  removeStudent: async (
    sectionId: string,
    studentId: string,
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete(
      `/course-sections/${sectionId}/students/${studentId}`,
    );
    return response.data;
  },

  // 7. Cập nhật danh sách điểm cho một sinh viên cụ thể
  updateStudentGrades: async (
    sectionId: string,
    studentId: string,
    grades: GradeRequest[],
  ): Promise<ApiResponse<void>> => {
    const response = await api.put(
      `/course-sections/${sectionId}/students/${studentId}/grades`,
      grades,
    );
    return response.data;
  },

  // 8. Đồng bộ khung điểm cho toàn bộ lớp (Sync-grades)
  syncGrades: async (sectionId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(
      `/course-sections/${sectionId}/sync-grades`,
    );
    return response.data;
  },

  // 9. Kiểm tra tính nhất quán của điểm số (Validate)
  validateGrades: async (sectionId: string): Promise<ApiResponse<void>> => {
    const response = await api.get(
      `/course-sections/${sectionId}/validate-grades`,
    );
    return response.data;
  },
};

export default courseSectionService;
