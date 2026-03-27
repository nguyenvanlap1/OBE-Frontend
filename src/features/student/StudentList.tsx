import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import studentService from "../../services/studentService";
import type {
  StudentFilterRequest,
  StudentUpdateRequest,
  StudentResponse,
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
  onCreate: () => void;
}

const StudentList = ({ onViewDetail, onCreate }: StudentListProps) => {
  // Hàm helper để hiển thị danh sách Set/Array dưới dạng chuỗi cách nhau bởi dấu phẩy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listFormatter = (params: any) => {
    const value = params.value;
    if (Array.isArray(value) && value.length > 0) {
      return value.join(", "); // Ví dụ: "Lớp A, Lớp B"
    }
    return "---";
  };

  // 1. Định nghĩa các cột
  const columnDefs = useMemo<ColDef<StudentResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "MSSV",
        flex: 0.8,
        filter: "agTextColumnFilter",
        pinned: "left",
      },
      {
        field: "fullName",
        headerName: "Họ và Tên",
        editable: true,
        filter: "agTextColumnFilter",
        flex: 1.2,
        cellClass: "font-medium",
      },
      {
        field: "gender",
        headerName: "Giới tính",
        editable: true,
        flex: 0.6,
        // Có thể dùng cellEditor dạng select ở đây nếu muốn
      },
      {
        field: "studentClassesId",
        headerName: "Lớp học",
        flex: 1,
        filter: "agTextColumnFilter",
        valueFormatter: listFormatter, // Xử lý hiển thị mảng ID lớp
      },
      {
        field: "educationProgramName",
        headerName: "Chương trình đào tạo",
        flex: 1.5,
        filter: "agTextColumnFilter",
        valueFormatter: listFormatter, // Xử lý hiển thị mảng tên CTĐT
      },
      {
        field: "departmentName",
        headerName: "Khoa",
        flex: 1,
        valueFormatter: listFormatter,
      },
    ],
    [],
  );

  // Nhãn hiển thị cho chi tiết
  const studentLabels = {
    id: "Mã số sinh viên",
    fullName: "Họ và tên",
    gender: "Giới tính",
    studentClassesId: "Danh sách lớp tham gia",
    educationProgramName: "Chương trình đào tạo",
    subDepartmentName: "Bộ môn quản lý",
    departmentName: "Thuộc khoa",
  };

  return (
    <InfiniteGrid<StudentResponse, StudentUpdateRequest, StudentFilterRequest>
      columnDefs={columnDefs}
      fetchData={studentService.search}
      onUpdate={async (data) => {
        // Map từ Response sang UpdateRequest (vì update cần Set mã lớp)
        const payload: StudentUpdateRequest = {
          id: data.id,
          fullName: data.fullName,
          gender: data.gender,
          studentClassesId: data.studentClassesId,
        };
        const res = await studentService.update(data.id, payload);
        return res.data;
      }}
      onDelete={studentService.delete}
      onViewDetail={(data) => {
        onViewDetail?.("student", data.id, data, studentLabels);
      }}
      onCreate={onCreate}
      title={"Quản lý hồ sơ Sinh viên"}
    />
  );
};

export default StudentList;
