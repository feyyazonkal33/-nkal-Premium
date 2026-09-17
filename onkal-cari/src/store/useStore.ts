import { useState, useEffect } from 'react';

export interface RecordItem {
  id: string;
  name: string;
  type: 'iscilik' | 'hesap';
  m2Price?: string;
  measurements?: any[];
  notes?: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'gelir' | 'gider';
  description: string;
  amount: number;
}

const STORAGE_KEY = 'onkal_premium_cari_records';

const MOCK_DATA: RecordItem[] = [
  {
    id: '1',
    name: 'Tursunlar İnşaat',
    type: 'iscilik',
    measurements: [],
    transactions: [],
  },
  {
    id: '2',
    name: 'Nkal Şantiye',
    type: 'hesap',
    measurements: [],
    transactions: [],
  },
  {
    id: '3',
    name: 'Önkal Plaza',
    type: 'iscilik',
    measurements: [],
    transactions: [],
  }
];

export function useStore() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setRecords(parsed);
        } else {
          setRecords(MOCK_DATA);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
        }
      } else {
        setRecords(MOCK_DATA);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
      }
    } catch (e) {
      console.error('Error loading records', e);
      setRecords(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  const saveRecords = (newRecords: RecordItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
      setRecords(newRecords);
    } catch (e) {
      console.error('Error saving records', e);
    }
  };

  const addRecord = (name: string, type: 'iscilik' | 'hesap') => {
    const newRecord: RecordItem = {
      id: Date.now().toString(),
      name,
      type,
      measurements: [],
      transactions: [],
    };
    saveRecords([...records, newRecord]);
  };

  const updateRecord = (updatedRecord: RecordItem) => {
    const newRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    saveRecords(newRecords);
  };

  const deleteRecord = (id: string) => {
    const newRecords = records.filter(r => r.id !== id);
    saveRecords(newRecords);
  };

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord
  };
}
