// src/app/dashboard/subscribers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, User, Search, RefreshCw, Download, ArrowLeft,
  ShieldCheck, Ban, Calendar
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { createClient } from '../../../../src/lib/supabase/client';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type Follower = {
  id: string;
  follower_id: string;
  created_at: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio_short: string | null;
  verified: boolean | null;
  blocked: boolean;
};

// Type pour les données de profil récupérées
type ProfileData = {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio_short: string | null;
  verified: boolean | null;
};

export default function SubscribersPage() {
  const t = useTranslations('dashboard.subscribers');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFollowers = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/sign-in'); return; }

    // 1. Récupérer les abonnements (follows)
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('follower_id, created_at, blocked')
      .eq('followed_id', user.id);

    if (followError) {
      console.error('Erreur follows:', followError);
      setFollowers([]);
      setLoading(false);
      return;
    }

    const followerIds = (followData || []).map((f: any) => f.follower_id);

    if (followerIds.length === 0) {
      setFollowers([]);
      setLoading(false);
      return;
    }

    // 2. Récupérer les profils correspondants
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, bio_short, verified')
      .in('id', followerIds);

    if (profilesError) {
      console.error('Erreur profils:', profilesError);
    }

    const profileMap = new Map<string, ProfileData>(
      (profilesData || []).map((p: any) => [
        p.id,
        {
          full_name: p.full_name ?? null,
          username: p.username ?? null,
          avatar_url: p.avatar_url ?? null,
          bio_short: p.bio_short ?? null,
          verified: p.verified ?? null,
        },
      ])
    );

    const combined = (followData || []).map((f: any) => {
      const profile = profileMap.get(f.follower_id) || {
        full_name: null,
        username: null,
        avatar_url: null,
        bio_short: null,
        verified: null,
      };

      return {
        id: f.follower_id, // clé unique pour le rendu
        follower_id: f.follower_id,
        created_at: f.created_at,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio_short: profile.bio_short,
        verified: profile.verified,
        blocked: f.blocked ?? false,
      };
    });

    setFollowers(combined as Follower[]);
    setLoading(false);
  };

  useEffect(() => { fetchFollowers(); }, []);

  const handleAction = async (followerId: string, action: 'block' | 'unblock') => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (action === 'block') {
      await supabase.from('user_blocks').insert({ blocker_id: user.id, blocked_id: followerId });
    } else {
      await supabase.from('user_blocks').delete().eq('blocker_id', user.id).eq('blocked_id', followerId);
    }

    setFollowers(prev => prev.map(f => f.follower_id === followerId ? { ...f, blocked: action === 'block' } : f));
    toast.success(action === 'block' ? '✅ Abonné bloqué' : '✅ Abonné débloqué');
  };

  const handleExport = () => {
    if (followers.length === 0) return;
    const headers = ['Date', 'Nom', 'Pseudo', 'Vérifié', 'Bloqué'];
    const rows = followers.map(f => [
      new Date(f.created_at).toLocaleDateString('fr-FR'),
      f.full_name || '—', f.username || '—',
      f.verified ? 'Oui' : 'Non', f.blocked ? 'Oui' : 'Non',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `abonnes_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('✅ Export CSV téléchargé');
  };

  const filtered = followers.filter(f =>
    !searchQuery ||
    f.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: followers.length,
    verified: followers.filter(f => f.verified).length,
    blocked: followers.filter(f => f.blocked).length,
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl"><Users className="w-5 h-5 text-cyan-400" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
            <p className="text-sm text-gray-400">{filtered.length} abonné{filtered.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="border-white/20 text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-1" /> 
          </Button>
          <Button variant="outline" size="sm" onClick={fetchFollowers} className="border-white/20 text-gray-300">
            <RefreshCw className="w-4 h-4 mr-1" /> 
          </Button>
          <Button size="sm" onClick={handleExport} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Download className="w-4 h-4 mr-1" /> 
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="flex gap-4 mb-6 text-sm">
        <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
          <span className="text-gray-400">Total : </span>
          <span className="text-white font-semibold">{stats.total}</span>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
          <span className="text-gray-400">Vérifiés : </span>
          <span className="text-emerald-400 font-semibold">{stats.verified}</span>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
          <span className="text-gray-400">Bloqués : </span>
          <span className="text-red-400 font-semibold">{stats.blocked}</span>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Rechercher un abonné..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white h-10"
        />
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{searchQuery ? 'Aucun résultat' : 'Aucun abonné pour le moment'}</p>
          </div>
        ) : (
          filtered.map((follower) => (
            <motion.div
              key={follower.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                {follower.avatar_url ? (
                  <img src={follower.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white text-sm truncate">{follower.full_name || follower.username || 'Anonyme'}</p>
                  {follower.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  {follower.blocked && <Ban className="w-3.5 h-3.5 text-red-400" />}
                </div>
                <p className="text-xs text-gray-500">
                  @{follower.username || 'inconnu'} · <Calendar className="w-3 h-3 inline mr-0.5" />
                  {new Date(follower.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(follower.follower_id, follower.blocked ? 'unblock' : 'block')}
                className={`text-xs h-8 ${follower.blocked ? 'border-emerald-500/30 text-emerald-300' : 'border-red-500/30 text-red-300'}`}
              >
                {follower.blocked ? 'Débloquer' : 'Bloquer'}
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}