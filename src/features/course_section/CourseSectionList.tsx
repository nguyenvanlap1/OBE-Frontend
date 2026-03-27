import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import courseSectionService from "../../services/courseSectionService";
import type {
  CourseSectionFilterRequest,
  CourseSectionUpdateRequest,
  CourseSectionResponse,
} from "../../services/courseSectionService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";

interface CourseSectionListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: CourseSectionResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
  onCreate: () => void;
}

const CourseSectionList = ({
  onViewDetail,
  onCreate,
}: CourseSectionListProps) => {
  // 1. Định nghĩa các cột cho bảng Lớp Học Phần
  const columnDefs = useMemo<ColDef<CourseSectionResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã Lớp HP",
        flex: 0.8,
        filter: "agTextColumnFilter",
        pinned: "left",
      },
      {
        field: "courseId",
        headerName: "Mã Học Phần",
        filter: "agTextColumnFilter",
        flex: 0.7,
      },
      {
        field: "courseVersionName",
        headerName: "Tên Học Phần (Phiên bản)",
        filter: "agTextColumnFilter",
        flex: 1.5,
        cellClass: "font-medium text-blue-700",
      },
      {
        field: "semesterTerm",
        headerName: "Học kỳ",
        filter: "agNumberColumnFilter",
        flex: 0.5,
        editable: true,
      },
      {
        field: "semesterAcademicYear",
        headerName: "Năm học",
        filter: "agTextColumnFilter",
        flex: 0.8,
        editable: true,
      },
      {
        field: "lecturerName",
        headerName: "Giảng viên",
        filter: "agTextColumnFilter",
        flex: 1.2,
      },
      {
        field: "subDepartmentName",
        headerName: "Bộ môn quản lý",
        filter: "agTextColumnFilter",
        flex: 1,
      },
    ],
    [],
  );

  // Nhãn hiển thị khi xem chi tiết (ViewDetail)
  const courseSectionLabels = {
    id: "Mã Lớp Học Phần",
    courseId: "Mã Học Phần",
    courseVersionName: "Tên Phiên Bản Học Phần",
    versionNumber: "Số Hiệu Phiên Bản",
    semesterTerm: "Học Kỳ (1/2/3)",
    semesterAcademicYear: "Năm Học (VD: 2025-2026)",
    lecturerId: "Mã Giảng Viên",
    lecturerName: "Họ Tên Giảng Viên",
    subDepartmentName: "Thuộc Bộ Môn",
  };

  // 2. Lắp ráp vào InfiniteGrid
  return (
    <InfiniteGrid<
      CourseSectionResponse,
      CourseSectionUpdateRequest,
      CourseSectionFilterRequest
    >
      columnDefs={columnDefs}
      fetchData={courseSectionService.search}
      onUpdate={async (data) => {
        // Map từ Response về UpdateRequest nếu backend yêu cầu payload cụ thể
        const updatePayload: CourseSectionUpdateRequest = {
          id: data.id,
          semesterTerm: data.semesterTerm,
          semesterAcademicYear: data.semesterAcademicYear,
          courseId: data.courseId,
          versionNumber: data.versionNumber,
          lecturerId: data.lecturerId,
        };
        const res = await courseSectionService.update(data.id, updatePayload);
        return res.data;
      }}
      onDelete={courseSectionService.delete}
      onViewDetail={(data) => {
        onViewDetail?.("courseSection", data.id, data, courseSectionLabels);
        console.log("Viewing Course Section: ", data.id);
      }}
      onCreate={onCreate}
      title={"Quản lý Lớp Học Phần (OBE)"}
    />
  );
};

export default CourseSectionList;
