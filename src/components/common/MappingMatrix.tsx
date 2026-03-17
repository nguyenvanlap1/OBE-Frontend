interface MatrixItem {
  id: number;
  code: string;
}

interface MappingItem {
  rowId: number; // Thay cho cloId
  colId: number; // Thay cho coId
  weight: number;
}

interface MappingMatrixProps {
  title: string;
  rows: MatrixItem[]; // Danh sách hàng dọc (ví dụ: CLOs)
  cols: MatrixItem[]; // Danh sách hàng ngang (ví dụ: COs)
  mappings: MappingItem[]; // Dữ liệu giao thoa
  isEditing: boolean;
  onMappingChange: (updatedMappings: MappingItem[]) => void;
  labels: { row: string; col: string }; // Nhãn hiển thị góc bảng (ví dụ: {row: "CLO", col: "CO"})
}

const MappingMatrix = ({
  title,
  rows,
  cols,
  mappings,
  isEditing,
  onMappingChange,
  labels,
}: MappingMatrixProps) => {
  // Lấy trọng số tại ô giao nhau
  const getWeight = (rowId: number, colId: number) => {
    const mapping = mappings.find(
      (m) => m.rowId === rowId && m.colId === colId,
    );
    return mapping ? mapping.weight : "";
  };

  // Cập nhật trọng số
  const handleWeightChange = (rowId: number, colId: number, value: string) => {
    const newWeight = value === "" ? 0 : Number(value);
    const existingIndex = mappings.findIndex(
      (m) => m.rowId === rowId && m.colId === colId,
    );

    const updatedMappings = [...mappings];
    if (existingIndex > -1) {
      updatedMappings[existingIndex] = {
        ...updatedMappings[existingIndex],
        weight: newWeight,
      };
    } else {
      updatedMappings.push({ rowId, colId, weight: newWeight });
    }
    onMappingChange(updatedMappings);
  };

  return (
    <section className="mt-8">
      <h3 className="font-bold mb-4 uppercase tracking-tight">{title}</h3>
      <table className="border-collapse border border-black text-sm">
        <thead>
          <tr className="bg-slate-100">
            {/* Góc bảng hiển thị nhãn linh hoạt */}
            <th className="border border-black p-2 w-28 text-center font-bold">
              {labels.row} \ {labels.col}
            </th>
            {cols.map((col) => (
              <th
                key={col.id}
                className="border border-black p-2 w-16 text-center font-bold"
              >
                {col.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border border-black p-2 text-center font-bold bg-slate-50">
                {row.code}
              </td>
              {cols.map((col) => (
                <td
                  key={`${row.id}-${col.id}`}
                  className="border border-black p-1 text-center"
                >
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-full text-center bg-yellow-50 outline-none"
                      value={getWeight(row.id, col.id)}
                      onChange={(e) =>
                        handleWeightChange(row.id, col.id, e.target.value)
                      }
                    />
                  ) : (
                    <span className="font-medium text-blue-700">
                      {getWeight(row.id, col.id) || "-"}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default MappingMatrix;
