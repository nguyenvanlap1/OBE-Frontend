import api, {
  type ApiResponse,
  type PageableRequest,
  type PageResponse,
} from "./api";

// 1. Định nghĩa Interface dựa trên SemesterResponse và Request từ Backend
export interface Semester {
  id: number; // Optional khi tạo mới (POST), có giá trị khi nhận từ API
  term: number;
  academicYear: string;
  startDate: string; // LocalDate từ Java sẽ map thành string (ISO format) ở TS
  endDate: string;
  label?: string; // Trường bổ sung từ SemesterResponse
}

// 2. Định nghĩa Service
const semesterService = {
  // Lấy danh sách phân trang (Sử dụng GET như trong Controller đã viết)
  search: async (
    params: PageableRequest,
    filter: Semester, // Nhận thêm object filter
  ): Promise<ApiResponse<PageResponse<Semester>>> => {
    const response = await api.post<ApiResponse<PageResponse<Semester>>>(
      "/semesters/search", // Endpoint search mới
      filter,
      { params },
    );
    return response.data;
  },

  // Tạo mới học kỳ
  create: async (data: Semester): Promise<ApiResponse<Semester>> => {
    const response = await api.post<ApiResponse<Semester>>("/semesters", data);
    return response.data;
  },

  // Cập nhật học kỳ
  update: async (
    id: number,
    data: Semester,
  ): Promise<ApiResponse<Semester>> => {
    const response = await api.put<ApiResponse<Semester>>(
      `/semesters/${id}`,
      data,
    );
    return response.data;
  },

  // Xóa học kỳ
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/semesters/${id}`);
    return response.data;
  },
};

export default semesterService;
