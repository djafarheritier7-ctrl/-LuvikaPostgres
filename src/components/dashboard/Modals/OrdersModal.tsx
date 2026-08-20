// src/components/dashboard/modals/OrdersModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Package, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';

type Order = {
  id: string;
  product: string;
  status: string;
  date: string;
  price: string;
};

export default function OrdersModal({
  isOpen,
  onClose,
  isAdmin,
  orders = [], // Maintenant passé en prop
}: {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  orders?: Order[]; // À remplacer par des données réelles de l'API
}) {
  const t = useTranslations('OrdersModal');
  
  if (!isOpen) return null;

  // Données par défaut si aucune commande n'est fournie
  const defaultOrders: Order[] = [
    { id: '1', product: t('sample_premium_card'), status: t('status_pending'), date: '2024-02-15', price: '$29.99' },
    { id: '2', product: t('sample_premium_subscription'), status: t('status_active'), date: '2024-02-10', price: '$12.99/mois' },
    { id: '3', product: t('sample_basic_card'), status: t('status_delivered'), date: '2024-01-25', price: '$9.99' },
    { id: '4', product: t('sample_priority_support'), status: t('status_active'), date: '2024-01-20', price: '$4.99' },
    { id: '5', product: t('sample_premium_card'), status: t('status_cancelled'), date: '2024-01-15', price: '$29.99' },
  ];

  const displayOrders = orders.length > 0 ? orders : defaultOrders;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case t('status_active'): 
        return { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle };
      case t('status_pending'): 
        return { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock };
      case t('status_delivered'): 
        return { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: CheckCircle };
      case t('status_cancelled'): 
        return { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: AlertCircle };
      default: 
        return { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: Clock };
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
          {/* Header avec dégradé */}
          <div className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/20 border-b border-white/10 p-5">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Package className="w-4.5 h-4.5 text-white" />
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
            <div className="space-y-3">
              {displayOrders.map((order, index) => {
                const { color, icon: StatusIcon } = getStatusConfig(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="group"
                  >
                    <Card className="glass-border bg-white/5 border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-bold text-white">{order.product}</span>
                              <Badge className={`${color} text-[11px] py-0.5 px-2 font-medium`}>
                                <StatusIcon className="w-3 h-3 mr-0.5 inline" />
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[13px] text-gray-400 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(order.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-violet-300">{order.price}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer avec bouton d'action */}
          <div className="p-4 border-t border-white/10 bg-white/3">
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-500/20 transition-all duration-300 group relative overflow-hidden"
              onClick={() => {
                window.location.href = isAdmin ? '/admin/orders' : '/dashboard/orders';
                onClose();
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
              <span className="flex items-center justify-center gap-2">
                <span>{t('view_all_button')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Styles globaux */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background-size: 200% 100%;
        }
      `}</style>
    </AnimatePresence>
  );
}