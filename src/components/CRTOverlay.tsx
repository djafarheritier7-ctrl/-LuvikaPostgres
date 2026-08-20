// src/components/CRTOverlay.tsx
'use client';

import { useEffect, useState } from 'react';

export default function CRTOverlay() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', (e) => {
      setPrefersReducedMotion(e.matches);
    });

    return () => {
      mediaQuery.removeEventListener('change', (e) => {});
    };
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <>
      {/* 📺 Effet CRT - PLUS DISCRET SUR MOBILE */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.06) 2px,  // ✅ Moins opaque sur mobile
              rgba(0, 0, 0, 0.06) 4px
            )
          `,
          opacity: 0.08,  // ✅ Réduit de 0.12 à 0.08 pour mobile
          zIndex: 1,
        }}
      />

      {/* 📡 Bruit/Grain - PLUS DISCRET SUR MOBILE */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 35%, rgba(255, 255, 255, 0.03) 0%, transparent 20%),  // ✅ 0.04 → 0.03
            radial-gradient(circle at 80% 65%, rgba(255, 255, 255, 0.03) 0%, transparent 20%)
          `,
          opacity: 0.3,  // ✅ Réduit de 0.4 à 0.3
          zIndex: 2,
        }}
      />

      {/* ✨ Scintillement - PLUS LENT SUR MOBILE */}
      <div 
        className="fixed inset-0 pointer-events-none animate-flicker-mobile"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',  // ✅ 0.08 → 0.06
          zIndex: 3,
        }}
      />

      {/* 🎯 Overlay de luminosité - FOND MOINS SOMBRE */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(30, 30, 40, 0.08) 0%, rgba(20, 20, 30, 0.12) 100%)',  // ✅ Plus clair
          zIndex: 0,
        }}
      />
    </>
  );
}