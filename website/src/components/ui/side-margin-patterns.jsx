import React from 'react';

/**
 * SideMarginPatterns Component
 * Renders clean, close-together line patterns in the left and right side margin areas
 * flanking the central max-w-7xl content layout.
 */
export default function SideMarginPatterns({ className = "" }) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}>
      {/* 
        ========================================================================
        LEFT SIDE MARGIN AREA (From screen left edge to max-w-7xl left boundary)
        ========================================================================
      */}
      <div 
        className="absolute top-0 bottom-0 left-0 z-0 hidden lg:block"
        style={{
          width: 'calc(max(0px, (100vw - 1280px) / 2))',
        }}
      >
        {/* Primary Close-Together Diagonal Line Pattern (-45deg, 6px spacing) */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              rgba(255, 255, 255, 0.14) 0px,
              rgba(255, 255, 255, 0.14) 1px,
              transparent 1px,
              transparent 7px
            )`,
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.1) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.1) 100%)'
          }}
        />

        {/* Screen Edge Vignette */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* 
        ========================================================================
        RIGHT SIDE MARGIN AREA (From max-w-7xl right boundary to screen right edge)
        ========================================================================
      */}
      <div 
        className="absolute top-0 bottom-0 right-0 z-0 hidden lg:block"
        style={{
          width: 'calc(max(0px, (100vw - 1280px) / 2))',
        }}
      >
        {/* Primary Close-Together Diagonal Line Pattern (45deg, 6px spacing) */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.14) 0px,
              rgba(255, 255, 255, 0.14) 1px,
              transparent 1px,
              transparent 7px
            )`,
            maskImage: 'linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.1) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.1) 100%)'
          }}
        />

        {/* Screen Edge Vignette */}
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black via-black/80 to-transparent" />
      </div>

      {/* 
        ========================================================================
        MOBILE & TABLET RESPONSIVE SIDE MARGIN STRIPS (Screen width < 1024px)
        ========================================================================
      */}
      <div className="block lg:hidden pointer-events-none">
        {/* Left Mobile Side Margin Strip */}
        <div 
          className="absolute top-0 bottom-0 left-0 w-3 sm:w-6 z-0 opacity-40 border-r border-white/10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              rgba(255, 255, 255, 0.18) 0px,
              rgba(255, 255, 255, 0.18) 1px,
              transparent 1px,
              transparent 5px
            )`
          }}
        />
        {/* Right Mobile Side Margin Strip */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-3 sm:w-6 z-0 opacity-40 border-l border-white/10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.18) 0px,
              rgba(255, 255, 255, 0.18) 1px,
              transparent 1px,
              transparent 5px
            )`
          }}
        />
      </div>
    </div>
  );
}
