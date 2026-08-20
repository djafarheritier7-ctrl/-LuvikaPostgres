// src/components/cards/ProfileCard3D.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';

type ProfileCard3DProps = {
  onTap?: () => void;
};

export default function ProfileCard3D({ onTap }: ProfileCard3DProps) {
  const t = useTranslations('profile_card_3d');
  const [isHovered, setIsHovered] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [neon, setNeon] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlashKey(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRotate = 12;
    const rotateYValue = ((x - centerX) / centerX) * maxRotate;
    const rotateXValue = ((centerY - y) / centerY) * maxRotate;
    setRotateY(rotateYValue);
    setRotateX(rotateXValue);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // ✅ Gestion du clic/tap
  const handleClick = useCallback(() => {
    if (onTap) {
      onTap();
      setFlashKey(prev => prev + 1); // Déclenche aussi le flash au clic
    }
  }, [onTap]);

  // Générer des blocs QR aléatoires pour l'aperçu (statique)
  const qrBlocks = Array(9).fill(0).map((_, i) => ({
    isDark: [0, 2, 6, 8].includes(i),
    isCenter: i === 4
  }));

  return (
    <motion.div
      ref={cardRef}
      className="
        relative
        w-full
        max-w-[520px]
        aspect-[16/9]
        mx-auto
        rounded-2xl
        overflow-hidden
        cursor-pointer
      "
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
        scale: isHovered ? 1.02 : 1,
        y: isHovered ? -4 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        mass: 0.5,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Glass Border Frame */}
      <div className="absolute inset-0 rounded-2xl border border-white/20 backdrop-blur-xl bg-white/5" />
      <div className="absolute -inset-[1px] rounded-2xl border border-cyan-300/30 pointer-events-none" />

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050814] via-[#0b1a3a]/60 to-black" />

      {/* Light Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/10 blur-xl"
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-blue-300/10 blur-xl"
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
      />

      {/* Lightning Flash */}
      <AnimatePresence>
        {(isHovered || flashKey % 3 === 0) && (
          <motion.div
            key={flashKey}
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0.05, 0.25, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/20 to-blue-400/10 blur-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-between px-8">
        {/* Identity */}
        <motion.div
          animate={{ y: [0, -3, 0], x: [0, 1, 0, -1, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
            {t('brand_name')}
          </h2>
          <p className="mt-1 text-sm text-cyan-200/90">
            {t('tagline')}
          </p>
          <p className="mt-2 text-xs font-mono text-gray-300 tracking-wider">
            {t('example_url')}
          </p>
        </motion.div>

        {/* QR */}
        <motion.div
          className="
            w-28 h-28 rounded-xl
            bg-gradient-to-br from-cyan-400/10 to-blue-500/10
            border border-cyan-300/40
            backdrop-blur-md
            flex items-center justify-center
            shadow-lg
          "
          animate={{ scale: [1, 1.05, 1], rotate: [0, 0.5, 0, -0.5, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        >
          <div className="grid grid-cols-3 gap-1">
            {qrBlocks.map((block, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-sm ${
                  block.isDark ? 'bg-cyan-300' :
                  block.isCenter ? 'bg-blue-300' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Verified Badge */}
      <span className="absolute top-4 right-4 text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 z-20">
        {t('verified_badge')}
      </span>

      {/* Matricule with neon effect on hover */}
      <motion.div
        onHoverStart={() => setNeon(true)}
        onHoverEnd={() => setNeon(false)}
        className="absolute bottom-3 left-4 z-20 font-mono text-xs tracking-[0.35em]"
        animate={{
          color: neon ? '#67e8f9' : '#94a3b8',
          textShadow: neon
            ? '0 0 6px #22d3ee, 0 0 12px #22d3ee'
            : '0 0 0 transparent'
        }}
        transition={{ duration: 0.2 }}
      >
        {t('matricule_example')}
      </motion.div>

      {/* Global Shadow */}
      <motion.div
        className="absolute -inset-1 rounded-[18px] pointer-events-none"
        animate={{
          boxShadow: [
            'inset 0 0 20px rgba(34,211,238,0.08), 0 20px 40px rgba(0,0,0,0.6)',
            'inset 0 0 32px rgba(34,211,238,0.15), 0 25px 50px rgba(0,0,0,0.7)',
            'inset 0 0 20px rgba(34,211,238,0.08), 0 20px 40px rgba(0,0,0,0.6)'
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </motion.div>
  );
}