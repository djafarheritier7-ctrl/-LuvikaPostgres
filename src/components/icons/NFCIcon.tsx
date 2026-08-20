// src/components/icons/NFCIcon.tsx
'use client';

import { motion } from 'framer-motion';

export default function NFCIcon({ size = 64 }: { size?: number }) {
  const r = size / 2;
  const ring1 = r * 0.85;
  const ring2 = r * 0.65;
  const ring3 = r * 0.45;

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {/* Anneaux concentriques */}
        <motion.circle
          cx={r}
          cy={r}
          r={ring1}
          stroke="url(#grad1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx={r}
          cy={r}
          r={ring2}
          stroke="url(#grad2)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.circle
          cx={r}
          cy={r}
          r={ring3}
          stroke="url(#grad3)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />

        {/* Cercle central */}
        <motion.circle
          cx={r}
          cy={r}
          r={r * 0.2}
          fill="url(#gradCenter)"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.05, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Dégradés */}
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="gradCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </radialGradient>
        </defs>
      </svg>

      {/* ✨ Éclat brillant (coin haut-gauche) */}
      <motion.div
        className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/60"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}