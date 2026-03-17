import React, { useState } from "react";

export interface Column<T> {
  header: string;
  key: string;
  width?: number; // Thêm độ rộng cột
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends { id: any }>({
  data,
  columns: initialColumns,
}: DataTableProps<T>) {
  // Quản lý danh sách các cột đang được hiển thị
  const [visibleKeys, setVisibleKeys] = useState<string[]>(
    initialColumns.map((c) => c.key),
  );
  const [showConfig, setShowConfig] = useState(false);

  // Lọc ra các cột được phép hiển thị
  const activeColumns = initialColumns.filter((col) =>
    visibleKeys.includes(col.key),
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
      {/* Nút tùy chỉnh cột kiểu Project Management */}
      <div className="flex justify-end p-2 bg-gray-50 border-b">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs bg-white border px-2 py-1 rounded shadow-sm hover:bg-gray-100"
        >
          ⚙️ Cấu hình cột
        </button>
      </div>

      {/* Menu thả xuống để chọn cột */}
      {showConfig && (
        <div className="absolute right-2 top-10 z-10 w-48 rounded-md border bg-white p-2 shadow-lg">
          <p className="mb-2 text-xs font-bold text-gray-500">Hiển thị cột</p>
          {initialColumns.map((col) => (
            <label
              key={col.key}
              className="flex items-center gap-2 py-1 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleKeys.includes(col.key)}
                onChange={() => {
                  setVisibleKeys((prev) =>
                    prev.includes(col.key)
                      ? prev.filter((k) => k !== col.key)
                      : [...prev, col.key],
                  );
                }}
              />
              {col.header}
            </label>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 font-semibold border-r last:border-0"
                  style={{ width: col.width ? `${col.width}px` : "auto" }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-indigo-50/40"
              >
                {activeColumns.map((col) => (
                  <td key={col.key} className="p-3 text-sm truncate">
                    {col.render
                      ? col.render(item)
                      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (item[col.key as keyof T] as any)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
