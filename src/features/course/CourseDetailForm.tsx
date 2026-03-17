import { useState } from "react";
import { Save, Edit2 } from "lucide-react";
import type {
  CourseResponseDetail,
  CourseUpdateRequestDetail,
} from "../../services/courseService";
import UniversalTable from "../../components/common/UniversalTable";
import MappingMatrix from "../../components/common/MappingMatrix";
import courseService from "../../services/courseService";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";

interface CourseDetailFormProps {
  data: CourseResponseDetail;
  onSave: (updatedData: CourseResponseDetail) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CourseDetailForm = ({ data, onSave }: CourseDetailFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  // Hàm khởi tạo để tránh lỗi map trên undefined
  const [formData, setFormData] = useState<CourseResponseDetail>(() => ({
    ...data,
    defaultName: data.defaultName || "",
    supDepartmentId: data.subDepartmentId || "",
    subDepartmentName: data.subDepartmentName || "",
    courseId: data.courseId || "",
    credits: data.credits || 0,
    versionNumber: data.versionNumber || 1,
    cos: data.cos || [],
    clos: data.clos || [],
    assessments: data.assessments || [],
    coCloMappings: data.coCloMappings || [],
    assessmentCloMappings: data.assessmentCloMappings || [],
  }));

  const isAllReady =
    formData.cos.length > 0 &&
    formData.clos.length > 0 &&
    formData.assessments.length > 0 &&
    formData.cos.every((c) => c.id && !String(c.id).startsWith("temp")) &&
    formData.clos.every((c) => c.id && !String(c.id).startsWith("temp")) &&
    formData.assessments.every((a) => a.id && !String(a.id).startsWith("temp"));

  const handleChange = <K extends keyof CourseResponseDetail>(
    key: K,
    value: CourseResponseDetail[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
      const payload: CourseUpdateRequestDetail = {
        ...formData,
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
        coCloMappings: (formData.coCloMappings || []).map((m) => ({
          ...m,
          coId: sanitizeId(m.coId),
          cloId: sanitizeId(m.cloId),
        })),
        assessmentCloMappings: (formData.assessmentCloMappings || []).map(
          (m) => ({
            ...m,
            assessmentId: sanitizeId(m.assessmentId),
            cloId: sanitizeId(m.cloId),
          }),
        ),
      };

      // 3. Logic quyết định Create hay Update
      // Kiểm tra nếu courseId là mã tạm hoặc prop truyền vào đánh dấu là tạo mới
      const isNew = formData.courseId.startsWith("new_") || !data.courseId;

      const response = isNew
        ? await courseService.createDetail(payload)
        : await courseService.updateDetail(payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          isNew ? "Tạo đề cương chi tiết thành công!" : "Cập nhật thành công!",
        );
        setIsEditing(false);

        if (response.data) {
          // Cập nhật lại form với data có ID thật từ DB
          setFormData(response.data);
          // Thông báo cho component cha (nếu cần) để cập nhật danh sách hoặc URL
          onSave(response.data);
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
    key: keyof Omit<
      CourseResponseDetail,
      "cos" | "clos" | "assessments" | "coCloMappings" | "assessmentCloMappings"
    >,
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
              className="flex-1 border-b border-dotted border-black outline-none px-1 bg-yellow-50 font-sans font-bold uppercase"
              value={formData.defaultName}
              onChange={(e) => handleChange("defaultName", e.target.value)}
            />
          ) : (
            <span className="font-bold uppercase">{formData.defaultName}</span>
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
        keys={["code", "content"]}
        columnNames={["Mục tiêu", "Nội dung mục tiêu"]}
        isEditing={isEditing}
        onDataChange={(newData) => handleChange("cos", newData)}
      />

      {/* 5. Chuẩn đầu ra học phần (CLO) */}
      <UniversalTable
        title="5. Chuẩn đầu ra của học phần"
        data={formData.clos}
        keys={["code", "content"]}
        columnNames={["CĐR HP", "Nội dung chuẩn đầu ra"]}
        isEditing={isEditing}
        onDataChange={(newData) => handleChange("clos", newData)}
      />

      {/* 6. Cấu trúc đánh giá (Assessments) */}
      <UniversalTable
        title="6. Cấu trúc đánh giá"
        data={formData.assessments}
        keys={["name", "regulation", "weight"]}
        columnNames={["Thành phần đánh giá", "Quy định", "Tỷ trọng (%)"]}
        isEditing={isEditing}
        onDataChange={(newData) => handleChange("assessments", newData)}
      />
      <MappingMatrix
        title="7. Ma trận mapping CO - CLO"
        rows={formData.clos} // CLO nằm dọc
        cols={formData.cos} // CO nằm ngang
        labels={{ row: "CLO", col: "CO" }}
        // Map dữ liệu cũ sang tên biến mới
        mappings={formData.coCloMappings.map((m) => ({
          rowId: m.cloId,
          colId: m.coId,
          weight: m.weight,
        }))}
        isEditing={isEditing && isAllReady}
        onMappingChange={(newMappings) => {
          // Khi lưu, map ngược lại đúng định dạng của API
          const apiData = newMappings.map((m) => ({
            cloId: m.rowId,
            coId: m.colId,
            weight: m.weight,
          }));
          handleChange("coCloMappings", apiData);
        }}
      />
      {!isAllReady && isEditing && (
        <p className="text-red-500 text-sm mb-2">
          ⚠️ Bạn phải lưu CO, CLO và Assessment trước khi thực hiện mapping.
        </p>
      )}
      {/* 8. Ma trận mapping Assessment - CLO */}
      <MappingMatrix
        title="8. Ma trận mapping Assessment - CLO"
        // Đổi: Assessment xuống hàng dọc
        rows={formData.assessments.map((a) => ({ id: a.id, code: a.name }))}
        // Đổi: CLO lên hàng ngang
        cols={formData.clos}
        labels={{ row: "Bài đánh giá", col: "CLO" }}
        mappings={formData.assessmentCloMappings.map((m) => ({
          rowId: m.assessmentId, // Bây giờ rowId ứng với Assessment
          colId: m.cloId, // colId ứng với CLO
          weight: m.weight,
        }))}
        isEditing={isEditing && isAllReady}
        onMappingChange={(newMappings) => {
          // Khi lưu về API, vẫn phải giữ đúng tên field cloId và assessmentId
          const apiData = newMappings.map((m) => ({
            assessmentId: m.rowId,
            cloId: m.colId,
            weight: m.weight,
          }));
          handleChange("assessmentCloMappings", apiData);
        }}
      />
      {!isAllReady && isEditing && (
        <p className="text-red-500 text-sm mb-2">
          ⚠️ Bạn phải lưu CO, CLO và Assessment trước khi thực hiện mapping.
        </p>
      )}
    </div>
  );
};

export default CourseDetailForm;
