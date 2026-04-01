import api from "./api";
import type { ApiResponse, PageableRequest, PageResponse } from "./api";

/**
 * Khớp với RolePermissionResponse.java
 */
export interface RolePermissionResponse {
  roleId: string;
  permissionId: string;
  permissionName: string;
  scopeType: string;
}

/**
 * Khớp với RoleResponse.java (Dùng cho danh sách rút gọn)
 */
export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
}

/**
 * Khớp với RoleResponseDetail.java (Dùng cho chi tiết vai trò)
 */
export interface RoleResponseDetail {
  id: string;
  name: string;
  description: string;
  rolePermissionResponses: RolePermissionResponse[];
}

/**
 * Khớp với RolePermissionRequest.java
 */
export interface RolePermissionRequest {
  roleId: string; // Optional vì khi tạo mới có thể chưa có roleId
  permissionId: string;
  scopeType: string; // VD: "DEPARTMENT", "FACULTY"
}

/**
 * Khớp với RoleRequestDetail.java
 * Đây là Payload dùng cho cả Create và Update
 */
export interface RoleRequest {
  id: string; // Mã vai trò (NotBlank)
  name: string;
  description: string;
  rolePermissionRequests: RolePermissionRequest[]; // Phải đúng tên biến này
}

/**
 * Khớp với RoleFilterRequest.java
 */
export interface RoleFilterRequest {
  id?: string; // Tìm theo mã
  name?: string; // Tìm theo tên
}

const roleService = {
  /**
   * POST /api/roles
   * Khớp với createRole(@Valid @RequestBody RoleRequestDetail request)
   */
  create: async (
    data: RoleRequest,
  ): Promise<ApiResponse<RoleResponseDetail>> => {
    const response = await api.post<ApiResponse<RoleResponseDetail>>(
      "/roles",
      data,
    );
    return response.data;
  },

  /**
   * POST /api/roles/search
   * Khớp với getRoles(@ParameterObject Pageable pageable, @RequestBody RoleFilterRequest filterRequest)
   */
  search: async (
    params: PageableRequest,
    filter: RoleFilterRequest,
  ): Promise<ApiResponse<PageResponse<RoleResponse>>> => {
    const response = await api.post<ApiResponse<PageResponse<RoleResponse>>>(
      "/roles/search",
      filter,
      { params },
    );
    return response.data;
  },

  /**
   * Lấy chi tiết vai trò bao gồm danh sách quyền hạn và phạm vi (Scope)
   * @param id Mã vai trò (VD: ROLE_ADMIN)
   * @return RoleResponseDetail chứa thông tin chi tiết và danh sách quyền
   */
  getById: async (id: string): Promise<ApiResponse<RoleResponseDetail>> => {
    const response = await api.get<ApiResponse<RoleResponseDetail>>(
      `/roles/${id}`,
    );
    return response.data;
  },

  /**
   * PUT /api/roles/{id}
   * Khớp với updateRole(@PathVariable("id") String id, @Valid @RequestBody RoleRequestDetail request)
   */
  update: async (
    id: string,
    data: RoleRequest,
  ): Promise<ApiResponse<RoleResponseDetail>> => {
    const response = await api.put<ApiResponse<RoleResponseDetail>>(
      `/roles/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * DELETE /api/roles/{id}
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/roles/${id}`);
    return response.data;
  },
};

export default roleService;
