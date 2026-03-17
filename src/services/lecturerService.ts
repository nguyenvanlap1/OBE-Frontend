import api from "./api";

export interface CreateLecturerRequest {
  id: string;
  fullName: string;
  gender: string;
  password: string;
}

const lecturerService = {
  // Lấy tất cả giảng viên
  getAll: async () => {
    const response = await api.get("/lecturers");
    return response.data;
  },

  // Tạo giảng viên mới
  create: async (data: CreateLecturerRequest) => {
    const response = await api.post("/lecturers", data);
    return response.data;
  },

  // Lấy giảng viên theo id
  getById: async (id: string) => {
    const response = await api.get(`/lecturers/${id}`);
    return response.data;
  },

  // Xóa giảng viên
  delete: async (id: string) => {
    const response = await api.delete(`/lecturers/${id}`);
    return response.data;
  },

  // Cập nhật giảng viên
  update: async (id: string, data: Partial<CreateLecturerRequest>) => {
    const response = await api.put(`/lecturers/${id}`, data);
    return response.data;
  },
};

export default lecturerService;
