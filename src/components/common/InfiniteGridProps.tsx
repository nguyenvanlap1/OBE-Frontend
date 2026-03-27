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
  type NewValueParams,
  type ICellRendererParams,
} from "ag-grid-community";
import { toast } from "react-toastify";
import type {
  ApiResponse,
  PageableRequest,
  PageResponse,
} from "../../services/api";

const myTheme = themeQuartz.withParams({
  spacing: 5,
  accentColor: "blue",
});

ModuleRegistry.registerModules([AllCommunityModule]);

interface InfiniteGridProps<
  EntityReponse extends { id: string | number },
  EntityRequest extends { id: string | number },
  FilterRequest,
> {
  columnDefs: ColDef<EntityReponse>[];
  fetchData: (
    params: PageableRequest,
    filters: FilterRequest,
  ) => Promise<ApiResponse<PageResponse<EntityReponse>>>;
  onUpdate?: (data: EntityRequest) => Promise<EntityReponse>;
  onCreate?: () => void;
  onDelete?: (id: string) => Promise<ApiResponse<void>>;
  onViewDetail?: (data: EntityReponse) => void; // Thêm dòng này
  pageSize?: number;
  title: string;
  description?: string;
}

export const InfiniteGrid = <
  EntityReponse extends { id: string | number },
  EntityRequest extends { id: string | number },
  FilterRequest,
>({
  columnDefs,
  fetchData,
  onUpdate,
  onDelete,
  onViewDetail,
  onCreate,
  pageSize = 15,
  title,
  description,
}: InfiniteGridProps<EntityReponse, EntityRequest, FilterRequest>) => {
  const gridApiRef = useRef<GridApi<EntityReponse> | null>(null);
  const [inputPage, setInputPage] = useState<number>(1);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const handleGoToPage = () => {
    if (gridApiRef.current) {
      gridApiRef.current.paginationGoToPage(inputPage - 1);
    }
  };

  const onCellValueChanged = useCallback(
    async (params: NewValueParams<EntityReponse>) => {
      // 1. Kiểm tra điều kiện chặn
      if (!onUpdate || params.newValue === params.oldValue) return;

      try {
        // 2. Ép kiểu dữ liệu từ Response sang Request để gửi lên API
        // Chúng ta ép kiểu params.data sang EntityRequest
        const requestData = params.data as unknown as EntityRequest;

        await onUpdate(requestData);
        toast.success("Cập nhật thành công!");
      } catch (err: unknown) {
        // 3. Xử lý lỗi message (xem chi tiết ở phần dưới)
        const errorResponse = err as ApiResponse<null>;

        // Hiển thị lỗi cụ thể (ví dụ: "Tên bộ môn không được để trống")
        toast.error(errorResponse.message || "Cập nhật thất bại");

        // Nếu lỗi, refresh để quay về dữ liệu cũ trong cache
        gridApiRef.current?.refreshInfiniteCache();
      }
    },
    [onUpdate],
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent<EntityReponse>) => {
      gridApiRef.current = params.api;
      const datasource: IDatasource = {
        getRows: async (p: IGetRowsParams) => {
          try {
            const { startRow, endRow, filterModel, sortModel } = p;
            const size = endRow - startRow;
            const page = Math.floor(startRow / size);

            const sortParam =
              sortModel.length > 0
                ? [`${sortModel[0].colId},${sortModel[0].sort}`]
                : ["id,asc"];

            // SỬA LỖI ANY: Mapping filter linh hoạt với kiểu dữ liệu an toàn
            const filters = Object.keys(filterModel).reduce((acc, key) => {
              // Ép kiểu acc thành Record để có thể gán thuộc tính động một cách hợp lệ
              const target = acc as Record<string, string | number | boolean>;

              // Lấy giá trị filter từ AG Grid
              target[key] = filterModel[key].filter;

              return acc;
            }, {} as FilterRequest);

            const res = await fetchData(
              { page, size, sort: sortParam },
              filters,
            );

            // AG Grid nhận dữ liệu từ PageResponse của Spring Boot
            p.successCallback(res.data.content, res.data.totalElements);
          } catch (err: unknown) {
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
    setHiddenColumns(
      (prev) =>
        prev.includes(field)
          ? prev.filter((f) => f !== field) // Hiện lại
          : [...prev, field], // Ẩn đi
    );
    // Sau khi ẩn hiện, grid cần tính toán lại độ rộng các cột cho đẹp
    // setTimeout(() => gridApiRef.current?.sizeColumnsToFit(), 0);
  };

  const finalColumnDefs = useMemo(() => {
    // 1. Map các cột cơ bản từ props
    const baseCols: ColDef<EntityReponse>[] = columnDefs.map((col) => ({
      ...col,
      hide: col.field ? hiddenColumns.includes(col.field as string) : false,
    }));

    // 2. Kiểm tra điều kiện: Chỉ hiện cột Thao tác nếu có ít nhất 1 trong 2 hành động
    if (onViewDetail || onDelete) {
      baseCols.push({
        headerName: "Thao tác",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        field: "id" as any,
        pinned: "right",
        sortable: false,
        filter: false,
        resizable: false,
        // Tính toán độ rộng linh hoạt: 1 nút thì 80px, 2 nút thì 150px
        width: onViewDetail && onDelete ? 70 : 90,
        suppressSizeToFit: true,
        cellClass: "!flex items-center justify-center gap-3",
        cellRenderer: (params: ICellRendererParams<EntityReponse>) => (
          <div className="flex justify-center items-center h-full gap-2">
            {/* Nút Xem chi tiết */}
            {onViewDetail && (
              <button
                onClick={() => onViewDetail(params.data!)}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                title="Xem chi tiết"
              >
                <Eye size={18} strokeWidth={2} />
              </button>
            )}

            {/* Nút Xóa */}
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
                    onDelete(params.value)
                      .then(() => {
                        toast.success("Xóa thành công");
                        gridApiRef.current?.refreshInfiniteCache();
                      })
                      .catch((err: unknown) => {
                        const errorResponse = err as ApiResponse<null>;
                        toast.error(errorResponse.message || "Xóa thất bại");
                      });
                  }
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Xóa"
              >
                <Trash2 size={18} strokeWidth={2} />
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
      filter: "agTextColumnFilter", // Bật bộ lọc text
      floatingFilter: true, // HIỆN THANH NHẬP TEXT DƯỚI HEADER
      sortable: true,
      resizable: true,

      cellStyle: {
        fontSize: "13px",
        lineHeight: "var(--ag-row-height)", // Sử dụng biến của AG Grid để khớp hoàn toàn
        paddingTop: "0px",
        paddingBottom: "0px",
      },
    }),
    [],
  );
  return (
    <div className="bg-gray-50 min-h-screen p-2">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Header & Toolbar gom tất cả vào 1 hàng duy nhất */}
        <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          {/* Bên trái: Tiêu đề + Mô tả */}
          <div className="flex items-baseline gap-2 overflow-hidden px-1">
            <h1 className="text-base font-bold text-gray-800 whitespace-nowrap">
              {title}
            </h1>
            {description && (
              <span className="text-[11px] text-gray-400 truncate hidden md:inline">
                {description}
              </span>
            )}
          </div>

          {/* Bên phải: Gom tất cả vào một cụm */}
          <div className="flex items-center gap-2">
            {/* 1. Ô chuyển trang mini */}
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded px-1.5 py-0.5">
              <input
                type="number"
                value={inputPage}
                onChange={(e) => setInputPage(Number(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
                className="w-7 text-center outline-none bg-transparent font-semibold text-indigo-600 text-xs"
                placeholder="P."
              />
              <button
                onClick={handleGoToPage}
                className="text-indigo-600 hover:text-indigo-800 p-0.5 ml-1 border-l border-gray-200"
              >
                <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>

            {/* 2. Dropdown Cài đặt cột */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 transition-all">
                <Settings2 size={14} />
                <span className="hidden sm:inline ml-1">Cột</span>
              </button>

              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md z-50 p-2 hidden group-hover:block animate-in fade-in zoom-in duration-150">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 px-1 border-b pb-1">
                  Tùy chỉnh cột
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {columnDefs
                    .filter((col) => col.field)
                    .map((col) => (
                      <label
                        key={col.field as string}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-indigo-50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={!hiddenColumns.includes(col.field as string)}
                          className="w-3.5 h-3.5 accent-indigo-600 rounded"
                          onChange={() => toggleColumn(col.field as string)}
                        />
                        <span className="text-xs text-gray-700 select-none">
                          {col.headerName || col.field}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            {/* 3. Nút Làm mới */}
            <button
              onClick={() => gridApiRef.current?.refreshInfiniteCache()}
              className="px-3 py-1.5 text-xs font-semibold rounded text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1"
            >
              <RefreshCw size={14} />
            </button>
            {/* --- NÚT TẠO MỚI --- */}
            {/* --- NÚT TẠO MỚI --- */}
            {onCreate && (
              <button
                onClick={async () => {
                  try {
                    // Gọi hàm onCreate từ cha truyền vào
                    // Cha có thể mở Modal và trả về kết quả sau khi đóng Modal
                    await onCreate();

                    // Luôn làm mới cache sau khi thao tác tạo mới hoàn tất thành công
                    gridApiRef.current?.refreshInfiniteCache();
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  } catch (err) {
                    // Nếu cha "throw error" hoặc user hủy bỏ, không cần refresh
                    console.log("Create cancelled or failed");
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all flex items-center gap-1"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Thêm mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Grid Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 overflow-hidden">
          <div className="h-[calc(100vh-180px)] min-h-[500px]">
            <AgGridReact<EntityReponse>
              theme={myTheme}
              columnDefs={finalColumnDefs}
              defaultColDef={defaultColDef}
              rowModelType="infinite"
              onGridReady={onGridReady}
              onCellValueChanged={onCellValueChanged}
              cacheBlockSize={pageSize}
              pagination={true}
              paginationPageSize={pageSize}
              suppressCellFocus={false}
              enableCellTextSelection={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
