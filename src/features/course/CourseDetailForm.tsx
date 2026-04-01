import { useState } from "react";
import { Save, Edit2 } from "lucide-react";
import UniversalTable from "../../components/common/UniversalTable";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import logData from "../../utils/logData";
import type {
  CourseVersionRequestUpdateDetail,
  CourseVersionResponseDetail,
} from "../../services/courseVersionService";
import courseVersionService from "../../services/courseVersionService";
import MappingMatrix2 from "../../components/common/MappingMatrix2";
import MappingMatrix3 from "../../components/common/MappingMatrix3";
import PloCoMappingStandalone from "./PloCoMappingStandalone";

interface CourseDetailFormProps {
  data: CourseVersionResponseDetail;
  onSave: (updatedData: CourseVersionResponseDetail) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CourseDetailForm = ({ data, onSave }: CourseDetailFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  // Hàm khởi tạo để tránh lỗi map trên undefined
  const [formData, setFormData] = useState<CourseVersionResponseDetail>(() => ({
    ...data,
    courseId: data.courseId || "",
    name: data.name || "",
    credits: data.credits || 0,
    versionNumber: data.versionNumber || 1,
    subDepartmentId: data.subDepartmentId || "",
    subDepartmentName: data.subDepartmentName || "",
    departmentId: data.departmentId || "",
    departmentName: data.departmentName || "",
    fromDate: data.fromDate || new Date().toISOString().split("T")[0],
    toDate: data.toDate || null,
    cos: data.cos || [],
    clos: data.clos || [],
    assessments: data.assessments || [],
    coCloMappings: data.coCloMappings || [],
    assessmentCloMappings: data.assessmentCloMappings || [],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --- HÀM LƯU GỌI API ---
  // --- HÀM LƯU GỌI API ---
  const handleSave = async () => {
    try {
      // 1. Sanitize các danh sách chính
      const sanitizedCos = formData.cos.map((item) => ({
        ...item,
        id: String(item.id).startsWith("temp") ? null : item.id,
      }));
      const sanitizedClos = formData.clos.map((item) => ({
        ...item,
        id: String(item.id).startsWith("temp") ? null : item.id,
      }));
      const sanitizedAsms = formData.assessments.map((item) => ({
        ...item,
        id: String(item.id).startsWith("temp") ? null : item.id,
      }));

      // 2. CHỐT HẠ: Tìm Code từ ID cho các Mapping
      const coCloMappingsForBackend = formData.coCloMappings
        .map((m) => {
          const clo = formData.clos.find(
            (p) => String(p.id) === String(m.cloId),
          );
          const co = formData.cos.find((p) => String(p.id) === String(m.coId));
          return {
            cloCode: clo?.cloCode || "",
            coCode: co?.coCode || "",
            weight: m.weight,
          };
        })
        .filter((m) => m.cloCode && m.coCode);

      const assessmentCloMappingsForBackend = formData.assessmentCloMappings
        .map((m) => {
          const clo = formData.clos.find(
            (p) => String(p.id) === String(m.cloId),
          );
          const asm = formData.assessments.find(
            (p) => String(p.id) === String(m.assessmentId),
          );
          return {
            cloCode: clo?.cloCode || "",
            assessmentCode: asm?.assessmentCode || 0,
            weight: m.weight,
          };
        })
        .filter((m) => m.cloCode && m.assessmentCode);

      const payload: CourseVersionRequestUpdateDetail = {
        ...formData,
        toDate: formData.toDate === null ? undefined : formData.toDate,
        cos: sanitizedCos,
        clos: sanitizedClos,
        assessments: sanitizedAsms,
        coCloMappings: coCloMappingsForBackend,
        assessmentCloMappings: assessmentCloMappingsForBackend,
      };
      // 3. Logic quyết định Create hay Update
      // Kiểm tra nếu courseId là mã tạm hoặc prop truyền vào đánh dấu là tạo mới
      const isNew = formData.courseId.startsWith("new_") || !data.courseId;
      console.log("giữ liệu trước khi gửi đi!");
      logData(payload);
      const response = isNew
        ? await courseVersionService.createFirst(payload)
        : await courseVersionService.update(payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          isNew ? "Tạo đề cương chi tiết thành công!" : "Cập nhật thành công!",
        );
        setIsEditing(false);

        if (response.data) {
          // Cập nhật lại form với data có ID thật từ DB
          setFormData(response.data);
          logData(response.data);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Save error:", error);
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    }
  };

  // Hàm helper để render input nhanh hơn
  const renderEditableField = (
    // Chỉ cho phép các key có giá trị là string hoặc number
    key: keyof Omit<CourseVersionResponseDetail, never>,
    type: string = "text",
  ) => {
    if (isEditing) {
      return (
        <input
          type={type}
          className="border-b border-dotted border-black outline-none px-1 bg-yellow-50 font-sans flex-1"
          // Ép kiểu về string | number để input hiểu
          value={(formData[key] as string | number) || ""}
          onChange={(e) =>
            handleChange(
              key,
              type === "number" ? Number(e.target.value) : e.target.value,
            )
          }
        />
      );
    }
    // Ở đây formData[key] chắc chắn là string | number nên span sẽ nhận được
    return (
      <span className="font-bold">
        {(formData[key] as string | number) || "---"}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-screen font-sans text-slate-900 shadow-sm">
      {/* Nút điều khiển */}
      <div className="flex justify-end mb-8 font-sans no-print">
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium border transition-colors ${
            isEditing
              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
          {isEditing ? "Lưu thay đổi" : "Sửa thông tin"}
        </button>
      </div>

      {/* Tiêu đề */}
      <div className="text-center mb-12">
        <h2 className="text-xl font-bold uppercase tracking-widest">
          Đề cương chi tiết học phần
        </h2>
        <div className="w-40 h-px bg-black mx-auto mt-2"></div>
      </div>

      {/* Nội dung chính */}
      <div className="space-y-6 text-[17px] leading-relaxed">
        {/* 1. Tên học phần */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold whitespace-nowrap">1. Tên học phần:</span>
          {isEditing ? (
            <input
              className="flex-1 border-b border-dotted border-black outline-none px-1 bg-yellow-50 font-sans font-bold"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          ) : (
            <span className="font-bold uppercase">{formData.name}</span>
          )}
        </div>

        {/* Các trường chi tiết */}
        <div className="ml-4 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="min-w-[200px]">- Mã số học phần:</span>
            {renderEditableField("courseId")}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="min-w-[200px]">- Số tín chỉ:</span>
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  className="w-20 border-b border-dotted border-black outline-none px-1 bg-yellow-50 font-sans"
                  value={formData.credits}
                  onChange={(e) =>
                    handleChange("credits", Number(e.target.value))
                  }
                />
                <span>tín chỉ</span>
              </div>
            ) : (
              <span>{formData.credits} tín chỉ</span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="min-w-[200px]">- Số phiên bản:</span>
            {renderEditableField("versionNumber")}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="min-w-[200px]">- Ngày áp dụng:</span>
            {renderEditableField("fromDate", "date")}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="min-w-[200px]">- Ngày kết thúc:</span>
            {renderEditableField("toDate", "date")}
          </div>
        </div>

        {/* 2. Đơn vị phụ trách */}
        <div className="space-y-3">
          <div className="font-bold">2. Đơn vị phụ trách học phần:</div>
          <div className="ml-4 flex items-baseline gap-2">
            <span className="min-w-[200px]">- Mã Bộ môn:</span>
            {renderEditableField("subDepartmentId")}
          </div>
          <div className="ml-4 flex items-baseline gap-2">
            <span className="min-w-[200px]">- Bộ môn:</span>
            {formData.subDepartmentName}
          </div>
        </div>
      </div>

      {/* 4. Mục tiêu học phần (CO) */}
      <UniversalTable
        title="4. Mục tiêu học phần"
        data={formData.cos}
        keys={["coCode", "content"]}
        columnNames={["Mục tiêu", "Nội dung mục tiêu"]}
        isEditing={isEditing}
        onDataChange={(newData) => handleChange("cos", newData)}
      />

      {/* 5. Chuẩn đầu ra học phần (CLO) */}
      <UniversalTable
        title="5. Chuẩn đầu ra của học phần"
        data={formData.clos}
        keys={["cloCode", "content"]}
        columnNames={["CĐR HP", "Nội dung chuẩn đầu ra"]}
        isEditing={isEditing}
        onDataChange={(newData) => handleChange("clos", newData)}
      />

      {/* 6. Cấu trúc đánh giá (Assessments) */}
      <UniversalTable
        title="6. Cấu trúc đánh giá"
        data={formData.assessments}
        keys={["assessmentCode", "name", "regulation", "weight"]}
        columnNames={["STT", "Thành phần đánh giá", "Quy định", "Tỷ trọng (%)"]}
        isEditing={isEditing}
        onDataChange={(newData) => handleChange("assessments", newData)}
      />
      <MappingMatrix2
        title="7. Ma trận mapping CO - CLO"
        // Chuẩn hóa rows và cols về định dạng {id, code}
        rows={formData.clos.map((p) => ({ id: p.id, code: p.cloCode }))}
        cols={formData.cos.map((p) => ({ id: p.id, code: p.coCode }))}
        // Mapping dùng trực tiếp ID
        mappings={formData.coCloMappings.map((m) => ({
          rowId: m.cloId,
          colId: m.coId,
          weight: m.weight,
        }))}
        labels={{ row: "CLO", col: "CO" }}
        isEditing={isEditing}
        onMappingChange={(newMappings) => {
          const apiFormat = newMappings.map((m) => ({
            cloId: m.rowId as any, // Ép kiểu để chấp nhận string/number tạm thời
            coId: m.colId as any,
            weight: m.weight,
            cloCode: "",
            coCode: "",
          }));
          handleChange("coCloMappings", apiFormat as any); // Thêm as any ở đây nếu TS vẫn báo lỗi tại handleChange
        }}
      />
      {/* 8. Ma trận mapping Assessment - CLO */}
      <MappingMatrix3
        title="9. Ma trận mapping Assessment - CLO"
        // Ở đây mình lấy cả Code và Name để hiển thị cho rõ
        rows={formData.clos.map((p) => ({
          id: p.id,
          displayLabel: p.cloCode,
        }))}
        cols={formData.assessments.map((p) => ({
          id: p.id,
          displayLabel: `${p.assessmentCode}: ${p.name}`, // Hiển thị "A1: Chuyên cần"
        }))}
        mappings={formData.assessmentCloMappings.map((m) => ({
          rowId: m.cloId,
          colId: m.assessmentId,
          weight: m.weight,
        }))}
        labels={{ row: "CLO", col: "Bài đánh giá" }}
        isEditing={isEditing}
        onMappingChange={(newMappings) => {
          const apiFormat = newMappings.map((m) => ({
            cloId: m.rowId as any,
            assessmentId: m.colId as any,
            weight: m.weight,
            cloCode: "",
            assessmentCode: "",
          }));
          handleChange("assessmentCloMappings", apiFormat);
        }}
      />
      <PloCoMappingStandalone
        courseId={formData.courseId}
        title="8. Ma trận mapping CO-PLO"
        courseVersion={formData.versionNumber}
      />
    </div>
  );
};

export default CourseDetailForm;
