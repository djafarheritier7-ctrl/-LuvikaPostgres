// src/app/dashboard/entreprise/orders/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Loading from '@/src/components/system/Loading';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const { data } = await supabase
        .from('ecommerce_orders')
        .select(`*, buyer:profiles!ecommerce_orders_buyer_id_fkey(*), seller:companies(*)`)
        .eq('id', orderId)
        .eq('seller_id', company.id)
        .single();

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400/60 text-sm font-light">Commande non trouvée</p>
        <Button variant="ghost" onClick={() => router.push('/dashboard/entreprise/orders')} className="mt-3 h-8 text-xs text-gray-400/60 hover:text-white/70 font-light rounded-lg">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Retour aux commandes
        </Button>
      </div>
    );
  }

  const statusConfig: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-300/70 border-amber-500/20',
    processing: 'bg-blue-500/10 text-blue-300/70 border-blue-500/20',
    shipped: 'bg-cyan-500/10 text-cyan-300/70 border-cyan-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-300/70 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-300/70 border-red-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/dashboard/entreprise/orders')} className="h-8 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Retour
        </Button>
        <h1 className="text-lg font-semibold text-white/80">Détails commande</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Infos principales */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/70 font-mono">#{order.id.slice(0, 8)}</h2>
              <Badge className={`text-[10px] font-light ${statusConfig[order.status] || statusConfig.pending}`}>
                {order.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs text-gray-400/60 font-light mb-1">Client</h3>
                <p className="text-sm text-white/70">{order.buyer?.full_name || order.buyer_name || 'Anonyme'}</p>
                <p className="text-xs text-gray-400/50 font-light">{order.buyer?.email || order.buyer_email || '—'}</p>
              </div>

              <div>
                <h3 className="text-xs text-gray-400/60 font-light mb-1">Adresse de livraison</h3>
                <p className="text-sm text-white/60 font-light">{order.shipping_address || 'Non spécifiée'}</p>
              </div>

              <div>
                <h3 className="text-xs text-gray-400/60 font-light mb-1">Articles</h3>
                <pre className="bg-white/[0.03] p-3 rounded-xl text-xs text-gray-300/70 font-light overflow-x-auto">
                  {JSON.stringify(order.items || [], null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] h-fit">
          <h2 className="text-sm font-semibold text-white/70 mb-4">Résumé</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400/60 font-light">Total</span>
              <span className="text-sm font-semibold text-white/80">{order.total_amount?.toLocaleString()} $</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400/60 font-light">Date</span>
              <span className="text-xs text-white/60 font-light">{format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400/60 font-light">Heure</span>
              <span className="text-xs text-white/60 font-light">{format(new Date(order.created_at), 'HH:mm', { locale: fr })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}