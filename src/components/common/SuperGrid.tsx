import {
  type ColDef,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type GridApi,
  type GridReadyEvent,
  type IDatasource,
  type IGetRowsParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo, useRef, useState } from "react";

// Đăng ký module Community - Miễn phí hoàn toàn
ModuleRegistry.registerModules([AllCommunityModule]);

interface ServerRequest {
  page: number;
  size: number;
  filterModel: any;
  sortModel: any;
}

interface ServerResponse<T> {
  rows: T[];
  total: number;
}

interface Props<T> {
  columnDefs: ColDef<T>[];
  rowData?: T[]; // dùng cho Client Side mode
  fetchData?: (req: ServerRequest) => Promise<ServerResponse<T>>; // dùng cho Infinite mode
  pageSize?: number;
  [key: string]: any;
}

const SuperGrid = <T,>({
  rowData,
  columnDefs,
  fetchData,
  pageSize = 10,
  ...rest
}: Props<T>) => {
  const gridApiRef = useRef<GridApi<T> | null>(null);
  const [displayedColumns, setDisplayedColumns] = useState<any[]>([]);

  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
    }),
    [],
  );

  const updateColumnList = () => {
    if (!gridApiRef.current) return;
    // Lấy danh sách cột thực tế từ API để đồng bộ UI nút Ẩn/Hiện
    const columns = gridApiRef.current.getColumns() || [];
    setDisplayedColumns([...columns]);
  };

  const toggleColumn = (colId: string) => {
    if (!gridApiRef.current) return;
    const column = gridApiRef.current.getColumn(colId);
    if (!column) return;
    gridApiRef.current.setColumnsVisible([colId], !column.isVisible());
    updateColumnList();
  };

  const onGridReady = (params: GridReadyEvent<T>) => {
    gridApiRef.current = params.api;
    updateColumnList();
    params.api.sizeColumnsToFit();

    // Nếu có fetchData thì cấu hình Datasource cho Infinite Row Model
    if (fetchData) {
      const datasource: IDatasource = {
        getRows: async (p: IGetRowsParams) => {
          const { startRow, endRow, filterModel, sortModel } = p;
          const size = endRow - startRow;
          const page = Math.floor(startRow / size);

          try {
            const res = await fetchData({
              page,
              size,
              filterModel,
              sortModel,
            });
            // Thành công: Trả dữ liệu về cho Grid
            p.successCallback(res.rows, res.total);
          } catch (e) {
            console.error("Grid fetch error:", e);
            p.failCallback();
          }
        },
      };
      // Gán datasource cho grid
      params.api.setGridOption("datasource", datasource);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Toolbar Ẩn/Hiện cột */}
      <div className="flex flex-wrap gap-2 items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
        <span className="text-sm font-semibold text-gray-600 mr-2">
          Ẩn/Hiện cột:
        </span>
        {displayedColumns.map((col) => {
          const colId = col.getColId();
          const isVisible = col.isVisible();
          const headerName = col.getColDef().headerName || colId;

          return (
            <button
              key={colId}
              type="button"
              onClick={() => toggleColumn(colId)}
              className={`px-3 py-1 text-xs font-medium border rounded-md transition-all shadow-sm ${
                isVisible
                  ? "bg-white border-blue-400 text-blue-600 shadow-inner"
                  : "bg-gray-200 border-gray-300 text-gray-400 opacity-60"
              }`}
            >
              {headerName}
            </button>
          );
        })}
      </div>

      {/* Vùng hiển thị Grid */}
      <div className="w-full h-[550px] shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <AgGridReact<T>
          theme={themeQuartz}
          // QUAN TRỌNG: Phải set rowModelType cố định từ đầu để tránh lỗi #22
          rowModelType={fetchData ? "infinite" : "clientSide"}
          rowData={!fetchData ? rowData : undefined}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onColumnMoved={updateColumnList}
          onColumnVisible={updateColumnList}
          // Infinite mode settings (Chỉ có tác dụng khi dùng infinite)
          cacheBlockSize={pageSize}
          maxBlocksInCache={2}
          {...rest}
        />
      </div>
    </div>
  );
};

export default SuperGrid;
