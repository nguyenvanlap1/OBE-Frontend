import api from "../../services/api";
import type { ApiResponse } from "../../services/api";

// --- Interfaces dựa trên Java DTOs ---

export interface PloCoMappingRequest {
  ploCode: string;
  coCode: string;
  weight: number;
}

export interface PloCoMappingResponse {
  ploCode: string;
  coCode: string;
  weight: number;
}

// Interface này dùng nếu bạn cần hiển thị thông tin Header (Course/Program)
export interface PloCoMappingResponseList {
  educationProgramId: string;
  educationProgramName: string;
  courseId: string;
  courseName: string;
  versionNumber: number;
  mappings: PloCoMappingResponse[];
}

export interface EducationProgramSummary {
  educationProgramId: string;
  educationProgramName: string;
}

export interface EducationProgramCourseSummaryList {
  courseId: string;
  courseVersionNumber: number;
  educationProgramSummaries: EducationProgramSummary[];
}

// --- PLO-CO Mapping Service ---
const ploCoMappingService = {
  /**
   * 1. Lấy danh sách ánh xạ PLO-CO hiện có
   * GET /api/v1/education-programs/{programId}/courses/{courseId}/plo-co-mappings
   */
  getMappings: async (
    programId: string,
    courseId: string,
  ): Promise<ApiResponse<PloCoMappingResponseList>> => {
    const response = await api.get(
      `/education-programs/${programId}/courses/${courseId}/plo-co-mappings`,
    );
    return response.data;
  },

  /**
   * 2. Thêm hoặc Cập nhật một ô trong ma trận (Upsert)
   * POST /api/v1/education-programs/{programId}/courses/{courseId}/plo-co-mappings
   */
  upsertMapping: async (
    programId: string,
    courseId: string,
    data: PloCoMappingRequest,
  ): Promise<ApiResponse<PloCoMappingResponse>> => {
    const response = await api.post(
      `/education-programs/${programId}/courses/${courseId}/plo-co-mappings`,
      data,
    );
    return response.data;
  },

  /**
   * 3. Xóa một ánh xạ (Gỡ bỏ mapping giữa PLO và CO)
   * DELETE /api/v1/education-programs/{programId}/courses/{courseId}/plo-co-mappings?ploCode=...&coCode=...
   */
  removeMapping: async (
    programId: string,
    courseId: string,
    ploCode: string,
    coCode: string,
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete(
      `/education-programs/${programId}/courses/${courseId}/plo-co-mappings`,
      {
        params: { ploCode, coCode },
      },
    );
    return response.data;
  },

  /**
   * 4. Lấy danh sách các CTĐT mà học phần đang tham gia
   * Lưu ý: Do Backend đặt hàm này trong PloCoMappingController có RequestMapping chung,
   * nên ta phải truyền thêm programId và courseId vào đường dẫn.
   */
  getCourseSummary: async (
    // programId: string, // Cần thêm tham số này
    courseId: string,
    version: number,
  ): Promise<ApiResponse<EducationProgramCourseSummaryList>> => {
    const response = await api.get(
      // Đường dẫn phải đi qua prefix của Controller trước
      `/education-programs/${"_"}/courses/${courseId}/plo-co-mappings/course-summary/${version}`,
    );
    return response.data;
  },
};

export default ploCoMappingService;
