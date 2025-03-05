interface StarProps {
  size?: number;
  className?: string;
  rotation?: number;
}

export function Star({ size = 40, className = "", rotation = 0 }: StarProps) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <svg
        viewBox="0 0 51 48"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E94CA1" /> {/* Rose du logo */}
            <stop offset="100%" stopColor="#23C6C8" /> {/* Bleu/teal du logo */}
          </linearGradient>
        </defs>
        <path
          d="M25.5 0L31.6553 18.3647H50.8882L35.1165 29.7205L41.2718 48.0853L25.5 36.7295L9.72823 48.0853L15.8835 29.7205L0.111794 18.3647H19.3447L25.5 0Z"
          fill="url(#starGradient)"
        />
      </svg>
    </div>
  );
}
