import api from "./api";
import type { ApiResponse } from "./api";

// --- Interfaces ---

export interface AssessmentSummary {
  id: number;
  assessmentCode: number;
  name: string;
  weight: number;
  score: number | null;
}

export interface CloSummary {
  id: number;
  cloCode: string;
  content: string;
  score: number;
  assessmentIds?: number[];
  assessmentSummaries?: AssessmentSummary[]; // Bổ sung để chứa object lồng
}

export interface CoSummary {
  id: number;
  courseId: string;
  coCode: string;
  content: string;
  score: number;
  cloIds?: number[];
  cloSummaries?: CloSummary[]; // Bổ sung
}

export interface CourseGradeSummary {
  courseId: string;
  courseName: string;
  finalScore: number | null;
  letterGrade: string;
  assessmentSummaries: AssessmentSummary[];
  clos: CloSummary[];
  cos: CoSummary[];
}

export interface PloSummary {
  id: number;
  ploCode: string;
  content: string;
  score: number;
  coIds?: number[];
  coSummaries?: CoSummary[]; // Bổ sung
}

export interface PoSummary {
  id: number;
  poCode: string;
  content: string;
  score: number;
  ploIds?: number[];
  ploSummaries?: PloSummary[]; // Bổ sung
}

export interface EducationProgramSummary {
  id: string;
  name: string;
  studentClassesId: string;
  courses: CourseGradeSummary[];
  plos: PloSummary[];
  pos: PoSummary[];
}

export interface StudentAcademicResultResponse {
  id: string;
  educationProgramSummary: EducationProgramSummary;
}

// --- Helper Logic: Mapping Data Objects based on IDs ---

/**
 * Hàm này giả lập lại logic populateAllIds của Backend
 * Giúp UI chỉ cần gọi po.ploSummaries là có dữ liệu thay vì phải đi find trong mảng gốc
 */
const enrichData = (
  data: StudentAcademicResultResponse,
): StudentAcademicResultResponse => {
  const summary = data.educationProgramSummary;

  // 1. Tạo Map để truy xuất nhanh
  const ploMap = new Map(summary.plos.map((p) => [p.id, p]));
  const allCosInProgram: CoSummary[] = summary.courses.flatMap((c) => c.cos);
  const coMap = new Map(allCosInProgram.map((c) => [c.id, c]));

  // 2. Xử lý cấp Course -> CLO -> Assessment
  summary.courses.forEach((course) => {
    const asmMap = new Map(course.assessmentSummaries.map((a) => [a.id, a]));
    const cloMapInCourse = new Map(course.clos.map((c) => [c.id, c]));

    course.clos.forEach((clo) => {
      clo.assessmentSummaries = clo.assessmentIds
        ?.map((id) => asmMap.get(id)!)
        .filter(Boolean);
    });

    course.cos.forEach((co) => {
      co.cloSummaries = co.cloIds
        ?.map((id) => cloMapInCourse.get(id)!)
        .filter(Boolean);
    });
  });

  // 3. Xử lý cấp PLO -> CO
  summary.plos.forEach((plo) => {
    plo.coSummaries = plo.coIds?.map((id) => coMap.get(id)!).filter(Boolean);
  });

  // 4. Xử lý cấp PO -> PLO
  summary.pos.forEach((po) => {
    po.ploSummaries = po.ploIds?.map((id) => ploMap.get(id)!).filter(Boolean);
  });

  return data;
};

// --- Student Academic Service ---

const studentAcademicService = {
  getStudentResult: async (
    studentId: string,
    programId: string,
  ): Promise<ApiResponse<StudentAcademicResultResponse>> => {
    const response = await api.get<ApiResponse<StudentAcademicResultResponse>>(
      `/academic-results/student/${studentId}/program/${programId}`,
    );

    // Thực hiện lồng dữ liệu trước khi trả về cho Component
    if (response.data?.data) {
      response.data.data = enrichData(response.data.data);
    }

    return response.data;
  },

  refreshStudentResult: async (
    studentId: string,
    programId: string,
  ): Promise<ApiResponse<StudentAcademicResultResponse>> => {
    const response = await api.post<ApiResponse<StudentAcademicResultResponse>>(
      `/academic-results/student/${studentId}/program/${programId}/refresh`,
    );

    if (response.data?.data) {
      response.data.data = enrichData(response.data.data);
    }

    return response.data;
  },
};

export default studentAcademicService;
