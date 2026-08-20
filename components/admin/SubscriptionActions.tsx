// src/components/admin/SubscriptionActions.tsx
'use client';

import { Button } from '../../components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export function SubscriptionActions({ id }: { id: string }) {
  const handleActivate = async () => {
    const res = await fetch(`/api/admin/subscriptions/${id}/activate`, {
      method: 'POST',
    });
    if (res.ok) window.location.reload();
  };

  const handleDeactivate = async () => {
    const res = await fetch(`/api/admin/subscriptions/${id}/deactivate`, {
      method: 'POST',
    });
    if (res.ok) window.location.reload();
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400"
        onClick={handleActivate}
      >
        <CheckCircle className="h-4 w-4 mr-1" /> Activer
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleDeactivate}
      >
        <XCircle className="h-4 w-4 mr-1" /> Désactiver
      </Button>
    </div>
  );
}