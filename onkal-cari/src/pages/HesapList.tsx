import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { Edit2 } from 'lucide-react';

export default function HesapList() {
  const { records, updateRecord } = useStore();
  const navigate = useNavigate();
  const hesapRecords = records.filter(r => r.type === 'hesap');

  const handleEditName = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    const newName = prompt('Hesap adını düzenle:', currentName);
    if (newName && newName !== currentName) {
      const record = records.find(r => r.id === id);
      if (record) {
        updateRecord({ ...record, name: newName });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-dark">
      <TopBar />

      <div className="p-4 flex-1">
        <h2 className="text-gold font-bold text-xl mb-4 border-b border-gold/30 pb-2 tracking-wide">Hesap Kayıtları</h2>

        <div className="flex flex-col gap-3">
          {hesapRecords.map(record => (
            <div
              key={record.id}
              onClick={() => navigate(`/hesap/${record.id}`)}
              className="bg-gray-900 border border-gold/50 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors shadow-lg"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-gray-200">{record.name}</span>
                <span className="text-xs text-gray-400 mt-1">Devam Ediyor</span>
              </div>
              <button
                onClick={(e) => handleEditName(e, record.id, record.name)}
                className="text-gold hover:text-gold-light p-2 transition-colors"
              >
                <Edit2 size={20} />
              </button>
            </div>
          ))}
          {hesapRecords.length === 0 && (
            <div className="text-center text-gray-500 py-8">Henüz kayıt bulunmuyor.</div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}