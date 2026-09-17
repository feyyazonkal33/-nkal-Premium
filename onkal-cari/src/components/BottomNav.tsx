import { Share2, PlusSquare, Timer, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 w-full max-w-md bg-dark border-t border-gold/30 px-6 py-3 flex justify-between items-center z-50">
      <button className="text-gray-400 hover:text-gold transition-colors flex flex-col items-center gap-1">
        <Share2 size={24} />
      </button>
      <button className="text-gray-400 hover:text-gold transition-colors flex flex-col items-center gap-1">
        <PlusSquare size={24} />
      </button>
      <button className="text-gray-400 hover:text-gold transition-colors flex flex-col items-center gap-1">
        <Timer size={24} />
      </button>
      <Link to="/" className="text-gray-400 hover:text-gold transition-colors flex flex-col items-center gap-1">
        <Menu size={24} />
      </Link>
    </div>
  );
}