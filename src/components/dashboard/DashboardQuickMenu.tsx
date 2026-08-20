// src/components/dashboard/DashboardQuickMenu.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Action = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  disabled?: boolean;
};

type Props = {
  onAction: (id: string) => void;
  actions: Action[];
  userPlan?: 'gratuit' | 'professionnel' | 'business';
};

export default function DashboardQuickMenu({
  onAction,
  actions,
  userPlan = 'gratuit', // Par défaut gratuit
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [dragY, setDragY] = useState(0);

  // 🔒 Actions bloquées pour le plan Gratuit
  const FREE_RESTRICTED_ACTIONS = ['statistics', 'subscribers', 'portfolio', 'certificates'];

  const isActionRestricted = (actionId: string): boolean => {
    return userPlan === 'gratuit' && FREE_RESTRICTED_ACTIONS.includes(actionId);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAction = (id: string) => {
    if (!isOpen) return;
    
    // 🔒 Bloquer l'action si restreinte pour le plan Gratuit
    if (isActionRestricted(id)) {
      // Optionnel : rediriger vers la page d'upgrade
      // window.location.href = '/pricing?upgrade=true';
      return;
    }
    
    onAction(id);
    setIsOpen(false);
    setDragY(0);
  };

  // 🔽 Tirer vers le bas pour fermer (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0) setDragY(Math.min(diff, 200));
  };

  const handleTouchEnd = () => {
    if (currentY.current - startY.current > 80) {
      setIsOpen(false);
    }
    setDragY(0);
  };

  return (
    <div className="fixed z-50 bottom-6 right-4 md:bottom-20 md:right-6" role="region" aria-label="Menu d'actions rapides">
      {/* Bouton central */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(!isOpen); setDragY(0); }}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-r from-indigo-600 to-purple-700 shadow-indigo-500/30'
            : 'bg-gradient-to-r from-cyan-600 to-blue-500 shadow-cyan-500/30'
        }`}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        {isOpen ? <X className="text-white w-5 h-5" /> : <Menu className="text-white w-5 h-5" />}
      </motion.button>

      {/* Menu radial — Desktop */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <div className="absolute bottom-20 right-0">
            <div className="relative w-64 h-64">
              {actions.map((action, i) => {
                const angle = (i / actions.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 110;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const restricted = isActionRestricted(action.id);
                
                return (
                  <motion.button
                    key={action.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, x, y }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.15 }}
                    onClick={() => handleAction(action.id)}
                    disabled={action.disabled || restricted}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      background: restricted 
                        ? 'linear-gradient(135deg, #4b5563, #374151)' // Gris pour bloqué
                        : `linear-gradient(135deg, ${getGradient(action.color)})`,
                      opacity: restricted ? 0.5 : 1,
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/20 shadow-lg hover:scale-110 active:scale-95 transition-all ${
                      restricted ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    title={restricted ? `${action.label} (🔒 Premium)` : action.label}
                  >
                    {/* Icône + Cadenas si restreint */}
                    <div className="relative">
                      <span className={`text-white scale-90 ${restricted ? 'opacity-60' : ''}`}>
                        {action.icon}
                      </span>
                      {restricted && (
                        <Lock 
                          className="absolute -top-1.5 -right-1.5 w-3 h-3 text-amber-400/80" 
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom sheet — Mobile avec tirer vers le bas */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              ref={sheetRef}
              initial={{ y: '100%' }}
              animate={{ y: dragY }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="w-full max-h-[75vh] overflow-y-auto bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl rounded-t-[28px] border-t border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Poignée */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/30" />
              </div>

              {/* Grille */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {actions.map((action) => {
                    const restricted = isActionRestricted(action.id);
                    
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleAction(action.id)}
                        disabled={action.disabled || restricted}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all relative ${
                          restricted 
                            ? 'opacity-50 cursor-not-allowed' 
                            : action.disabled 
                              ? 'opacity-40' 
                              : 'bg-white/5 hover:bg-white/10 active:bg-white/15'
                        }`}
                      >
                        <div className="relative">
                          <span
                            className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5"
                            style={{ 
                              background: restricted 
                                ? 'linear-gradient(135deg, #4b5563, #374151)' 
                                : `linear-gradient(135deg, ${getGradient(action.color)})` 
                            }}
                          >
                            <span className={`text-white scale-90 ${restricted ? 'opacity-50' : ''}`}>
                              {action.icon}
                            </span>
                          </span>
                          {/* Cadenas sur mobile */}
                          {restricted && (
                            <Lock 
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400/80" 
                              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
                            />
                          )}
                        </div>
                        <span className={`text-[11px] font-medium ${
                          restricted ? 'text-gray-500' : 'text-gray-300'
                        }`}>
                          {action.label}
                        </span>
                        {restricted && (
                          <span className="text-[9px] text-amber-400/60 mt-0.5">Premium</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message pour les utilisateurs Free */}
              {userPlan === 'gratuit' && (
                <div className="px-4 pb-2">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                    <p className="text-[11px] text-amber-300/80 font-light flex items-center justify-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      Débloquez toutes les fonctionnalités avec Premium
                    </p>
                  </div>
                </div>
              )}

              {/* Fermer */}
              <div className="p-4 pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  className="w-full h-11 rounded-xl text-gray-400 border border-white/10 hover:bg-white/10 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="mr-2 w-4 h-4" /> Fermer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getGradient = (cls: string): string => {
  const map: Record<string, string> = {
    'from-cyan-500 to-blue-500': '#06b6d4, #3b82f6',
    'from-purple-500 to-indigo-500': '#a855f7, #6366f1',
    'from-emerald-500 to-teal-500': '#10b981, #14b8a6',
    'from-amber-500 to-orange-500': '#f59e0b, #f97316',
    'from-blue-900 to-blue-800': '#1e3a5f, #1e3a8a',
    'from-sky-500 to-cyan-500': '#0ea5e9, #06b6d4',
    'from-yellow-500 to-amber-500': '#eab308, #f59e0b',
    'from-slate-500 to-gray-500': '#64748b, #6b7280',
    'from-red-500 to-rose-500': '#ef4444, #f43f5e',
    'from-green-500 to-emerald-500': '#22c55e, #10b981', 
  };
  return map[cls] || '#06b6d4, #3b82f6';
};