import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import lecturerService from "../../services/lecturerService";
import type {
  LecturerFilterRequest,
  LecturerRequest,
  LecturerResponse,
} from "../../services/lecturerService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";

interface LecturerListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: LecturerResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
  onCreate: () => void;
}

const LecturerList = ({ onViewDetail, onCreate }: LecturerListProps) => {
  // 1. Định nghĩa các cột cho bảng Giảng viên
  const columnDefs = useMemo<ColDef<LecturerResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã GV",
        flex: 0.7,
        filter: "agTextColumnFilter",
        pinned: "left",
      },
      {
        field: "fullName",
        headerName: "Họ và Tên",
        editable: true,
        filter: "agTextColumnFilter",
        flex: 1.2,
        cellClass: "font-medium text-slate-800",
      },
      {
        field: "gender",
        headerName: "Giới tính",
        editable: true,
        filter: "agTextColumnFilter",
        flex: 0.5,
      },
      {
        field: "subDepartmentIds",
        headerName: "Mã Bộ môn quản lý",
        flex: 1.5,
        // Hiển thị mảng ID dưới dạng chuỗi ngăn cách bằng dấu phẩy
        valueFormatter: (params) => {
          return params.value ? params.value.join(", ") : "---";
        },
      },
    ],
    [],
  );

  // Nhãn hiển thị khi xem chi tiết (ViewDetail)
  const lecturerLabels = {
    id: "Mã số Giảng viên",
    fullName: "Họ và Tên",
    gender: "Giới tính",
    subDepartmentIds: "Danh sách Mã Bộ môn trực thuộc",
  };

  // 2. Lắp ráp vào InfiniteGrid
  return (
    <InfiniteGrid<LecturerResponse, LecturerRequest, LecturerFilterRequest>
      columnDefs={columnDefs}
      fetchData={lecturerService.search}
      onUpdate={async (data) => {
        // Map từ Response sang Request (DTO backend yêu cầu)
        const payload: LecturerRequest = {
          id: data.id,
          fullName: data.fullName,
          gender: data.gender,
          subDepartmentIds: data.subDepartmentIds,
        };
        const res = await lecturerService.update(data.id, payload);
        return res.data;
      }}
      onDelete={lecturerService.delete}
      onViewDetail={(data) => {
        onViewDetail?.("lecturer", data.id, data, lecturerLabels);
        console.log("Viewing Lecturer: ", data.id);
      }}
      onCreate={onCreate}
      title={"Quản lý danh sách Giảng viên"}
    />
  );
};

export default LecturerList;
