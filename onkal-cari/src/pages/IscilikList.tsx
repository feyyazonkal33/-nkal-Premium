import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import Modal from '../components/Modal';
import { Plus, Edit2 } from 'lucide-react';

export default function IscilikList() {
  const { records, addRecord, updateRecord } = useStore();
  const navigate = useNavigate();
  const iscilikRecords = records.filter(r => r.type === 'iscilik');

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [currentReminderText, setCurrentReminderText] = useState('');

  // Local state for generic reminder (not tied to a specific record but to the module)
  // For simplicity, we'll store this in localstorage directly
  const [moduleReminder, setModuleReminder] = useState(() => localStorage.getItem('iscilik_reminder') || '');

  const handleSaveReminder = (text: string) => {
    setModuleReminder(text);
    localStorage.setItem('iscilik_reminder', text);
  };

  const handleAdd = () => {
    const name = prompt('Yeni İşçilik/Proje Adı:');
    if (name) {
      addRecord(name, 'iscilik');
    }
  };

  const handleEditName = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    const newName = prompt('Proje adını düzenle:', currentName);
    if (newName && newName !== currentName) {
      const record = records.find(r => r.id === id);
      if (record) {
        updateRecord({ ...record, name: newName });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-dark">
      <TopBar />

      <div className="p-4 flex-1">
        <h2 className="text-gold font-bold text-xl mb-4 border-b border-gold/30 pb-2">İşçilik Kayıtları</h2>

        <div className="flex flex-col gap-3">
          {iscilikRecords.map(record => (
            <div
              key={record.id}
              onClick={() => navigate(`/iscilik/${record.id}`)}
              className="bg-gray-900 border border-gold/50 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors shadow-md"
            >
              <span className="font-semibold text-lg">{record.name}</span>
              <button
                onClick={(e) => handleEditName(e, record.id, record.name)}
                className="text-gray-400 hover:text-gold p-2"
              >
                <Edit2 size={18} />
              </button>
            </div>
          ))}
          {iscilikRecords.length === 0 && (
            <div className="text-center text-gray-500 py-8">Henüz kayıt bulunmuyor.</div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-40">
        <button
          onClick={() => {
            setCurrentReminderText(moduleReminder);
            setIsReminderOpen(true);
          }}
          className="w-12 h-12 bg-gray-800 border-2 border-gold rounded-full flex items-center justify-center text-gold shadow-[0_0_10px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform"
        >
          <span className="font-bold text-xl">H</span>
        </button>
        <button
          onClick={handleAdd}
          className="w-14 h-14 bg-gold rounded-full flex items-center justify-center text-dark shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:scale-105 transition-transform"
        >
          <Plus size={32} />
        </button>
      </div>

      <BottomNav />

      <Modal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        title="Hatırlatmalar"
        initialValue={currentReminderText}
        onSave={handleSaveReminder}
      />
    </div>
  );
}