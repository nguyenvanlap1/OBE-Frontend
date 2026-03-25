import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";

import schoolYearService, {
  type SchoolYear,
} from "../../services/schoolYearService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";

interface SchoolYearListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: SchoolYear,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
}

const SchoolYearList = ({ onViewDetail }: SchoolYearListProps) => {
  // 1. Cấu hình cột cho AG Grid - Bỏ hoàn toàn các thuộc tính filter
  const columnDefs = useMemo<ColDef<SchoolYear>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã Khóa / Niên khóa",
        // Bỏ filter: "agTextColumnFilter"
        filter: false,
        flex: 1,
        cellClass: "bg-blue-50/20 font-medium",
      },
    ],
    [],
  );

  // 2. Labels cho Form chi tiết
  const labels = {
    id: "Mã Khóa/Niên khóa (VD: K48, 2024-2028)",
  };

  return (
    <InfiniteGrid<
      SchoolYear, // Response
      SchoolYear, // Request (Tạo mới)
      SchoolYear // Filter (Bỏ qua vì không dùng lọc)
    >
      title="Quản lý Niên khóa"
      description="Quản lý danh sách các khóa đào tạo và năm học"
      columnDefs={columnDefs}
      // Vì getAll trả về ApiResponse<SchoolYear[]>, InfiniteGrid sẽ tự map
      fetchData={schoolYearService.search}
      // Update cho SchoolYear thường là xóa đi tạo lại,
      // nhưng nếu Component yêu cầu onUpdate thì ta gọi service create/update tương ứng
      onUpdate={(data) =>
        schoolYearService.create(data).then((res) => res.data)
      }
      onDelete={schoolYearService.delete}
      onViewDetail={(data) => {
        onViewDetail?.("school_year", data.id, data, labels);
      }}
      pageSize={20}
    />
  );
};

export default SchoolYearList;
