interface MatrixItem {
  id: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface MappingItem {
  rowId: string; // Đồng bộ kiểu String
  colId: string; // Đồng bộ kiểu String
  weight: number;
}

interface MappingMatrixProps {
  title: string;
  rows: MatrixItem[];
  cols: MatrixItem[];
  mappings: MappingItem[];
  isEditing: boolean;
  onMappingChange: (updatedMappings: MappingItem[]) => void;
  labels: { row: string; col: string };
  rowKey?: keyof MatrixItem;
  colKey?: keyof MatrixItem;
  rowLabelKey?: string;
  colLabelKey?: string;
}

const MappingMatrix = ({
  title,
  rows,
  cols,
  mappings,
  isEditing,
  onMappingChange,
  labels,
  rowKey = "id",
  colKey = "id",
  rowLabelKey = "code",
  colLabelKey = "code",
}: MappingMatrixProps) => {
  // Lấy trọng số: So sánh sau khi đã chuyển về String để tránh lệch kiểu data
  const getWeight = (rowVal: string, colVal: string) => {
    const mapping = mappings.find(
      (m) => String(m.rowId) === rowVal && String(m.colId) === colVal,
    );
    return mapping ? mapping.weight.toString() : "";
  };

  // Cập nhật trọng số
  // Trong file MappingMatrix.tsx
  const handleWeightChange = (
    rowVal: string,
    colVal: string,
    value: string,
  ) => {
    const newWeight = value === "" ? 0 : Number(value);

    // 1. Chuyển tất cả về String để so sánh chính xác tuyệt đối
    const updatedMappings = mappings.filter(
      (m) =>
        !(
          String(m.rowId) === String(rowVal) &&
          String(m.colId) === String(colVal)
        ),
    );

    // 2. Chỉ push cái mới nhất vào (Nếu weight > 0)
    if (newWeight !== 0) {
      updatedMappings.push({
        rowId: String(rowVal),
        colId: String(colVal),
        weight: newWeight,
      });
    }

    onMappingChange(updatedMappings);
  };

  return (
    <section className="mt-8">
      <h3 className="font-bold mb-4 uppercase tracking-tight text-gray-800">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="border-collapse border border-black text-sm w-full max-w-fit">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-2 min-w-[120px] text-center font-bold">
                {labels.row} \ {labels.col}
              </th>
              {cols.map((col) => (
                <th
                  key={String(col[colKey])}
                  className="border border-black p-2 w-16 text-center font-bold"
                >
                  {/* Sử dụng colLabelKey nếu có, không thì fallback về 'code' hoặc 'id' */}
                  {col[colLabelKey || "code"] || col.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rVal = String(row[rowKey]);

              return (
                <tr key={rVal}>
                  <td className="border border-black p-2 text-center font-bold bg-slate-50">
                    {row[rowLabelKey || "code"] || row.id}
                  </td>
                  {cols.map((col) => {
                    const cVal = String(col[colKey]);
                    const weightValue = getWeight(rVal, cVal);

                    return (
                      <td
                        key={`${rVal}-${cVal}`}
                        className="border border-black p-1 text-center"
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full text-center bg-yellow-50 outline-none focus:bg-yellow-100 p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={weightValue}
                            onChange={(e) =>
                              handleWeightChange(rVal, cVal, e.target.value)
                            }
                          />
                        ) : (
                          <span className="font-medium text-blue-700">
                            {weightValue || "-"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MappingMatrix;
