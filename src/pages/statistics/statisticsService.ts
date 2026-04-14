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
  studentId: string;
  assessmentCode: number;
  assessmentName: string;
  score: number;
}

export interface StudentCloResult {
  studentId: string;
  cloCode: string;
  cloScore: number;
}

export interface StudentCoResult {
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
export const statisticsService = {
  calculateOBE: async (request: CourseClassStatisticsRequest) => {
    const response = await api.post("/statistics/aggregate-obe", request);

    // ❌ KHÔNG map, KHÔNG mutate, KHÔNG enrich
    return response.data;
  },
};

export default statisticsService;
