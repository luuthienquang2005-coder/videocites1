import React from "react";

interface LogoProps {
  className?: string;
  watermark?: boolean;
}

export default function Logo({ className = "w-8 h-8", watermark = false }: LogoProps) {
  // If watermark is true, we render a highly translucent, simpler version, or the full logo with opacity.
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300`}
    >
      <defs>
        {/* Deep Blue / Royal Blue Gradient for the main outer frame */}
        <linearGradient id="blueGrad" x1="15" y1="15" x2="105" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a2a95" />
          <stop offset="60%" stopColor="#1a3db8" />
          <stop offset="100%" stopColor="#0e2380" />
        </linearGradient>

        {/* Bright Cyan / Turquoise Gradient for the inner/top elements */}
        <linearGradient id="cyanGrad" x1="20" y1="20" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#009edb" />
        </linearGradient>
        
        {/* Soft Shadow for realistic depth when not in watermark mode */}
        {!watermark && (
          <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
          </filter>
        )}
      </defs>

      <g filter={watermark ? undefined : "url(#logoShadow)"}>
        {/* 1. Main outer dark blue play frame - Left and bottom thick border */}
        <path
          d="M 28 12 
             C 24 10, 20 13, 20 18 
             L 20 82 
             C 20 87, 24 90, 28 88 
             L 88 54 
             C 92 52, 92 48, 88 46 
             L 60 30"
          stroke="url(#blueGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2. Inner cyan triangular accent line */}
        <path
          d="M 32 24 
             L 32 76 
             C 32 78, 34 79, 36 78 
             L 58 65 
             C 61 63, 61 57, 58 55 
             L 48 49"
          stroke="url(#cyanGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Cyan quotation mark (Upper comma) */}
        <g transform="translate(68, 36)">
          {/* Circular bulb */}
          <circle cx="0" cy="0" r="5.5" fill="url(#cyanGrad)" />
          {/* Curved tail */}
          <path
            d="M 4 -3 
               C 5 2, 7 8, 3 13 
               C 1 15, -2 15, -2 12 
               C -2 9, 1 7, 2 4 
               C 2 1, 1 -1, 0 -3 
               Z"
            fill="url(#cyanGrad)"
          />
        </g>

        {/* 4. Deep Blue quotation mark (Lower comma) */}
        <g transform="translate(80, 50)">
          {/* Circular bulb */}
          <circle cx="0" cy="0" r="5.5" fill="url(#blueGrad)" />
          {/* Curved tail */}
          <path
            d="M 4 -3 
               C 5 2, 7 8, 3 13 
               C 1 15, -2 15, -2 12 
               C -2 9, 1 7, 2 4 
               C 2 1, 1 -1, 0 -3 
               Z"
            fill="url(#blueGrad)"
          />
        </g>
      </g>
    </svg>
  );
}
