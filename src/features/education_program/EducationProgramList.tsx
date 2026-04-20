import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";

import educationProgramService, {
  type EducationProgramFilterRequest,
  type EducationProgramRequest,
  type EducationProgramResponse,
} from "./educationProgramService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import { toast } from "react-toastify";

interface EducationProgramListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
  onCreate: () => void;
}

const EducationProgramList = ({
  onViewDetail,
  onCreate,
}: EducationProgramListProps) => {
  // 1. Cấu hình các cột cho AG Grid
  // 1. Cấu hình các cột cho AG Grid
  const columnDefs = useMemo<ColDef<EducationProgramResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã CTĐT",
        filter: "agTextColumnFilter",
        width: 120,
        pinned: "left", // Ghim cột mã để dễ theo dõi
      },
      {
        field: "name",
        headerName: "Tên chương trình",
        editable: true,
        filter: "agTextColumnFilter",
        cellClass: "bg-blue-50/20 font-medium",
        flex: 1,
        minWidth: 250,
      },
      {
        field: "educationLevel",
        headerName: "Trình độ",
        editable: true,
        filter: "agTextColumnFilter",
        width: 130,
      },
      {
        field: "requiredCredits",
        headerName: "Số tín chỉ",
        editable: true,
        filter: "agNumberColumnFilter",
        width: 110,
      },
      {
        field: "totalCourses",
        headerName: "Số học phần",
        filter: false,
        width: 110,
      },
      {
        field: "subDepartmentId",
        headerName: "Mã bộ môn quản lý",
        filter: "agTextColumnFilter",
        editable: true,
        width: 180,
      },
      {
        field: "subDepartmentName",
        headerName: "Bộ môn quản lý",
        filter: "agTextColumnFilter",
        width: 180,
      },
      {
        // BỔ SUNG: Tên Khoa
        field: "departmentName",
        headerName: "Khoa",
        filter: "agTextColumnFilter",
        width: 180,
      },
      {
        // BỔ SUNG: Hiển thị danh sách niên khóa (dạng chuỗi cách nhau bởi dấu phẩy)
        field: "schoolYearIds",
        headerName: "Niên khóa",
        filter: "agTextColumnFilter",
        width: 150,
        valueFormatter: (params) => {
          return params.value ? params.value.join(", ") : "";
        },
      },
    ],
    [],
  );

  // 2. Labels cập nhật đầy đủ
  const labels = {
    id: "Mã chương trình đào tạo",
    name: "Tên chương trình",
    educationLevel: "Trình độ đào tạo",
    requiredCredits: "Số tín chỉ yêu cầu",
    subDepartmentId: "Mã bộ môn",
    subDepartmentName: "Bộ môn quản lý",
    departmentId: "Mã khoa",
    departmentName: "Khoa quản lý",
    schoolYearIds: "Các niên khóa áp dụng",
    totalCourses: "Tổng số học phần",
  };

  return (
    <InfiniteGrid<
      EducationProgramResponse,
      EducationProgramRequest,
      EducationProgramFilterRequest
    >
      title="Danh sách Chương trình đào tạo"
      description="Quản lý PO, PLO và khung chương trình giảng dạy"
      columnDefs={columnDefs}
      fetchData={educationProgramService.search}
      // Vì Update yêu cầu EducationProgramRequest, ta cần chuyển đổi nhẹ từ Response
      onUpdate={(data) => {
        // Map lại đúng format request nếu cần thiết
        const requestData: EducationProgramRequest = {
          ...data,
          subDepartmentId: data.subDepartmentId, // Đảm bảo field này tồn tại trong response
        };
        return educationProgramService
          .update(data.id, requestData)
          .then((res) => res.data);
      }}
      onDelete={educationProgramService.delete}
      onCreate={onCreate}
      onViewDetail={async (data) => {
        try {
          // Khi nhấn View, ta fetch Detail để lấy đầy đủ PO, PLO, Mappings
          const detailRes = await educationProgramService.getById(data.id);
          onViewDetail?.(
            "education_program",
            data.name,
            detailRes.data,
            labels,
          );
        } catch (error) {
          const err = error as AxiosError<ApiResponse<null>>;
          toast.error(err.message);
        }
      }}
      pageSize={15}
    />
  );
};

export default EducationProgramList;
