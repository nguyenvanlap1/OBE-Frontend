import React, { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import excelService from "../../services/excelService";

interface SectionGradeImportProps {
  sectionId: string;
}

const SectionGradeImport = ({ sectionId }: SectionGradeImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Tải file mẫu điểm
  const handleDownloadTemplate = async () => {
    try {
      await excelService.downloadGradeTemplate();
      toast.info("Đang bắt đầu tải file mẫu điểm...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Không thể tải file mẫu điểm");
    }
  };

  // 2. Xử lý import file điểm
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
      await excelService.importGrades(sectionId, file);
      toast.success("Import điểm thành công!");

      // reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Lỗi khi import điểm. Kiểm tra lại file.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-600 text-white rounded-md">
          <FileSpreadsheet size={20} />
        </div>
        <div>
          <h3 className="font-bold text-green-900 text-lg">
            Quản lý điểm sinh viên
          </h3>
          <p className="text-sm text-green-700">
            Import điểm cho sinh viên trong học phần bằng file Excel
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Import */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 border border-green-300 rounded-md hover:bg-green-100 transition-all font-medium disabled:opacity-50"
        >
          {isImporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Upload size={18} />
          )}
          {isImporting ? "Đang xử lý..." : "Import điểm từ Excel"}
        </button>

        {/* Download template */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 transition-all font-medium"
        >
          <Download size={18} />
          Tải file mẫu điểm
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

      <div className="mt-4 text-[13px] text-green-600 italic">
        * File phải có cột <strong>MSSV</strong> và các cột dạng{" "}
        <strong>STT_1, STT_2,...</strong> tương ứng với thành phần điểm.
      </div>
    </div>
  );
};

export default SectionGradeImport;