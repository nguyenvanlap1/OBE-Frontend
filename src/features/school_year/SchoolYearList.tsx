import { useMemo, useState } from "react"; // Thêm useState
import type { ColDef } from "ag-grid-community";
import schoolYearService, { type SchoolYear } from "./schoolYearService";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import { toast } from "react-toastify";
// Giả sử bạn có một component Modal/Dialog dùng chung
// Hoặc tôi sẽ demo bằng một Modal đơn giản bên dưới

const SchoolYearList = () => {
  // 1. Khai báo state để kiểm soát đóng/mở popup
  const [isOpen, setIsOpen] = useState(false);

  const columnDefs = useMemo<ColDef<SchoolYear>[]>(
    () => [
      {
        field: "id",
        headerName: "Mã Khóa / Niên khóa",
        filter: "agTextColumnFilter",
        flex: 1,
        cellClass: "bg-blue-50/20 font-medium",
      },
    ],
    [],
  );

  const labels = {
    id: "Mã Khóa/Niên khóa (VD: K48, 2024-2028)",
  };

  // 2. Hàm xử lý khi bấm nút "Lưu" trong popup
  const handleSave = async (data: SchoolYear) => {
    try {
      await schoolYearService.create(data);
      setIsOpen(false); // Đóng popup sau khi tạo xong
      // Có thể thêm logic reload grid tại đây nếu cần
    } catch (error) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    }
  };

  return (
    <>
      <InfiniteGrid<SchoolYear, SchoolYear, SchoolYear>
        title="Quản lý Niên khóa"
        description="Quản lý danh sách các khóa đào tạo và năm học"
        columnDefs={columnDefs}
        fetchData={schoolYearService.search}
        onUpdate={(data) =>
          schoolYearService.create(data).then((res) => res.data)
        }
        onDelete={schoolYearService.delete}
        // 3. NHIỆM VỤ CHÍNH: Nhấn vào đây là bật Modal
        onCreate={() => setIsOpen(true)}
        pageSize={20}
      />

      {/* 4. ĐÂY LÀ MODAL CỦA BẠN */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Thêm Niên khóa mới</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSave({ id: formData.get("id") as string });
              }}
            >
              <div className="mb-4">
                <label className="block text-sm mb-1">{labels.id}</label>
                <input
                  name="id"
                  className="w-full border p-2 rounded"
                  placeholder="Nhập mã..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SchoolYearList;
