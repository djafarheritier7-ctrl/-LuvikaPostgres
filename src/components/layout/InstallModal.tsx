// src/components/layout/InstallModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { 
  X, Smartphone, Download, 
  Sparkle, Share2, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallModal() {
  const t = useTranslations('install_modal');
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem('install_modal_shown');
    if (alreadyShown) return;

    // Détection iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios);
    
    // Android / Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS / Safari
    const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone;
    if (ios && !isInStandaloneMode) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }

     const isSafariDesktop = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && 
                          !('ontouchstart' in window);
  
  if (isSafariDesktop) {
    // Ne pas montrer le modal d'installation sur Safari Desktop
    // car il ne supporte pas l'installation PWA
    console.log('Safari Desktop détecté - Installation PWA non supportée');
    localStorage.setItem('install_modal_shown', 'true');
    return;
  }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);


  
  const handleInstall = () => {
    if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
      (window as any).deferredPrompt.userChoice.then(() => {
        setShow(false);
        localStorage.setItem('install_modal_shown', 'true');
      });
    } else {
      setShow(false);
      localStorage.setItem('install_modal_shown', 'true');
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('install_modal_shown', 'true');
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
        <div className="rounded-2xl p-4 bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/30 relative overflow-hidden">
          {/* Décoration subtile */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/5 to-blue-500/3 rounded-full blur-2xl"></div>
          
          {/* Bouton fermer */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400/60 hover:text-gray-300/80 transition-colors p-1 z-10"
            aria-label={t('close_label')}
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start gap-2.5 mb-2.5 pr-6">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-500/60 to-blue-500/60 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-3.5 h-3.5 text-white/80" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white/80">{t('title')}</h2>
                <p className="text-xs text-cyan-300/60 font-light">{t('pwa_badge')}</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-300/60 text-xs mb-3 leading-relaxed font-light">
              {isIOS ? (
                <>
                  <span className="text-cyan-300/70">{t('ios_prefix')}</span> {t('ios_instruction_before')} <Share2 className="w-3 h-3 inline mx-0.5 align-middle text-gray-400/70" /> 
                  <span>{t('ios_share_text')}</span>, <Plus className="w-3 h-3 inline mx-0.5 align-middle text-gray-400/70" /> 
                  <span>{t('ios_add_text')}</span>.
                </>
              ) : (
                <>
                  <span className="text-cyan-300/70">{t('android_prefix')}</span> {t('android_description')}
                </>
              )}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {!isIOS && (
                <Button 
                  size="sm"
                  className="h-7 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light px-3 rounded-lg shadow-sm"
                  onClick={handleInstall}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {t('install_button')}
                </Button>
              )}
              
              <Button 
                size="sm"
                variant="outline" 
                className="h-7 text-xs border-white/[0.08] text-gray-300/70 hover:bg-white/[0.04] font-light px-3 rounded-lg"
                onClick={handleClose}
              >
                {t('later_button')}
              </Button>
            </div>
            
            {/* Footer */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-[10px] text-gray-500/60 font-light">
              <p className="flex items-center gap-1">
                <Sparkle className="w-2.5 h-2.5 text-cyan-400/40" />
                <span>{t('footer_text')}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}