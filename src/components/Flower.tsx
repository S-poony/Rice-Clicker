import React from 'react';

interface FlowerProps {
  style?: React.CSSProperties;
  className?: string;
  color?: string;
}

export const Flower: React.FC<FlowerProps> = ({ style, className, color }) => {
  const flowerId = React.useId();
  const petalColor = color || '#FFD700';

  const base = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const gradientUrl = `url(${base}#${flowerId}-gradient)`;
  const shadowUrl = `url(${base}#${flowerId}-shadow)`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Gradient for petals */}
        <radialGradient id={`${flowerId}-gradient`}>
          <stop offset="0%" stopColor={petalColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={petalColor} stopOpacity="1" />
        </radialGradient>

        {/* Soft shadow filter */}
        <filter id={`${flowerId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(0, 0, 0, 0.25)" />
        </filter>
      </defs>

      {/* Apply shadow to the entire flower group */}
      <g transform="translate(50 50) scale(1.2)" filter={shadowUrl}>
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={gradientUrl} transform="rotate(0)" />
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={gradientUrl} transform="rotate(72)" />
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={gradientUrl} transform="rotate(144)" />
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={gradientUrl} transform="rotate(216)" />
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={gradientUrl} transform="rotate(288)" />
      </g>

      <circle cx="50" cy="50" r="8" fill="#8B4513" />
    </svg>
  );
};
