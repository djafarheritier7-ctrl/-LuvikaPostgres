// src/app/auth/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-gradient-to-br relative overflow-hidden">
      {/* Fond décoratif subtil */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(6,182,212,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(79,70,229,0.03),transparent_50%)]" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex-1">
        {children}
      </div>
    </div>
  );
}