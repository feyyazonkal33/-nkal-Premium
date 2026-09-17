import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  const [error, setError] = useState(false);

  return (
    <div className={`rounded-full border-[6px] border-gold bg-dark flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.8)] relative ${className}`}>
      {/* Outer Glow Ring Effect */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(212,175,55,0.5)] pointer-events-none" />

      {!error ? (
        <img
          src="./logo.png"
          alt="Önkal Premium İnşaat"
          className="w-full h-full object-cover relative z-10"
          onError={() => setError(true)}
        />
      ) : (
        <Building2 className="text-gold w-1/2 h-1/2 relative z-10" />
      )}
    </div>
  );
}
