import { useCallback, useRef, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Eye,
  Trash2,
  RefreshCw,
  ChevronRight,
  Settings2,
  Plus,
} from "lucide-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type GridApi,
  type GridReadyEvent,
  type IDatasource,
  type IGetRowsParams,
  type ICellRendererParams,
} from "ag-grid-community";
import { toast } from "react-toastify";
import type {
  ApiResponse,
  PageableRequest,
  PageResponse,
} from "../../services/api";
import type {
  CourseVersionResponse,
  CourseVersionFilterRequest,
} from "../../services/courseVersionService";
import type { AxiosError } from "axios";

const myTheme = themeQuartz.withParams({
  spacing: 5,
  accentColor: "blue",
});

ModuleRegistry.registerModules([AllCommunityModule]);

interface CourseVersionGridProps {
  columnDefs: ColDef<CourseVersionResponse>[];
  fetchData: (
    params: PageableRequest,
    filters: CourseVersionFilterRequest,
  ) => Promise<ApiResponse<PageResponse<CourseVersionResponse>>>;
  onCreate?: () => void;
  // Delete nhận cả 2 tham số để định danh khóa hỗn hợp
  onDelete?: (
    courseId: string,
    versionNumber: number,
  ) => Promise<ApiResponse<void>>;
  onViewDetail?: (data: CourseVersionResponse) => void;
  pageSize?: number;
  title: string;
  description?: string;
}

export const CourseVersionGrid = ({
  columnDefs,
  fetchData,
  onDelete,
  onViewDetail,
  onCreate,
  pageSize = 15,
  title,
  description,
}: CourseVersionGridProps) => {
  const gridApiRef = useRef<GridApi<CourseVersionResponse> | null>(null);
  const [inputPage, setInputPage] = useState<number>(1);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const handleGoToPage = () => {
    if (gridApiRef.current) {
      gridApiRef.current.paginationGoToPage(inputPage - 1);
    }
  };

  const onGridReady = useCallback(
    (params: GridReadyEvent<CourseVersionResponse>) => {
      gridApiRef.current = params.api;
      const datasource: IDatasource = {
        getRows: async (p: IGetRowsParams) => {
          try {
            const { startRow, endRow, filterModel, sortModel } = p;
            const size = endRow - startRow;
            const page = Math.floor(startRow / size);

            // Xử lý Sort: Mặc định theo courseId nếu không chọn
            const sortParam =
              sortModel.length > 0
                ? [`${sortModel[0].colId},${sortModel[0].sort}`]
                : ["courseId,asc"];

            // Xử lý Filter cho CourseVersionFilterRequest
            const filters: CourseVersionFilterRequest = Object.keys(
              filterModel,
            ).reduce((acc, key) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const target = acc as any;
              target[key] = filterModel[key].filter;
              return acc;
            }, {} as CourseVersionFilterRequest);

            const res = await fetchData(
              { page, size, sort: sortParam },
              filters,
            );
            p.successCallback(res.data.content, res.data.totalElements);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            const errorResponse = err as ApiResponse<null>;
            toast.error("Không thể tải dữ liệu: " + errorResponse.message);
            p.failCallback();
          }
        },
      };
      params.api.setGridOption("datasource", datasource);
    },
    [fetchData],
  );

  const toggleColumn = (field: string) => {
    setHiddenColumns((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const finalColumnDefs = useMemo(() => {
    const baseCols: ColDef<CourseVersionResponse>[] = columnDefs.map((col) => ({
      ...col,
      hide: col.field ? hiddenColumns.includes(col.field as string) : false,
    }));

    if (onViewDetail || onDelete) {
      baseCols.push({
        headerName: "Thao tác",
        pinned: "right",
        sortable: false,
        filter: false,
        resizable: false,
        width: 100,
        cellClass: "!flex items-center justify-center gap-3",
        cellRenderer: (params: ICellRendererParams<CourseVersionResponse>) => (
          <div className="flex justify-center items-center h-full gap-3">
            {onViewDetail && (
              <button
                onClick={() => onViewDetail(params.data!)}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                title="Xem chi tiết"
              >
                <Eye size={18} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  const { courseId, versionNumber } = params.data!;
                  if (
                    window.confirm(
                      `Xóa v${versionNumber} của học phần ${courseId}?`,
                    )
                  ) {
                    onDelete(courseId, versionNumber)
                      .then(() => {
                        toast.success("Xóa thành công");
                        gridApiRef.current?.refreshInfiniteCache();
                      })
                      .catch((err: unknown) => {
                        const error = err as AxiosError<ApiResponse<null>>;
                        toast.error(error.message || "Xóa thất bại");
                      });
                  }
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Xóa"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ),
      });
    }
    return baseCols;
  }, [columnDefs, hiddenColumns, onDelete, onViewDetail]);

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    }),
    [],
  );

  return (
    <div className="bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto space-y-2">
        <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-baseline gap-2 px-1">
            <h1 className="text-base font-bold text-gray-800">{title}</h1>
            {description && (
              <span className="text-[11px] text-gray-400 hidden md:inline">
                {description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded px-1.5 py-0.5">
              <input
                type="number"
                value={inputPage}
                onChange={(e) => setInputPage(Number(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
                className="w-7 text-center bg-transparent font-semibold text-indigo-600 text-xs"
              />
              <button
                onClick={handleGoToPage}
                className="text-indigo-600 p-0.5 ml-1 border-l border-gray-200"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100">
                <Settings2 size={14} />
                <span className="hidden sm:inline">Cột</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md z-50 p-2 hidden group-hover:block">
                {columnDefs
                  .filter((c) => c.field)
                  .map((col) => (
                    <label
                      key={col.field as string}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-indigo-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.includes(col.field as string)}
                        onChange={() => toggleColumn(col.field as string)}
                        className="w-3 h-3 accent-indigo-600"
                      />
                      <span className="text-xs">
                        {col.headerName || col.field}
                      </span>
                    </label>
                  ))}
              </div>
            </div>

            <button
              onClick={() => gridApiRef.current?.refreshInfiniteCache()}
              className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <RefreshCw size={14} />
            </button>

            {onCreate && (
              <button
                onClick={onCreate}
                className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Thêm mới</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 overflow-hidden">
          <div className="h-[calc(100vh-180px)] min-h-[500px]">
            <AgGridReact<CourseVersionResponse>
              theme={myTheme}
              columnDefs={finalColumnDefs}
              defaultColDef={defaultColDef}
              rowModelType="infinite"
              onGridReady={onGridReady}
              cacheBlockSize={pageSize}
              pagination={true}
              paginationPageSize={pageSize}
              // THÊM 2 DÒNG NÀY ĐỂ COPY ĐƯỢC
              enableCellTextSelection={true}
              ensureDomOrder={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
