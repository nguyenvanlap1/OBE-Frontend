import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";

import studentService, {
  type StudentFilterRequest,
  type StudentRequest,
  type StudentResponse,
} from "../../services/studentService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";

interface StudentListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: StudentResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
}

const StudentList = ({ onViewDetail }: StudentListProps) => {
  const columnDefs = useMemo<ColDef<StudentResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã Số Sinh Viên",
        filter: "agTextColumnFilter",
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        field: "fullName",
        headerName: "Họ và Tên",
        editable: true,
        filter: "agTextColumnFilter",
        cellClass: "font-medium text-blue-600",
      },
      {
        field: "gender",
        headerName: "Giới tính",
        editable: true,
        width: 120,
        filter: "agTextColumnFilter",
      },
      {
        field: "educationProgramIds",
        headerName: "Chương trình đào tạo",
        filter: false,
        valueFormatter: (params) => {
          return params.value ? params.value.join(", ") : "Chưa cập nhật";
        },
        cellClass: "text-gray-500 italic",
      },
    ],
    [],
  );

  const labels = {
    id: "Mã số sinh viên",
    fullName: "Họ và tên",
    gender: "Giới tính",
    educationProgramIds: "Danh sách chương trình học",
  };

  return (
    <InfiniteGrid<StudentResponse, StudentRequest, StudentFilterRequest>
      title="Quản lý Sinh viên"
      description="Dữ liệu sinh viên tham gia hệ thống đào tạo OBE"
      columnDefs={columnDefs}
      // Dùng getAll phù hợp với PageableRequest và FilterRequest
      fetchData={studentService.getAll}
      onUpdate={(data) =>
        studentService.update(data.id, data).then((res) => res.data)
      }
      onDelete={studentService.delete}
      onViewDetail={(data) => {
        onViewDetail?.("student", data.fullName, data, labels);
        console.log("Viewing student detail: ", data.id);
      }}
      pageSize={20}
    />
  );
};

export default StudentList;
