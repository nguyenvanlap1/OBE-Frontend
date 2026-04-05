import { useState } from "react";
import { Save, Edit2, X } from "lucide-react";
import UniversalTable from "../../components/common/UniversalTable";
import educationProgramService from "./educationProgramService";
import { toast } from "react-toastify";

import type { EducationProgramResponseDetail } from "./educationProgramService";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import logData from "../../utils/logData";
import MappingMatrix2 from "../../components/common/MappingMatrix2";
import ProgramCourseOverview from "./ProgramCourseOverview";

interface Props {
  data: EducationProgramResponseDetail;
}

const EducationProgramDetailForm = ({ data }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  // Tính toán trực tiếp dựa trên props data
  const isNewRecord = data.id.startsWith("new_") || !data.id;
  const [newYearInput, setNewYearInput] = useState(""); // State tạm để nhập niên khóa
  const addYearId = () => {
    const value = newYearInput.trim();
    if (value && !formData.schoolYearIds.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        schoolYearIds: [...prev.schoolYearIds, value],
      }));
      setNewYearInput(""); // Xóa trắng ô nhập sau khi thêm
    }
  };

  const removeYearId = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      schoolYearIds: prev.schoolYearIds.filter((item) => item !== id),
    }));
  };

  // Nếu bạn muốn dùng State để quản lý (phòng trường hợp sau khi lưu thành công nó không còn là "mới")
  const [isNew, setIsNew] = useState(isNewRecord);

  const [formData, setFormData] = useState(() => ({
    ...data,
    id: data.id || "",
    name: data.name || "",
    educationLevel: data.educationLevel || "",
    requiredCredits: data.requiredCredits || 0,
    subDepartmentId: data.subDepartmentId || "",
    schoolYearIds: data.schoolYearIds || [],
    pos: data.pos || [],
    plos: data.plos || [],
    ploPoMappings: data.ploPoMappings || [],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const handleSave = async () => {
    try {
      // 1. Chuẩn hóa POS/PLOS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sanitizedPos = formData.pos.map((po: any) => ({
        ...po,
        id: String(po.id).startsWith("temp") ? null : po.id,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sanitizedPlos = formData.plos.map((plo: any) => ({
        ...plo,
        id: String(plo.id).startsWith("temp") ? null : plo.id,
      }));

      // 2. Chuẩn hóa Mappings
      const mappingsForBackend = formData.ploPoMappings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((m: any) => {
          const plo = formData.plos.find(
            (p) => String(p.id) === String(m.ploId),
          );
          const po = formData.pos.find((p) => String(p.id) === String(m.poId));
          return {
            ploCode: plo?.ploCode || "",
            poCode: po?.poCode || "",
            weight: m.weight,
          };
        })
        .filter((m) => m.ploCode && m.poCode);

      // 3. TẠO PAYLOAD CHUNG Ở ĐÂY (Xử lý schoolYearIds 1 lần duy nhất)
      const payload = {
        ...formData,
        schoolYearIds: formData.schoolYearIds || [],
        pos: sanitizedPos,
        plos: sanitizedPlos,
        ploPoMappings: mappingsForBackend,
      };

      logData(payload);

      // 4. GỌI SERVICE (Dùng chung payload)
      const response = !isNew
        ? await educationProgramService.updateDetail(formData.id, payload)
        : await educationProgramService.createDetail(payload);

      // 5. Xử lý kết quả trả về
      if (response.data) {
        toast.success(isNew ? "Tạo mới thành công!" : "Cập nhật thành công!");
        setFormData({
          ...response.data,
          schoolYearIds: response.data.schoolYearIds || [],
        });
        setIsEditing(false);
        setIsNew(false);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<ApiResponse<null>>;
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white">
      {/* BUTTON */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center gap-2 px-4 py-2 border rounded"
        >
          {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
          {isEditing ? "Lưu" : "Sửa"}
        </button>
      </div>
      {/* INFO */}
      <div className="space-y-3">
        {/* HÀNG MỚI: MÃ CHƯƠNG TRÌNH */}
        <div>
          <b>Mã CTĐT:</b>{" "}
          {isEditing && isNew ? (
            <input
              value={formData.id}
              placeholder="Nhập mã (VD: CNTT_2024)"
              onChange={(e) => handleChange("id", e.target.value)}
              className="border-b bg-yellow-50 outline-none px-1"
            />
          ) : (
            <span className={isNew ? "text-gray-400 italic" : "font-mono"}>
              {formData.id}
            </span>
          )}
        </div>
        <div>
          <b>Tên CTĐT:</b>{" "}
          {isEditing ? (
            <input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="border-b"
            />
          ) : (
            formData.name
          )}
        </div>
        <div>
          <b>Mã bộ môn:</b>{" "}
          {isEditing ? (
            <input
              value={formData.subDepartmentId}
              onChange={(e) => handleChange("subDepartmentId", e.target.value)}
              className="border-b"
            />
          ) : (
            formData.subDepartmentId
          )}
        </div>
        <div className="flex items-start gap-2">
          <b className="min-w-[120px]">Niên khóa:</b>
          <div className="flex-1 flex flex-wrap gap-2">
            {/* Hiển thị danh sách niên khóa dưới dạng Tag */}
            {Array.isArray(formData.schoolYearIds) &&
              formData.schoolYearIds.map((yearId) => (
                <span
                  key={yearId}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-bold flex items-center gap-1 border border-blue-200"
                >
                  {yearId}
                  {isEditing && (
                    <X
                      size={14}
                      className="cursor-pointer text-red-500 hover:bg-red-50 rounded"
                      onClick={() => removeYearId(yearId)}
                    />
                  )}
                </span>
              ))}

            {/* Ô nhập khi đang ở chế độ Sửa */}
            {isEditing && (
              <div className="flex gap-1">
                <input
                  placeholder="Nhập mã (VD: K48)..."
                  className="text-sm border-b border-blue-600 outline-none w-32 bg-yellow-50 px-1"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addYearId())
                  }
                />
                <button
                  type="button"
                  onClick={addYearId}
                  className="text-xs bg-blue-600 text-white px-2 rounded hover:bg-blue-700"
                >
                  Thêm
                </button>
              </div>
            )}

            {/* Thông báo nếu trống */}
            {(!formData.schoolYearIds || formData.schoolYearIds.length === 0) &&
              !isEditing && (
                <span className="italic text-gray-400">
                  Chưa thiết lập niên khóa
                </span>
              )}
          </div>
        </div>
        <div>
          <b>Bậc đào tạo:</b>{" "}
          {isEditing ? (
            <input
              value={formData.educationLevel}
              onChange={(e) => handleChange("educationLevel", e.target.value)}
              className="border-b"
            />
          ) : (
            formData.educationLevel
          )}
        </div>

        <div>
          <b>Số tín chỉ:</b>{" "}
          {isEditing ? (
            <input
              type="number"
              value={formData.requiredCredits}
              onChange={(e) =>
                handleChange("requiredCredits", Number(e.target.value))
              }
              className="border-b"
            />
          ) : (
            formData.requiredCredits
          )}
        </div>
      </div>
      {/* PO */}
      <UniversalTable
        title="PO - Mục tiêu đào tạo"
        data={formData.pos}
        keys={["poCode", "content"]}
        columnNames={["PO", "Nội dung"]}
        isEditing={isEditing}
        onDataChange={(d) => handleChange("pos", d)}
      />
      {/* PLO */}
      <UniversalTable
        title="PLO - Chuẩn đầu ra"
        data={formData.plos}
        keys={["ploCode", "content"]}
        columnNames={["PLO", "Nội dung"]}
        isEditing={isEditing}
        onDataChange={(d) => handleChange("plos", d)}
      />
      {/* MAPPING */}
      {/* MAPPING */}
      <MappingMatrix2
        title="Mapping PLO - PO"
        rows={formData.plos.map((p) => ({ id: p.id, code: p.ploCode }))}
        cols={formData.pos.map((p) => ({ id: p.id, code: p.poCode }))}
        // 1. Chuyển từ định dạng của formData sang định dạng MappingMatrix2 hiểu
        mappings={formData.ploPoMappings.map((m) => ({
          rowId: m.ploId,
          colId: m.poId,
          weight: m.weight,
        }))}
        labels={{ row: "PLO", col: "PO" }}
        isEditing={isEditing}
        // 2. Chuyển ngược từ MappingMatrix2 về định dạng ploId/poId cho formData
        onMappingChange={(newMappings) => {
          const apiFormat = newMappings.map((m) => ({
            ploId: m.rowId as number, // Ép kiểu về number/string tùy DB
            poId: m.colId as number,
            weight: m.weight,
            ploCode: "", // Tạm thời để trống, sẽ xử lý ở handleSave
            poCode: "",
          }));
          handleChange("ploPoMappings", apiFormat);
        }}
      />
      {/* --- PHẦN MỚI THÊM VÀO ĐÂY --- */}
      <hr className="my-10 border-gray-200" />{" "}
      {/* Đường kẻ phân cách cho đẹp */}
      <div className="mt-8">
        {!isNew && <ProgramCourseOverview programId={formData.id} />}
      </div>
    </div>
  );
};

export default EducationProgramDetailForm;
