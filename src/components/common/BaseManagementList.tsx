import { useCallback } from "react";
import type { ColDef } from "ag-grid-community";
import type {
  ApiResponse,
  PageableRequest,
  PageResponse,
} from "../../services/api";
import { InfiniteGrid } from "./InfiniteGridProps";

// Định nghĩa Interface cho một Service chuẩn (Spring Boot style)
interface BaseService<
  EntityResponse extends { id: string },
  EntityRequest extends { id: string },
  FilterRequest,
> {
  search: (
    params: PageableRequest,
    filters: FilterRequest,
  ) => Promise<ApiResponse<PageResponse<EntityResponse>>>;
  update: (
    id: string,
    data: EntityRequest,
  ) => Promise<ApiResponse<EntityResponse>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

interface BaseManagementPageProps<
  EntityResponse extends { id: string },
  EntityRequest extends { id: string },
  FilterRequest,
> {
  title: string;
  description?: string;
  columnDefs: ColDef<EntityResponse>[];
  service: BaseService<EntityResponse, EntityRequest, FilterRequest>;
  pageSize?: number;
}

export const BaseManagementPage = <
  EntityResponse extends { id: string },
  EntityRequest extends { id: string },
  FilterRequest,
>({
  title,
  description,
  columnDefs,
  service,
  pageSize = 15,
}: BaseManagementPageProps<EntityResponse, EntityRequest, FilterRequest>) => {
  // Tự động hóa hàm Fetch
  const handleFetchData = useCallback(
    async (params: PageableRequest, filters: FilterRequest) => {
      return await service.search(params, filters);
    },
    [service],
  );

  // Tự động hóa hàm Update
  const handleUpdate = useCallback(
    async (data: EntityRequest) => {
      // Ép kiểu data thành any để lấy id (vì EntityRequest có thể không có field id)
      const id = data.id;
      const res = await service.update(id, data);
      return res.data;
    },
    [service],
  );

  // Tự động hóa hàm Delete
  const handleDelete = useCallback(
    async (id: string) => {
      return await service.delete(id);
    },
    [service],
  );

  return (
    <InfiniteGrid<EntityResponse, EntityRequest, FilterRequest>
      title={title}
      description={description}
      columnDefs={columnDefs}
      fetchData={handleFetchData}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      pageSize={pageSize}
    />
  );
};
