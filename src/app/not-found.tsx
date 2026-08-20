// src/app/not-found.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Home, LogOut, AlertCircle, Search, 
  Sparkle, Rocket, Zap, Scan, 
  Database, ShieldCheck, Globe, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';

export default function NotFound() {
  const t = useTranslations('not_found');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    
    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/sign-in?reason=session_expired';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
          />
          <span className="text-cyan-300/70 text-sm font-light tracking-wide">
            {t('loading')}
          </span>
        </motion.div>
      </div>
    );
  }

  const suggestions = [
    { icon: Zap, label: t('suggestions.dashboard'), href: "/dashboard" },
    { icon: Scan, label: t('suggestions.features'), href: "/features" },
    { icon: Database, label: t('suggestions.pricing'), href: "/pricing" },
    { icon: ShieldCheck, label: t('suggestions.documentation'), href: "/documentation" }
  ];

  const badges = [
    { icon: Globe, label: t('badges.languages') },
    { icon: ShieldCheck, label: t('badges.security') },
    { icon: Rocket, label: t('badges.availability') }
  ];

  return (
    <AnimatePresence>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Fond animé */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.06),transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.04),transparent_60%)]"></div>
          
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/[0.03]"
              style={{
                width: `${Math.random() * 30 + 8}px`,
                height: `${Math.random() * 30 + 8}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                y: [0, -15, 0],
                x: [0, Math.sin(i) * 20, 0],
                scale: [0.8, 1.1, 0.8],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        <div className="text-center max-w-xl mx-auto px-4">
          {/* Chiffres 404 */}
          <div className="relative mb-6">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
              className="absolute -inset-4 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-2xl"
            ></motion.div>
            
            <div className="relative z-10 flex justify-center gap-2">
              {[4, 0, 4].map((num, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                  className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400/80 to-blue-400/80"
                >
                  {num}
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center backdrop-blur-sm">
                <AlertCircle className="w-6 h-6 text-amber-400/70" />
              </div>
            </motion.div>
          </div>

          {/* Titre et description */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
            className="text-2xl md:text-3xl font-bold text-white/90 mb-3"
          >
            {t('title')}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-gray-300/60 mb-8 max-w-sm mx-auto text-sm font-light leading-relaxed"
          >
            {isAuthenticated ? t('session_expired') : t('page_moved')}
          </motion.p>
          
          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500/[0.08] hover:bg-red-500/[0.12] border border-red-500/[0.15] text-red-400/70 hover:text-red-300/80 rounded-xl text-sm font-light transition-all duration-300 group"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>{t('sign_out')}</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white/70 rounded-xl text-sm font-light transition-all duration-300 group"
              >
                <ArrowRight className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform rotate-180" />
                <span>{t('back')}</span>
              </motion.button>
            )}
          </div>
          
          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
            className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] max-w-lg mx-auto"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-500/60 to-blue-500/60 flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h3 className="text-sm font-semibold text-white/80">{t('suggestions_title')}</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((item, i) => (
                <motion.div key={i} whileHover={{ x: 3 }} className="group">
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-all duration-300 border border-white/[0.04]"
                  >
                    <div className="w-7 h-7 rounded-md bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-cyan-300/60 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-gray-300/60 group-hover:text-white/70 transition-colors text-xs font-light">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-500/60 text-xs font-light mb-2">
              {t('need_help')}
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-1.5 text-cyan-400/60 hover:text-cyan-300/80 text-xs font-light group transition-colors"
            >
              <span>{t('contact_support')}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-gray-500/60 font-light"
          >
            <div className="flex items-center justify-center gap-1.5">
              <span>{t('made_with')}</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-1">
                  <badge.icon className="w-3 h-3 text-cyan-400/40" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}