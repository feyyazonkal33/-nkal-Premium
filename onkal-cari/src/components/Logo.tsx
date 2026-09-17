interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`rounded-full border-4 border-gold bg-dark flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.6)] ${className}`}>
      <img src="/logo.png" alt="Önkal Premium İnşaat" className="w-full h-full object-cover" />
    </div>
  );
}