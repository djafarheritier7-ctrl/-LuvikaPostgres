// src/components/layout/CookiesBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Cookie, ShieldCheck, X, 
  Sparkle, Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CookieBanner() {
  const t = useTranslations('cookies_banner');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('luvika_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('luvika_cookie_consent', 'accepted');
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('luvika_cookie_consent', 'rejected');
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[92%] max-w-md"
      >
        <div className="rounded-2xl p-4 bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/30">
          {/* Header */}
          <div className="flex items-start gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-500/60 to-orange-500/60 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-3.5 h-3.5 text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                {t('title')}
                <Badge className="bg-emerald-500/10 text-emerald-300/70 border-emerald-500/20 text-[10px] py-0 px-1.5 font-light">
                  {t('essential_badge')}
                </Badge>
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400/60 hover:text-gray-300/80 transition-colors p-0.5"
              aria-label={t('close_label')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Description */}
          <p className="text-gray-300/60 text-xs mb-3 leading-relaxed font-light">
            {t('description')}
          </p>
          
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge className="bg-blue-500/10 text-blue-300/60 border-blue-500/15 text-[10px] py-0 px-1.5 font-light">
              <ShieldCheck className="w-2.5 h-2.5 mr-0.5 inline" />
              {t('badge_security')}
            </Badge>
            <Badge className="bg-cyan-500/10 text-cyan-300/60 border-cyan-500/15 text-[10px] py-0 px-1.5 font-light">
              <Sparkle className="w-2.5 h-2.5 mr-0.5 inline" />
              {t('badge_session')}
            </Badge>
            <Badge className="bg-purple-500/10 text-purple-300/60 border-purple-500/15 text-[10px] py-0 px-1.5 font-light">
              <Settings className="w-2.5 h-2.5 mr-0.5 inline" />
              {t('badge_preferences')}
            </Badge>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleAccept}
              size="sm"
              className="h-7 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light px-3 rounded-lg shadow-sm"
            >
              {t('accept_button')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="h-7 text-xs border-white/[0.08] text-gray-300/70 hover:bg-white/[0.04] font-light px-3 rounded-lg"
            >
              {t('reject_button')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 text-xs text-cyan-300/60 hover:text-cyan-200/80 hover:bg-white/[0.04] font-light px-2 rounded-lg"
            >
              <Link href="/privacy">
                {t('privacy_link')}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}