import { useState, useEffect } from 'react';

// --- VERİ TİPLERİ ---
interface RoomMeasurements {
  id: string;
  banyo: string;
  ebeveyn: string;
  wc: string;
  mutfak: string;
  odalar: string;
}

interface CashItem {
  id: string;
  title: string;
  amount: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  type: 'iscilik' | 'hesap';
  m2PriceNote: string;
  alacakVerecekNote: string;
  measurements: RoomMeasurements[];
  gelirler: CashItem[];
  giderler: CashItem[];
}

// Matematiksel Metraj Hesaplayıcı (16x2.40 veya 16*2.40 desteği)
const evalMeasurement = (val: string | number | undefined): number => {
  if (!val) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const s = val.toString().replace(/,/g, '.').trim().toLowerCase();
  if (s.includes('x') || s.includes('*')) {
    const parts = s.split(/[x*]/).map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
    if (parts.length === 0) return 0;
    const res = parts.reduce((acc, curr) => acc * curr, 1);
    return isNaN(res) ? 0 : Number(res.toFixed(2));
  }
  if (s.includes('+')) {
    const parts = s.split('+').map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
    const res = parts.reduce((acc, curr) => acc + curr, 0);
    return isNaN(res) ? 0 : Number(res.toFixed(2));
  }
  const parsed = parseFloat(s);
  return isNaN(parsed) ? 0 : Number(parsed.toFixed(2));
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Tursunlar İnşaat',
    status: 'Devam Ediyor',
    type: 'iscilik',
    m2PriceNote: 'Birim m² fiyatı: 850 TL + KDV olarak anlaşıldı.',
    alacakVerecekNote: 'Alınan Peşinat: 150.000 TL\nKalan Bakiye: 85.000 TL',
    measurements: [
      { id: 'm1', banyo: '12', ebeveyn: '8', wc: '4', mutfak: '25', odalar: '65' },
      { id: 'm2', banyo: '10', ebeveyn: '7', wc: '4', mutfak: '22', odalar: '60' },
    ],
    gelirler: [],
    giderler: []
  },
  {
    id: '2',
    name: 'Önkal Şantiye',
    status: 'Devam Ediyor',
    type: 'hesap',
    m2PriceNote: '',
    alacakVerecekNote: '',
    measurements: [],
    gelirler: [
      { id: 'g1', title: 'Hakediş 1', amount: 250000 },
    ],
    giderler: [
      { id: 'gd1', title: 'Kum ve Çimento', amount: 12000 },
    ]
  },
  {
    id: '3',
    name: 'Önkal Plaza',
    status: 'Devam Ediyor',
    type: 'iscilik',
    m2PriceNote: '',
    alacakVerecekNote: '',
    measurements: [],
    gelirler: [],
    giderler: []
  }
];

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('onkal_cari_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({
        ...p,
        name: p.name === 'Nkal Şantiye' ? 'Önkal Şantiye' : p.name,
        measurements: (p.measurements || []).map((m: any) => ({
          id: m.id || Date.now().toString(),
          banyo: String(m.banyo ?? ''),
          ebeveyn: String(m.ebeveyn ?? ''),
          wc: String(m.wc ?? ''),
          mutfak: String(m.mutfak ?? ''),
          odalar: String(m.odalar ?? '')
        }))
      }));
    }
    return INITIAL_PROJECTS;
  });

  const [generalNote, setGeneralNote] = useState<string>(() => {
    return localStorage.getItem('onkal_genel_not') || 'Şantiye hatırlatmaları, siparişler ve acil notlar...';
  });

  useEffect(() => {
    localStorage.setItem('onkal_cari_v1', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('onkal_genel_not', generalNote);
  }, [generalNote]);

  const [activeTab, setActiveTab] = useState<'iscilik' | 'hesap'>('iscilik');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'h_note' | 'm2_note' | 'alacak_note' | 'spreadsheet' | 'new_proj' | null>(null);

  // Proje Silme Modalı State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Gelir / Gider Özel Modal
  const [cashModal, setCashModal] = useState<{ isOpen: boolean; type: 'gelir' | 'gider' }>({
    isOpen: false,
    type: 'gelir'
  });
  const [cashTitle, setCashTitle] = useState('');
  const [cashAmount, setCashAmount] = useState('');

  // Aktif Hücre Takibi (Hızlı Tuşlar İçin)
  const [activeCell, setActiveCell] = useState<{ rowId: string; col: keyof RoomMeasurements } | null>(null);

  const [newProjectName, setNewProjectName] = useState('');
  const [logoImgError, setLogoImgError] = useState(false);

  const currentProject = projects.find(p => p.id === selectedProjectId);

  const updateCurrentProject = (updater: (prev: Project) => Project) => {
    if (!selectedProjectId) return;
    setProjects(prev => prev.map(p => p.id === selectedProjectId ? updater(p) : p));
  };

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const newProj: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      status: 'Devam Ediyor',
      type: activeTab,
      m2PriceNote: '',
      alacakVerecekNote: '',
      measurements: [],
      gelirler: [],
      giderler: []
    };
    setProjects([newProj, ...projects]);
    setNewProjectName('');
    setActiveModal(null);
  };

  const handleSaveCashItem = () => {
    if (!cashTitle.trim()) {
      alert('Lütfen açıklama girin.');
      return;
    }
    const amt = parseFloat(cashAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Lütfen geçerli bir tutar girin.');
      return;
    }

    const newItem: CashItem = {
      id: Date.now().toString(),
      title: cashTitle.trim(),
      amount: amt
    };

    updateCurrentProject(prev => {
      if (cashModal.type === 'gelir') {
        return { ...prev, gelirler: [...prev.gelirler, newItem] };
      } else {
        return { ...prev, giderler: [...prev.giderler, newItem] };
      }
    });

    setCashTitle('');
    setCashAmount('');
    setCashModal({ isOpen: false, type: 'gelir' });
  };

  // Aktif Hücreye Sembol Ekleme Fonksiyonu
  const insertSymbol = (sym: string) => {
    if (!activeCell || !currentProject) return;
    updateCurrentProject(prev => ({
      ...prev,
      measurements: prev.measurements.map(r => {
        if (r.id === activeCell.rowId) {
          const curVal = r[activeCell.col] || '';
          return { ...r, [activeCell.col]: curVal + sym };
        }
        return r;
      })
    }));
  };

  // WhatsApp ile Hakediş Metraj Dökümü Paylaşma
  const handleShareWhatsApp = () => {
    if (!currentProject) return;
    const bSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.banyo), 0);
    const eSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.ebeveyn), 0);
    const wSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.wc), 0);
    const mSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.mutfak), 0);
    const oSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.odalar), 0);
    const gTotal = bSum + eSum + wSum + mSum + oSum;

    const message =
`🏗️ *ÖNKAL PREMİUM İNŞAAT*
📍 *Proje:* ${currentProject.name}
📐 *İşçilik Metraj Hakediş Dökümü:*
• Banyo: *${bSum.toFixed(2)} m²*
• Ebeveyn: *${eSum.toFixed(2)} m²*
• WC: *${wSum.toFixed(2)} m²*
• Mutfak / Koridor: *${mSum.toFixed(2)} m²*
• Odalar: *${oSum.toFixed(2)} m²*
━━━━━━━━━━━━━━━━━━
🏆 *GENEL TOPLAM: ${gTotal.toFixed(2)} m²*
📅 _Tarih: ${new Date().toLocaleDateString('tr-TR')} - ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}_`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const visibleProjects = projects.filter(p => p.type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b14] via-[#0b1120] to-[#04060c] text-slate-100 flex flex-col items-center justify-between pb-28 font-sans select-none antialiased">

      {/* 1. ÜST BİLGİ BARI */}
      <header className="w-full max-w-md px-5 pt-4 pb-2 border-b border-amber-500/20 bg-[#0a0f1d]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {selectedProjectId ? (
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <img
                src="./logo.png"
                alt="Logo"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-8 h-8 rounded-full object-cover border border-amber-400/40 shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              />
            )}
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-[#fae19c] via-[#d4af37] to-[#aa7d22] bg-clip-text text-transparent tracking-wide">
                {selectedProjectId ? currentProject?.name : 'Önkal Premium Cari'}
              </h1>
              <p className="text-[10px] text-amber-200/50 uppercase tracking-widest font-semibold">
                {selectedProjectId ? `${currentProject?.type === 'iscilik' ? 'İşçilik' : 'Hesap'} Detayları` : 'İnşaat Yönetim Sistemi'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-medium text-slate-300 flex items-center justify-end space-x-1">
              <span>Antalya</span>
              <span className="text-amber-400">☀️ 29°C</span>
            </div>
            <div className="text-[10px] text-slate-400">17 Eylül • 21:00</div>
          </div>
        </div>
      </header>

      {/* İÇERİK ALANI */}
      <main className="w-full max-w-md px-4 pt-3 flex-1 flex flex-col items-center">

        {!selectedProjectId ? (
          <>
            {/* Dairesel Altın Logo Vitrini */}
            <div className="my-4 relative flex items-center justify-center">
              <div
                className={`w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-[#8f6d1f] via-[#fce69a] to-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.3)] transition-transform duration-700 ease-out flex items-center justify-center ${
                  activeTab === 'iscilik' ? '-rotate-6' : 'rotate-6'
                }`}
              >
                <div className="w-full h-full rounded-full bg-[#070b14] flex flex-col items-center justify-center p-2 text-center border border-amber-400/30 overflow-hidden">
                  {!logoImgError ? (
                    <img
                      src="./logo.png"
                      alt="Önkal Logo"
                      onError={() => setLogoImgError(true)}
                      className="w-32 h-32 object-contain filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.8)]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-14 h-14 text-[#d4af37]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7v15h20V7L12 2zm0 2.84L18 8v12H6V8l6-3.16zM8 10h3v3H8v-3zm5 0h3v3h-3v-3zm-5 5h3v3H8v-3zm5 0h3v3h-3v-3z"/>
                      </svg>
                      <span className="text-[10px] font-bold text-[#f5da88] mt-1 tracking-wider">ÖNKAL PREMİUM</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kapsül Sekme Seçici */}
            <div className="w-full max-w-xs bg-[#0e1526] border border-amber-500/25 p-1 rounded-full flex mb-5 shadow-inner">
              <button
                onClick={() => setActiveTab('iscilik')}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeTab === 'iscilik'
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#f7e59b] to-[#b58728] text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                İşçilik
              </button>
              <button
                onClick={() => setActiveTab('hesap')}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeTab === 'hesap'
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#f7e59b] to-[#b58728] text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hesap
              </button>
            </div>

            {/* Proje Listesi */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/70">
                  {activeTab === 'iscilik' ? 'İşçilik Projeleri' : 'Cari Hesap Projeleri'} ({visibleProjects.length})
                </span>
              </div>

              {visibleProjects.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  Henüz kayıtlı proje yok. Alttaki "+" butonundan ekleyin.
                </div>
              ) : (
                visibleProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className="w-full bg-[#10172c]/90 hover:bg-[#141e38] border border-amber-500/20 hover:border-amber-400/50 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all cursor-pointer group"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {project.name}
                      </h3>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {project.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* SİLME BUTONU */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                        }}
                        className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-rose-500/20 flex items-center justify-center transition-colors active:scale-90"
                        title="Projeyi Sil"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <div className="flex items-center space-x-1 text-amber-400/70 group-hover:text-amber-400 pl-1">
                        <span className="text-xs text-slate-400 group-hover:text-amber-300 font-medium">Aç</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* PROJE DETAY EKRANI */
          <div className="w-full space-y-4 pt-2">

            {/* İŞÇİLİK MODÜLÜ DETAYI */}
            {currentProject?.type === 'iscilik' && (
              <div className="space-y-3">
                <button
                  onClick={() => setActiveModal('spreadsheet')}
                  className="w-full bg-[#10172c] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all hover:border-amber-400"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📐</span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-amber-200">İnşaat m² Ölçüleri</div>
                      <div className="text-[11px] text-slate-400">Banyo, WC, Mutfak ve Oda tablosu</div>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg font-bold">
                    Tabloyu Aç
                  </span>
                </button>

                <button
                  onClick={() => setActiveModal('m2_note')}
                  className="w-full bg-[#10172c] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all hover:border-amber-400"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">💰</span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-amber-200">m² Fiyatı</div>
                      <div className="text-[11px] text-slate-400">Birim fiyat ve anlaşma notları</div>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">Düzenle ✏️</span>
                </button>

                <button
                  onClick={() => setActiveModal('alacak_note')}
                  className="w-full bg-[#10172c] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all hover:border-amber-400"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⚖️</span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-amber-200">Alacak / Verecek</div>
                      <div className="text-[11px] text-slate-400">Ödemeler ve bakiye hesabı</div>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">Görüntüle ✏️</span>
                </button>
              </div>
            )}

            {/* HESAP MODÜLÜ DETAYI */}
            {currentProject?.type === 'hesap' && (
              <div className="w-full space-y-3">

                {/* Net Bakiye Kartı */}
                {(() => {
                  const totGelir = currentProject.gelirler.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
                  const totGider = currentProject.giderler.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
                  const bakiye = totGelir - totGider;
                  return (
                    <div className="bg-gradient-to-br from-[#10172c] via-[#0d1426] to-[#070b16] border border-amber-500/35 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] text-center">
                      <span className="text-[10px] uppercase tracking-widest text-amber-200/60 font-bold">Net Kalan Bakiye</span>
                      <div className={`text-2xl font-black mt-1 ${bakiye >= 0 ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]'}`}>
                        ₺{bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex justify-around mt-3 pt-3 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Toplam Gelir</span>
                          <span className="font-bold text-emerald-400">₺{totGelir.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="h-7 w-[1px] bg-slate-800" />
                        <div>
                          <span className="text-slate-400 text-[11px] block">Toplam Gider</span>
                          <span className="font-bold text-rose-400">₺{totGider.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Gelir / Gider Listesi ve Lüks Ekleme Butonları */}
                <div className="bg-[#10172c]/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                      KAYITLAR
                    </span>

                    {/* AYRI AYRI İKİ BUTON */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setCashModal({ isOpen: true, type: 'gelir' });
                          setCashTitle('');
                          setCashAmount('');
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 hover:to-emerald-600/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-[11px] font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-95 transition-all flex items-center space-x-1"
                      >
                        <span className="text-xs font-bold">+</span>
                        <span>Gelir</span>
                      </button>

                      <button
                        onClick={() => {
                          setCashModal({ isOpen: true, type: 'gider' });
                          setCashTitle('');
                          setCashAmount('');
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-rose-500/20 to-rose-600/10 hover:from-rose-500/30 hover:to-rose-600/20 text-rose-300 border border-rose-500/40 rounded-xl text-[11px] font-bold shadow-[0_0_15px_rgba(244,63,94,0.15)] active:scale-95 transition-all flex items-center space-x-1"
                      >
                        <span className="text-xs font-bold">-</span>
                        <span>Gider</span>
                      </button>
                    </div>
                  </div>

                  {/* Kalemler */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {[
                      ...currentProject.gelirler.map(g => ({ ...g, itemType: 'gelir' as const })),
                      ...currentProject.giderler.map(g => ({ ...g, itemType: 'gider' as const }))
                    ].length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        Kayıtlı gelir veya gider kalemi bulunmuyor.
                      </div>
                    ) : (
                      [
                        ...currentProject.gelirler.map(g => ({ ...g, itemType: 'gelir' as const })),
                        ...currentProject.giderler.map(g => ({ ...g, itemType: 'gider' as const }))
                      ].map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2.5 rounded-xl bg-[#080d1a] text-xs border border-slate-800/80 hover:border-amber-500/20 transition-all">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-wide ${item.itemType === 'gelir' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                              {item.itemType === 'gelir' ? '+ GELİR' : '- GİDER'}
                            </span>
                            <span className="font-medium text-slate-200">{item.title}</span>
                          </div>
                          <div className="flex items-center space-x-2.5">
                            <span className={`font-mono font-bold ${item.itemType === 'gelir' ? 'text-emerald-300' : 'text-rose-300'}`}>
                              ₺{item.amount.toLocaleString('tr-TR')}
                            </span>
                            <button
                              onClick={() => {
                                updateCurrentProject(prev => ({
                                  ...prev,
                                  gelirler: prev.gelirler.filter(i => i.id !== item.id),
                                  giderler: prev.giderler.filter(i => i.id !== item.id),
                                }));
                              }}
                              className="w-5 h-5 flex items-center justify-center rounded-full text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Sil"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 2. SABİT ALT NAVİGASYON BARI (SİMETRİK 3'LÜ YUVALAK KOKPİT) */}
      <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto z-40">
        <div className="relative bg-gradient-to-r from-[#cfa12b] via-[#faeb9e] to-[#996e14] text-slate-950 px-8 py-3 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)] flex items-center justify-between border-t border-amber-300/40">

          {/* SOL: YUVARLAK PAYLAŞ BUTONU ("H" FORMATINDA) */}
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert('Önkal Premium bağlantısı kopyalandı!');
              } else {
                alert('Bağlantı kopyalandı!');
              }
            }}
            className="w-10 h-10 rounded-full bg-[#111726] text-[#e8c76b] border border-amber-400 shadow-md flex items-center justify-center active:scale-90 transition-transform"
            title="Uygulamayı Paylaş"
          >
            <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>

          {/* ORTA: YÜKSELTİLMİŞ ALTIN "+" BUTONU */}
          <div className="relative -top-5">
            <button
              onClick={() => setActiveModal('new_proj')}
              className="w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-[#151c2e] to-[#090d18] text-[#f7e396] border-2 border-amber-300 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center active:scale-90 transition-transform"
              title="Yeni Proje Ekle"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>

          {/* SAĞ: YUVARLAK "H" (HATIRLATMA) BUTONU */}
          <button
            onClick={() => setActiveModal('h_note')}
            className="w-10 h-10 rounded-full bg-[#111726] text-[#e8c76b] font-black text-sm border border-amber-400 shadow-md flex items-center justify-center active:scale-90 transition-transform"
            title="Hatırlatma Notları"
          >
            H
          </button>
        </div>
      </nav>

      {/* --- MODALLAR --- */}

      {/* PROJE SİLME ONAY MODALI */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c1222]/95 border border-rose-500/40 rounded-3xl p-6 shadow-[0_15px_50px_rgba(0,0,0,0.85)] text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-black text-slate-100 mb-1">Projeyi Sil</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              <span className="font-bold text-amber-300">"{projectToDelete.name}"</span> projesini ve içerisindeki tüm hakediş/kasa kayıtlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex space-x-2.5">
              <button
                onClick={() => setProjectToDelete(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-2xl transition-all"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
                  setProjectToDelete(null);
                }}
                className="flex-1 py-2.5 text-xs font-black bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İNŞAAT m² TABLOSU VE WHATSAPP HAKEDİŞ RAPORU */}
      {activeModal === 'spreadsheet' && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#0c1222] border border-amber-500/50 rounded-3xl p-4 shadow-2xl flex flex-col max-h-[90vh]">

            {/* Başlık ve Kapat Butonu */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📐</span>
                <div>
                  <span className="text-sm font-bold text-amber-300 block leading-tight">İnşaat m² Ölçü Tablosu</span>
                  <span className="text-[10px] text-slate-400">Çarpım için: "16x2.40" veya "16*2.40"</span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-800/60 text-slate-400 hover:text-white flex items-center justify-center">✕</button>
            </div>

            {/* HIZLI TUŞLAR (MOBİLDE ÇARPI X GİRİŞİ İÇİN) */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#070b14] border border-amber-500/20 rounded-xl my-2">
              <span className="text-[10px] text-amber-200/70 font-bold">Hızlı Tuş:</span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => insertSymbol('x')}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black rounded-lg text-xs border border-amber-500/40 active:scale-95 transition-all shadow-sm"
                >
                  × (Çarpı)
                </button>
                <button
                  type="button"
                  onClick={() => insertSymbol(',')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs border border-slate-700 active:scale-95 transition-all shadow-sm"
                >
                  , (Virgül)
                </button>
                <button
                  type="button"
                  onClick={() => insertSymbol('+')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs border border-slate-700 active:scale-95 transition-all shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tablo Alanı */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-full text-[11px] text-center border-collapse">
                <thead>
                  <tr className="bg-[#151e36] text-amber-200 border-b border-amber-500/30">
                    <th className="p-2 border-r border-slate-800">Banyo</th>
                    <th className="p-2 border-r border-slate-800">Ebeveyn</th>
                    <th className="p-2 border-r border-slate-800">WC</th>
                    <th className="p-2 border-r border-slate-800">Mutfak/Kor.</th>
                    <th className="p-2">Odalar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProject.measurements.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800/80 hover:bg-[#11182c]">
                      {(['banyo', 'ebeveyn', 'wc', 'mutfak', 'odalar'] as const).map(col => {
                        const calculated = evalMeasurement(row[col]);
                        const isFormula = (row[col] || '').includes('x') || (row[col] || '').includes('*') || (row[col] || '').includes('+');
                        return (
                          <td key={col} className="p-1 border-r border-slate-800/60 last:border-r-0">
                            <div className="flex flex-col items-center">
                              <input
                                type="text"
                                value={row[col] || ''}
                                placeholder="0"
                                onFocus={() => setActiveCell({ rowId: row.id, col })}
                                onChange={e => {
                                  const val = e.target.value;
                                  updateCurrentProject(prev => ({
                                    ...prev,
                                    measurements: prev.measurements.map(r => r.id === row.id ? { ...r, [col]: val } : r)
                                  }));
                                }}
                                className="w-16 text-center bg-[#060912] border border-slate-800 rounded py-1 text-slate-100 font-mono text-xs focus:border-amber-400 focus:outline-none shadow-inner"
                              />
                              {isFormula && calculated > 0 && (
                                <span className="text-[9px] text-emerald-400 font-mono mt-0.5">
                                  ={calculated.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* SÜTUN TOPLAMLARI (AYIRICI ÇİZGİNİN ALTINDA) */}
                  <tr className="bg-[#10192e] font-bold text-amber-300 border-t-2 border-amber-500/50">
                    {(['banyo', 'ebeveyn', 'wc', 'mutfak', 'odalar'] as const).map(col => {
                      const sum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r[col]), 0);
                      return (
                        <td key={col} className="p-2 border-r border-slate-800/60 last:border-r-0">
                          <div className="text-[9px] uppercase text-amber-200/50 font-semibold">{col}</div>
                          <div className="font-mono text-[11px] text-amber-300 font-black">{sum.toFixed(1)} m²</div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BÜYÜK GENEL TOPLAM ALANI */}
            {(() => {
              const bSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.banyo), 0);
              const eSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.ebeveyn), 0);
              const wSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.wc), 0);
              const mSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.mutfak), 0);
              const oSum = currentProject.measurements.reduce((acc, r) => acc + evalMeasurement(r.odalar), 0);
              const grandTotal = bSum + eSum + wSum + mSum + oSum;

              return (
                <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#121a30] via-[#172342] to-[#121a30] border border-amber-500/40 shadow-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🏆</span>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-amber-300/90 font-black">GENEL İŞÇİLİK METRAJI</div>
                      <div className="text-[10px] text-slate-400">Tüm Mahaller Genel Toplamı</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black bg-gradient-to-r from-[#fae19c] via-[#d4af37] to-[#fce69a] bg-clip-text text-transparent font-mono">
                      {grandTotal.toFixed(2)} m²
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* WHATSAPP İLE HAKEDİŞ PAYLAŞ BUTONU */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full mt-2.5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>WhatsApp ile Hakediş Dökümünü Paylaş</span>
            </button>

            {/* Satır Ekle & Tamam Butonları */}
            <div className="flex space-x-2 mt-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const newRow: RoomMeasurements = {
                    id: Date.now().toString(),
                    banyo: '', ebeveyn: '', wc: '', mutfak: '', odalar: ''
                  };
                  updateCurrentProject(prev => ({
                    ...prev,
                    measurements: [...prev.measurements, newRow]
                  }));
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-2xl transition-all"
              >
                + Yeni Satır Ekle
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md active:scale-95 transition-all"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LÜKS GELİR / GİDER GİRİŞ PANELİ */}
      {cashModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-opacity">
          <div className="w-full max-w-sm bg-[#0c1222]/95 border border-amber-500/35 rounded-3xl p-6 shadow-[0_15px_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${cashModal.type === 'gelir' ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600' : 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-600'}`} />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${cashModal.type === 'gelir' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                  {cashModal.type === 'gelir' ? 'Gelir Kaydı' : 'Gider Kaydı'}
                </h3>
              </div>
              <button
                onClick={() => setCashModal({ isOpen: false, type: 'gelir' })}
                className="w-7 h-7 rounded-full bg-slate-800/60 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-amber-200/70 tracking-wider block mb-1.5">
                  Kalem Açıklaması
                </label>
                <input
                  type="text"
                  placeholder={cashModal.type === 'gelir' ? 'Örn: Daire Satışı, Hakediş...' : 'Örn: Demir, Hazır Beton, İşçilik...'}
                  value={cashTitle}
                  onChange={e => setCashTitle(e.target.value)}
                  className="w-full bg-[#060912] border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-amber-200/70 tracking-wider block mb-1.5">
                  Tutar (TL)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-amber-400 font-bold text-sm">₺</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={cashAmount}
                    onChange={e => setCashAmount(e.target.value)}
                    className="w-full bg-[#060912] border border-slate-700/80 rounded-2xl pl-8 pr-4 py-2.5 text-base font-black text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 font-mono shadow-inner"
                  />
                </div>
              </div>

              <div className="flex space-x-2.5 pt-2">
                <button
                  onClick={() => setCashModal({ isOpen: false, type: 'gelir' })}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800/80 rounded-2xl transition-all"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleSaveCashItem}
                  className={`flex-1 py-2.5 text-xs font-black rounded-2xl shadow-lg active:scale-95 transition-all ${
                    cashModal.type === 'gelir'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/20'
                  }`}
                >
                  Kaydı Tamamla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YENİ PROJE EKLEME */}
      {activeModal === 'new_proj' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c1222] border border-amber-500/40 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-amber-300 mb-3">Yeni Proje ({activeTab === 'iscilik' ? 'İşçilik' : 'Hesap'})</h3>
            <input
              type="text"
              placeholder="Proje / Şantiye Adı..."
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="w-full bg-[#060912] border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 shadow-inner"
            />
            <div className="flex space-x-2 mt-4">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 text-xs text-slate-400 rounded-2xl hover:bg-slate-800">
                Vazgeç
              </button>
              <button onClick={handleAddProject} className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl shadow-md">
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "H" HATIRLATMA NOTLARI */}
      {activeModal === 'h_note' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c1222] border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col h-[70vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-amber-300">📝 Hatırlatma Notları</span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <textarea
              value={generalNote}
              onChange={e => setGeneralNote(e.target.value)}
              placeholder="Buraya şantiye hatırlatmalarını serbestçe yazabilirsiniz..."
              className="w-full flex-1 mt-3 bg-[#060912] border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-amber-400/50"
            />
            <button
              onClick={() => setActiveModal(null)}
              className="mt-3 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs rounded-2xl shadow-md"
            >
              Kaydet ve Kapat
            </button>
          </div>
        </div>
      )}

      {/* m² FİYATI NOTU */}
      {activeModal === 'm2_note' && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c1222] border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col h-[55vh]">
            <h3 className="text-sm font-bold text-amber-300 mb-2">💰 m² Fiyat Notları ({currentProject.name})</h3>
            <textarea
              value={currentProject.m2PriceNote}
              onChange={e => {
                const val = e.target.value;
                updateCurrentProject(prev => ({ ...prev, m2PriceNote: val }));
              }}
              placeholder="Birim m² fiyatı ve anlaşma detayları..."
              className="w-full flex-1 bg-[#060912] border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => setActiveModal(null)}
              className="mt-3 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs rounded-2xl"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* ALACAK / VERECEK NOTU */}
      {activeModal === 'alacak_note' && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c1222] border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col h-[55vh]">
            <h3 className="text-sm font-bold text-amber-300 mb-2">⚖️ Alacak / Verecek Takibi ({currentProject.name})</h3>
            <textarea
              value={currentProject.alacakVerecekNote}
              onChange={e => {
                const val = e.target.value;
                updateCurrentProject(prev => ({ ...prev, alacakVerecekNote: val }));
              }}
              placeholder="Ödenen peşinatlar, kalan bakiye ve borçlar..."
              className="w-full flex-1 bg-[#060912] border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => setActiveModal(null)}
              className="mt-3 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs rounded-2xl"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
