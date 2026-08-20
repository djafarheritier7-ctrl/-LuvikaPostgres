// src/components/admin/UpgradeRequestActions.tsx
'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, Loader2, ArrowRight, Building2 } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  id: string;
  currentPlan?: 'basic' | 'premium';
  targetPlan?: 'entreprise';
};

export function UpgradeRequestActions({ id, currentPlan, targetPlan = 'entreprise' }: Props) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const displayCurrentPlan = currentPlan || 'basic';

  const approve = async () => {
    setLoading('approve');
    try {
      const res = await fetch(`/api/admin/upgrade-requests/${id}/approved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes || null }),
      });
      if (!res.ok) throw new Error();
      toast.success('Abonnement approuvé', { description: `Plan mis à jour vers "${targetPlan}".` });
      window.location.reload();
    } catch {
      toast.error('Erreur', { description: 'Impossible d\'approuver la demande.' });
    } finally {
      setLoading(null);
      setShowConfirm(false);
    }
  };

  const reject = async () => {
    setLoading('reject');
    try {
      const res = await fetch(`/api/admin/upgrade-requests/${id}/rejected`, { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Demande rejetée');
      window.location.reload();
    } catch {
      toast.error('Erreur', { description: 'Impossible de rejeter la demande.' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] space-y-3">
        {/* Plan actuel → cible */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center gap-2 text-xs text-gray-400/60 font-light">
            <Building2 className="w-3.5 h-3.5" />
            Changement de plan
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400/60 font-light bg-white/[0.03] px-2 py-0.5 rounded-lg">
              {displayCurrentPlan}
            </span>
            <ArrowRight className="w-3 h-3 text-gray-500/50" />
            <span className="text-[11px] text-purple-300/60 font-light bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
              {targetPlan}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[11px] text-gray-400/60 font-light flex items-center gap-1 mb-1">
            <MessageSquare className="w-3 h-3" />
            Note interne (optionnelle)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Commentaire admin..."
            className="w-full text-xs bg-white/[0.03] border border-white/[0.08] text-white/80 rounded-xl p-2.5 resize-none font-light placeholder:text-gray-500/40"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={reject}
            disabled={loading !== null}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-xs text-red-400/60 hover:text-red-300/70 rounded-lg border border-red-500/[0.08] hover:bg-red-500/[0.04] transition-colors font-light disabled:opacity-50"
          >
            {loading === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Rejeter
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading !== null}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-xs bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white font-light rounded-lg transition-all disabled:opacity-50"
          >
            {loading === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Approuver
          </button>
        </div>
      </div>

      {/* Modal confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08]" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-white/80 mb-2">Confirmer l'activation</h3>
            <p className="text-xs text-gray-400/60 font-light mb-4">
              Cette action activera un abonnement {targetPlan} et autorisera la création d'une entreprise.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 h-8 text-xs text-gray-400/60 hover:text-white/70 rounded-lg hover:bg-white/[0.04] transition-colors font-light">
                Annuler
              </button>
              <button onClick={approve} disabled={loading === 'approve'} className="flex-1 h-8 text-xs bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white font-light rounded-lg transition-all disabled:opacity-50">
                {loading === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}