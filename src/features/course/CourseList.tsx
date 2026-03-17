import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";

import courseService, {
  type CourseFilterRequest,
  type CourseUpdateRequest,
  type CourseResponse,
  type CourseResponseDetail,
} from "../../services/courseService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";
import logData from "../../utils/logData";
interface CourseListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    // Ép kiểu data phải là CourseResponseDetail VÀ phải có thêm trường id: string
    data: CourseResponseDetail & { id: string },
  ) => void;
  onCreate?: () => Promise<void>;
}

const CourseList = ({ onViewDetail, onCreate }: CourseListProps) => {
  const columnDefs = useMemo<ColDef<CourseResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã Học Phần",
        filter: "agTextColumnFilter",
        width: 150,
      },
      {
        field: "name",
        headerName: "Tên Học Phần (Hiện hành)",
        editable: true,
        filter: "agTextColumnFilter",
        cellClass: "bg-blue-50/20 font-medium",
        flex: 1,
      },
      {
        field: "credits",
        headerName: "Tín chỉ",
        editable: true,
        width: 100,
        filter: "agNumberColumnFilter",
      },
      {
        field: "versionNumber",
        headerName: "Phiên bản",
        width: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => `v${params.value}`,
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
        filter: "agTextColumnFilter",
      },
    ],
    [],
  );

  return (
    <InfiniteGrid<CourseResponse, CourseUpdateRequest, CourseFilterRequest>
      title="Quản lý Học phần"
      description="Danh sách học phần và các phiên bản OBE hiện hành"
      columnDefs={columnDefs}
      fetchData={courseService.search}
      onUpdate={(data) =>
        // Lưu ý: data ở đây là CourseResponse từ Grid, cần map sang CourseUpdateRequest nếu cần
        courseService
          .update({
            ...data,
            isNewVersion: false, // Mặc định update trên version hiện tại
          } as CourseUpdateRequest)
          .then((res) => res.data)
      }
      onDelete={(id) => courseService.deleteFullCourse(id)}
      onViewDetail={(dataFromGrid) => {
        // 1. Gọi API lấy chi tiết dựa trên id và versionNumber từ dòng vừa click
        courseService
          .getDetail(dataFromGrid.id, dataFromGrid.versionNumber)
          .then((res) => {
            logData(res);

            // 2. Chuẩn bị dữ liệu đầy đủ
            const enrichedData = {
              ...res.data,
              id: `${res.data.courseId}_v${res.data.versionNumber}`, // Tạo ID duy nhất cho Tab
            };

            // 3. Gọi callback truyền lên App.tsx với ĐỦ 3 THAM SỐ như interface đã định nghĩa
            // onViewDetail ở đây chính là props nhận từ App.tsx
            onViewDetail?.("course", res.data.defaultName, enrichedData);
          });
      }}
      onCreate={onCreate}
      pageSize={15}
    />
  );
};

export default CourseList;
