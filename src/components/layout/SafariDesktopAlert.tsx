// src/components/layout/SafariDesktopAlert.tsx
'use client';

import { useEffect, useState } from 'react';
import { X, Chrome, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SafariDesktopAlert() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si déjà masqué
    const isDismissed = localStorage.getItem('safari_alert_dismissed');
    if (isDismissed) return;

    // Détecter Safari Desktop
    const ua = navigator.userAgent;
    const isSafari = /safari/i.test(ua) && !/chrome/i.test(ua) && !/edge/i.test(ua);
    const isDesktop = !('ontouchstart' in window) && !/mobile|android|iphone|ipad/i.test(ua);
    
    if (isSafari && isDesktop) {
      // Attendre un peu avant d'afficher
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('safari_alert_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-slate-900/95 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              {/* Icône Chrome */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Chrome className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-white">
                    Meilleure expérience
                  </h4>
                  <button
                    onClick={handleDismiss}
                    className="text-gray-500 hover:text-gray-300 transition-colors ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 mb-3">
                  Safari ne supporte pas l'installation d'applications. 
                  Utilisez <span className="text-blue-400 font-medium">Chrome</span> ou <span className="text-blue-400 font-medium">Edge</span> pour installer LUVIKA sur votre bureau.
                </p>
                
                <div className="flex gap-2">
                  <a
                    href="https://www.google.com/chrome/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Chrome
                  </a>
                  <a
                    href="https://www.microsoft.com/edge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs rounded-lg transition-colors border border-white/10"
                  >
                    <Download className="w-3 h-3" />
                    Edge
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}