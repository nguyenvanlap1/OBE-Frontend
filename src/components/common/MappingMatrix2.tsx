interface MatrixItem {
  id: number | string; // Chấp nhận cả temp-id
  code: string;
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

const MappingMatrix2 = ({
  title,
  rows,
  cols,
  mappings,
  isEditing,
  onMappingChange,
  labels,
}: MappingMatrixProps) => {
  const getWeight = (rowId: number | string, colId: number | string) => {
    // Ép kiểu về string để so sánh chính xác cho cả ID tạm và ID thật
    const mapping = mappings.find(
      (m) =>
        String(m.rowId) === String(rowId) && String(m.colId) === String(colId),
    );
    return mapping ? mapping.weight : "";
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
      <h3 className="font-bold mb-4 uppercase text-gray-700">{title}</h3>
      <table className="border-collapse border border-gray-400 text-sm min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-2 text-center font-bold min-w-[100px]">
              {labels.row} \ {labels.col}
            </th>
            {cols.map((col) => (
              <th
                key={col.id}
                className="border border-gray-400 p-2 w-16 text-center font-bold"
              >
                {col.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="border border-gray-400 p-2 text-center font-bold bg-gray-50">
                {row.code}
              </td>
              {cols.map((col) => (
                <td
                  key={`${row.id}-${col.id}`}
                  className="border border-gray-400 p-1 text-center"
                >
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      className="w-full text-center bg-yellow-50 focus:bg-white outline-none p-1"
                      value={getWeight(row.id, col.id)}
                      onChange={(e) =>
                        handleWeightChange(row.id, col.id, e.target.value)
                      }
                    />
                  ) : (
                    <span className="font-medium text-blue-600">
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

export default MappingMatrix2;
