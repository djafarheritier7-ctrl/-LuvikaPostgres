// src/components/admin/MarkAsReadButton.tsx
'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

export function MarkAsReadButton({ requestId, onSuccess }: { requestId: string; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);

  const markAsRead = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contact-requests/${requestId}/read`, { method: 'POST' });
      if (res.ok) {
        onSuccess?.();
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={markAsRead}
      disabled={loading}
      className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] text-cyan-400/60 hover:text-cyan-300/70 rounded-lg hover:bg-cyan-500/[0.04] transition-colors font-light disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <CheckCircle className="w-3 h-3" />
      )}
      Marquer lu
    </button>
  );
}