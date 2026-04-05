import React, { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { RefreshCw, Save, Trash2, BookOpen, PlusCircle } from "lucide-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type GridApi,
  type CellEditRequestEvent,
} from "ag-grid-community";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import educationProgramService, {
  type ProgramCourseDetailListResponse,
} from "./educationProgramService";

ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz.withParams({
  spacing: 5,
  accentColor: "#2563eb",
});

interface Props {
  programData: ProgramCourseDetailListResponse;
  knowledgeBlocks: { id: string; name: string }[];
  isReadOnly?: boolean;
  onRefresh?: () => void;
}

const ProgramCourseTableAgGrid: React.FC<Props> = ({
  programData,
  knowledgeBlocks,
  isReadOnly = false,
  onRefresh,
}) => {
  const gridApiRef = useRef<GridApi | null>(null);
  const [newCourseId, setNewCourseId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCourse = useCallback(async () => {
    if (!newCourseId.trim()) {
      toast.warn("Vui lòng nhập Mã học phần");
      return;
    }

    setIsAdding(true);
    try {
      const defaultKbId =
        knowledgeBlocks.length > 0 ? knowledgeBlocks[0].id : undefined;

      const response = await educationProgramService.addCourse(
        programData.id,
        newCourseId.toUpperCase(),
        1,
        defaultKbId,
      );

      // Kiểm tra response.data chính là object ProgramCourseDetailResponse mới
      if (response.data) {
        toast.success(`Đã thêm học phần ${newCourseId}`);

        // CHÈN TRỰC TIẾP VÀO GRID MÀ KHÔNG CẦN REFRESH
        gridApiRef.current?.applyTransaction({
          add: [response.data],
          addIndex: 0, // Thêm vào đầu danh sách cho dễ thấy
        });

        setNewCourseId("");

        // BỎ DÒNG NÀY: if (onRefresh) onRefresh();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<ApiResponse<null>>;
      toast.error(error.message || "Không thể thêm học phần.");
    } finally {
      setIsAdding(false);
    }
  }, [programData.id, newCourseId, knowledgeBlocks]); // Xóa onRefresh khỏi dependency

  // 2. Xử lý Xóa học phần
  const handleRemoveCourse = useCallback(
    async (courseId: string) => {
      if (!window.confirm(`Xóa học phần ${courseId} khỏi chương trình?`))
        return;

      try {
        await educationProgramService.removeCourse(programData.id, courseId);
        gridApiRef.current?.applyTransaction({
          remove: [{ courseId }],
        });
        toast.success(`Đã xóa học phần ${courseId}`);
      } catch (err: unknown) {
        const error = err as AxiosError<ApiResponse<null>>;
        toast.error(error.response?.data?.message || "Xóa thất bại");
      }
    },
    [programData.id],
  );

  // 3. Cập nhật Khối kiến thức
  const onCellEditRequest = useCallback(
    async (event: CellEditRequestEvent) => {
      const { data: rowData, newValue, column, node } = event;
      const targetKB = knowledgeBlocks.find((kb) => kb.name === newValue);
      if (!targetKB || targetKB.id === rowData.knowledgeBlockId) return;

      try {
        await educationProgramService.updateCourseKnowledgeBlock(
          programData.id,
          rowData.courseId,
          targetKB.id,
        );

        rowData.knowledgeBlockId = targetKB.id;
        rowData.knowledgeBlockName = targetKB.name;
        node?.setDataValue(column, targetKB.name);
        gridApiRef.current?.redrawRows();
        toast.success(`Đã chuyển ${rowData.courseId} sang ${targetKB.name}`);
      } catch (err: unknown) {
        const error = err as AxiosError<ApiResponse<null>>;
        toast.error(error.response?.data?.message || "Cập nhật thất bại");
      }
    },
    [programData.id, knowledgeBlocks],
  );

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "STT",
        valueGetter: "node.rowIndex + 1",
        width: 70,
        pinned: "left",
        sortable: false,
        filter: false,
        cellClass: "text-center text-gray-500",
      },
      {
        headerName: "Mã Học Phần",
        field: "courseId",
        width: 130,
        pinned: "left",
        cellClass: "font-mono font-bold text-blue-900",
      },
      {
        headerName: "Tên Học Phần (Phiên bản)",
        field: "courseVersionName",
        minWidth: 250,
        flex: 2,
        valueFormatter: (p) =>
          p.value ? `${p.value} (v${p.data.courseVersionNumber})` : "",
      },
      {
        headerName: "Tín chỉ",
        field: "courseCredit",
        width: 100,
        cellClass: "text-center font-medium",
      },
      {
        headerName: "Khối kiến thức",
        field: "knowledgeBlockName",
        minWidth: 200,
        flex: 1,
        editable: !isReadOnly,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: knowledgeBlocks.map((kb) => kb.name),
        },
        cellClass:
          "bg-blue-50/30 font-semibold text-blue-700 border-l border-blue-100",
        valueFormatter: (p) => p.value || "(Chưa phân khối)",
      },
      {
        headerName: "Thao tác",
        width: 100,
        pinned: "right",
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => (
          <div className="flex justify-center items-center h-full">
            <button
              onClick={() => handleRemoveCourse(params.data.courseId)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Gỡ học phần"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [isReadOnly, knowledgeBlocks, handleRemoveCourse],
  );

  return (
    <div className="space-y-2">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between bg-white p-2 rounded-t-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 border-r border-gray-100">
            <div className="p-1.5 bg-blue-50 rounded text-blue-600">
              <BookOpen size={18} />
            </div>
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Học phần trong chương trình
            </h2>
          </div>

          {/* CỤM THÊM HỌC PHẦN */}
          {!isReadOnly && (
            <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded border border-gray-200 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <input
                type="text"
                placeholder="Nhập Mã học phần..."
                value={newCourseId}
                onChange={(e) => setNewCourseId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCourse()}
                className="bg-transparent border-none focus:ring-0 text-xs w-40 px-2 py-1 placeholder:text-gray-400"
              />
              <button
                onClick={handleAddCourse}
                disabled={isAdding}
                className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 transition-colors"
              >
                <PlusCircle
                  size={14}
                  className={isAdding ? "animate-spin" : ""}
                />
                <span>Thêm môn</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onRefresh}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-300 rounded transition-all"
          title="Tải lại danh sách"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* GRID */}
      <div className="bg-white rounded-b-lg shadow-sm border-x border-b border-gray-200 p-1 overflow-hidden">
        <div className="h-[550px]">
          <AgGridReact
            theme={myTheme}
            rowData={programData.programCourseDetailResponses}
            columnDefs={columnDefs}
            onGridReady={(params) => (gridApiRef.current = params.api)}
            readOnlyEdit={true}
            onCellEditRequest={onCellEditRequest}
            getRowId={(params) => params.data.courseId}
            pagination={true}
            paginationPageSize={20}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400 italic px-1">
        <Save size={12} />
        <span>
          Kích hoạt ô "Khối kiến thức" để thay đổi. Dữ liệu sẽ được đồng bộ tự
          động lên hệ thống.
        </span>
      </div>
    </div>
  );
};

export default ProgramCourseTableAgGrid;
