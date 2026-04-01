import { useEffect, useState } from "react";
import { Search, RefreshCw, Grid3X3, Plus, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import ploCoMappingService, {
  type EducationProgramSummary,
  type PloCoMappingResponse,
} from "../../services/ploCoMappingService";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";

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
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State mới cho danh sách gợi ý
  const [suggestedPrograms, setSuggestedPrograms] = useState<
    EducationProgramSummary[]
  >([]);

  const [customPlos, setCustomPlos] = useState<string[]>([]);
  const [customCos, setCustomCos] = useState<string[]>([]);
  const [newCode, setNewCode] = useState({ plo: "", co: "" });

  const allPloCodes = Array.from(
    new Set([...mappings.map((m) => m.ploCode), ...customPlos]),
  ).sort();
  const allCoCodes = Array.from(
    new Set([...mappings.map((m) => m.coCode), ...customCos]),
  ).sort();

  const handleFetch = async () => {
    if (!programId) {
      toast.warn("Nhập Mã CTĐT");
      return;
    }
    setLoading(true);
    try {
      const response = await ploCoMappingService.getMappings(
        programId,
        courseId,
      );
      setMappings(response.data.mappings || []);
      setProgramName(response.data.educationProgramName);
      setCustomPlos([]);
      setCustomCos([]);
      toast.success("Tải dữ liệu thành công");
    } catch (error) {
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };

  // 1. Tự động lấy danh sách CTĐT gợi ý khi component load
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await ploCoMappingService.getCourseSummary(
          courseId,
          courseVersion,
        );
        if (res.data) {
          setSuggestedPrograms(res.data.educationProgramSummaries);
        }
      } catch (error: unknown) {
        const err = error as AxiosError<ApiResponse<void>>;
        console.error(err.message);
      }
    };
    fetchSuggestions();
  }, [courseId, courseVersion]);

  // Hàm xử lý cập nhật trọng số
  const handleWeightChange = async (
    ploCode: string,
    coCode: string,
    weightStr: string,
  ) => {
    const weight = parseFloat(weightStr);

    // Nếu nhập trống hoặc 0 -> Xóa ánh xạ (tùy nghiệp vụ, ở đây mình coi 0 hoặc NaN là xóa)
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
      } catch (e) {
        /* Lỗi có thể do chưa tồn tại mapping để xóa */
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
        setMappings((prev) => {
          const filtered = prev.filter(
            (m) => !(m.ploCode === ploCode && m.coCode === coCode),
          );
          return [...filtered, res.data];
        });
      }
    } catch (error) {
      toast.error("Không thể lưu trọng số");
    }
  };

  return (
    <div className="mt-8 overflow-x-auto">
      <h3 className="font-bold mb-4 uppercase text-slate-700 border-l-4 border-blue-600 pl-3">
        {title}
      </h3>
      <div className="bg-white border rounded-lg shadow-sm">
        {/* Header Tìm kiếm */}
        <div className="p-4 bg-slate-50 border-b flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Mã CTĐT
            </label>
            <input
              type="text"
              list="program-suggestions" // Kết nối với ID của datalist
              className="w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              placeholder="Nhập hoặc chọn mã CTĐT..."
            />
            <datalist id="program-suggestions">
              {suggestedPrograms.map((prog) => (
                <option
                  key={prog.educationProgramId}
                  value={prog.educationProgramId}
                >
                  {prog.educationProgramName}
                </option>
              ))}
            </datalist>
          </div>
          {/* KHU VỰC HIỂN THỊ TÊN CHƯƠNG TRÌNH */}
          <div className="flex-[1] flex flex-col justify-end h-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Tên chương trình đào tạo
            </label>
            <div className="px-3 py-1.5 text-sm font-semibold text-blue-800 bg-blue-50 border border-blue-100 rounded min-h-[38px] flex items-center">
              {programName || (
                <span className="text-slate-300 font-normal italic">
                  Chưa xác định
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleFetch}
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={14} />
            ) : (
              <Search size={14} />
            )}{" "}
            Truy xuất
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
              <Grid3X3 size={14} /> Ma trận trọng số PLO - CO
            </h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`text-[11px] px-3 py-1 rounded font-bold border transition-all ${
                isEditing
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-slate-500 border-slate-300"
              }`}
            >
              {isEditing ? "XONG" : "CHỈNH SỬA KHUNG & TRỌNG SỐ"}
            </button>
          </div>

          {isEditing && (
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100 flex flex-wrap gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Thêm mã PLO..."
                  className="border rounded px-2 py-1 text-xs outline-none"
                  value={newCode.plo}
                  onChange={(e) =>
                    setNewCode({
                      ...newCode,
                      plo: e.target.value.toUpperCase(),
                    })
                  }
                />
                <button
                  onClick={() => {
                    if (newCode.plo) {
                      setCustomPlos([...customPlos, newCode.plo]);
                      setNewCode({ ...newCode, plo: "" });
                    }
                  }}
                  className="bg-orange-500 text-white p-1 rounded"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex gap-2 border-l border-orange-200 pl-4">
                <input
                  type="text"
                  placeholder="Thêm mã CO..."
                  className="border rounded px-2 py-1 text-xs outline-none"
                  value={newCode.co}
                  onChange={(e) =>
                    setNewCode({ ...newCode, co: e.target.value.toUpperCase() })
                  }
                />
                <button
                  onClick={() => {
                    if (newCode.co) {
                      setCustomCos([...customCos, newCode.co]);
                      setNewCode({ ...newCode, co: "" });
                    }
                  }}
                  className="bg-orange-500 text-white p-1 rounded"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {allPloCodes.length > 0 || allCoCodes.length > 0 ? (
            <div className="overflow-x-auto border rounded">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-r bg-slate-50 p-2 text-[11px] text-slate-400">
                      PLO \ CO
                    </th>
                    {allCoCodes.map((co) => (
                      <th
                        key={co}
                        className="border-b bg-slate-50 p-2 text-[11px] font-bold text-center text-slate-600"
                      >
                        {co}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allPloCodes.map((plo) => (
                    <tr key={plo}>
                      <td className="border-r border-b p-2 text-[11px] font-bold bg-slate-50/50 text-center uppercase text-slate-700">
                        {plo}
                      </td>
                      {allCoCodes.map((co) => {
                        const mapping = mappings.find(
                          (m) => m.ploCode === plo && m.coCode === co,
                        );
                        return (
                          <td
                            key={`${plo}-${co}`}
                            className="border-b border-r p-1 text-center min-w-[60px]"
                          >
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              disabled={!isEditing}
                              defaultValue={mapping?.weight || ""}
                              onBlur={(e) =>
                                handleWeightChange(plo, co, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleWeightChange(
                                    plo,
                                    co,
                                    (e.target as HTMLInputElement).value,
                                  );
                              }}
                              placeholder="0.0"
                              className={`w-full text-center text-xs py-1 rounded border outline-none transition-all ${
                                mapping
                                  ? "bg-blue-50 border-blue-200 font-bold text-blue-700"
                                  : "bg-transparent border-transparent hover:border-slate-200"
                              } ${!isEditing && "cursor-default"}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-slate-300 bg-slate-50/50 rounded border-2 border-dashed">
              <AlertCircle size={32} className="mb-2 opacity-20" />
              <p className="text-xs font-medium">
                Bật chỉnh sửa để thiết lập ma trận.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PloCoMappingStandalone;
