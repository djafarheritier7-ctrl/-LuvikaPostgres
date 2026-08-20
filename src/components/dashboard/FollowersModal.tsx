// src/components/dashboard/FollowersModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Follower = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  followed_at: string;
};

export default function FollowersModal({
  isOpen,
  onClose,
  profileId,
  totalFollowers,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  totalFollowers: number;
}) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/followers?profile_id=${profileId}&limit=50`)
      .then(r => r.json())
      .then(data => { setFollowers(data.followers || []); setLoading(false); });
  }, [isOpen, profileId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
          className="glass-border bg-gray-900 rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col border border-white/10" onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
            <h2 className="text-lg font-bold text-white">Abonnés ({totalFollowers})</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X size={16} /></Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-8">Chargement...</p>
            ) : followers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Aucun abonné</p>
            ) : (
              followers.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {f.avatar_url ? <img src={f.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : (f.full_name || f.username).charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{f.full_name || f.username}</p>
                    <p className="text-gray-500 text-xs">@{f.username}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-white/10 shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-xs text-gray-400">Fermer</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}