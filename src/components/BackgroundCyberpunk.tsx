// src/components/BackgroundCyberpunk.tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BackgroundCyberpunk() {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', (e) => {
      setPrefersReducedMotion(e.matches);
    });

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', (e) => {});
    };
  }, []);


  // ✅ Désactiver uniquement si prefers-reduced-motion
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 🔵 Grille Cyberpunk - PLUS LÉGER SUR MOBILE */}
      <div className="absolute inset-0">
        <div 
          className={`absolute inset-0 ${isMobile ? 'opacity-15' : 'opacity-25'}`}
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, ${isMobile ? '0.1' : '0.2'}) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, ${isMobile ? '0.1' : '0.2'}) 1px, transparent 1px)
            `,
            backgroundSize: isMobile ? '60px 60px' : '40px 40px', // ✅ Plus espacé sur mobile
            maskImage: 'radial-gradient(circle at center, white 0%, transparent 70%)'
          }}
        />
      </div>

      {/* 🟢 Ligne de Scan Horizontal - MASQUÉE SUR MOBILE (trop lourd) */}
      {!isMobile && (
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          animate={{
            y: ['0%', '100%'],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
          initial={{ y: '0%' }}
        />
      )}

      {/* 🟣 Particules Flottantes - MOINS NOMBREUSES SUR MOBILE */}
      <div className="absolute inset-0">
        {[...Array(isMobile ? 8 : 15)].map((_, i) => ( // ✅ 8 au lieu de 15 sur mobile
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#8b5cf6' : '#22d3ee',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: i % 3 === 0 
                ? '0 0 10px #6366f1, 0 0 20px #6366f1'  // ✅ Moins intense sur mobile
                : i % 3 === 1 
                ? '0 0 10px #8b5cf6, 0 0 20px #8b5cf6' 
                : '0 0 10px #22d3ee, 0 0 20px #22d3ee',
            }}
            animate={{
              y: [0, isMobile ? -10 : -20, 0],  // ✅ Mouvement réduit sur mobile
              x: [0, Math.random() * (isMobile ? 20 : 40) - (isMobile ? 10 : 20), 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: isMobile ? 6 : 4 + Math.random() * 3,  // ✅ Plus lent sur mobile
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
        ))}
      </div>

      {/* 🔴 Réseau de Connexions - MOINS NOMBREUX SUR MOBILE */}
      <div className={`absolute inset-0 ${isMobile ? 'opacity-5' : 'opacity-8'}`}>
        <svg width="100%" height="100%">
          {[...Array(isMobile ? 6 : 10)].map((_, i) => {  // ✅ 6 au lieu de 10 sur mobile
            const x1 = Math.random() * 100;
            const y1 = Math.random() * 100;
            const x2 = Math.random() * 100;
            const y2 = Math.random() * 100;
            return (
              <motion.line
                key={i}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="#6366f1"
                strokeWidth={isMobile ? 0.5 : 1}  // ✅ Plus fin sur mobile
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                  duration: isMobile ? 12 : 8 + Math.random() * 4,  // ✅ Plus lent sur mobile
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* ⚡ Effet Glitch - PLUS DISCRET SUR MOBILE */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className={`absolute inset-0 ${isMobile ? 'opacity-5' : 'opacity-8'}`}
          style={{ 
            backgroundImage: 'linear-gradient(90deg, #6366f1 1px, transparent 1px)',
            backgroundSize: isMobile ? '5px 100%' : '3px 100%',  // ✅ Plus espacé sur mobile
            animation: isMobile ? 'glitchMove 1s steps(15) infinite' : 'glitchMove 0.5s steps(20) infinite'
          }}
        />
        <div 
          className={`absolute inset-0 ${isMobile ? 'opacity-3' : 'opacity-5'}`}
          style={{ 
            backgroundImage: 'linear-gradient(0deg, #22d3ee 1px, transparent 1px)',
            backgroundSize: isMobile ? '100% 6px' : '100% 4px',  // ✅ Plus espacé sur mobile
            animation: isMobile ? 'glitchMoveY 1.2s steps(12) infinite' : 'glitchMoveY 0.8s steps(15) infinite'
          }}
        />
      </div>

      {/* 🌈 Brume Colorée - PLUS DISCRÈTE SUR MOBILE */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isMobile ? 'from-cyan-500/5 via-purple-500/5' : 'from-cyan-500/8 via-purple-500/8'} to-transparent`} />
    </div>
  );
}