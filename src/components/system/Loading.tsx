// src/components/system/Loading.tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function Loading() {
  const t = useTranslations('Loading');
  
  const messages = [
    t('message_initializing'),
    t('message_loading_profile'),
    t('message_preparing_interface'),
  ];

  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIdx(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Cercle tournant simple */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Texte */}
        <div className="text-center">
          <p className="text-white font-semibold text-sm">{t('brand_name')}</p>
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-gray-400 text-xs mt-1"
          >
            {messages[idx]}
          </motion.p>
        </div>

        {/* Barre fine */}
        <div className="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
}