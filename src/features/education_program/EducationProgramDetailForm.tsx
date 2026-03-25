import { useState } from "react";
import { Save, Edit2 } from "lucide-react";
import UniversalTable from "../../components/common/UniversalTable";
import educationProgramService from "../../services/educationProgramService";
import { toast } from "react-toastify";

import type { EducationProgramResponseDetail } from "../../services/educationProgramService";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import logData from "../../utils/logData";
import MappingMatrix2 from "../../components/common/MappingMatrix2";

interface Props {
  data: EducationProgramResponseDetail;
}

const EducationProgramDetailForm = ({ data }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(() => ({
    ...data,
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
      // 1. Chuẩn hóa dữ liệu: Chuyển các ID tạm thời thành null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sanitizedPos = formData.pos.map((po: any) => ({
        ...po,
        // Ép kiểu po.id về String để dùng startsWith
        id: String(po.id).startsWith("temp") ? null : po.id,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sanitizedPlos = formData.plos.map((plo: any) => ({
        ...plo,
        id: String(plo.id).startsWith("temp") ? null : plo.id,
      }));

      // CHỐT HẠ: Tìm Code từ ID để Backend lookup được
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
        .filter((m) => m.ploCode && m.poCode); // Loại bỏ các mapping không hợp lệ

      logData(mappingsForBackend);
      logData({
        id: formData.id,
        name: formData.name,
        educationLevel: formData.educationLevel,
        requiredCredits: formData.requiredCredits,
        subDepartmentId: formData.subDepartmentId,
        schoolYearIds: formData.schoolYearIds || [], // Đảm bảo lấy từ formData
        pos: sanitizedPos,
        plos: sanitizedPlos,
        ploPoMappings: mappingsForBackend,
      });
      // Sử dụng hàm updateDetail để lưu toàn bộ dữ liệu phức hợp
      const response = await educationProgramService.updateDetail(formData.id, {
        id: formData.id,
        name: formData.name,
        educationLevel: formData.educationLevel,
        requiredCredits: formData.requiredCredits,
        subDepartmentId: formData.subDepartmentId,
        schoolYearIds: formData.schoolYearIds || [], // Đảm bảo lấy từ formData
        pos: sanitizedPos,
        plos: sanitizedPlos,
        ploPoMappings: mappingsForBackend,
      });

      // Cập nhật lại state với dữ liệu mới nhất từ Server (quan trọng để lấy ID cho PO/PLO mới)
      if (response.data) {
        setFormData({
          ...response.data,
          schoolYearIds: response.data.schoolYearIds || [],
        });
      }
      logData(response.data);

      toast.success("Cập nhật chi tiết chương trình thành công!");
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiResponse<null>>;
      // Hiển thị message từ AppException nếu có
      toast.error(error.message);
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
    </div>
  );
};

export default EducationProgramDetailForm;
