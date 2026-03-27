import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import studentClassService from "../../services/studentClassService";
import type {
  StudentClassFilterRequest,
  StudentClassUpdateRequest,
  StudentClassResponse,
} from "../../services/studentClassService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";

interface StudentClassListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: StudentClassResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
  onCreate: () => void;
}

const StudentClassList = ({
  onViewDetail,
  onCreate,
}: StudentClassListProps) => {
  // 1. Định nghĩa các cột cho bảng Lớp Sinh Viên
  const columnDefs = useMemo<ColDef<StudentClassResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã Lớp",
        flex: 0.8,
        filter: "agTextColumnFilter",
        pinned: "left", // Cố định mã lớp bên trái
      },
      {
        field: "name",
        headerName: "Tên Lớp Học",
        editable: true,
        filter: "agTextColumnFilter",
        flex: 1.2,
        cellClass: "bg-blue-50/20 font-medium",
      },
      {
        field: "schoolYearId",
        headerName: "Khóa",
        editable: true,
        filter: "agTextColumnFilter",
        flex: 0.6,
      },
      {
        field: "educationProgramName",
        headerName: "Chương Trình Đào Tạo",
        filter: "agTextColumnFilter",
        flex: 1.5,
      },
      {
        field: "subDepartmentName",
        headerName: "Bộ Môn",
        filter: "agTextColumnFilter",
        flex: 1,
      },
      {
        field: "departmentName",
        headerName: "Khoa",
        filter: "agTextColumnFilter",
        flex: 1,
      },
    ],
    [],
  );

  // Nhãn hiển thị khi xem chi tiết (ViewDetail)
  const studentClassLabels = {
    id: "Mã Lớp Sinh Viên",
    name: "Tên Lớp Hành Chính",
    schoolYearId: "Niên Khóa / Khóa",
    educationProgramId: "Mã CTĐT",
    educationProgramName: "Tên Chương Trình Đào Tạo",
    subDepartmentName: "Thuộc Bộ Môn",
    departmentName: "Thuộc Khoa",
  };

  // 2. Lắp ráp vào InfiniteGrid
  return (
    <InfiniteGrid<
      StudentClassResponse,
      StudentClassUpdateRequest,
      StudentClassFilterRequest
    >
      columnDefs={columnDefs}
      fetchData={studentClassService.search}
      onUpdate={async (data) => {
        // Lưu ý: data ở đây là StudentClassResponse từ grid, cần map sang UpdateRequest nếu cần
        const res = await studentClassService.update(data.id, data);
        return res.data;
      }}
      onDelete={studentClassService.delete}
      onViewDetail={(data) => {
        onViewDetail?.("studentClass", data.id, data, studentClassLabels);
        console.log("Viewing Class: ", data.id);
      }}
      onCreate={onCreate}
      title={"Quản lý Lớp Sinh Viên"}
    />
  );
};

export default StudentClassList;
