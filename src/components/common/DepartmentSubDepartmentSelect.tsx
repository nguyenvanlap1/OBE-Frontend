import { useState, useEffect } from "react";
import { Building, Landmark } from "lucide-react";
import departmentService from "../../services/departmentService";
import subDepartmentService from "../../services/subDepartmentService";
import type { DepartmentResponse } from "../../services/departmentService";
import type { SubDepartmentResponse } from "../../services/subDepartmentService";

interface Props {
  selectedDepartmentId: string;
  selectedSubDepartmentId: string;
  onDepartmentChange: (id: string) => void;
  onSubDepartmentChange: (id: string) => void;
  isEditing: boolean;
}

const DepartmentSubDepartmentSelect = ({
  selectedDepartmentId,
  selectedSubDepartmentId,
  onDepartmentChange,
  onSubDepartmentChange,
  isEditing,
}: Props) => {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDepartmentResponse[]>(
    [],
  );
  const [loadingSub, setLoadingSub] = useState(false);

  // Load danh sách Khoa lần đầu
  useEffect(() => {
    departmentService.search({ page: 0, size: 100 }, {}).then((res) => {
      if (res.data) setDepartments(res.data.content);
    });
  }, []);

  // Mỗi khi selectedDepartmentId thay đổi, load lại Bộ môn
  useEffect(() => {
    if (selectedDepartmentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingSub(true);
      subDepartmentService
        .getByDepartmentId(selectedDepartmentId)
        .then((res) => {
          if (res.data) setSubDepartments(res.data);
        })
        .finally(() => setLoadingSub(false));
    } else {
      setSubDepartments([]);
    }
  }, [selectedDepartmentId]);

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-400 uppercase font-bold">
          Đơn vị
        </span>
        <span className="text-sm font-medium text-slate-700">
          {departments.find((d) => d.id === selectedDepartmentId)?.name ||
            "N/A"}
          {" > "}
          {subDepartments.find((s) => s.id === selectedSubDepartmentId)?.name ||
            "N/A"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 flex-1">
      {/* Dropdown Khoa */}
      <div className="flex-1 space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
          <Landmark size={12} /> Khoa
        </label>
        <select
          value={selectedDepartmentId}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
        >
          <option value="">-- Chọn Khoa --</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown Bộ môn */}
      <div className="flex-1 space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
          <Building size={12} /> Bộ môn
        </label>
        <select
          disabled={!selectedDepartmentId || loadingSub}
          value={selectedSubDepartmentId}
          onChange={(e) => onSubDepartmentChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">
            {loadingSub ? "Đang tải..." : "-- Chọn Bộ môn --"}
          </option>
          {subDepartments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DepartmentSubDepartmentSelect;
