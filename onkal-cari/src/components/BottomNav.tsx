import { Share2, Monitor, Plus, Timer, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import Modal from './Modal';

export default function BottomNav() {
  const { addRecord } = useStore();
  const location = useLocation();
  const isIscilik = location.pathname.startsWith('/iscilik');
  const reminderKey = isIscilik ? 'iscilik_reminder' : 'hesap_reminder';

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [moduleReminder, setModuleReminder] = useState(() => localStorage.getItem(reminderKey) || '');

  const handleSaveReminder = (text: string) => {
    setModuleReminder(text);
    localStorage.setItem(reminderKey, text);
  };

  const handleAdd = () => {
    const type = isIscilik ? 'iscilik' : 'hesap';
    const typeName = isIscilik ? 'İşçilik' : 'Hesap';
    const name = prompt(`Yeni ${typeName} Proje Adı:`);
    if (name) {
      addRecord(name, type);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 w-full max-w-md bg-gold-gradient rounded-t-3xl shadow-[0_-5px_20px_rgba(212,175,55,0.3)] px-6 pt-3 pb-5 flex justify-between items-end z-50">
        <button className="text-dark/80 hover:text-dark transition-colors flex flex-col items-center gap-1 mb-2">
          <Share2 size={24} />
        </button>
        <button className="text-dark/80 hover:text-dark transition-colors flex flex-col items-center gap-1 mb-2">
          <Monitor size={24} />
        </button>

        {/* Center Actions Container */}
        <div className="relative flex items-end justify-center">
          {/* H Button */}
          <button
            onClick={() => setIsReminderOpen(true)}
            className="absolute -left-12 bottom-2 w-10 h-10 bg-dark border-2 border-gold rounded-full flex items-center justify-center text-gold shadow-lg hover:scale-105 transition-transform font-bold text-lg"
          >
            H
          </button>

          {/* Main + Button */}
          <button
            onClick={handleAdd}
            className="w-16 h-16 bg-dark border-4 border-gold rounded-full flex items-center justify-center text-gold shadow-2xl hover:scale-105 transition-transform mb-4 z-10"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        <button className="text-dark/80 hover:text-dark transition-colors flex flex-col items-center gap-1 mb-2">
          <Timer size={24} />
        </button>
        <Link to="/" className="text-dark/80 hover:text-dark transition-colors flex flex-col items-center gap-1 mb-2">
          <Menu size={24} />
        </Link>
      </div>

      <Modal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        title="Hatırlatmalar"
        initialValue={moduleReminder}
        onSave={handleSaveReminder}
      />
    </>
  );
}