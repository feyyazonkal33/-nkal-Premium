interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`rounded-full border-4 border-gold bg-dark flex flex-col items-center justify-center p-4 shadow-[0_0_15px_rgba(212,175,55,0.4)] ${className}`}>
      {/* Abstract building silhouette in gold */}
      <svg width="60%" height="60%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 90 L20 50 L40 30 L40 90 Z" fill="#d4af37" />
        <path d="M40 90 L40 20 L60 10 L60 90 Z" fill="#d4af37" />
        <path d="M60 90 L60 40 L80 60 L80 90 Z" fill="#d4af37" />
      </svg>
      <span className="text-gold font-bold text-xs mt-2 uppercase tracking-wider text-center">
        Önkal Premium<br/>İnşaat
      </span>
    </div>
  );
}