import type {
  ApiResponse,
  PageableRequest,
  PageResponse,
} from "../../../services/api";
import api from "../../../services/api";

export interface ProcessInstanceResponseDTO {
  id: string; // ID của Instance (dùng làm key chính)
  processId: string; // ID của định nghĩa quy trình (Process Definition ID)
  processName: string;
  processInstanceId: string; // Đồng bộ với trường id
  processDefinitionKey: string;
  taskId: string | null; // ID của task hiện tại đang chờ (nếu có)
  taskName: string; // Tên bước hiện tại
  taskDefinitionKey: string | null;
  isMyTask: boolean; // User hiện tại có phải người xử lý task này không
  currentAssignee: string;
  createTime: string;
  status: string; // "Đang chạy" hoặc "Đã xong"
}

const workflowCommonService = {
  // Lấy danh sách quy trình DO TÔI TẠO (My Requests)
  getMyStartedProcesses: async (
    params: PageableRequest,
  ): Promise<ApiResponse<PageResponse<ProcessInstanceResponseDTO>>> => {
    const response = await api.get("/workflow/my-processes", { params });
    return response.data;
  },

  // Lấy danh sách quy trình TÔI THAM GIA (Duyệt hoặc từng duyệt qua)
  getMyInvolvedProcesses: async (
    params: PageableRequest,
  ): Promise<ApiResponse<PageResponse<ProcessInstanceResponseDTO>>> => {
    const response = await api.get("/workflow/my-involved", { params });
    return response.data;
  },

  // Lấy thông tin task hiện tại của một quy trình bất kỳ
  getCurrentTask: async (
    processInstanceId: string,
  ): Promise<ApiResponse<ProcessInstanceResponseDTO>> => {
    const response = await api.get(
      `/workflow/process/${processInstanceId}/current-task`,
    );
    return response.data;
  },
};

export default workflowCommonService;
