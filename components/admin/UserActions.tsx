'use client';

import { useState } from 'react';
import { toast } from 'sonner'; // ✅
import { Button } from '../../components/ui/button';
import { ShieldX, ShieldCheck } from 'lucide-react';
import { ConfirmBanModal } from './ConfirmBanModal';
import { ConfirmUnbanModal } from './ConfirmUnbanModal';

export function UserActions({ 
  id, 
  isSelf, 
  username, 
  isBanned 
}: { 
  id: string; 
  isSelf: boolean; 
  username: string;
  isBanned: boolean;
}) {
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);

  if (isSelf) return null;

  const handleBan = async () => {
    const res = await fetch(`/api/admin/users/${id}/ban`, { method: 'POST' });
    if (res.ok) {
      toast.success(`✅ ${username} a été banni !`);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error('❌ Échec du bannissement');
    }
  };

  const handleUnban = async () => {
    const res = await fetch(`/api/admin/users/${id}/unban`, { method: 'POST' });
    if (res.ok) {
      toast.success(`✅ ${username} a été débanni !`);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error('❌ Échec du débannissement');
    }
  };

  if (isBanned) {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsUnbanModalOpen(true)}
        >
          <ShieldCheck className="h-4 w-4 mr-1 text-green-400" /> Débannir
        </Button>
        <ConfirmUnbanModal
          isOpen={isUnbanModalOpen}
          onOpenChange={setIsUnbanModalOpen}
          onConfirm={handleUnban}
          username={username}
        />
      </>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => setIsBanModalOpen(true)}
      >
        <ShieldX className="h-4 w-4 mr-1" /> Bannir
      </Button>
      <ConfirmBanModal
        isOpen={isBanModalOpen}
        onOpenChange={setIsBanModalOpen}
        onConfirm={handleBan}
        username={username}
      />
    </>
  );
}