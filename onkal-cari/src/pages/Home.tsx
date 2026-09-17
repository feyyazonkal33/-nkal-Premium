import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useStore } from '../store/useStore';
import { Edit2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { records, updateRecord } = useStore();
  const [activeTab, setActiveTab] = useState<'iscilik' | 'hesap'>('iscilik');

  const handleSelect = (tab: 'iscilik' | 'hesap') => {
    setActiveTab(tab);
  };

  const currentRecords = records.filter(r => r.type === activeTab);

  const handleEditName = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    const typeName = activeTab === 'iscilik' ? 'Proje' : 'Hesap';
    const newName = prompt(`${typeName} adını düzenle:`, currentName);
    if (newName && newName !== currentName) {
      const record = records.find(r => r.id === id);
      if (record) {
        updateRecord({ ...record, name: newName });
      }
    }
  };

  return (
    <div className="flex flex-col items-center relative overflow-hidden mt-8 px-4 w-full">

      {/* Animated Logo Container */}
      <div
        className="transition-transform duration-500 ease-in-out z-10 w-48 h-48 mb-8"
        style={{
          transform: activeTab === 'iscilik'
            ? 'rotate(-25deg)'
            : 'rotate(25deg)'
        }}
      >
        <Logo className="w-full h-full" />
      </div>

      {/* Capsule Tabs */}
      <div className="flex bg-gray-900 border border-gold/50 rounded-full p-1 z-20 w-3/4 max-w-xs shadow-[0_0_15px_rgba(212,175,55,0.3)] mb-8">
        <button
          onClick={() => handleSelect('iscilik')}
          className={`flex-1 py-2 text-center font-bold rounded-full transition-colors focus:outline-none z-10 ${activeTab === 'iscilik' ? 'bg-gold text-dark' : 'text-gray-300 hover:text-gold'}`}
        >
          İşçilik
        </button>
        <div className="w-[1px] bg-gold/30 my-2 mx-1" />
        <button
          onClick={() => handleSelect('hesap')}
          className={`flex-1 py-2 text-center font-bold rounded-full transition-colors focus:outline-none z-10 ${activeTab === 'hesap' ? 'bg-gold text-dark' : 'text-gray-300 hover:text-gold'}`}
        >
          Hesap
        </button>
      </div>

      {/* Project List */}
      <div className="w-full max-w-md flex flex-col gap-3 z-20">
        {currentRecords.map(record => (
          <div
            key={record.id}
            onClick={() => navigate(`/${activeTab}/${record.id}`)}
            className="bg-[#121827]/80 border border-amber-500/20 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors shadow-lg backdrop-blur-sm"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-gray-200">{record.name}</span>
              <span className="text-xs text-amber-500 mt-1 inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Devam Ediyor
              </span>
            </div>
            <button
              onClick={(e) => handleEditName(e, record.id, record.name)}
              className="text-gold hover:text-gold-light p-2 transition-colors bg-dark/50 rounded-full"
            >
              <Edit2 size={20} />
            </button>
          </div>
        ))}
        {currentRecords.length === 0 && (
          <div className="text-center text-gray-500 py-8">Henüz {activeTab === 'iscilik' ? 'proje' : 'hesap'} bulunmuyor.</div>
        )}
      </div>

      {/* Backdrop visual elements */}
      <div className="absolute inset-0 flex pointer-events-none opacity-20 -z-10">
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-gold/10" />
        <div className="w-1/2 h-full bg-gradient-to-l from-transparent to-gold/10" />
      </div>

    </div>
  );
}
