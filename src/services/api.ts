import axios, { AxiosError } from "axios";
import qs from "qs"; // Cần cài: npm install qs

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: "repeat" });
  },
  withCredentials: true, // ❗ BẮT BUỘC: Để gửi và nhận Cookie
});

// Interceptor xử lý phản hồi
api.interceptors.response.use(
  (response) => response, // Thành công thì trả về nguyên vẹn
  (error: AxiosError<ApiResponse<null>>) => {
    // Nếu Backend có trả về ApiResponse lỗi (400, 401, 500...)
    if (error.response && error.response.data) {
      // Throw chính cái Object { status, message, data } đó ra để bạn dùng
      return Promise.reject(error.response.data);
    }
    // Nếu là lỗi mạng hoặc lỗi không xác định
    return Promise.reject({
      status: 500,
      message: "Lỗi kết nối hoặc hệ thống không phản hồi",
    });
  },
);

export default api;

// Interface bọc ngoài cùng cho mọi Response từ Spring Boot
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Interface cho dữ liệu phân trang (PageResponse)
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Interface cho các tham số phân trang gửi lên Server (thay thế any)
export interface PageableRequest {
  page?: number; // Số trang (bắt đầu từ 0)
  size?: number; // Số bản ghi mỗi trang
  sort?: string[]; // Ví dụ: ["name,asc", "id,desc"]
}
