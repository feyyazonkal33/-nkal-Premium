import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface SpreadsheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSave: (data: any) => void;
}

export default function Spreadsheet({ isOpen, onClose, initialData, onSave }: SpreadsheetProps) {
  const [columns, setColumns] = useState<string[]>(['Banyo', 'Ebeveyn Banyosu', 'WC', 'Mutfak/Koridor', 'Odalar']);
  // data[rowIndex][colIndex] = string (number)
  const [rows, setRows] = useState<string[][]>([Array(5).fill('')]);

  useEffect(() => {
    if (initialData && initialData.columns && initialData.rows) {
      setColumns(initialData.columns);
      setRows(initialData.rows);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const addRow = () => {
    setRows([...rows, Array(columns.length).fill('')]);
  };

  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const updateCell = (rIdx: number, cIdx: number, val: string) => {
    const newRows = [...rows];
    newRows[rIdx][cIdx] = val;
    setRows(newRows);
  };

  const calculateSum = (cIdx: number) => {
    return rows.reduce((acc, row) => {
      const val = parseFloat(row[cIdx]);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const handleSave = () => {
    onSave({ columns, rows });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2">
      <div className="bg-dark border border-gold rounded-lg w-full max-w-full md:max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-3 border-b border-gold/30">
          <h2 className="text-gold font-bold">İnşaat m² Ölçüleri</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          <div className="min-w-max">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-700 bg-gray-900 text-gold p-2 w-10"></th>
                  {columns.map((col, cIdx) => (
                    <th key={cIdx} className="border border-gray-700 bg-gray-900 text-gold p-2 min-w-[100px]">
                      <input
                        type="text"
                        value={col}
                        onChange={(e) => {
                          const newCols = [...columns];
                          newCols[cIdx] = e.target.value;
                          setColumns(newCols);
                        }}
                        className="bg-transparent w-full text-center focus:outline-none focus:border-b focus:border-gold"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="border border-gray-700 text-center">
                      <button onClick={() => removeRow(rIdx)} className="text-red-500 hover:text-red-400 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-gray-700 p-0">
                        <input
                          type="number"
                          value={cell}
                          onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                          className="w-full h-full p-2 bg-transparent text-gray-200 focus:outline-none focus:bg-gray-800 text-right"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="border border-gray-700 bg-gray-900 font-bold text-gold text-center">Σ</td>
                  {columns.map((_, cIdx) => (
                    <td key={`sum-${cIdx}`} className="border border-gray-700 bg-gray-900 text-gold font-bold p-2 text-right">
                      {calculateSum(cIdx)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <button onClick={addRow} className="mt-4 flex items-center gap-1 text-gold hover:text-gold-light">
              <Plus size={16} /> Satır Ekle
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-gold/30 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-gold text-dark font-bold py-2 px-6 rounded hover:bg-gold-light transition-colors"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}