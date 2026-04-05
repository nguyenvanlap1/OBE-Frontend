import { useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import semesterService, { type Semester } from "./semesterService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import { toast } from "react-toastify";

interface SemesterListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: Semester,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
}

const SemesterList = ({ onViewDetail }: SemesterListProps) => {
  // 1. Khai báo state để kiểm soát đóng/mở popup
  const [isOpen, setIsOpen] = useState(false);

  // Cấu hình cột cho AG Grid
  const columnDefs = useMemo<ColDef<Semester>[]>(
    () => [
      {
        field: "term",
        headerName: "Học kỳ",
        filter: true,
        flex: 1,
        valueFormatter: (params) => `Học kỳ ${params.value}`,
        cellClass: "font-medium",
      },
      {
        field: "academicYear",
        headerName: "Năm học",
        filter: true,
        sort: "desc",
        flex: 1,
      },
      {
        field: "startDate",
        headerName: "Ngày bắt đầu",
        filter: true,
        flex: 1,
        editable: true,
      },
      {
        field: "endDate",
        headerName: "Ngày kết thúc",
        filter: true,
        editable: true,
        flex: 1,
      },
    ],
    [],
  );

  const labels = {
    term: "Học kỳ (1, 2, 3)",
    academicYear: "Năm học (VD: 2025-2026)",
    startDate: "Ngày bắt đầu học kỳ",
    endDate: "Ngày kết thúc học kỳ",
  };

  // 2. Hàm xử lý khi bấm nút "Lưu" trong popup
  const handleSave = async (data: Semester) => {
    try {
      await semesterService.create(data);
      setIsOpen(false);
      toast.success("Tạo học kỳ thành công!");
      // Grid sẽ tự động reload nếu InfiniteGrid được cấu hình để quan sát thay đổi
    } catch (error) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message || "Có lỗi xảy ra");
    }
  };

  return (
    <>
      <InfiniteGrid<Semester, Semester, Semester>
        title="Quản lý Học kỳ"
        description="Quản lý danh sách các học kỳ và thời gian đào tạo theo năm học"
        columnDefs={columnDefs}
        fetchData={semesterService.search}
        onUpdate={(data) => {
          if (data.id) {
            return semesterService
              .update(data.id, data)
              .then((res) => res.data);
          }
          return semesterService.create(data).then((res) => res.data);
        }}
        onDelete={(id) => semesterService.delete(Number(id))}
        // 3. Bật Modal khi nhấn nút thêm mới
        onCreate={() => setIsOpen(true)}
        onViewDetail={(data) => {
          onViewDetail?.(
            "semester",
            data.label || `Kỳ ${data.term}`,
            data,
            labels,
          );
        }}
        pageSize={20}
      />

      {/* 4. MODAL THÊM MỚI HỌC KỲ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[450px]">
            <h3 className="text-lg font-bold mb-4">Thêm Học kỳ mới</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSave({
                  term: Number(formData.get("term")),
                  academicYear: formData.get("academicYear") as string,
                  startDate: formData.get("startDate") as string,
                  endDate: formData.get("endDate") as string,
                } as Semester);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">{labels.term}</label>
                  <input
                    name="term"
                    type="number"
                    min="1"
                    max="3"
                    className="w-full border p-2 rounded"
                    placeholder="Ví dụ: 1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    {labels.academicYear}
                  </label>
                  <input
                    name="academicYear"
                    className="w-full border p-2 rounded"
                    placeholder="Ví dụ: 2025-2026"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Ngày bắt đầu</label>
                    <input
                      name="startDate"
                      type="date"
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Ngày kết thúc</label>
                    <input
                      name="endDate"
                      type="date"
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Lưu học kỳ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SemesterList;
