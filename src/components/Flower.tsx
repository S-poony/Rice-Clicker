import React from 'react';

interface FlowerProps {
  style?: React.CSSProperties;
  className?: string;
  color?: string;
}

export const Flower: React.FC<FlowerProps> = ({ style, className, color }) => {
  const flowerId = React.useId();
  const petalColor = color || '#FFD700';

  // **FIX: Define the absolute URL for the gradient.**
  // This ensures the browser can find the gradient definition regardless of the page's base URL.
  const base = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const absoluteFlowerUrl = `url(${base}#${flowerId})`; 
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={flowerId}>
          <stop offset="0%" stopColor={petalColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={petalColor} stopOpacity="1" />
        </radialGradient>
      </defs>
      <g transform="translate(50 50) scale(1.2)">
        {/* **FIX: Use the new absoluteFlowerUrl variable for the fill attribute** */}
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={absoluteFlowerUrl} transform="rotate(0)" />
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={absoluteFlowerUrl} transform="rotate(72)" />
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={absoluteFlowerUrl} transform="rotate(144)" />
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={absoluteFlowerUrl} transform="rotate(216)" />
        <path d="M0,-25 C15,-25 15,-5 0,-5 C-15,-5 -15,-25 0,-25 Z" fill={absoluteFlowerUrl} transform="rotate(288)" />
      </g>
      <circle cx="50" cy="50" r="8" fill="#8B4513" />
    </svg>
  );
};