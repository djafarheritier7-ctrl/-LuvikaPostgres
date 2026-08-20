// src/components/dashboard/modals/NFCModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Plus, AlertTriangle, Scan, CheckCircle, Clock, Ban } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import type { NFCCard } from '@/src/types/nfc';

export default function NFCModal({
  isOpen,
  onClose,
  cards,
  onManageCard,
}: {
  isOpen: boolean;
  onClose: () => void;
  cards: NFCCard[];
  onManageCard?: (card: NFCCard) => void;
}) {
  const t = useTranslations('NFCModal');
  
  if (!isOpen) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle, label: t('status_active') };
      case 'pending': return { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock, label: t('status_pending') };
      case 'lost': return { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: AlertTriangle, label: t('status_lost') };
      case 'blocked': return { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: Ban, label: t('status_blocked') };
      default: return { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: Clock, label: status };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass-border backdrop-blur-2xl rounded-2xl w-full max-w-md border border-white/15 shadow-2xl shadow-black/50 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header avec dégradé NFC */}
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border-b border-white/10 p-5">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-300 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <span className="text-black font-bold text-sm">N</span>
                </div>
                {t('title')}
              </h2>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                onClick={onClose}
                aria-label={t('close_label')}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-gray-300 text-sm mt-1 max-w-md">
              {t('subtitle')}
            </p>
          </div>

          {/* Contenu scrollable */}
          <ScrollArea className="h-[400px] p-4">
            {cards.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-amber-500/15 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
                  <AlertTriangle className="text-amber-400 w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('empty_title')}</h3>
                <p className="text-gray-400 max-w-xs mx-auto">
                  {t('empty_description')}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                  onClick={() => {
                    window.location.href = '/dashboard/nfc';
                    onClose();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('order_button')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card) => {
                  const { color, icon: StatusIcon, label } = getStatusConfig(card.status);
                  // Calculer un pourcentage d'utilisation fictif basé sur scans_count si disponible
                  const usagePercent = card.scan_count ? Math.min(Math.floor((card.scan_count / 1000) * 100), 100) : 87;
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * cards.indexOf(card) }}
                      whileHover={{ x: 4 }}
                      className="cursor-pointer"
                      onClick={() => onManageCard?.(card)}
                    >
                      <Card className="glass-border bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300 overflow-hidden group">
                        <div className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                <Scan className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-mono font-bold text-amber-300 truncate">{card.card_id}</p>
                                <p className="text-[13px] text-gray-400 mt-0.5">
                                  {t('created_date', { date: new Date(card.created_at).toLocaleDateString('fr-FR') })}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${color} text-[11px] py-0.5 px-2 font-medium whitespace-nowrap`}>
                              <StatusIcon className="w-3 h-3 mr-0.5 inline" />
                              {label}
                            </Badge>
                          </div>
                          
                          {/* Barre de progression pour les cartes actives */}
                          {card.status === 'active' && (
                            <div className="mt-3 pt-3 border-t border-white/5">
                              <div className="flex items-center justify-between text-[12px] text-gray-400 mb-1.5">
                                <span>{t('usage_label')}</span>
                                <span>{usagePercent}%</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${usagePercent}%` }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer avec bouton d'action */}
          {cards.length > 0 && (
            <div className="p-4 border-t border-white/10 bg-white/3">
              <Button
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300"
                onClick={() => {
                  window.location.href = '/dashboard/nfc';
                  onClose();
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t('add_card_button')}
                </span>
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}