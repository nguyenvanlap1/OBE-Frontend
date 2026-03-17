import { Trash2 } from "lucide-react"; // Đừng quên cài lucide-react nếu chưa có
interface UniversalTableProps<T> {
  title: string;
  data: T[];
  isEditing: boolean;
  onDataChange: (updatedData: T[]) => void;
  // Thay đổi từ bộ đôi cố định sang mảng động
  columnNames: string[];
  keys: (keyof T)[];
}

const UniversalTable = <T extends { id: number | string }>({
  title,
  data,
  isEditing,
  onDataChange,
  columnNames,
  keys,
}: UniversalTableProps<T>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldChange = (index: number, key: keyof T, newValue: any) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [key]: newValue };
    onDataChange(updatedData);
  };

  // --- Hàm thêm hàng mới ---
  const handleAddRow = () => {
    // 1. Tạo một object mới dựa trên các keys hiện có
    const newRow = {} as T;
    keys.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newRow as any)[key] = ""; // Khởi tạo giá trị trống cho mỗi ô
    });

    // 2. Gán ID tạm thời (dùng timestamp để tránh trùng lặp trong React)
    newRow.id = `temp-${Date.now()}`;

    // 3. Cập nhật dữ liệu lên component cha
    onDataChange([...data, newRow]);
  };

  // --- Hàm xóa hàng ---
  const handleRemoveRow = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onDataChange(updatedData);
  };

  return (
    <section className="mt-8">
      {/* Thêm phần Header có chứa nút bấm */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold uppercase tracking-tight">{title}</h3>
        {isEditing && (
          <button
            type="button"
            onClick={handleAddRow}
            className="px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors uppercase"
          >
            + Thêm dòng
          </button>
        )}
      </div>
      <table className="w-full border-collapse border border-black text-[15px]">
        <thead>
          <tr className="bg-slate-100">
            {/* Duyệt qua mảng columnNames để tạo header */}
            {columnNames.map((name, index) => (
              <th
                key={index}
                className="border border-black p-2 font-bold uppercase text-sm text-center"
              >
                {name}
              </th>
            ))}
            {/* Thêm cột Header cho nút xóa khi đang sửa */}
            {isEditing && (
              <th className="border border-black p-2 w-12 text-center text-red-600">
                <Trash2 size={16} className="mx-auto" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              {/* Duyệt qua mảng keys để tạo các ô dữ liệu tương ứng */}
              {keys.map((key, colIndex) => (
                <td key={String(key)} className="border border-black p-2">
                  {isEditing ? (
                    <textarea
                      rows={1}
                      className="w-full p-1 bg-yellow-50 outline-none border border-transparent focus:border-blue-500 rounded font-sans"
                      value={String(item[key])}
                      onChange={(e) =>
                        handleFieldChange(rowIndex, key, e.target.value)
                      }
                    />
                  ) : (
                    <div
                      className={
                        colIndex === 0
                          ? "font-bold text-center"
                          : "text-justify"
                      }
                    >
                      {String(item[key]).normalize("NFC")}
                      {/* Tự động thêm dấu % nếu là trường weight */}
                      {String(key).toLowerCase() === "weight" ? "%" : ""}
                    </div>
                  )}
                </td>
              ))}
              {/* Ô chứa nút xóa */}
              {isEditing && (
                <td className="border border-black p-2 text-center bg-white">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(rowIndex)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                    title="Xóa dòng"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default UniversalTable;
