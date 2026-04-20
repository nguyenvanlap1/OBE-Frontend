import { useEffect, useState } from "react";
import { Search, RefreshCw, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import type {
  EducationProgramSummary,
  PloCoMappingResponse,
} from "../education_program/ploCoMappingService";
import ploCoMappingService from "../education_program/ploCoMappingService";
import type { ApiResponse } from "../../services/api";
import type { AxiosError } from "axios";

const PloCoMappingStandalone = ({
  courseId,
  courseVersion,
  title,
}: {
  courseId: string;
  courseVersion: number;
  title: string;
}) => {
  const [programId, setProgramId] = useState("");
  const [mappings, setMappings] = useState<PloCoMappingResponse[]>([]);
  const [programName, setProgramName] = useState("");
  // State mới cho việc xóa nhanh
  const [selectedMappingToDelete, setSelectedMappingToDelete] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [suggestedPrograms, setSuggestedPrograms] = useState<
    EducationProgramSummary[]
  >([]);

  const [customPlos, setCustomPlos] = useState<string[]>([]);
  const [customCos, setCustomCos] = useState<string[]>([]);
  const [newCode, setNewCode] = useState({ plo: "", co: "" });

  // const allPloCodes = Array.from(
  //   new Set([...mappings.map((m) => m.ploCode), ...customPlos]),
  // ).sort();
  // const allCoCodes = Array.from(
  //   new Set([...mappings.map((m) => m.coCode), ...customCos]),
  // ).sort();

  // Hàm bổ trợ để trích xuất số từ chuỗi (ví dụ: "PLO10" -> 10)
  const naturalSort = (a: string, b: string) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const allPloCodes = Array.from(
    new Set([...mappings.map((m) => m.ploCode), ...customPlos]),
  ).sort(naturalSort); // Sử dụng naturalSort thay vì sort() mặc định

  const allCoCodes = Array.from(
    new Set([...mappings.map((m) => m.coCode), ...customCos]),
  ).sort(naturalSort); // Sử dụng naturalSort để CO1, CO2... được chuẩn

  const handleFetch = async () => {
    if (!programId) return toast.warn("Nhập Mã CTĐT");
    setLoading(true);
    try {
      const response = await ploCoMappingService.getMappings(
        programId,
        courseId,
      );
      if (!response?.data?.mappings || response.data.mappings.length === 0) {
        toast.info("Không có dữ liệu mapping!");
        setMappings([]);
        setProgramName(response?.data?.educationProgramName || "");
        return;
      }
      setMappings(response.data.mappings);
      setProgramName(response.data.educationProgramName);
      setCustomPlos([]);
      setCustomCos([]);
      toast("Đã tải dữ liệu thành công");
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDelete = async () => {
    if (!selectedMappingToDelete) return;

    const [ploCode, coCode] = selectedMappingToDelete.split("|");
    setLoading(true);
    try {
      await ploCoMappingService.removeMapping(
        programId,
        courseId,
        ploCode,
        coCode,
      );
      setMappings((prev) =>
        prev.filter((m) => !(m.ploCode === ploCode && m.coCode === coCode)),
      );
      setSelectedMappingToDelete("");
      toast.success(`Đã xóa mapping ${ploCode} - ${coCode}`);
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await ploCoMappingService.getCourseSummary(
          courseId,
          courseVersion,
        );
        if (res.data) setSuggestedPrograms(res.data.educationProgramSummaries);
      } catch (error: unknown) {
        const err = error as AxiosError<ApiResponse<null>>;
        console.error(err.message);
      }
    };
    fetchSuggestions();
  }, [courseId, courseVersion]);

  const handleWeightChange = async (
    ploCode: string,
    coCode: string,
    weightStr: string,
  ) => {
    const weight = parseFloat(weightStr);

    if (isNaN(weight) || weight <= 0) {
      try {
        await ploCoMappingService.removeMapping(
          programId,
          courseId,
          ploCode,
          coCode,
        );
        setMappings((prev) =>
          prev.filter((m) => !(m.ploCode === ploCode && m.coCode === coCode)),
        );
        toast.success(`Đã xóa mapping ${ploCode} - ${coCode}`);
      } catch (error: unknown) {
        const err = error as AxiosError<ApiResponse<null>>;
        console.error(err.message);
      }
      return;
    }

    try {
      const res = await ploCoMappingService.upsertMapping(programId, courseId, {
        ploCode,
        coCode,
        weight,
      });
      if (res.data) {
        setMappings((prev) => [
          ...prev.filter(
            (m) => !(m.ploCode === ploCode && m.coCode === coCode),
          ),
          res.data,
        ]);
      }
      toast.success(`Đã cập nhật mapping ${ploCode} - ${coCode}`);
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      console.error(err.message || lỗi);
    }
  };

  // Hàm xóa "mềm" các mã tự thêm
  const removePloRow = (code: string) =>
    setCustomPlos((prev) => prev.filter((c) => c !== code));
  const removeCoCol = (code: string) =>
    setCustomCos((prev) => prev.filter((c) => c !== code));

  return (
    <div className="mt-6">
      {/* 1. HEADER: Tiêu đề và Nút chuyển đổi chế độ */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-700 uppercase border-l-4 border-blue-500 pl-3">
          {title}
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-1.5 rounded text-xs font-bold border transition-colors ${
            isEditing
              ? "bg-slate-800 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {isEditing ? "HOÀN TẤT" : "CHỈNH SỬA MA TRẬN"}
        </button>
      </div>

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        {/* 2. SEARCH BAR: Truy xuất dữ liệu và Hiển thị tên chương trình */}
        <div className="p-3 bg-slate-50 border-b space-y-3">
          <div className="flex items-center gap-3">
            <input
              list="progs"
              className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 ring-blue-500"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              placeholder="Mã Chương trình đào tạo..."
            />
            <datalist id="progs">
              {suggestedPrograms.map((p) => (
                <option key={p.educationProgramId} value={p.educationProgramId}>
                  {p.educationProgramName}
                </option>
              ))}
            </datalist>

            <button
              onClick={handleFetch}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={14} />
              ) : (
                <Search size={14} />
              )}
              Truy xuất
            </button>
          </div>

          {programName && (
            <div className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded border border-blue-100 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Chương trình: {programName}
            </div>
          )}
        </div>

        <div className="p-4">
          {/* 3. EDITING TOOLS: Thêm PLO/CO và Xóa nhanh (Chỉ hiện khi isEditing = true) */}
          {isEditing && (
            <div className="mb-4 p-3 bg-blue-50/30 rounded-md border border-blue-100 flex flex-wrap gap-6 items-center">
              {/* Thêm PLO */}
              <div className="flex gap-1 items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
                  Thêm:
                </span>
                <input
                  type="text"
                  placeholder="+ PLO"
                  className="border rounded px-2 py-1 text-xs w-20"
                  value={newCode.plo}
                  onChange={(e) =>
                    setNewCode({
                      ...newCode,
                      plo: e.target.value.toUpperCase(),
                    })
                  }
                  // Thêm xử lý Enter ở đây
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCode.plo) {
                      setCustomPlos([...customPlos, newCode.plo]);
                      setNewCode({ ...newCode, plo: "" });
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newCode.plo) {
                      setCustomPlos([...customPlos, newCode.plo]);
                      setNewCode({ ...newCode, plo: "" });
                    }
                  }}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Thêm CO */}
              <div className="flex gap-1 items-center border-l pl-4 border-slate-200">
                <input
                  type="text"
                  placeholder="+ CO"
                  className="border rounded px-2 py-1 text-xs w-20"
                  value={newCode.co}
                  onChange={(e) =>
                    setNewCode({ ...newCode, co: e.target.value.toUpperCase() })
                  }
                  // Thêm xử lý Enter ở đây
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCode.co) {
                      setCustomCos([...customCos, newCode.co]);
                      setNewCode({ ...newCode, co: "" });
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newCode.co) {
                      setCustomCos([...customCos, newCode.co]);
                      setNewCode({ ...newCode, co: "" });
                    }
                  }}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Xóa nhanh Mapping */}
              <div className="flex gap-1 border-l pl-4 border-slate-200 items-center">
                <span className="text-[10px] font-bold text-red-500 uppercase mr-1">
                  Xóa cặp:
                </span>
                <select
                  className="border rounded px-2 py-1 text-xs w-40 bg-white outline-none focus:ring-1 ring-red-400"
                  value={selectedMappingToDelete}
                  onChange={(e) => setSelectedMappingToDelete(e.target.value)}
                >
                  <option value="">-- Chọn để xóa --</option>
                  {mappings.map((m) => (
                    <option
                      key={`${m.ploCode}-${m.coCode}`}
                      value={`${m.ploCode}|${m.coCode}`}
                    >
                      {m.ploCode} - {m.coCode} (w: {m.weight})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleQuickDelete}
                  disabled={!selectedMappingToDelete || loading}
                  className="p-1 bg-red-500 text-white rounded disabled:bg-slate-300 hover:bg-red-600 transition-colors"
                  title="Xóa mapping đã chọn"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
          {/* 4. DATA TABLE: Ma trận Mapping (CO ngang, PLO dọc) */}
          <div className="overflow-x-auto border rounded bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100">
                  {/* Góc trên bên trái: Đảo nhãn thành CO \ PLO */}
                  <th className="p-2 border-b border-r text-slate-500 font-medium w-20">
                    CO \ PLO
                  </th>
                  {/* Render PLO theo chiều ngang */}
                  {allPloCodes.map((plo) => (
                    <th
                      key={plo}
                      className="p-2 border-b border-r font-bold text-center group relative min-w-[60px]"
                    >
                      {plo}
                      {isEditing && (
                        <button
                          onClick={() => removePloRow(plo)}
                          className="absolute -top-1 -right-1 hidden group-hover:flex bg-red-500 text-white rounded-full p-0.5 shadow-sm"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Duyệt qua danh sách CO để tạo từng hàng */}
                {allCoCodes.map((co) => (
                  <tr
                    key={co}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Cột đầu tiên hiển thị mã CO */}
                    <td className="p-2 border-b border-r font-bold text-center bg-slate-50 relative group">
                      {co}
                      {isEditing && (
                        <button
                          onClick={() => removeCoCol(co)}
                          className="absolute top-1 left-1 hidden group-hover:flex bg-red-500 text-white rounded-full p-0.5 shadow-sm"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </td>
                    {/* Duyệt qua PLO để đổ dữ liệu vào từng ô (cell) */}
                    {allPloCodes.map((plo) => {
                      const mapping = mappings.find(
                        (m) => m.ploCode === plo && m.coCode === co,
                      );
                      return (
                        <td
                          key={`${co}-${plo}`}
                          className="p-1 border-b border-r"
                        >
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            disabled={!isEditing}
                            // Sử dụng key để ép input re-render khi mapping thay đổi
                            key={mapping?.weight}
                            defaultValue={mapping?.weight || ""}
                            onBlur={(e) =>
                              handleWeightChange(plo, co, e.target.value)
                            }
                            placeholder="-"
                            className={`w-full text-center py-1.5 rounded outline-none transition-all ${
                              mapping
                                ? "font-bold text-blue-600 bg-blue-50"
                                : "bg-transparent text-slate-400"
                            } ${
                              isEditing
                                ? "border border-transparent hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:shadow-inner"
                                : "cursor-default"
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && mappings.length === 0 && !programId && (
            <div className="text-center py-10 text-slate-400 text-sm">
              Vui lòng nhập Mã CTĐT để truy xuất ma trận mapping.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PloCoMappingStandalone;
