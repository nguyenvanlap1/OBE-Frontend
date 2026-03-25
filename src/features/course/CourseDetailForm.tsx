import { useState } from "react";
import { Save, Edit2 } from "lucide-react";
import UniversalTable from "../../components/common/UniversalTable";
import MappingMatrix from "../../components/common/MappingMatrix";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import logData from "../../utils/logData";
import type {
  CourseVersionRequestUpdateDetail,
  CourseVersionResponseDetail,
} from "../../services/courseVersionService";
import courseVersionService from "../../services/courseVersionService";

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

  const handleChange = <K extends keyof CourseVersionResponseDetail>(
    key: K,
    value: CourseVersionResponseDetail[K],
  ) => {
    setFormData((prev) => {
      const newState = { ...prev, [key]: value };

      // LOGIC CLEANUP: Khi danh sách thực thể chính thay đổi, xóa mapping mồ côi
      if (key === "clos") {
        const currentCloCodes = new Set(
          (value as any[]).map((i) => i.cloCode).filter(Boolean),
        );
        newState.coCloMappings = prev.coCloMappings.filter((m) =>
          currentCloCodes.has(m.cloCode),
        );
        newState.assessmentCloMappings = prev.assessmentCloMappings.filter(
          (m) => currentCloCodes.has(m.cloCode),
        );
      }

      if (key === "cos") {
        const currentCoCodes = new Set(
          (value as any[]).map((i) => i.coCode).filter(Boolean),
        );
        newState.coCloMappings = prev.coCloMappings.filter((m) =>
          currentCoCodes.has(m.coCode),
        );
      }

      if (key === "assessments") {
        const currentAsmCodes = new Set(
          (value as any[]).map((i) => i.assessmentCode).filter(Boolean),
        );
        newState.assessmentCloMappings = prev.assessmentCloMappings.filter(
          (m) => currentAsmCodes.has(m.assessmentCode),
        );
      }

      return newState;
    });
  };

  // --- HÀM LƯU GỌI API ---
  // --- HÀM LƯU GỌI API ---
  const handleSave = async () => {
    try {
      // 1. Hàm sanitize để dọn dẹp ID tạm
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sanitizeId = (id: any) => {
        if (
          typeof id === "string" &&
          (id.startsWith("temp") || id.startsWith("new_"))
        ) {
          return null;
        }
        return id;
      };

      // 2. Tạo payload an toàn
      const payload: CourseVersionRequestUpdateDetail = {
        ...formData,
        toDate: formData.toDate ?? undefined,
        courseId: formData.courseId || "",
        cos: (formData.cos || []).map((item) => ({
          ...item,
          id: sanitizeId(item.id),
        })),
        clos: (formData.clos || []).map((item) => ({
          ...item,
          id: sanitizeId(item.id),
        })),
        assessments: (formData.assessments || []).map((item) => ({
          ...item,
          id: sanitizeId(item.id),
        })),
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
      <MappingMatrix
        title="7. Ma trận mapping CO - CLO"
        rows={formData.clos}
        cols={formData.cos}
        rowKey="id"
        colKey="id"
        rowLabelKey="cloCode"
        colLabelKey="coCode"
        labels={{ row: "CLO", col: "CO" }}
        // 1. Chuyển mapping sang dùng ID thay vì Code để MappingMatrix quản lý chính xác từng ô
        mappings={formData.coCloMappings.map((m) => {
          const rowObj = formData.clos.find((r) => r.cloCode === m.cloCode);
          const colObj = formData.cos.find((c) => c.coCode === m.coCode);
          return {
            rowId: String(rowObj?.id || m.cloCode), // Ưu tiên lấy ID tạm
            colId: String(colObj?.id || m.coCode),
            weight: m.weight,
          };
        })}
        isEditing={isEditing}
        onMappingChange={(newMappings) => {
          // 2. Khi có thay đổi, tìm ngược lại Code từ ID để cập nhật vào formData
          const apiData = newMappings.map((m) => {
            const rowObj = formData.clos.find((r) => String(r.id) === m.rowId);
            const colObj = formData.cos.find((c) => String(c.id) === m.colId);
            return {
              cloCode: rowObj?.cloCode || "", // Nếu hàng mới chưa nhập code thì để rỗng
              coCode: colObj?.coCode || "",
              weight: m.weight,
            };
          });
          console.log(apiData);
          handleChange("coCloMappings", apiData);
        }}
      />
      {/* 8. Ma trận mapping Assessment - CLO */}
      {/* 8. Ma trận mapping Assessment - CLO */}
      <MappingMatrix
        title="8. Ma trận mapping Assessment - CLO"
        rows={formData.clos} // Hàng là CLO
        cols={formData.assessments} // Cột là Assessment
        rowKey="id" // Dùng id để giữ identity ổn định
        colKey="id" // Dùng id để tránh tạo thêm cột khi gõ tên Assessment
        rowLabelKey="cloCode"
        colLabelKey="name" // Hiển thị name (Thành phần đánh giá) lên đầu cột
        labels={{ row: "CLO", col: "Bài đánh giá" }}
        // 1. Chuyển đổi dữ liệu từ Code sang ID tạm thời để truyền vào Matrix
        mappings={formData.assessmentCloMappings.map((m) => {
          const rowObj = formData.clos.find((r) => r.cloCode === m.cloCode);
          // Lưu ý: So khớp theo assessmentName của mapping và name của bảng Assessments
          const colObj = formData.assessments.find(
            (a) => a.assessmentCode === m.assessmentCode,
          );

          return {
            rowId: String(rowObj?.id || m.cloCode),
            colId: String(colObj?.id || m.assessmentCode),
            weight: m.weight,
          };
        })}
        isEditing={isEditing}
        onMappingChange={(newMappings) => {
          // 2. Khi có thay đổi, tìm ngược lại Code từ ID để lưu về State chính (formData)
          const apiData = newMappings.map((m) => {
            const rowObj = formData.clos.find((r) => String(r.id) === m.rowId);
            const colObj = formData.assessments.find(
              (a) => String(a.id) === m.colId,
            );

            return {
              assessmentCode: colObj?.assessmentCode || "", // Lấy code từ object tìm được
              assessmentName: colObj?.name || "", // Lấy tên mới nhất từ input
              cloCode: rowObj?.cloCode || "", // Lấy mã CLO
              weight: m.weight,
            };
          });
          handleChange("assessmentCloMappings", apiData);
        }}
      />
    </div>
  );
};

export default CourseDetailForm;
