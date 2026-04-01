import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

// --- Interfaces ---
export interface AccountResponse {
  id: string;
  username: string;
  enabled: boolean;
  isSystemAccount: boolean;
  fullName: string;
}

export interface AccountFilterRequest {
  username?: string;
  fullName?: string;
  enabled?: boolean;
  isSystemAccount?: boolean;
}

/**
 * Khớp hoàn toàn với AccountCreateRequestDetail.java
 */
export interface AccountCreateRequest {
  username: string;
  password: string; // Không để dấu '?' vì bên Java dùng @NotBlank (bắt buộc)
  enabled: boolean;
  // Phải trùng tên biến 'accountRoleSubDepartmentResponses' như trong Java DTO
  accountRoleSubDepartmentResponses: AccountRoleSubDepartmentRequest[];
}

export interface AccountChangePasswordByAdmin {
  username: string;
  password?: string;
}

export interface AccountChangePasswordByUser {
  username: string;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
}

/**
 * Dùng cho lúc NHẬN dữ liệu từ API (khớp với Response.java)
 */
export interface AccountRoleSubDepartmentResponse {
  accountId: string;
  roleId: string;
  roleName: string;
  subDepartmentId: string;
  subDepartmentName: string;
  departmentId: string;
  departmentName: string;
}

/**
 * Dùng cho lúc GỬI dữ liệu lên API (khớp với Request.java)
 */
export interface AccountRoleSubDepartmentRequest {
  accountId: string;
  roleId: string;
  subDepartmentId: string;
}

/**
 * Cập nhật lại Interface chính
 */
export interface AccountResponseDetail {
  id: string;
  username: string;
  enabled: boolean;
  isSystemAccount: boolean;
  fullName: string;
  // Chỗ này phải dùng bản Response vì Server trả về đầy đủ tên
  accountRoleSubDepartmentResponses: AccountRoleSubDepartmentResponse[];
}

export interface AccountRequestDetail {
  username: string;
  enabled: boolean;
  // Chỗ này dùng bản Request vì Client chỉ cần gửi ID lên để lưu
  accountRoleSubDepartmentResponses: AccountRoleSubDepartmentRequest[];
}

/**
 * Khớp với AccountRoleSubDepartmentRequest.java và Response
 */
export interface AccountRoleSubDepartment {
  accountId: string;
  roleId: string;
  subDepartmentId: string;
}

// --- Account Service ---
const accountService = {
  // 1. Tìm kiếm và phân trang (Sử dụng GET với params)
  getAccounts: async (
    pageable: PageableRequest,
    filter: AccountFilterRequest,
  ): Promise<ApiResponse<PageResponse<AccountResponse>>> => {
    const response = await api.get("/accounts", {
      params: { ...filter, ...pageable },
    });
    return response.data;
  },

  // 2. Tạo tài khoản
  create: async (
    data: AccountCreateRequest,
  ): Promise<ApiResponse<AccountResponse>> => {
    const response = await api.post("/accounts", data);
    return response.data;
  },

  // 3. Admin đổi mật khẩu
  changePasswordByAdmin: async (
    data: AccountChangePasswordByAdmin,
  ): Promise<ApiResponse<void>> => {
    const response = await api.put("/accounts/change-password/admin", data);
    return response.data;
  },

  // 4. User tự đổi mật khẩu
  changePasswordByUser: async (
    data: AccountChangePasswordByUser,
  ): Promise<ApiResponse<void>> => {
    const response = await api.put("/accounts/change-password/user", data);
    return response.data;
  },

  // 5. Bật/Tắt trạng thái
  toggleStatus: async (username: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/accounts/${username}/toggle`);
    return response.data;
  },

  // 6. Xóa tài khoản
  // Trong accountService.ts
  delete: async (username: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/accounts/${username}`);
    return response.data; // <--- Đảm bảo trả về response.data thay vì để trống
  },

  /**
   * GET /api/accounts/{username}
   * Lấy chi tiết tài khoản và các quyền (Roles/Departments)
   */
  getDetail: async (
    username: string,
  ): Promise<ApiResponse<AccountResponseDetail>> => {
    const response = await api.get<ApiResponse<AccountResponseDetail>>(
      `/accounts/${username}`,
    );
    return response.data;
  },

  /**
   * PUT /api/accounts/detail
   * Cập nhật thông tin chi tiết và danh sách phân quyền
   */
  updateDetail: async (
    data: AccountRequestDetail,
  ): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>("/accounts/detail", data);
    return response.data;
  },
};

export default accountService;
