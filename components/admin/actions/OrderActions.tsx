// src/components/admin/actions/OrderActions.tsx
'use client';

import { Button } from '../../../components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner'; // ✅ toast moderne (léger, pas de CSS lourde)
import { useTranslations } from 'next-intl';

type OrderActionProps = {
  orderId: string;
  onActionSuccess?: () => void; // ✅ callback optionnel pour refresh parent
};

export function OrderActions({ orderId, onActionSuccess }: OrderActionProps) {
  const t = useTranslations('admin.orders');

  const handleValidate = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success(t('action_success.validate'));
        onActionSuccess?.();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Échec validation');
      }
    } catch (err: any) {
      console.error('❌ Erreur validation:', err);
      toast.error(t('action_error.validate') + (err.message ? `: ${err.message}` : ''));
    }
  };

  const handleCancel = async () => {
    if (!confirm(t('confirm_cancel'))) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success(t('action_success.cancel'));
        onActionSuccess?.();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Échec annulation');
      }
    } catch (err: any) {
      console.error('❌ Erreur annulation:', err);
      toast.error(t('action_error.cancel') + (err.message ? `: ${err.message}` : ''));
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400"
        onClick={handleValidate}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        {t('validate_button')}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        onClick={handleCancel}
      >
        <XCircle className="h-4 w-4 mr-1" />
        {t('cancel_button')}
      </Button>
    </div>
  );
}