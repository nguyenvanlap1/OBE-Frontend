import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";

import courseVersionService, {
  type CourseVersionResponse,
  type CourseVersionResponseDetail,
} from "../../services/courseVersionService";
// Import component Grid mới dành riêng cho CourseVersion
import logData from "../../utils/logData";
import { CourseVersionGrid } from "./CourseVersionGrid";

interface CourseVersionListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: CourseVersionResponseDetail & { id: string },
  ) => void;
  onCreate?: () => void;
}

const CourseVersionList = ({
  onViewDetail,
  onCreate,
}: CourseVersionListProps) => {
  // 1. Định nghĩa cột hiển thị
  const columnDefs = useMemo<ColDef<CourseVersionResponse>[]>(
    () => [
      {
        field: "courseId",
        headerName: "Mã Học Phần",
        width: 150,
        pinned: "left",
      },
      {
        field: "courseName",
        headerName: "Tên Học Phần",
        cellClass: "font-medium",
        flex: 1,
      },
      {
        field: "credits",
        headerName: "Tín chỉ",
        width: 100,
        filter: "agNumberColumnFilter",
      },
      {
        field: "versionNumber",
        headerName: "Phiên bản",
        width: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) =>
          params.value ? `v${params.value}` : "-",
        cellClass: "text-blue-600 font-semibold",
      },
      {
        field: "fromDate",
        headerName: "Ngày áp dụng",
        width: 150,
        filter: "agDateColumnFilter",
      },
      {
        field: "subDepartmentId",
        headerName: "Mã Bộ môn",
        width: 130,
      },
      {
        field: "departmentName",
        headerName: "Khoa quản lý",
        flex: 0.8,
      },
    ],
    [],
  );

  return (
    <CourseVersionGrid
      title="Quản lý Phiên bản Học phần"
      description="Danh sách các phiên bản OBE. Nhấn 'Xem chi tiết' để cập nhật nội dung."
      columnDefs={columnDefs}
      fetchData={courseVersionService.search}
      // 2. Logic Xóa: Khớp với signature (courseId, versionNumber) của CourseVersionGrid
      onDelete={(courseId, versionNumber) => {
        return courseVersionService.delete(courseId, versionNumber);
      }}
      // 3. Logic Xem chi tiết: Lấy dữ liệu đầy đủ từ Service
      onViewDetail={(dataFromGrid) => {
        courseVersionService
          .getDetail(dataFromGrid.courseId, dataFromGrid.versionNumber)
          .then((res) => {
            logData(res);

            const enrichedData = {
              ...res.data,
              // ID duy nhất cho Tab để React không bị nhầm lẫn giữa các Version
              id: `${res.data.courseId}_v${res.data.versionNumber}`,
            };

            onViewDetail?.(
              "course-version",
              `${res.data.courseId} (v${res.data.versionNumber})`,
              enrichedData,
            );
          });
      }}
      onCreate={onCreate}
      pageSize={15}
    />
  );
};

export default CourseVersionList;
