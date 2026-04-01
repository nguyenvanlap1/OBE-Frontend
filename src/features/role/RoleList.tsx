import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import roleService from "../../services/roleService";
import type {
  RoleResponse,
  RoleRequest,
  RoleFilterRequest,
  RoleResponseDetail,
} from "../../services/roleService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";
import { toast } from "react-toastify";

interface RoleListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: RoleResponseDetail,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
  onCreate: () => void;
}

const RoleList = ({ onViewDetail, onCreate }: RoleListProps) => {
  // Hàm helper để hiển thị mảng ID quyền
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listFormatter = (params: any) => {
    const value = params.value;
    if (Array.isArray(value) && value.length > 0) {
      return value.join(", ");
    }
    return "---";
  };

  // 1. Định nghĩa các cột cho Role
  const columnDefs = useMemo<ColDef<RoleResponse>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã Vai Trò",
        flex: 0.8,
        filter: "agTextColumnFilter",
        pinned: "left",
      },
      {
        field: "name",
        headerName: "Tên Vai Trò",
        editable: true,
        filter: "agTextColumnFilter",
        flex: 1,
        cellClass: "font-medium text-blue-600",
      },
      {
        field: "description",
        headerName: "Mô tả",
        editable: true,
        flex: 1.5,
        filter: "agTextColumnFilter",
      },
      {
        field: "permissionIds",
        headerName: "Quyền hạn",
        flex: 1.2,
        filter: "agTextColumnFilter",
        valueFormatter: listFormatter,
      },
    ],
    [],
  );

  // Nhãn hiển thị cho chi tiết (Khớp với các field trong RoleResponse/Detail)
  const roleLabels = {
    id: "Mã định danh vai trò",
    name: "Tên vai trò hiển thị",
    description: "Mô tả nhiệm vụ",
    permissionIds: "Danh sách mã quyền",
    rolePermissionResponses: "Chi tiết quyền và phạm vi",
  };

  return (
    <InfiniteGrid<RoleResponse, RoleRequest, RoleFilterRequest>
      columnDefs={columnDefs}
      fetchData={roleService.search}
      onDelete={roleService.delete}
      // Trong RoleList.tsx

      onViewDetail={async (data) => {
        try {
          // 1. Gọi API lấy chi tiết (vì data từ Grid chỉ có ID quyền, không có tên quyền & scope)
          const response = await roleService.getById(data.id);

          if (response.data) {
            // 2. Gửi dữ liệu chi tiết (RoleResponseDetail) vào hàm mở tab
            onViewDetail?.(
              "role", // idTabset
              data.id, // nameTab (Dùng mã Role làm tên tab)
              response.data, // Dữ liệu đầy đủ đã fetch từ hàm getById
              roleLabels, // Nhãn hiển thị
            );
          }
        } catch (error) {
          // Xử lý lỗi nếu không fetch được dữ liệu
          console.error("Lỗi khi lấy chi tiết vai trò:", error);
          toast.error("Không thể tải thông tin chi tiết vai trò");
        }
      }}
      onCreate={onCreate}
      title={"Quản lý Vai trò & Phân quyền"}
    />
  );
};

export default RoleList;
