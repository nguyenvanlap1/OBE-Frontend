import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import subDepartmentService, {
  type SubDepartmentFilterRequest,
  type SubDepartmentRequest,
  type SubDepartmentResponse,
} from "../../services/subDepartmentService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";
import departmentService from "../../services/departmentService";

interface SubDepartmentListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: SubDepartmentResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
}

const SubDepartmentList = ({ onViewDetail }: SubDepartmentListProps) => {
  // 1. Định nghĩa các cột cho bảng Bộ môn
  const columnDefs = useMemo<ColDef<SubDepartmentResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã Bộ Môn",
        flex: 0.7,
        filter: "agTextColumnFilter",
      },
      {
        field: "name",
        headerName: "Tên Bộ Môn",
        editable: true,
        filter: "agTextColumnFilter",
        cellClass: "bg-blue-50/20 font-medium",
      },
      {
        field: "departmentId",
        headerName: "Mã khoa",
        editable: true,
        filter: "agTextColumnFilter",
        cellClass: "bg-blue-50/20 font-medium",
      },
      {
        field: "departmentName", // Hiển thị tên khoa từ Response
        headerName: "Thuộc Khoa",
        filter: "agTextColumnFilter",
        flex: 1,
      },
      {
        field: "description",
        headerName: "Mô tả",
        editable: true,
        flex: 1.5,
        filter: false,
      },
    ],
    [],
  );

  const subDepartmentLabels = {
    id: "Mã Bộ Môn",
    name: "Tên Bộ Môn",
    description: "Mô tả chi tiết",
    departmentId: "Mã Khoa Chủ Quản",
    departmentName: "Tên Khoa",
  };

  // 2. Lắp ráp vào BaseManagementPage
  return (
    <InfiniteGrid<
      SubDepartmentResponse,
      SubDepartmentRequest,
      SubDepartmentFilterRequest
    >
      columnDefs={columnDefs}
      fetchData={subDepartmentService.search}
      onUpdate={async (data) => {
        const res = await subDepartmentService.update(data.id, data);
        return res.data;
      }}
      onDelete={departmentService.delete}
      onViewDetail={(data) => {
        // nếu muốn lấy thêm chi tiết thì fetch ở đây rồi truyền data khác vào
        onViewDetail?.("subDepartment", data.name, data, subDepartmentLabels);
        console.log("View data: " + data);
      }}
      title={""}
    ></InfiniteGrid>
  );
};

export default SubDepartmentList;
