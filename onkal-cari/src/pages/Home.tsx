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
    <div className="flex flex-col min-h-screen pb-16 bg-dark">
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden mt-8">

        {/* Animated Logo Container */}
        <div
          className="transition-transform duration-1000 ease-in-out z-10 w-64 h-64 mb-10"
          style={{
            transform: animating === 'left'
              ? 'translateX(-150vw) rotate(-360deg)'
              : animating === 'right'
                ? 'translateX(150vw) rotate(360deg)'
                : 'translateX(0) rotate(0deg)'
          }}
        >
          <Logo className="w-full h-full" />
        </div>

        {/* Capsule Tabs */}
        <div className="flex bg-gray-900 border border-gold/50 rounded-full p-1 z-20 w-3/4 max-w-xs shadow-lg relative">
          <button
            onClick={() => handleSelect('left')}
            className={`flex-1 py-2 text-center font-bold rounded-full transition-colors focus:outline-none z-10 ${animating === 'left' ? 'bg-gold text-dark' : 'text-gray-300 hover:text-gold'}`}
          >
            İşçilik
          </button>
          <div className="w-[1px] bg-gold/30 my-2 mx-1" />
          <button
            onClick={() => handleSelect('right')}
            className={`flex-1 py-2 text-center font-bold rounded-full transition-colors focus:outline-none z-10 ${animating === 'right' ? 'bg-gold text-dark' : 'text-gray-300 hover:text-gold'}`}
          >
            Hesap
          </button>
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