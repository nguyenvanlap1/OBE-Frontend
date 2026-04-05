import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";

import { InfiniteGrid } from "../../components/common/InfiniteGridProps";
import departmentService, {
  type DepartmentSummaryResponse,
} from "../department/departmentService";
import type {
  SubDepartmentFilterRequest,
  SubDepartmentRequest,
  SubDepartmentResponse,
} from "./subDepartmentService";
import subDepartmentService from "./subDepartmentService";

interface SubDepartmentListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: SubDepartmentResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
  onCreate: () => void;
}

const SubDepartmentList = ({
  onViewDetail,
  onCreate,
}: SubDepartmentListProps) => {
  // 1. Đổi state thành mảng Object
  const [departments, setDepartments] = useState<DepartmentSummaryResponse[]>(
    [],
  );

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const res = await departmentService.getAllSummary();
        if (res.data) {
          setDepartments(res.data); // Lưu nguyên Object {id, name}
        }
      } catch (error) {
        console.error("Lỗi tải danh sách khoa", error);
      }
    };
    fetchDropdownData();
  }, []);
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
      title="Quản lý bộ môn"
      description="Hệ thống quản lý dữ liệu OBE"
      columnDefs={columnDefs}
      fetchData={subDepartmentService.search}
      onUpdate={async (data) => {
        const res = await subDepartmentService.update(data.id, data);
        return res.data;
      }}
      onDelete={subDepartmentService.delete}
      onViewDetail={(data) => {
        // nếu muốn lấy thêm chi tiết thì fetch ở đây rồi truyền data khác vào
        onViewDetail?.("subDepartment", data.name, data, subDepartmentLabels);
        console.log("View data: " + data);
      }}
      onCreate={onCreate}
    ></InfiniteGrid>
  );
};

export default SubDepartmentList;
