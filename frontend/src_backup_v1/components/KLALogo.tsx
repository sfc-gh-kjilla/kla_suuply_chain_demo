import React from 'react';

export const KLALogo: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <svg 
      width={size * 3} 
      height={size} 
      viewBox="0 0 120 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="klaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2D1B4E" />
          <stop offset="50%" stopColor="#5B2D83" />
          <stop offset="100%" stopColor="#7B3FA0" />
        </linearGradient>
      </defs>
      <text 
        x="0" 
        y="32" 
        fontFamily="'Segoe UI', Arial, sans-serif" 
        fontSize="36" 
        fontWeight="300" 
        fill="url(#klaGradient)"
        letterSpacing="1"
      >
        KLA
      </text>
      <rect x="75" y="4" width="32" height="32" fill="#00A0C8" rx="2"/>
      <rect x="89" y="10" width="4" height="20" fill="white"/>
      <rect x="81" y="18" width="20" height="4" fill="white"/>
    </svg>
  );
};
