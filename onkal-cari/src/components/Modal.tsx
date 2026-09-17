import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue?: string;
  onSave: (val: string) => void;
}

export default function Modal({ isOpen, onClose, title, initialValue = '', onSave }: ModalProps) {
  const [text, setText] = useState(initialValue);

  useEffect(() => {
    setText(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark border border-gold rounded-lg w-full max-w-sm shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-3 border-b border-gold/30">
          <h2 className="text-gold font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 flex-1">
          <textarea
            className="w-full h-48 bg-gray-900 border border-gray-700 rounded p-2 text-gray-200 focus:outline-none focus:border-gold resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Buraya notunuzu yazın..."
          />
        </div>
        <div className="p-3 border-t border-gold/30 flex justify-end">
          <button
            onClick={() => {
              onSave(text);
              onClose();
            }}
            className="bg-gold text-dark font-bold py-2 px-6 rounded hover:bg-gold-light transition-colors"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}