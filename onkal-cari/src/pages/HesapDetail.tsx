import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, type Transaction } from '../store/useStore';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

export default function HesapDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { records, updateRecord, loading } = useStore();

  const record = records.find(r => r.id === id);
  const [activeTab, setActiveTab] = useState<'gelir' | 'gider'>('gelir');

  if (loading) return <div className="p-8 text-center text-gold">Yükleniyor...</div>;
  if (!record) return <div className="p-8 text-center text-red-500">Kayıt bulunamadı.</div>;

  const transactions = record.transactions || [];
  const currentTransactions = transactions.filter(t => t.type === activeTab);

  const totalGelir = transactions.filter(t => t.type === 'gelir').reduce((sum, t) => sum + t.amount, 0);
  const totalGider = transactions.filter(t => t.type === 'gider').reduce((sum, t) => sum + t.amount, 0);
  const currentTotal = activeTab === 'gelir' ? totalGelir : totalGider;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const handleAddRow = () => {
    const desc = prompt('Açıklama:');
    if (!desc) return;
    const amountStr = prompt('Tutar:');
    if (!amountStr) return;
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount)) return alert('Geçersiz tutar');

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: activeTab,
      description: desc,
      amount
    };

    updateRecord({ ...record, transactions: [...transactions, newTx] });
  };

  const handleDeleteRow = (txId: string) => {
    const newTxs = transactions.filter(t => t.id !== txId);
    updateRecord({ ...record, transactions: newTxs });
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-dark">
      <TopBar />

      <div className="flex items-center gap-2 p-4 border-b border-gold/30">
        <button onClick={() => navigate(-1)} className="text-gold hover:text-gold-light">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-gold font-bold text-xl truncate">{record.name} - Hesap</h2>
      </div>

      <div className="flex w-full border-b border-gray-800">
        <button
          onClick={() => setActiveTab('gelir')}
          className={`flex-1 py-3 text-center font-bold transition-colors ${activeTab === 'gelir' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Gelir
        </button>
        <button
          onClick={() => setActiveTab('gider')}
          className={`flex-1 py-3 text-center font-bold transition-colors ${activeTab === 'gider' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Gider
        </button>
      </div>

      <div className="p-4 flex-1 overflow-auto">

        {/* Net Bakiye Summary */}
        <div className="mb-6 p-4 bg-gray-900 border border-gold/30 rounded-lg flex justify-between items-center">
          <span className="text-gray-400 font-semibold">Net Bakiye</span>
          <span className={`text-xl font-bold ${totalGelir - totalGider >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(totalGelir - totalGider)}
          </span>
        </div>

        {/* Transaction List */}
        <div className="flex flex-col gap-3">
          {currentTransactions.map(tx => (
            <div key={tx.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex justify-between items-center shadow-md">
              <div className="flex-1 mr-2 truncate text-gray-200 font-medium">
                {tx.description}
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${tx.type === 'gelir' ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(tx.amount)}
                </span>
                <button onClick={() => handleDeleteRow(tx.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddRow}
            className="w-full mt-2 py-3 border-2 border-dashed border-gold/50 rounded-lg text-gold flex items-center justify-center gap-2 hover:bg-gold/5 transition-colors font-semibold"
          >
            <Plus size={20} /> Yeni Satır Ekle
          </button>
        </div>

        {/* Total Footer */}
        <div className="mt-8 p-3 border-t-2 border-gold flex justify-between items-center">
          <span className="font-bold text-lg text-gold">Genel Toplam:</span>
          <span className="font-bold text-xl text-gold">{formatCurrency(currentTotal)}</span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}