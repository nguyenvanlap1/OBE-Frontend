interface MatrixItem {
  id: number | string;
  // Cho phép truyền vào bất kỳ thông tin nào để hiển thị
  displayLabel: string;
}

interface MappingItem {
  rowId: number | string;
  colId: number | string;
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
}

const MappingMatrix3 = ({
  title,
  rows,
  cols,
  mappings,
  isEditing,
  onMappingChange,
  labels,
}: MappingMatrixProps) => {
  const getWeight = (rowId: number | string, colId: number | string) => {
    const mapping = mappings.find(
      (m) =>
        String(m.rowId) === String(rowId) && String(m.colId) === String(colId),
    );
    // Trả về string trống nếu weight là 0 hoặc undefined để input dễ xử lý
    return mapping && mapping.weight !== 0 ? mapping.weight : "";
  };

  const handleWeightChange = (
    rowId: number | string,
    colId: number | string,
    value: string,
  ) => {
    const newWeight = value === "" ? 0 : Number(value);
    const existingIndex = mappings.findIndex(
      (m) =>
        String(m.rowId) === String(rowId) && String(m.colId) === String(colId),
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
    <section className="mt-8 overflow-x-auto">
      <h3 className="font-bold mb-4 uppercase text-slate-700 border-l-4 border-blue-600 pl-3">
        {title}
      </h3>
      <table className="border-collapse border border-slate-300 text-sm min-w-full shadow-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 p-3 text-center font-bold bg-slate-200 text-slate-700 min-w-[120px]">
              {labels.row} \ {labels.col}
            </th>
            {cols.map((col) => (
              <th
                key={col.id}
                className="border border-slate-300 p-2 text-center font-bold text-slate-700 min-w-[80px]"
                title={col.displayLabel} // Hover để xem full text nếu bị dài
              >
                {col.displayLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-blue-50 transition-colors">
              <td className="border border-slate-300 p-2 text-center font-bold bg-slate-50 text-slate-700">
                {row.displayLabel}
              </td>
              {cols.map((col) => (
                <td
                  key={`${row.id}-${col.id}`}
                  className="border border-slate-300 p-0 text-center relative"
                >
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      className="w-full h-10 text-center bg-yellow-50 focus:bg-white focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                      value={getWeight(row.id, col.id)}
                      onChange={(e) =>
                        handleWeightChange(row.id, col.id, e.target.value)
                      }
                    />
                  ) : (
                    <span
                      className={`font-semibold ${getWeight(row.id, col.id) ? "text-blue-600" : "text-slate-300"}`}
                    >
                      {getWeight(row.id, col.id) || "0"}
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

export default MappingMatrix3;
