import api from "../../services/api";
import type {
  ApiResponse,
  PageableRequest,
  PageResponse,
} from "../../services/api";

/**
 * --- INTERFACES FOR REQUESTS & RESPONSES ---
 */
export interface GradeRequest {
  sectionAssessmentCode: number;
  score: number;
}

export interface GradeResponse {
  id: number;
  sectionAssessmentCode: number;
  score: number;
}

export interface EnrollmentRequest {
  id: number;
  grades: GradeRequest[];
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

export interface CourseSectionGradeResponse {
  id: string;
  // Assessments (từ CourseVersion)
  assessmentResponses: AssessmentResponse[];

  // SectionAssessment (mapping theo lớp)
  sectionAssessmentResponses: SectionAssessmentResponse[];

  // Danh sách sinh viên + điểm
  enrollmentResponses: EnrollmentResponse[];
}

export interface AssessmentResponse {
  assessmentCode: number;
  name: string;
  regulation: string;
  weight: number;
}

export interface SectionAssessmentResponse {
  id: number;
  sectionAssessmentCode: number;
}

export interface CourseSectionFilterRequest {
  id?: string;
  semesterTerm?: number;
  semesterAcademicYear?: string;

  // Course info
  courseId?: string;
  courseVersionName?: string;
  versionNumber?: number;

  // Lecturer
  lecturerId?: string;
  lecturerName?: string;

  // SubDepartment
  subDepartmentId?: string;
  subDepartmentName?: string;
}

export interface CourseSectionBaseRequest {
  id: string;
  semesterTerm: number;
  semesterAcademicYear: string;

  courseId: string;
  versionNumber: number;

  lecturerId: string;
}

export type CourseSectionCreateRequest = CourseSectionBaseRequest;

export type CourseSectionUpdateRequest = CourseSectionBaseRequest;

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
  ): Promise<ApiResponse<CourseSectionResponse>> => {
    const response = await api.get(`/course-sections/${id}`);
    return response.data;
  },

  // Lấy chi tiết bảng điểm của lớp học phần
  getGrade: async (
    id: string,
  ): Promise<ApiResponse<CourseSectionGradeResponse>> => {
    const response = await api.get(`/course-sections/${id}/grades`);
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
  ): Promise<ApiResponse<EnrollmentResponse>> => {
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
  updateStudentGradesBatch: async (
    sectionId: string,
    enrollmentId: string,
    data: EnrollmentRequest,
  ): Promise<ApiResponse<EnrollmentResponse>> => {
    const response = await api.put(
      `/course-sections/${sectionId}/students/${enrollmentId}/grades-batch`,
      data,
    );
    return response.data;
  },

  // 8. Cập nhật một đầu điểm đơn lẻ (Phục vụ AG Grid)
  // URL mới: PATCH /api/course-sections/{sectionId}/enrollments/{enrollmentId}/grades/{saCode}?score={score}
  updateSingleGrade: async (
    sectionId: string, // Thêm tham số sectionId
    enrollmentId: number,
    saCode: number,
    score: number,
  ): Promise<ApiResponse<EnrollmentResponse>> => {
    const response = await api.patch(
      `/course-sections/${sectionId}/enrollments/${enrollmentId}/grades/${saCode}`,
      null, // Body để trống vì backend dùng @RequestParam
      {
        params: { score },
      },
    );
    return response.data;
  },
};

export default courseSectionService;
