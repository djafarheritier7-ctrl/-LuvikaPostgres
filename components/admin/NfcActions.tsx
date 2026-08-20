 // src/components/admin/NfcActions.tsx
'use client';

import { Button } from '../../components/ui/button';
import { ArchiveX } from 'lucide-react';

export function NfcActions({ id, status }: { id: string; status: string }) {
  if (status === 'blocked') return null;

  const handleBlock = async () => {
    if (confirm('Bloquer définitivement cette carte ?')) {
      const res = await fetch(`/api/admin/nfc/${id}/block`, {
        method: 'POST',
      });
      if (res.ok) window.location.reload();
    }
  };

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleBlock}
    >
      <ArchiveX className="h-4 w-4 mr-1" /> Bloquer
    </Button>
  );
}