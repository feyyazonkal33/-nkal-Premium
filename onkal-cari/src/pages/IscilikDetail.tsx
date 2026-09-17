import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import Modal from '../components/Modal';
import Spreadsheet from '../components/Spreadsheet';
import { ChevronLeft } from 'lucide-react';

export default function IscilikDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { records, updateRecord, loading } = useStore();

  const record = records.find(r => r.id === id);

  const [activeModal, setActiveModal] = useState<'m2Price' | 'alacakVerecek' | 'measurements' | null>(null);

  if (loading) return <div className="p-8 text-center text-gold">Yükleniyor...</div>;
  if (!record) return <div className="p-8 text-center text-red-500">Kayıt bulunamadı.</div>;

  const handleSaveModal = (field: 'm2Price' | 'notes', text: string) => {
    updateRecord({ ...record, [field]: text });
  };

  const handleSaveSpreadsheet = (data: any) => {
    updateRecord({ ...record, measurements: data });
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-dark">
      <TopBar />

      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-6 border-b border-gold/30 pb-3">
          <button onClick={() => navigate(-1)} className="text-gold hover:text-gold-light">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-gold font-bold text-xl truncate">{record.name} - İşçilik</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div
            onClick={() => setActiveModal('m2Price')}
            className="bg-gray-900 border border-gold/40 rounded-lg p-5 cursor-pointer hover:bg-gray-800 transition-colors shadow-md flex justify-between items-center"
          >
            <span className="font-semibold text-lg text-gray-200">m² fiyatı</span>
            <span className="text-sm text-gray-400 truncate max-w-[150px]">{record.m2Price ? '(Dolu)' : '(Boş)'}</span>
          </div>

          <div
            onClick={() => setActiveModal('measurements')}
            className="bg-gray-900 border border-gold/40 rounded-lg p-5 cursor-pointer hover:bg-gray-800 transition-colors shadow-md flex justify-between items-center"
          >
            <span className="font-semibold text-lg text-gray-200">İnşaat m² ölçüleri</span>
            <span className="text-sm text-gray-400">Tabloyu Aç</span>
          </div>

          <div
            onClick={() => setActiveModal('alacakVerecek')}
            className="bg-gray-900 border border-gold/40 rounded-lg p-5 cursor-pointer hover:bg-gray-800 transition-colors shadow-md flex justify-between items-center"
          >
            <span className="font-semibold text-lg text-gray-200">Alacak/Verecek</span>
            <span className="text-sm text-gray-400 truncate max-w-[150px]">{record.notes ? '(Dolu)' : '(Boş)'}</span>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'm2Price'}
        onClose={() => setActiveModal(null)}
        title="m² Fiyatı"
        initialValue={record.m2Price || ''}
        onSave={(val) => handleSaveModal('m2Price', val)}
      />

      <Modal
        isOpen={activeModal === 'alacakVerecek'}
        onClose={() => setActiveModal(null)}
        title="Alacak/Verecek Notları"
        initialValue={record.notes || ''}
        onSave={(val) => handleSaveModal('notes', val)}
      />

      <Spreadsheet
        isOpen={activeModal === 'measurements'}
        onClose={() => setActiveModal(null)}
        initialData={record.measurements}
        onSave={handleSaveSpreadsheet}
      />
    </div>
  );
}