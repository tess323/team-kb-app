export default function TigerLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base face */}
      <circle cx="20" cy="22" r="17" fill="#f97316" />

      {/* Ears */}
      <polygon points="5,14 2,2 13,10" fill="#f97316" />
      <polygon points="35,14 38,2 27,10" fill="#f97316" />
      {/* Inner ear */}
      <polygon points="6,12 4,4 12,10" fill="#fbbf24" />
      <polygon points="34,12 36,4 28,10" fill="#fbbf24" />

      {/* Forehead centre stripe */}
      <polygon points="20,8 17.5,16 22.5,16" fill="#1c1917" />

      {/* Left brow stripes */}
      <polygon points="7,12 5,18 10,17" fill="#1c1917" />
      <polygon points="4,19 3,25 8,23" fill="#1c1917" />

      {/* Right brow stripes */}
      <polygon points="33,12 35,18 30,17" fill="#1c1917" />
      <polygon points="36,19 37,25 32,23" fill="#1c1917" />

      {/* Muzzle */}
      <ellipse cx="20" cy="29" rx="8" ry="6" fill="#fde68a" />

      {/* Eyes — amber with slit pupils */}
      <ellipse cx="14" cy="20" rx="4" ry="3.5" fill="#fbbf24" />
      <ellipse cx="26" cy="20" rx="4" ry="3.5" fill="#fbbf24" />
      <ellipse cx="14" cy="20" rx="1.2" ry="3" fill="#1c1917" />
      <ellipse cx="26" cy="20" rx="1.2" ry="3" fill="#1c1917" />
      {/* Eye shine */}
      <circle cx="15.2" cy="18.8" r="0.9" fill="white" />
      <circle cx="27.2" cy="18.8" r="0.9" fill="white" />

      {/* Nose */}
      <polygon points="20,25 17.5,27.5 22.5,27.5" fill="#92400e" />

      {/* Mouth lines */}
      <path d="M20 27.5 Q17 30 15.5 29" stroke="#92400e" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M20 27.5 Q23 30 24.5 29" stroke="#92400e" strokeWidth="0.9" fill="none" strokeLinecap="round" />

      {/* Whisker dots */}
      <circle cx="11" cy="28" r="0.8" fill="#92400e" />
      <circle cx="11" cy="30.5" r="0.8" fill="#92400e" />
      <circle cx="29" cy="28" r="0.8" fill="#92400e" />
      <circle cx="29" cy="30.5" r="0.8" fill="#92400e" />
    </svg>
  );
}
