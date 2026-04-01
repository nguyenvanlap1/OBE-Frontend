import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type {
  AccountFilterRequest,
  AccountResponse,
  AccountResponseDetail,
} from "../../services/accountService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";
import accountService from "../../services/accountService";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import { toast } from "react-toastify";

interface AccountListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: AccountResponseDetail,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
  ) => void;
  onCreate: () => void;
}

const AccountList = ({ onViewDetail, onCreate }: AccountListProps) => {
  // 1. Định nghĩa các cột cho bảng Tài khoản
  const columnDefs = useMemo<ColDef<AccountResponse>[]>(
    () => [
      {
        field: "username",
        headerName: "Tên đăng nhập",
        flex: 1,
        filter: "agTextColumnFilter",
        sort: "asc", // Thiết lập sắp xếp mặc định ở đây
        pinned: "left",
        cellClass: "font-bold text-blue-600",
      },
      {
        field: "fullName",
        headerName: "Họ và Tên",
        filter: "agTextColumnFilter",
        flex: 1.5,
      },
      {
        field: "enabled",
        headerName: "Trạng thái",
        flex: 0.8,
        // Thêm filter vào đây
        filter: "agSetColumnFilter",
        filterParams: {
          values: [true, false],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          valueFormatter: (params: any) =>
            params.value ? "Đang hoạt động" : "Đang khóa",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => {
          return params.value ? (
            <span className="text-green-600">● Đang hoạt động</span>
          ) : (
            <span className="text-red-600">● Đang khóa</span>
          );
        },
      },
      {
        field: "isSystemAccount",
        headerName: "Loại tài khoản",
        flex: 1,
        // Thay vì dùng agTextColumnFilter, hãy dùng Set Filter hoặc chỉ định rõ giá trị
        filter: "agSetColumnFilter",
        filterParams: {
          values: [true, false],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          valueFormatter: (params: any) =>
            params.value ? "Hệ thống" : "Người dùng",
        },
        valueFormatter: (params) => (params.value ? "Hệ thống" : "Người dùng"),
        cellClassRules: {
          "text-red-600 font-bold": (params) => params.value === true,
        },
      },
    ],
    [],
  );

  // Nhãn hiển thị cho phần chi tiết
  const accountLabels = {
    username: "Tên đăng nhập / Mã số",
    fullName: "Họ và tên chủ tài khoản",
    enabled: "Trạng thái hoạt động",
    isSystemAccount: "Quyền quản trị hệ thống",
  };

  const handleViewDetail = async (username: string) => {
    try {
      // Gọi API getDetail từ service để lấy dữ liệu mới nhất (bao gồm Roles/Departments)
      const response = await accountService.getDetail(username);

      if (response.data) {
        // Sau khi có dữ liệu "xịn" từ DB, mới truyền vào hàm hiển thị
        onViewDetail?.("account", username, response.data, accountLabels);
      }
    } catch (error) {
      const err = error as AxiosError<ApiResponse<void>>;
      toast(err.message);
      // Bạn có thể thêm thông báo toast lỗi ở đây nếu cần
    }
  };

  return (
    <InfiniteGrid<AccountResponse, AccountResponse, AccountFilterRequest>
      title={"Quản lý Tài khoản người dùng"}
      columnDefs={columnDefs}
      // Sử dụng hàm getAccounts từ service đã tạo
      fetchData={accountService.getAccounts}
      // Hàm toggle status có thể được gọi thông qua context menu hoặc action trong Grid
      onUpdate={async (data) => {
        // Ví dụ logic cập nhật nhanh: Toggle trạng thái
        await accountService.toggleStatus(data.username);
        return { ...data, enabled: !data.enabled };
      }}
      onDelete={accountService.delete}
      onViewDetail={(data) => {
        // data ở đây là dữ liệu rút gọn từ danh sách (AccountResponse)
        // Chúng ta chỉ lấy 'username' để đi fetch bản đầy đủ
        handleViewDetail(data.username);
      }}
      onCreate={onCreate}
    />
  );
};

export default AccountList;
