import React, { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import excelService from "../../services/excelService";

interface SectionStudentImportProps {
  sectionId: string;
}

const SectionStudentImport = ({ sectionId }: SectionStudentImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Tải file mẫu
  const handleDownloadTemplate = async () => {
    try {
      await excelService.downloadSectionTemplate();
      toast.info("Đang bắt đầu tải file mẫu...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Không thể tải file mẫu");
    }
  };

  // 2. Xử lý file khi người dùng chọn
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check định dạng
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      toast.error("Vui lòng chọn đúng file Excel (.xlsx hoặc .xls)");
      return;
    }

    setIsImporting(true);
    try {
      await excelService.importToSection(sectionId, file);
      toast.success("Đã thêm danh sách sinh viên vào lớp học phần!");

      // Reset input để có thể chọn lại file cũ nếu muốn
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Lỗi khi import file. Vui lòng kiểm tra định dạng.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600 text-white rounded-md">
          <FileSpreadsheet size={20} />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 text-lg">
            Quản lý danh sách lớp
          </h3>
          <p className="text-sm text-blue-700">
            Đăng ký sinh viên vào học phần này qua file Excel
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Nút Import */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100 transition-all font-medium disabled:opacity-50"
        >
          {isImporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Upload size={18} />
          )}
          {isImporting ? "Đang xử lý..." : "Import MSSV từ Excel"}
        </button>

        {/* Nút Tải mẫu */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 transition-all font-medium"
        >
          <Download size={18} />
          Tải file mẫu
        </button>

        {/* Input ẩn */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />
      </div>

      <div className="mt-4 text-[13px] text-blue-600 italic">
        * Lưu ý: File chỉ cần duy nhất một cột <strong>MSSV</strong>.
      </div>
    </div>
  );
};

export default SectionStudentImport;
