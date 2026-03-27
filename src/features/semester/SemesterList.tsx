import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import semesterService, { type Semester } from "../../services/semesterService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";

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
  // 1. Cấu hình cột cho AG Grid
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
        flex: 1,
      },
      {
        field: "startDate",
        headerName: "Ngày bắt đầu",
        filter: true,
        flex: 1,
      },
      {
        field: "endDate",
        headerName: "Ngày kết thúc",
        filter: true,
        flex: 1,
      },
    ],
    [],
  );

  // 2. Labels định nghĩa cho Form/Chi tiết
  const labels = {
    id: "ID Học kỳ",
    term: "Học kỳ (1, 2, 3)",
    academicYear: "Năm học (VD: 2025-2026)",
    startDate: "Ngày bắt đầu học kỳ",
    endDate: "Ngày kết thúc học kỳ",
  };

  return (
    <InfiniteGrid<
      Semester, // Dữ liệu hiển thị (Response)
      Semester, // Dữ liệu tạo mới/cập nhật (Request)
      Semester // Filter (Để any nếu chưa có interface filter cụ thể)
    >
      title="Quản lý Học kỳ"
      description="Quản lý danh sách các học kỳ và thời gian đào tạo theo năm học"
      columnDefs={columnDefs}
      // Gọi hàm getAll từ service
      fetchData={semesterService.search}
      // Xử lý tạo mới hoặc cập nhật
      onUpdate={(data) => {
        if (data.id) {
          return semesterService.update(data.id, data).then((res) => res.data);
        }
        return semesterService.create(data).then((res) => res.data);
      }}
      // Xử lý xóa
      onDelete={(id) => semesterService.delete(Number(id))}
      // Xem chi tiết
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
  );
};

export default SemesterList;
