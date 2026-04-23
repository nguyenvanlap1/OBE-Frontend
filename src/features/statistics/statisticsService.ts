// ==============================
// 🔥 RESPONSE (MATCH BACKEND)
// ==============================

import api from "../../services/api";

export interface AssessmentResult {
  assessmentCode: number;
  assessmentName: string;
  studentsPassed: number;
  level: number;
  percentage: number;
  description: string;
}

export interface StudentAssessmentResult {
  enrollmentId: number;
  studentId: string;
  assessmentCode: number;
  assessmentName: string;
  score: number;
}

export interface StudentCloResult {
  enrollmentId: number;
  studentId: string;
  cloCode: string;
  cloScore: number;
}

export interface StudentCoResult {
  enrollmentId: number;
  studentId: string;
  coCode: string;
  coScore: number;
}

export interface CloResult {
  cloCode: string;
  averageScore: number;
  percentage: number;
  level: number;
}

export interface CoResult {
  coCode: string;
  averageScore: number;
  percentage: number;
  level: number;
}

export interface CourseSectionAnalyticsResponse {
  courseSectionId: string;
  courseName: string;
  totalStudents: number;
  benchmark: number;

  assessmentResults: AssessmentResult[];

  studentAssessmentResults: StudentAssessmentResult[];
  studentCloResults: StudentCloResult[];
  studentCoResults: StudentCoResult[];

  cloResults: CloResult[];
  coResults: CoResult[];
}

export interface LevelThreshold {
  levelValue: number;
  thresholdPercentage: number;
  description: string;
}

export interface CourseClassStatisticsRequest {
  courseId: string;
  versionNumber: number;

  courseSectionIds: string[];

  sectionAssessmentCodes: number[];

  benchmarkScore: number;

  levels: LevelThreshold[];
}

// ==============================
// 📊 STUDENT CLASS ANALYTICS (MATCH BACKEND)
// ==============================

export interface PoResult {
  poCode: string;
  averageScore: number;
  percentage: number;
  level: number;
}

export interface PloResult {
  ploCode: string;
  averageScore: number;
  percentage: number;
  level: number;
}

// Cấu trúc lồng nhau trong từng môn học
export interface CourseSummary {
  courseId: string;
  courseName: string;
  assessments: AssessmentResult[];
  clos: CloResult[];
  cos: CoResult[];
}

// Thêm 2 interface này để chứa dữ liệu điểm chi tiết từng sinh viên
export interface StudentPoResult {
  studentId: string;
  poCode: string;
  poScore: number;
}

export interface StudentPloResult {
  studentId: string;
  ploCode: string;
  ploScore: number;
}

// Cập nhật interface chính
export interface StudentClassAnalyticsResponse {
  educationProgramId: string;
  educationProgramName: string;
  totalStudents: number;
  poResults: PoResult[];
  ploResults: PloResult[];
  courseSummaries: CourseSummary[];

  // 🔥 Bổ sung 2 mảng này để map với Backend
  studentPoResults: StudentPoResult[];
  studentPloResults: StudentPloResult[];
}

// Request cho thống kê lớp
export interface StudentClassStatisticsRequest {
  programId: string;
  studentClassIds: string[];
  benchmarkScore: number;
  levels: LevelThreshold[];
}

export const statisticsService = {
  calculateOBE: async (request: CourseClassStatisticsRequest) => {
    const response = await api.post("/statistics/aggregate-obe", request);

    // ❌ KHÔNG map, KHÔNG mutate, KHÔNG enrich
    return response.data;
  },

  // BỔ SUNG: Thống kê theo Lớp sinh viên (Student Classes)
  calculateStudentClassesOBE: async (
    request: StudentClassStatisticsRequest,
  ) => {
    const response = await api.post(
      "/statistics/student-classes/aggregate-obe",
      request,
    );

    // Trả về dữ liệu nguyên bản từ API (đã bao gồm nested courseSummaries)
    return response.data;
  },
};

export default statisticsService;
