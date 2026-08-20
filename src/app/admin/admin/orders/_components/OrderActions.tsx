// src/app/(admin)/admin/orders/_components/OrderActions.tsx
'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
};

export function OrderActions({ orderId, currentStatus, onStatusChange }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (newStatus: OrderStatus, label: string) => {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Échec');
      }

      toast.success(`${label} effectuée`);
      onStatusChange?.(orderId, newStatus);
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Pending → Processing */}
      {currentStatus === 'pending' && (
        <button
          onClick={() => updateStatus('processing', 'Validation')}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white font-light rounded-lg transition-all disabled:opacity-50"
        >
          {loading === 'processing' ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle className="w-3 h-3" />
          )}
          Valider
        </button>
      )}

      {/* Processing → Shipped / Cancelled */}
      {currentStatus === 'processing' && (
        <>
          <button
            onClick={() => updateStatus('shipped', 'Expédition')}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-lg transition-all disabled:opacity-50"
          >
            {loading === 'shipped' ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Truck className="w-3 h-3" />
            )}
            Expédier
          </button>
          <button
            onClick={() => updateStatus('cancelled', 'Annulation')}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] border border-red-500/[0.15] text-red-400/60 hover:text-red-300/70 hover:bg-red-500/[0.04] font-light rounded-lg transition-all disabled:opacity-50"
          >
            {loading === 'cancelled' ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            Annuler
          </button>
        </>
      )}

      {/* Shipped → Delivered */}
      {currentStatus === 'shipped' && (
        <button
          onClick={() => updateStatus('delivered', 'Livraison')}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 text-white font-light rounded-lg transition-all disabled:opacity-50"
        >
          {loading === 'delivered' ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle className="w-3 h-3" />
          )}
          Livrer
        </button>
      )}

      {/* Delivered / Cancelled → Lecture seule */}
      {currentStatus === 'delivered' && (
        <span className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-emerald-500/10 text-emerald-300/60 border border-emerald-500/20 font-light rounded-lg">
          <CheckCircle className="w-3 h-3" /> Livrée
        </span>
      )}
      {currentStatus === 'cancelled' && (
        <span className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-red-500/10 text-red-300/60 border border-red-500/20 font-light rounded-lg">
          <XCircle className="w-3 h-3" /> Annulée
        </span>
      )}

      {/* Réinitialiser (tous sauf pending) */}
      {currentStatus !== 'pending' && (
        <button
          onClick={() => updateStatus('pending', 'Réinitialisation')}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] text-amber-400/60 hover:text-amber-300/70 hover:bg-amber-500/[0.04] font-light rounded-lg transition-all disabled:opacity-50"
        >
          {loading === 'pending' ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Réinit.
        </button>
      )}
    </div>
  );
}