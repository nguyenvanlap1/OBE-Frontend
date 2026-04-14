import type { ApiResponse } from "../../../services/api";
import api from "../../../services/api";

export interface UpdateCourseRequestDTO {
  content: string;
  selectedApprover: string;
  courseId: string;
  versionNumber?: number;
}

// Data trả về từ Map<String, Object> bao gồm cả courseData đã parse
export interface WorkflowDataResponse extends Record<string, any> {
  isEnded: boolean;
  processInstanceId: string;
  currentTaskId: string;
  taskDefinitionKey: string;
  courseData?: any;
}

const updateCourseWorkflowService = {
  // Khởi tạo quy trình cập nhật học phần mới
  startProcess: async (
    data: UpdateCourseRequestDTO,
  ): Promise<ApiResponse<string>> => {
    const response = await api.post("/workflow/course-version/start", data);
    return response.data;
  },

  // Lấy toàn bộ dữ liệu (Snapshot + Biến quy trình) dựa trên taskId
  getDataByTaskId: async (
    taskId: string,
  ): Promise<ApiResponse<WorkflowDataResponse>> => {
    const response = await api.get(
      `/workflow/course-version/task/${taskId}/data`,
    );
    return response.data;
  },

  /**
   * Hoàn thành một Task (Duyệt, Sửa nội dung, Gửi lại...)
   * @param taskId ID của task hiện tại
   * @param variables Các biến để điều hướng quy trình (ví dụ: { approved: true })
   */
  completeTask: async (
    taskId: string,
    variables: Record<string, any>,
  ): Promise<ApiResponse<void>> => {
    const response = await api.post(
      `/workflow/course-version/task/${taskId}/complete`,
      variables,
    );
    return response.data;
  },
};

export default updateCourseWorkflowService;
