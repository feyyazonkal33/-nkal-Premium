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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark border-2 border-gold/50 rounded-xl w-full max-w-sm shadow-[0_0_20px_rgba(212,175,55,0.2)] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gold/30">
          <h2 className="text-gold font-bold text-lg tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gold transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 flex-1">
          <textarea
            className="w-full h-48 bg-gray-900 border border-gold/30 rounded-xl p-3 text-gray-200 focus:outline-none focus:border-gold resize-none shadow-inner"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Buraya notunuzu yazın..."
          />
        </div>
        <div className="p-4 border-t border-gold/30 flex justify-end">
          <button
            onClick={() => {
              onSave(text);
              onClose();
            }}
            className="bg-gold text-dark font-bold py-2 px-6 rounded-xl hover:bg-gold-light transition-colors shadow-md"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}