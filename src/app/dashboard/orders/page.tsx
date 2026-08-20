// src/app/dashboard/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RefreshCw, Package as PackageIcon, Clock, Truck, CheckCircle, X, MapPin, Sparkle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Loading from '@/src/components/system/Loading';

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock },
    processing: { label: 'En préparation', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: PackageIcon },
    shipped: { label: 'Expédiée', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: Truck },
    delivered: { label: 'Livrée', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: X },
  };
  const cfg = config[status] || { label: 'Inconnu', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: PackageIcon };
  const Icon = cfg.icon;
  return <Badge className={`px-2 py-1 text-xs border ${cfg.color} flex items-center gap-1`}><Icon className="w-3 h-3" />{cfg.label}</Badge>;
};

export default function UserOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/user/orders');
        if (!res.ok) throw new Error('Erreur réseau');
        setOrders(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    await fetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    setCancellingId(null);
  };

  const productLabels: Record<string, string> = { nfc_premium: 'Carte NFC Premium', nfc_enterprise: 'Pack NFC Entreprise' };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-xl"><PackageIcon className="w-5 h-5 text-violet-400" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mes commandes</h1>
            <p className="text-sm text-gray-400">{orders.length} commande{orders.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="border-white/20 text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-1" /> 
          </Button>
          <Button size="sm" onClick={() => router.push('/dashboard/orders/new')} className="bg-violet-600 hover:bg-violet-700 text-white">
            <PackageIcon className="w-4 h-4 mr-1" /> 
          </Button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="border-white/20 text-gray-300"><RefreshCw className="w-4 h-4 mr-2" />Réessayer</Button>
        </div>
      )}

      {/* Liste vide */}
      {!error && orders.length === 0 && (
        <div className="text-center py-16">
          <PackageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Aucune commande pour le moment</p>
          <Button onClick={() => router.push('/dashboard/orders/new')} className="bg-violet-600 hover:bg-violet-700 text-white">
            <PackageIcon className="w-4 h-4 mr-2" />Commander ma première carte
          </Button>
          <div className="flex justify-center gap-6 mt-8 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 24h</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Kinshasa</span>
            <span className="flex items-center gap-1"><Sparkle className="w-3 h-3" /> Premium</span>
          </div>
        </div>
      )}

      {/* Liste */}
      {orders.length > 0 && (
        <div className="space-y-3">
          {orders.map(order => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-violet-500/10 rounded-lg shrink-0"><PackageIcon className="w-4 h-4 text-violet-400" /></div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{productLabels[order.product_type] || order.product_type} ×{order.quantity}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={order.status} />
                {order.status === 'pending' && (
                  <Button size="sm" variant="ghost" onClick={() => cancelOrder(order.id)} disabled={cancellingId === order.id}
                    className="text-red-400 hover:text-red-300 text-xs h-8">
                    {cancellingId === order.id ? '...' : 'Annuler'}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}