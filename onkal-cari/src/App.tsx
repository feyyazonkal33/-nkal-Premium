import { useState, useEffect } from 'react';

// --- VERİ TİPLERİ ---
interface RoomMeasurements {
  id: string;
  banyo: number;
  ebeveyn: number;
  wc: number;
  mutfak: number;
  odalar: number;
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

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Tursunlar İnşaat',
    status: 'Devam Ediyor',
    type: 'iscilik',
    m2PriceNote: 'Birim m² fiyatı: 850 TL + KDV olarak anlaşıldı.',
    alacakVerecekNote: 'Alınan Peşinat: 150.000 TL\nKalan Bakiye: 85.000 TL',
    measurements: [
      { id: 'm1', banyo: 12, ebeveyn: 8, wc: 4, mutfak: 25, odalar: 65 },
      { id: 'm2', banyo: 10, ebeveyn: 7, wc: 4, mutfak: 22, odalar: 60 },
    ],
    gelirler: [],
    giderler: []
  },
  {
    id: '2',
    name: 'Nkal Şantiye',
    status: 'Devam Ediyor',
    type: 'hesap',
    m2PriceNote: '',
    alacakVerecekNote: '',
    measurements: [],
    gelirler: [
      { id: 'g1', title: 'Hakediş 1', amount: 250000 },
      { id: 'g2', title: 'Ek İş Bedeli', amount: 45000 },
    ],
    giderler: [
      { id: 'gd1', title: 'Demir ve Çimento', amount: 110000 },
      { id: 'gd2', title: 'İşçilik Ödemesi', amount: 65000 },
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
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
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

  const visibleProjects = projects.filter(p => p.type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b14] via-[#0c1222] to-[#05080f] text-slate-100 flex flex-col items-center justify-between pb-28 font-sans select-none antialiased">

      {/* 1. ÜST BİLGİ BARI */}
      <header className="w-full max-w-md px-5 pt-4 pb-2 border-b border-amber-500/20 bg-[#0a0f1d]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {selectedProjectId ? (
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <img src="./logo.png" alt="Logo" className="w-9 h-9 rounded-full object-cover border border-amber-400/40 shadow-sm" />
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
                className={`w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-[#8f6d1f] via-[#fce69a] to-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.25)] transition-transform duration-700 ease-out flex items-center justify-center ${
                  activeTab === 'iscilik' ? '-rotate-6' : 'rotate-6'
                }`}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#11192e] to-[#070b14] flex flex-col items-center justify-center p-3 text-center border border-amber-400/30 overflow-hidden">
                  {!logoImgError ? (
                    <img
                      src="./logo.png"
                      alt="Önkal Premium Logo"
                      onError={() => setLogoImgError(true)}
                      className="w-32 h-32 object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-14 h-14 text-[#d4af37]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7v15h20V7L12 2zm0 2.84L18 8v12H6V8l6-3.16zM8 10h3v3H8v-3zm5 0h3v3h-3v-3zm-5 5h3v3H8v-3zm5 0h3v3h-3v-3z"/>
                      </svg>
                      <span className="text-[10px] font-bold text-[#f5da88] mt-1 tracking-wider">ÖNKAL PREMİUM</span>
                      <span className="text-[8px] text-amber-200/60 tracking-widest">İNŞAAT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kapsül Sekme Seçici */}
            <div className="w-full max-w-xs bg-[#12192c] border border-amber-500/20 p-1 rounded-full flex mb-5 shadow-inner">
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
                    className="w-full bg-[#12192e]/90 hover:bg-[#16213d] border border-amber-500/20 hover:border-amber-400/50 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all cursor-pointer group"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {project.name}
                      </h3>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-amber-400/70 group-hover:text-amber-400">
                      <span className="text-xs text-slate-400 group-hover:text-amber-300 font-medium">Aç</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* PROJE DETAY EKRANI */
          <div className="w-full space-y-4 pt-2">
            {currentProject?.type === 'iscilik' && (
              <div className="space-y-3">
                <button
                  onClick={() => setActiveModal('spreadsheet')}
                  className="w-full bg-[#12192e] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all hover:border-amber-400"
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
                  className="w-full bg-[#12192e] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all hover:border-amber-400"
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
                  className="w-full bg-[#12192e] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all hover:border-amber-400"
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

            {currentProject?.type === 'hesap' && (
              <div className="w-full space-y-3">
                {(() => {
                  const totGelir = currentProject.gelirler.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
                  const totGider = currentProject.giderler.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
                  const bakiye = totGelir - totGider;
                  return (
                    <div className="bg-gradient-to-br from-[#12192e] to-[#0d1424] border border-amber-500/40 rounded-2xl p-4 shadow-xl text-center">
                      <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Net Kalan Bakiye</span>
                      <div className={`text-2xl font-black mt-1 ${bakiye >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ₺{bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex justify-around mt-3 pt-3 border-t border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 block">Toplam Gelir</span>
                          <span className="font-bold text-emerald-300">₺{totGelir.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="h-7 w-[1px] bg-slate-800" />
                        <div>
                          <span className="text-slate-400 block">Toplam Gider</span>
                          <span className="font-bold text-rose-300">₺{totGider.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-[#12192e] border border-slate-800 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300 uppercase">Gelir / Gider Kalemleri</span>
                    <button
                      onClick={() => {
                        const title = prompt('Kalem açıklaması (Örn: Çimento, Hakediş):');
                        if (!title) return;
                        const amtStr = prompt('Tutar (TL):');
                        const amount = Number(amtStr) || 0;
                        const isGelir = confirm('Bu bir GELİR mi? (Evet: Gelir, İptal: Gider)');

                        updateCurrentProject(prev => ({
                          ...prev,
                          gelirler: isGelir ? [...prev.gelirler, { id: Date.now().toString(), title, amount }] : prev.gelirler,
                          giderler: !isGelir ? [...prev.giderler, { id: Date.now().toString(), title, amount }] : prev.giderler,
                        }));
                      }}
                      className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg hover:bg-amber-500/30"
                    >
                      + Yeni Ekle
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {[...currentProject.gelirler.map(g => ({ ...g, type: 'gelir' })), ...currentProject.giderler.map(g => ({ ...g, type: 'gider' }))].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-[#0b101d] text-xs border border-slate-800/80">
                        <div>
                          <span className={`font-bold mr-1.5 ${item.type === 'gelir' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.type === 'gelir' ? '[+]' : '[-]'}
                          </span>
                          <span>{item.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-semibold">₺{item.amount.toLocaleString('tr-TR')}</span>
                          <button
                            onClick={() => {
                              updateCurrentProject(prev => ({
                                ...prev,
                                gelirler: prev.gelirler.filter(i => i.id !== item.id),
                                giderler: prev.giderler.filter(i => i.id !== item.id),
                              }));
                            }}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 2. SABİT ALT NAVİGASYON BARI (TÜM SAYFALARDA KALICI) */}
      <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto z-40">
        <div className="relative bg-gradient-to-r from-[#cfa12b] via-[#faeb9e] to-[#996e14] text-slate-950 px-6 py-2.5 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)] flex items-center justify-between border-t border-amber-300/40">

          <button
            onClick={() => alert('Bağlantı kopyalandı!')}
            className="flex flex-col items-center justify-center text-slate-900 active:scale-90 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            <span className="text-[9px] font-bold">Paylaş</span>
          </button>

          <button
            onClick={() => setSelectedProjectId(null)}
            className="flex flex-col items-center justify-center text-slate-900 active:scale-90 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
            <span className="text-[9px] font-bold">Projeler</span>
          </button>

          {/* ORTADAKİ YÜKSELTİLMİŞ "+" BUTONU */}
          <div className="relative -top-5">
            <button
              onClick={() => setActiveModal('new_proj')}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#151c2e] to-[#090d18] text-[#f7e396] border-2 border-amber-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>

          {/* "H" (HATIRLATMA) BUTONU */}
          <button
            onClick={() => setActiveModal('h_note')}
            className="w-8 h-8 rounded-full bg-[#111726] text-[#e8c76b] font-black text-sm border border-amber-400 shadow-md flex items-center justify-center active:scale-90 transition-transform"
          >
            H
          </button>

          <button
            onClick={() => alert('Önkal Premium İnşaat - Cari Takip Sürüm v1.0')}
            className="flex flex-col items-center justify-center text-slate-900 active:scale-90 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <span className="text-[9px] font-bold">Menü</span>
          </button>
        </div>
      </nav>

      {/* --- MODALLAR --- */}

      {/* 1. YENİ PROJE EKLEME */}
      {activeModal === 'new_proj' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#11192e] border border-amber-500/40 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-amber-300 mb-3">Yeni Proje Ekle ({activeTab === 'iscilik' ? 'İşçilik' : 'Hesap'})</h3>
            <input
              type="text"
              placeholder="Proje / Şantiye Adı..."
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="w-full bg-[#090d18] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            />
            <div className="flex space-x-2 mt-4">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-2 text-xs text-slate-400 rounded-xl hover:bg-slate-800">
                Vazgeç
              </button>
              <button onClick={handleAddProject} className="flex-1 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl shadow-md">
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. "H" HATIRLATMA NOTLARI */}
      {activeModal === 'h_note' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#101728] border border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-col h-[70vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-amber-300">📝 Hatırlatma Notları</span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <textarea
              value={generalNote}
              onChange={e => setGeneralNote(e.target.value)}
              placeholder="Buraya şantiye hatırlatmalarını serbestçe yazabilirsiniz..."
              className="w-full flex-1 mt-3 bg-[#080c16] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-amber-400/50"
            />
            <button
              onClick={() => setActiveModal(null)}
              className="mt-3 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
            >
              Kaydet ve Kapat
            </button>
          </div>
        </div>
      )}

      {/* 3. İNŞAAT m² SPREADSHEET (TABLO) */}
      {activeModal === 'spreadsheet' && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#101728] border border-amber-500/50 rounded-2xl p-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-amber-300">📐 İnşaat m² Ölçü Tablosu</span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto mt-3">
              <table className="w-full text-[11px] text-center border-collapse">
                <thead>
                  <tr className="bg-[#19233c] text-amber-200 border-b border-amber-500/30">
                    <th className="p-1.5 border-r border-slate-800">Banyo</th>
                    <th className="p-1.5 border-r border-slate-800">Ebeveyn</th>
                    <th className="p-1.5 border-r border-slate-800">WC</th>
                    <th className="p-1.5 border-r border-slate-800">Mutfak/Kor.</th>
                    <th className="p-1.5">Odalar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProject.measurements.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800/80 hover:bg-[#141c30]">
                      {(['banyo', 'ebeveyn', 'wc', 'mutfak', 'odalar'] as const).map(col => (
                        <td key={col} className="p-1 border-r border-slate-800/60 last:border-r-0">
                          <input
                            type="number"
                            value={row[col] || ''}
                            onChange={e => {
                              const val = Number(e.target.value) || 0;
                              updateCurrentProject(prev => ({
                                ...prev,
                                measurements: prev.measurements.map(r => r.id === row.id ? { ...r, [col]: val } : r)
                              }));
                            }}
                            className="w-14 text-center bg-[#070b14] border border-slate-800 rounded py-1 text-slate-200 focus:border-amber-400 focus:outline-none"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-amber-500/10 font-bold text-amber-300 border-t-2 border-amber-500/40">
                    {(['banyo', 'ebeveyn', 'wc', 'mutfak', 'odalar'] as const).map(col => {
                      const sum = currentProject.measurements.reduce((acc, r) => acc + (Number(r[col]) || 0), 0);
                      return (
                        <td key={col} className="p-2 border-r border-slate-800/60 last:border-r-0">
                          {sum} m²
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex space-x-2 mt-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const newRow: RoomMeasurements = {
                    id: Date.now().toString(),
                    banyo: 0, ebeveyn: 0, wc: 0, mutfak: 0, odalar: 0
                  };
                  updateCurrentProject(prev => ({
                    ...prev,
                    measurements: [...prev.measurements, newRow]
                  }));
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl"
              >
                + Yeni Satır Ekle
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. m² FİYATI NOTU */}
      {activeModal === 'm2_note' && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#101728] border border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-col h-[55vh]">
            <h3 className="text-sm font-bold text-amber-300 mb-2">💰 m² Fiyat Notları ({currentProject.name})</h3>
            <textarea
              value={currentProject.m2PriceNote}
              onChange={e => {
                const val = e.target.value;
                updateCurrentProject(prev => ({ ...prev, m2PriceNote: val }));
              }}
              placeholder="Birim m² fiyatı ve anlaşma detayları..."
              className="w-full flex-1 bg-[#080c16] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => setActiveModal(null)}
              className="mt-3 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs rounded-xl"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* 5. ALACAK / VERECEK NOTU */}
      {activeModal === 'alacak_note' && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#101728] border border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-col h-[55vh]">
            <h3 className="text-sm font-bold text-amber-300 mb-2">⚖️ Alacak / Verecek Takibi ({currentProject.name})</h3>
            <textarea
              value={currentProject.alacakVerecekNote}
              onChange={e => {
                const val = e.target.value;
                updateCurrentProject(prev => ({ ...prev, alacakVerecekNote: val }));
              }}
              placeholder="Ödenen peşinatlar, kalan bakiye ve borçlar..."
              className="w-full flex-1 bg-[#080c16] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => setActiveModal(null)}
              className="mt-3 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs rounded-xl"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
