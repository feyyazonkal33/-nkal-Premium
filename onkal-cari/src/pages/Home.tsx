import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Logo from '../components/Logo';

export default function Home() {
  const navigate = useNavigate();
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);

  const handleSelect = (side: 'left' | 'right') => {
    setAnimating(side);

    // Left for Iscilik, Right for Hesap based on "İşçilik | Hesap" tab ordering
    setTimeout(() => {
      if (side === 'left') navigate('/iscilik');
      else navigate('/hesap');
    }, 1200); // Wait for animation
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <TopBar />

      {/* Tabs */}
      <div className="flex w-full border-b border-gold/30">
        <button
          onClick={() => handleSelect('left')}
          className="flex-1 py-3 text-center font-bold text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors border-r border-gold/30"
        >
          İşçilik
        </button>
        <button
          onClick={() => handleSelect('right')}
          className="flex-1 py-3 text-center font-bold text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors"
        >
          Hesap
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">

        {/* Animated Logo Container */}
        <div
          className="transition-transform duration-1000 ease-in-out z-10 w-64 h-64"
          style={{
            transform: animating === 'left'
              ? 'translateX(-150vw) rotate(-360deg)'
              : animating === 'right'
                ? 'translateX(150vw) rotate(360deg)'
                : 'translateX(0) rotate(0deg)'
          }}
        >
          <Logo className="w-full h-full cursor-pointer hover:scale-105 transition-transform duration-300" />
        </div>

        {/* Backdrop visual elements */}
        {!animating && (
          <div className="absolute inset-0 flex pointer-events-none opacity-20">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-gold/10" />
            <div className="w-1/2 h-full bg-gradient-to-l from-transparent to-gold/10" />
          </div>
        )}
      </div>
    </div>
  );
}