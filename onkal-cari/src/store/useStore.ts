import { useState, useEffect } from 'react';
import localforage from 'localforage';

localforage.config({
  name: 'OnkalPremiumCari',
});

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

export function useStore() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const stored = await localforage.getItem<RecordItem[]>('records');
      if (stored) {
        setRecords(stored);
      }
    } catch (e) {
      console.error('Error loading records', e);
    } finally {
      setLoading(false);
    }
  };

  const saveRecords = async (newRecords: RecordItem[]) => {
    try {
      await localforage.setItem('records', newRecords);
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