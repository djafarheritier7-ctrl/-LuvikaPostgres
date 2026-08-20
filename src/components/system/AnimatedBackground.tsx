// src/components/system/AnimatedBackground.tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'dashboard' | 'auth' | 'public';
  className?: string;
}

export function AnimatedBackground({
  variant = 'default',
  className = '',
}: AnimatedBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Orbs */}
      <motion.div
        className="absolute top-0 -left-40 w-72 h-72 bg-cyan-500/[0.08] rounded-full mix-blend-screen filter blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute bottom-0 -right-40 w-72 h-72 bg-blue-500/[0.06] rounded-full mix-blend-screen filter blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {variant === 'auth' && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/[0.04] rounded-full mix-blend-screen filter blur-3xl"
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Grid subtil */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
}

// Ré-exports pour compatibilité
export function BackgroundGradientShift() {
  return <AnimatedBackground variant="public" />;
}

export function DashboardBackground() {
  return <AnimatedBackground variant="dashboard" />;
}

export function AuthBackground() {
  return <AnimatedBackground variant="auth" />;
}

export function PublicPageBackground() {
  return <AnimatedBackground variant="public" />;
}