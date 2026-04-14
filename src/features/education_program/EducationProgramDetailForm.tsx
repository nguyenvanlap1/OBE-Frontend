/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Save, Edit2, X, GraduationCap, BookOpen, Layers } from "lucide-react";
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
  const isNewRecord = data.id.startsWith("new_") || !data.id;
  const [isNew, setIsNew] = useState(isNewRecord);
  const [newYearInput, setNewYearInput] = useState("");

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

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addYearId = () => {
    const value = newYearInput.trim();
    if (value && !formData.schoolYearIds.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        schoolYearIds: [...prev.schoolYearIds, value],
      }));
      setNewYearInput("");
    }
  };

  const removeYearId = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      schoolYearIds: prev.schoolYearIds.filter((item) => item !== id),
    }));
  };

  const handleSave = async () => {
    try {
      const sanitizedPos = formData.pos.map((po: any) => ({
        ...po,
        id: String(po.id).startsWith("temp") ? null : po.id,
      }));

      const sanitizedPlos = formData.plos.map((plo: any) => ({
        ...plo,
        id: String(plo.id).startsWith("temp") ? null : plo.id,
      }));

      const mappingsForBackend = formData.ploPoMappings
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

      const payload = {
        ...formData,
        schoolYearIds: formData.schoolYearIds || [],
        pos: sanitizedPos,
        plos: sanitizedPlos,
        ploPoMappings: mappingsForBackend,
      };

      logData(payload);

      const response = !isNew
        ? await educationProgramService.updateDetail(formData.id, payload)
        : await educationProgramService.createDetail(payload);

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
    <div className="max-w-5xl mx-auto p-12 bg-white min-h-[800px] shadow-sm text-slate-900">
      {/* Header & Controls */}
      <div className="flex justify-between items-center mb-10 no-print">
        <div className="flex items-center gap-3 text-blue-600">
          <GraduationCap size={32} />
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            Cấu hình Chương trình
          </h1>
        </div>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            isEditing
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
          {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
        </button>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-slate-700">
          Chi tiết Chương trình Đào tạo
        </h2>
        <div className="w-24 h-1 bg-blue-600 mx-auto mt-3 rounded-full"></div>
      </div>

      <div className="space-y-12">
        {/* SECTION 1: THÔNG TIN CHUNG */}
        <section className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 font-bold text-lg text-blue-800 mb-6">
            <BookOpen size={20} />
            <span>1. Thông tin định danh</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 ml-4">
            {/* Mã CTĐT */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-500 uppercase">
                Mã chương trình
              </span>
              {isEditing && isNew ? (
                <input
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                  className="border-b-2 border-blue-400 bg-yellow-50 outline-none px-2 py-1 font-mono text-lg"
                  placeholder="VD: CNTT_2024"
                />
              ) : (
                <span className="text-lg font-bold font-mono text-slate-800">
                  {formData.id || "---"}
                </span>
              )}
            </div>

            {/* Tên CTĐT */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-500 uppercase">
                Tên chương trình
              </span>
              {isEditing ? (
                <input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="border-b-2 border-blue-400 bg-yellow-50 outline-none px-2 py-1 text-lg"
                />
              ) : (
                <span className="text-lg font-bold text-slate-800">
                  {formData.name}
                </span>
              )}
            </div>

            {/* Bậc đào tạo */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-500 uppercase">
                Bậc đào tạo
              </span>
              {isEditing ? (
                <input
                  value={formData.educationLevel}
                  onChange={(e) =>
                    handleChange("educationLevel", e.target.value)
                  }
                  className="border-b-2 border-blue-400 bg-yellow-50 outline-none px-2 py-1"
                />
              ) : (
                <span className="text-slate-700 font-medium">
                  {formData.educationLevel}
                </span>
              )}
            </div>

            {/* Tín chỉ */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-500 uppercase">
                Tổng số tín chỉ
              </span>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.requiredCredits}
                  onChange={(e) =>
                    handleChange("requiredCredits", Number(e.target.value))
                  }
                  className="border-b-2 border-blue-400 bg-yellow-50 outline-none px-2 py-1 w-24"
                />
              ) : (
                <span className="text-slate-700 font-bold text-xl">
                  {formData.requiredCredits}{" "}
                  <small className="text-sm font-normal">tín chỉ</small>
                </span>
              )}
            </div>

            {/* Niên khóa */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-500 uppercase">
                Niên khóa áp dụng
              </span>
              <div className="flex flex-wrap gap-2 items-center min-h-[40px]">
                {formData.schoolYearIds.map((yearId) => (
                  <span
                    key={yearId}
                    className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-sm font-black flex items-center gap-2 border shadow-sm"
                  >
                    {yearId}
                    {isEditing && (
                      <X
                        size={14}
                        className="cursor-pointer text-red-500 hover:scale-125 transition-transform"
                        onClick={() => removeYearId(yearId)}
                      />
                    )}
                  </span>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-2 ml-2">
                    <input
                      placeholder="Nhập khóa (K48...)"
                      className="text-sm border-b-2 border-slate-300 outline-none w-32 bg-transparent px-1 focus:border-blue-600 transition-colors"
                      value={newYearInput}
                      onChange={(e) => setNewYearInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addYearId())
                      }
                    />
                    <button
                      type="button"
                      onClick={addYearId}
                      className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save size={14} />
                    </button>
                  </div>
                )}
                {formData.schoolYearIds.length === 0 && !isEditing && (
                  <span className="italic text-slate-400">
                    Chưa thiết lập niên khóa
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: MỤC TIÊU & CHUẨN ĐẦU RA */}
        <section className="space-y-10">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-800 border-l-4 border-blue-600 pl-3">
            <Layers size={20} />
            <span>2. Khung năng lực (PO & PLO)</span>
          </div>

          <div className="grid grid-cols-1 gap-12 ml-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <UniversalTable
                title="PO - Mục tiêu đào tạo"
                data={formData.pos}
                keys={["poCode", "content"]}
                columnNames={["Mã PO", "Nội dung mục tiêu"]}
                isEditing={isEditing}
                onDataChange={(d) => handleChange("pos", d)}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <UniversalTable
                title="PLO - Chuẩn đầu ra"
                data={formData.plos}
                keys={["ploCode", "content"]}
                columnNames={["Mã PLO", "Nội dung chuẩn đầu ra"]}
                isEditing={isEditing}
                onDataChange={(d) => handleChange("plos", d)}
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: MAPPING */}
        <section className="space-y-6 pt-10 border-t border-slate-100">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-800 border-l-4 border-green-600 pl-3 uppercase tracking-wider">
            <span>3. Ma trận đóng góp PLO - PO</span>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 overflow-x-auto">
            <MappingMatrix2
              title=""
              rows={formData.plos.map((p) => ({ id: p.id, code: p.ploCode }))}
              cols={formData.pos.map((p) => ({ id: p.id, code: p.poCode }))}
              mappings={formData.ploPoMappings.map((m) => ({
                rowId: m.ploId,
                colId: m.poId,
                weight: m.weight,
              }))}
              labels={{ row: "PLO", col: "PO" }}
              isEditing={isEditing}
              onMappingChange={(newMappings) => {
                const apiFormat = newMappings.map((m) => ({
                  ploId: m.rowId as number,
                  poId: m.colId as number,
                  weight: m.weight,
                  ploCode: "",
                  poCode: "",
                }));
                handleChange("ploPoMappings", apiFormat);
              }}
            />
          </div>
        </section>

        {/* SECTION 4: HỌC PHẦN (Dữ liệu bổ trợ) */}
        {!isNew && (
          <section className="pt-10 border-t-2 border-dashed border-slate-100">
            <ProgramCourseOverview programId={formData.id} />
          </section>
        )}
      </div>
    </div>
  );
};

export default EducationProgramDetailForm;
