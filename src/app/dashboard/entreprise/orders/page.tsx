// src/app/dashboard/entreprise/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Package, TrendingUp, Calendar, ArrowLeft, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Loading from '@/src/components/system/Loading';

export default function OrdersPage() {
  const t = useTranslations('enterprise.modules.orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;
      setCompanyId(company.id);

      const { data } = await supabase
        .from('ecommerce_orders')
        .select(`*, buyer:profiles!ecommerce_orders_buyer_id_fkey(full_name, email)`)
        .eq('seller_id', company.id)
        .order('created_at', { ascending: false });

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const filterByDateRange = (data: any[], range: string) => {
    const now = new Date();
    const start = range === 'today' ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) :
                  range === 'week' ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) :
                  range === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(0);
    return data.filter(o => new Date(o.created_at) >= start);
  };

  const filteredOrders = filterByDateRange(orders, dateRange);

  const stats = {
    revenue: filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    average: filteredOrders.length > 0
      ? filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / filteredOrders.length
      : 0,
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ecommerce_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Statut mis à jour');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Client', 'Email', 'Total', 'Statut', 'Date'];
    const rows = filteredOrders.map(o => [
      o.id.slice(0, 8),
      o.buyer?.full_name || o.buyer_name || 'Anonyme',
      o.buyer?.email || o.buyer_email || '',
      o.total_amount || 0,
      o.status,
      new Date(o.created_at).toLocaleDateString('fr-FR'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  if (loading) return <Loading />;

  const statCards = [
    { icon: <TrendingUp className="w-5 h-5 text-emerald-400/70" />, label: "Chiffre d'affaires", value: `${stats.revenue.toLocaleString()} $`, sub: dateRange },
    { icon: <Package className="w-5 h-5 text-amber-400/70" />, label: "En attente", value: stats.pending, sub: null },
    { icon: <Package className="w-5 h-5 text-emerald-400/70" />, label: "Livrées", value: stats.delivered, sub: null },
    { icon: <Calendar className="w-5 h-5 text-cyan-400/70" />, label: "Moyenne", value: `${stats.average.toFixed(0)} $`, sub: null },
  ];

  const dateRangeLabels: Record<string, string> = {
    today: "Aujourd'hui", week: "Cette semaine", month: "Ce mois", all: "Tout"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/entreprise')} className="h-8 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Retour
          </Button>
          <h1 className="text-xl font-semibold text-white/80">{t('title')}</h1>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
            {Object.entries(dateRangeLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDateRange(key as any)}
                className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors ${
                  dateRange === key ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button onClick={exportCSV} variant="outline" className="h-8 text-xs border-white/[0.08] text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <div key={i} className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] text-center">
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <p className="text-xs text-gray-400/60 font-light mb-0.5">{stat.label}</p>
            <p className="text-lg font-semibold text-white/80">{stat.value}</p>
            {stat.sub && <p className="text-[10px] text-gray-500/60 font-light mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Liste */}
      <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-3">{t('recent_orders')}</h2>
        <div className="space-y-2">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-400/60 text-xs font-light py-8">Aucune commande trouvée</p>
          ) : filteredOrders.slice(0, 15).map(order => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => router.push(`/dashboard/entreprise/orders/${order.id}`)}>
              <div>
                <p className="text-xs text-white/70 font-mono">#{order.id.slice(0, 8)}</p>
                <p className="text-[11px] text-gray-400/60 font-light">
                  {order.buyer?.full_name || order.buyer_name || 'Client anonyme'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white/80">{(order.total_amount || 0).toLocaleString()} $</p>
                <select
                  value={order.status}
                  onChange={(e) => { e.stopPropagation(); updateOrderStatus(order.id, e.target.value); }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 h-6 text-[11px] bg-white/[0.03] border border-white/[0.08] text-white/60 rounded-md px-1.5 font-light"
                >
                  <option value="pending">En attente</option>
                  <option value="processing">En cours</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
                <p className="text-[10px] text-gray-500/50 font-light mt-0.5">
                  {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}