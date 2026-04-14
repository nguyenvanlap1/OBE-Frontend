import api, { type ApiResponse } from "./api";
import { toast } from "react-toastify";

/**
 * Hàm hỗ trợ tải file nhị phân (Blob)
 * Xử lý an toàn cho cả TypeScript và lỗi từ Server
 */
const handleDownloadFile = async (
  endpoint: string,
  fileName: string,
): Promise<void> => {
  try {
    const response = await api.get(endpoint, {
      responseType: "blob",
    });

    // Lấy dữ liệu thực tế (xử lý trường hợp interceptor đã bóc tách .data hoặc chưa)
    const rawData = (response as any).data ? (response as any).data : response;

    // Ép kiểu về Blob để xử lý logic tiếp theo
    const blob = rawData as Blob;

    // --- KIỂM TRA NẾU SERVER TRẢ VỀ LỖI JSON ---
    if (blob.type === "application/json") {
      const text = await blob.text();
      try {
        const errorJson = JSON.parse(text);
        toast.error(errorJson.message || "Server báo lỗi không thể tạo file");
      } catch (e) {
        toast.error("Lỗi hệ thống: Server trả về dữ liệu không hợp lệ");
      }
      return;
    }

    // --- THỰC HIỆN TẢI FILE ---
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    // Dọn dẹp
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`Tải file thành công`);
  } catch (error: any) {
    console.error("Download error:", error);
    toast.error("Không thể kết nối tới Server để tải file");
  }
};

const excelService = {
  // 1. Tải mẫu sinh viên cho lớp danh nghĩa
  downloadStudentTemplate: async (): Promise<void> => {
    await handleDownloadFile(
      "/excel/template-students",
      "template_sinh_vien.xlsx",
    );
  },

  // 2. Tải mẫu sinh viên cho lớp học phần (Chỉ MSSV)
  downloadSectionTemplate: async (): Promise<void> => {
    await handleDownloadFile(
      "/excel/template-section-enrollment",
      "template_import_hoc_phan.xlsx",
    );
  },

  downloadGradeTemplate: async (): Promise<void> => {
    await handleDownloadFile(
      "/excel/template-grades",
      "template_nhap_diem.xlsx",
    );
  },

  importGrades: async (
    sectionId: string,
    file: File,
  ): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/excel/import-grades/${sectionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
  // 3. Import cho lớp danh nghĩa
  importStudents: async (
    classId: string,
    file: File,
  ): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      `/excel/import-students/${classId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // 4. Import cho lớp học phần
  importToSection: async (
    sectionId: string,
    file: File,
  ): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      `/excel/import-to-section/${sectionId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};

export default excelService;
