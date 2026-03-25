import api, {
  type ApiResponse,
  type PageableRequest,
  type PageResponse,
} from "./api";

// 1. Định nghĩa Interface dựa trên Entity Backend
export interface SchoolYear {
  id: string; // Tương ứng với @Id (VD: "K48", "2024-2028")
}

// 2. Định nghĩa Service
const schoolYearService = {
  // Đổi tên từ getAll sang search để khớp với InfiniteGrid
  search: async (
    params: PageableRequest,
    filter: SchoolYear,
  ): Promise<ApiResponse<PageResponse<SchoolYear>>> => {
    // Truyền params (page, size) vào query string và filter vào body
    const response = await api.post<ApiResponse<PageResponse<SchoolYear>>>(
      "/school-years/search",
      filter,
      { params },
    );
    return response.data;
  },

  // 2. Tạo mới: Trả về ApiResponse chứa 1 đối tượng SchoolYear
  create: async (data: SchoolYear) => {
    const response = await api.post<ApiResponse<SchoolYear>>(
      "/school-years",
      data,
    );
    return response.data;
  },

  // 3. Xóa: Trả về ApiResponse không có data (void)
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/school-years/${id}`);
    return response.data;
  },
};

export default schoolYearService;
