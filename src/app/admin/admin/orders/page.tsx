// src/app/admin/admin/orders/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package, ArrowLeft, Search, CheckCircle, XCircle, RotateCcw,
  MapPin, User, AlertCircle, RefreshCw, Truck, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Loading from '@/src/components/system/Loading';
import { OrderActions } from './_components/OrderActions';

type Order = {
  id: string;
  quantity: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string | null;
  created_at: string;
  profiles: { full_name: string; username: string; email: string } | null;
};

const ITEMS_PER_PAGE = 8;

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ReactNode; className: string; label: string }> = {
  pending: { icon: <AlertCircle className="w-3 h-3" />, className: 'bg-yellow-500/10 text-yellow-300/60 border-yellow-500/20', label: 'En attente' },
  processing: { icon: <RefreshCw className="w-3 h-3" />, className: 'bg-blue-500/10 text-blue-300/60 border-blue-500/20', label: 'En cours' },
  shipped: { icon: <Truck className="w-3 h-3" />, className: 'bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20', label: 'Expédiée' },
  delivered: { icon: <CheckCircle className="w-3 h-3" />, className: 'bg-emerald-500/10 text-emerald-300/60 border-emerald-500/20', label: 'Livrée' },
  cancelled: { icon: <XCircle className="w-3 h-3" />, className: 'bg-red-500/10 text-red-300/60 border-red-500/20', label: 'Annulée' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, profiles(full_name, username, email)')
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    let result = orders.filter(order => {
      if (filter !== 'all' && order.status !== filter) return false;
      if (search) {
        const term = search.toLowerCase();
        const p = order.profiles;
        if (!p) return false;
        return (p.full_name?.toLowerCase().includes(term) || p.username?.toLowerCase().includes(term) || p.email?.toLowerCase().includes(term));
      }
      return true;
    });
    return result;
  }, [orders, filter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => setCurrentPage(1), [filter, search]);

  // ✅ Callback pour OrderActions
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as OrderStatus] || { icon: <Package className="w-3 h-3" />, className: 'bg-gray-500/10 text-gray-300/60 border-gray-500/20', label: status };
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${config.className}`}>
        {config.icon}{config.label}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white/80">Commandes</h1>
            <p className="text-xs text-gray-400/60 font-light mt-1">{filtered.length} commande{filtered.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5 flex-wrap">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((v) => (
              <button key={v} onClick={() => setFilter(v as any)}
                className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors ${
                  filter === v ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                }`}>{v === 'all' ? 'Toutes' : v === 'pending' ? 'En attente' : v === 'processing' ? 'En cours' : v === 'shipped' ? 'Expédiées' : v === 'delivered' ? 'Livrées' : 'Annulées'}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
        <Input placeholder="Rechercher par nom, email..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl w-full" />
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <Package className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
          <p className="text-gray-400/60 text-sm font-light">Aucune commande trouvée</p>
          {(filter !== 'all' || search) && (
            <Button variant="ghost" onClick={() => { setFilter('all'); setSearch(''); }}
              className="mt-3 h-8 text-xs text-cyan-400/60 hover:text-cyan-300/70 font-light rounded-lg">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Réinitialiser
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {paginated.map((order) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all w-full">
              <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-cyan-400/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white/70 font-medium">{order.profiles?.full_name || 'Inconnu'}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-[11px] text-gray-400/50 font-light mt-0.5">{order.profiles?.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500/50 font-light">
                      <span>{order.quantity} carte{order.quantity > 1 ? 's' : ''}</span>
                      {order.shipping_address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.shipping_address}</span>}
                      <span>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                {/* ✅ OrderActions remplace tous les boutons */}
                <div className="flex-shrink-0 lg:ml-4">
                  <OrderActions 
                    orderId={order.id} 
                    currentStatus={order.status} 
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <p className="text-[11px] text-gray-500/50 font-light">Page {currentPage} sur {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(page => (
              <Button key={page} variant="ghost" size="sm" onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 p-0 text-xs font-light rounded-lg ${page === currentPage ? 'bg-white/[0.06] text-white/80' : 'text-gray-400/60 hover:text-white/70'}`}>
                {page}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}