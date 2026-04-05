import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";

import departmentService, {
  type DepartmentFilterRequest,
  type DepartmentRequest,
  type DepartmentResponse,
} from "./departmentService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";

interface DepartmentListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: DepartmentResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
  onCreate: () => void;
}

const DepartmentList = ({ onViewDetail, onCreate }: DepartmentListProps) => {
  const columnDefs = useMemo<ColDef<DepartmentResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã Khoa",
        filter: "agTextColumnFilter",
      },
      {
        field: "name",
        headerName: "Tên Khoa",
        editable: true,
        filter: "agTextColumnFilter",
        cellClass: "bg-blue-50/20 font-medium",
      },
      {
        field: "description",
        headerName: "Mô tả",
        editable: true,
        filter: false,
      },
    ],
    [],
  );

  const labels = {
    id: "Mã khoa",
    name: "Tên khoa",
    description: "Mô tả chi tiết",
  };

  return (
    <InfiniteGrid<
      DepartmentResponse,
      DepartmentRequest,
      DepartmentFilterRequest
    >
      title="Quản lý Khoa"
      description="Hệ thống quản lý dữ liệu OBE"
      columnDefs={columnDefs}
      fetchData={departmentService.search}
      onUpdate={(data) =>
        departmentService.update(data.id, data).then((res) => res.data)
      }
      onDelete={departmentService.delete}
      onViewDetail={(data) => {
        // nếu muốn lấy thêm chi tiết thì fetch ở đây rồi truyền data khác vào
        onViewDetail?.("department", data.name, data, labels);
        console.log("View data: " + data);
      }}
      onCreate={onCreate}
      pageSize={15}
    />
  );
};

export default DepartmentList;
