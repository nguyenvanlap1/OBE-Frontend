import api, { type ApiResponse } from "./api";

// Interface cho quyền hạn
export interface PermissionResponse {
  id: string; // ví dụ: "USER_READ"
  name: string; // ví dụ: "Xem người dùng"
  scope: string;
  description: string;
}

// Interface cho một lượt gán (Khoa - Bộ môn - Vai trò)
export interface UserAssignmentDTO {
  departmentId: string;
  departmentName: string;
  subDepartmentId: string;
  subDepartmentName: string;
  roleId: string;
  roleName: string;
  permissions: PermissionResponse[];
}

// Interface chính cho API /api/me
export interface UserMeResponse {
  username: string;
  fullName: string;
  isSystemAccount: boolean;
  assignments: UserAssignmentDTO[];
}

const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post("/login", { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/logout");
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<UserMeResponse>> => {
    const response = await api.get<ApiResponse<UserMeResponse>>("/me");
    return response.data; // Trả về ApiResponse chứa UserMeResponse
  },
};

export default authService;
