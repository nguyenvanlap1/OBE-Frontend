interface OutcomeItem {
  id: number;
  code: string;
  content: string;
}

interface OutcomeTableProps {
  title: string;
  data: OutcomeItem[];
  isEditing: boolean;
  onDataChange: (updatedData: OutcomeItem[]) => void;
  columnNames: [string, string];
}

const OutcomeTable = ({
  title,
  data,
  isEditing,
  onDataChange,
  columnNames,
}: OutcomeTableProps) => {
  const handleContentChange = (index: number, newContent: string) => {
    const updatedData = [...data];
    updatedData[index].content = newContent;
    onDataChange(updatedData);
  };

  return (
    <section className="mt-8">
      <h3 className="font-bold mb-4 uppercase tracking-tight">{title}</h3>
      <table className="w-full border-collapse border border-black text-[15px]">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black p-2 w-24 text-center font-bold uppercase text-sm">
              {columnNames[0]}
            </th>
            <th className="border border-black p-2 text-center font-bold uppercase text-sm">
              {columnNames[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="border border-black p-2 text-center font-bold align-top">
                {item.code}
              </td>
              <td className="border border-black p-2 text-justify">
                {isEditing ? (
                  <textarea
                    rows={3}
                    className="w-full p-2 bg-yellow-50 outline-none border border-blue-200 focus:border-blue-600 rounded font-sans leading-normal"
                    value={item.content}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                  />
                ) : (
                  <p className="whitespace-pre-line leading-relaxed">
                    {item.content.normalize("NFC")}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default OutcomeTable;
