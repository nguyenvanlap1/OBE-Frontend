import React, { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Settings2, RefreshCw, Save, UserPlus, Trash2 } from "lucide-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type GridApi,
} from "ag-grid-community";
import { toast } from "react-toastify";
import type {
  CourseSectionGradeResponse,
  GradeResponse,
} from "../../services/courseSectionService";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import courseSectionService from "../../services/courseSectionService";
import type { CellEditRequestEvent } from "ag-grid-community";

// Định nghĩa interface mới kế thừa từ ColDef của AG Grid
interface MyCustomColDef extends ColDef {
  metadata?: {
    saCode: number;
  };
}

// 1. Khởi tạo Theme và Module (Đồng bộ với style bạn thích)
ModuleRegistry.registerModules([AllCommunityModule]);
const myTheme = themeQuartz.withParams({
  spacing: 5,
  accentColor: "#2563eb", // Blue-600
});

interface Props {
  data: CourseSectionGradeResponse;
  isReadOnly?: boolean;
  onRefresh?: () => void; // Thêm prop này
}

const GradeTableAgGrid: React.FC<Props> = ({
  data,
  isReadOnly = false,
  onRefresh,
}) => {
  const gridApiRef = useRef<GridApi | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [newStudentId, setNewStudentId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleRemoveStudent = useCallback(
    async (studentId: string) => {
      if (
        !window.confirm(`Bạn có chắc muốn xóa sinh viên ${studentId} khỏi lớp?`)
      )
        return;

      try {
        await courseSectionService.removeStudent(data.id, studentId);

        const rowNode = gridApiRef.current?.getRowNode(studentId.toString());
        if (rowNode?.data) {
          gridApiRef.current?.applyTransaction({ remove: [rowNode.data] });
          toast.success(`Đã xóa sinh viên ${studentId}`);
        }
      } catch (err: unknown) {
        const error = err as AxiosError<ApiResponse<null>>;
        toast.error(error.message || "Xóa sinh viên thất bại");
      }
    },
    [data.id],
  ); // QUAN TRỌNG: Cần data.id ở đây

  const handleAddStudent = useCallback(async () => {
    if (!newStudentId.trim()) {
      toast.warn("Vui lòng nhập MSSV");
      return;
    }

    setIsAdding(true);
    try {
      const response = await courseSectionService.addStudent(
        data.id,
        newStudentId,
      );
      const newEnrollment = response.data;

      if (newEnrollment) {
        gridApiRef.current?.applyTransaction({
          add: [newEnrollment],
          addIndex: 0,
        });
        toast.success(`Đã thêm sinh viên ${newStudentId}`);
        setNewStudentId("");
      }
    } catch (err: unknown) {
      const msg = err as AxiosError<ApiResponse<null>>;
      toast.error(msg.response?.data?.message || "Thêm sinh viên thất bại");
    } finally {
      setIsAdding(false);
    }
  }, [data.id, newStudentId]); // Phụ thuộc vào ID lớp và giá trị input
  // 3. Định nghĩa cột (Mapping động từ sectionAssessmentResponses)
  // 3. Định nghĩa cột (Đã thu nhỏ STT và MSSV)
  const columnDefs = useMemo(() => {
    const baseCols: ColDef[] = [
      {
        headerName: "STT",
        valueGetter: "node.rowIndex + 1",
        width: 50, // Thu nhỏ hết mức có thể
        minWidth: 50,
        maxWidth: 60,
        flex: 0, // Không cho phép co giãn theo tỷ lệ
        pinned: "left",
        filter: false,
        sortable: false,
        suppressSizeToFit: true, // Ép Grid giữ nguyên kích thước này
        cellClass: "text-center text-gray-500",
      },
      {
        headerName: "MSSV",
        field: "studentId",
        width: 100, // Vừa đủ cho mã số sinh viên
        minWidth: 100,
        maxWidth: 110,
        flex: 0, // Không cho phép co giãn
        pinned: "left",
        filter: "agTextColumnFilter",
        suppressSizeToFit: true,
        cellClass: "font-mono text-xs text-blue-900", // Font mono giúp mã số gọn hơn
      },
      {
        headerName: "Họ và Tên",
        field: "studentFullName",
        minWidth: 180, // Để cột tên "gánh" phần flex còn lại
        flex: 2, // Ưu tiên giãn cột tên thay vì cột điểm
        pinned: "left",
        filter: "agTextColumnFilter",
      },
    ];

    const gradeCols: ColDef[] = data.sectionAssessmentResponses.map((sa) => {
      const assessmentInfo = data.assessmentResponses.find(
        (a) => a.assessmentCode === sa.sectionAssessmentCode,
      );
      const weight = assessmentInfo?.weight ?? 0;
      const fieldName = `grade_${sa.sectionAssessmentCode}`;

      return {
        headerName: `${assessmentInfo?.name || "Điểm"} (${(weight * 100).toFixed(0)}%)`,
        field: fieldName,
        width: 90, // Thu nhỏ cột điểm cho gọn
        minWidth: 80,
        maxWidth: 120,
        flex: 1,
        editable: !isReadOnly,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: { min: 0, max: 10 },
        cellClass:
          "text-center font-bold text-blue-700 bg-blue-50/20 border-l border-gray-100",
        metadata: { saCode: sa.sectionAssessmentCode },
        valueGetter: (params) => {
          const gradeEntry = params.data.grades?.find(
            (g: GradeResponse) =>
              g.sectionAssessmentCode === sa.sectionAssessmentCode,
          );
          return gradeEntry ? gradeEntry.score : null;
        },
        hide: hiddenColumns.includes(fieldName),
      };
    });

    const handleCols: ColDef[] = [
      {
        headerName: "Thao tác",
        field: "actions",
        width: 80,
        minWidth: 80,
        maxWidth: 100,
        pinned: "right",
        filter: false,
        sortable: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => (
          <div className="flex justify-center items-center h-full">
            <button
              onClick={() => handleRemoveStudent(params.data.studentId)}
              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Xóa sinh viên"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ];
    return [...baseCols, ...gradeCols, ...handleCols];
  }, [
    data.sectionAssessmentResponses,
    data.assessmentResponses,
    isReadOnly,
    hiddenColumns,
    handleRemoveStudent,
  ]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      floatingFilter: true,
      cellStyle: { fontSize: "13px" }, // Giảm size chữ xuống 12px cho gọn bảng
    }),
    [],
  );

  const onCellEditRequest = useCallback(async (event: CellEditRequestEvent) => {
    const { data: rowData, newValue, oldValue, colDef, column, node } = event;

    // 1. Kiểm tra giá trị thực sự thay đổi
    const val = newValue === "" || newValue === null ? null : Number(newValue);
    const oldVal =
      oldValue === "" || oldValue === null ? null : Number(oldValue);

    if (val === oldVal) return;

    const saCode = (colDef as MyCustomColDef).metadata?.saCode;
    if (!saCode) return;

    try {
      // 2. Gọi API trước
      await courseSectionService.updateSingleGrade(
        rowData.id,
        saCode,
        val ?? 0,
      );

      // 3. API THÀNH CÔNG -> Cập nhật trực tiếp vào data của dòng
      if (!rowData.grades) rowData.grades = [];
      const idx = rowData.grades.findIndex(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (g: any) => g.sectionAssessmentCode === saCode,
      );

      if (idx > -1) {
        rowData.grades[idx].score = val;
      } else {
        rowData.grades.push({ sectionAssessmentCode: saCode, score: val });
      }

      // 4. ÉP GRID CẬP NHẬT HIỂN THỊ
      // Vì readOnlyEdit=true, chỉ khi dòng này chạy thì số trên màn hình mới thay đổi
      node?.setDataValue(column, val);
      gridApiRef.current?.redrawRows();
      toast.success(`Đã cập nhật điểm cho ${rowData.studentFullName}`);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiResponse<null>>;
      console.error("Chi tiết lỗi:", error); // Log ra console để debug
      toast.error(error.message || "Cập nhật điểm thất bại");
      // Không cần set lại oldValue vì thực tế Grid chưa bao giờ đổi sang newValue
    }
  }, []);

  return (
    <div className="space-y-2">
      {/* TOOLBAR TỔNG HỢP - GỌN GÀNG */}
      <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        {/* Nhóm bên trái: Tiêu đề + Thêm sinh viên */}
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2 px-1 border-r pr-4 border-gray-100">
            <h1 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
              Bảng điểm lớp
            </h1>
            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
              #{data.id}
            </span>
          </div>

          {/* CỤM THÊM SINH VIÊN: Tinh tế */}
          <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded border border-gray-200 focus-within:border-blue-400 focus-within:bg-white transition-all">
            <input
              type="text"
              placeholder="Thêm MSSV..."
              value={newStudentId}
              onChange={(e) => setNewStudentId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
              className="bg-transparent border-none focus:ring-0 text-xs w-24 px-2 py-1 placeholder:text-gray-400"
            />
            <button
              onClick={handleAddStudent}
              disabled={isAdding}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50 transition-colors"
            >
              <UserPlus size={14} className={isAdding ? "animate-pulse" : ""} />
            </button>
          </div>
        </div>

        {/* Nhóm bên phải: Cài đặt cột + Refresh */}
        <div className="flex items-center gap-2">
          {/* Cài đặt ẩn hiện cột */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 transition-all">
              <Settings2 size={14} />
              <span className="hidden sm:inline">Cột</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 shadow-xl rounded-md z-50 p-2 hidden group-hover:block">
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 border-b pb-1">
                Tùy chỉnh cột điểm
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                {data.sectionAssessmentResponses.map((sa) => {
                  const name =
                    data.assessmentResponses.find(
                      (a) => a.assessmentCode === sa.sectionAssessmentCode,
                    )?.name || "Cột điểm";
                  const fieldName = `grade_${sa.sectionAssessmentCode}`;
                  return (
                    <label
                      key={fieldName}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.includes(fieldName)}
                        className="w-3.5 h-3.5 accent-blue-600 rounded"
                        onChange={() =>
                          setHiddenColumns((prev) =>
                            prev.includes(fieldName)
                              ? prev.filter((f) => f !== fieldName)
                              : [...prev, fieldName],
                          )
                        }
                      />
                      <span className="text-xs text-gray-700">{name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onRefresh) {
                onRefresh();
              }
              gridApiRef.current?.redrawRows();
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-300 rounded transition-all"
            title="Tải lại bảng"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* GRID CONTAINER */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 overflow-hidden">
        <div className="h-[500px]">
          <AgGridReact
            theme={myTheme}
            rowData={data.enrollmentResponses}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={(params) => (gridApiRef.current = params.api)}
            pagination={true}
            readOnlyEdit={true}
            paginationPageSize={15}
            enableCellTextSelection={true}
            undoRedoCellEditing={true}
            undoRedoCellEditingLimit={5}
            suppressFieldDotNotation={true}
            onCellEditRequest={onCellEditRequest}
            getRowId={(params) => params.data.studentId.toString()}
          />
        </div>
      </div>

      {/* FOOTER: Ghi chú nhỏ */}
      <div className="flex items-center gap-2 text-[10px] text-gray-400 italic px-1">
        <Save size={10} />
        <span>Hệ thống tự động lưu điểm ngay sau khi chỉnh sửa ô.</span>
      </div>
    </div>
  );
};

export default GradeTableAgGrid;
