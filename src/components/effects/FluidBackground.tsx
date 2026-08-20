// src/components/effects/FluidBackground.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PARTICLES = [
  { size: 80,  left: '5%',  top: '10%', duration: 20, delay: 0 },
  { size: 50,  left: '20%', top: '60%', duration: 25, delay: -3 },
  { size: 100, left: '45%', top: '5%',  duration: 22, delay: -7 },
  { size: 40,  left: '65%', top: '40%', duration: 28, delay: -11 },
  { size: 70,  left: '80%', top: '15%', duration: 24, delay: -2 },
  { size: 55,  left: '35%', top: '75%', duration: 26, delay: -9 },
  { size: 90,  left: '10%', top: '80%', duration: 23, delay: -5 },
  { size: 45,  left: '55%', top: '25%', duration: 30, delay: -14 },
  { size: 60,  left: '75%', top: '70%', duration: 21, delay: -6 },
  { size: 35,  left: '90%', top: '50%', duration: 27, delay: -12 },
];

export default function FluidBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Fond bleu nuit profond */}
      <div className="absolute inset-0 bg-[#0b1120]" />

      {/* Dégradé animé subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/15 via-blue-900/10 to-indigo-900/5 animate-gradient-shift" />

      {/* Particules flottantes */}
      {mounted && PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-cyan-500/15"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: p.top,
            left: p.left,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, i % 2 === 0 ? 20 : -20, 0],
            scale: [1, 1.08, 1],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}

      {/* Styles globaux */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          animation: gradient-shift 30s ease infinite;
          background-size: 400% 400%;
        }
      `}</style>
    </div>
  );
}