// src/app/cookies/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Globe, ArrowLeft, Sparkle, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookiesPage() {
  const t = useTranslations('cookies_page');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

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

  const cookiesList = [
    { icon: Lock, title: t('cookies_list.auth'), desc: t('cookies_list.auth_desc') },
    { icon: Globe, title: t('cookies_list.preferences'), desc: t('cookies_list.preferences_desc') },
    { icon: Shield, title: t('cookies_list.security'), desc: t('cookies_list.security_desc') }
  ];

  const rightsList = [
    t('rights_list.access'),
    t('rights_list.delete'),
    t('rights_list.refuse')
  ];

  return (
    <AnimatePresence>
      <div className="min-h-screen bg-gradient-to-br bg-transparent py-10">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r bg-transparent px-3.5 py-1.5 rounded-full border border-cyan-500/20 mb-4">
              <span className="text-cyan-300/80 font-medium text-sm">{t('badge')}</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white/90 to-cyan-200/70 bg-clip-text text-transparent mb-3">
              {t('title')}
            </h1>
            <p className="text-gray-300/70 max-w-xl mx-auto text-sm font-light leading-relaxed">
              {t('description')}
            </p>
            
            <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500/60 to-blue-400/60 mx-auto mt-4 rounded-full"></div>
          </motion.div>

          {/* Contenu */}
          <div className="space-y-4">
            {/* Cookies utilisés */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
              className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/60 to-cyan-500/60 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white/80 mb-0.5">{t('used_cookies_title')}</h2>
                  <p className="text-xs text-gray-400/60 font-light">{t('used_cookies_subtitle')}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {cookiesList.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:bg-white/[0.03] transition-all">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-cyan-300/60" />
                    </div>
                    <div>
                      <h3 className="text-sm text-white/70 font-medium">{item.title}</h3>
                      <p className="text-xs text-gray-400/50 font-light mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Important */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
              className="rounded-2xl p-5 bg-amber-500/[0.03] backdrop-blur-sm border border-amber-500/[0.08]"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500/60 to-orange-500/60 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white/80 mb-1.5">{t('important_title')}</h2>
                  <p className="text-gray-300/60 text-sm font-light leading-relaxed">
                    <span className="text-amber-300/70">{t('important_no_tracking')}</span>{' '}
                    {t('important_description')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Vos droits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
              className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]"
            >
              <h2 className="text-base font-semibold text-white/80 mb-3">{t('your_rights_title')}</h2>
              <ul className="space-y-2">
                {rightsList.map((right, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-gray-300/60 text-sm font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 mt-1.5 flex-shrink-0"></span>
                    <span>{right}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bouton retour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
            className="mt-8 text-center"
          >
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-cyan-300/60 hover:text-cyan-200/80 hover:bg-cyan-500/[0.04] font-light rounded-lg">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                {t('back_to_home')}
              </Button>
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mt-10 pt-5 border-t border-white/[0.06] text-[11px] text-gray-500/60 font-light"
          >
            <p>{t('footer_text', { date: new Date().toLocaleDateString('fr-FR') })}</p>
            <p className="mt-1 flex items-center justify-center gap-1.5">
              <span>{t('made_with')}</span>
            </p>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}