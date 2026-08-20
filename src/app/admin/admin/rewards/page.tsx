// src/app/admin/rewards/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Trophy, Search, User as UserIcon, Crown, Building,
  ChevronLeft, ChevronRight, Gift, Percent, Medal, Star,
  TrendingUp, Users, Filter, Shield
} from 'lucide-react';
import Link from 'next/link';
import Loading from '@/src/components/system/Loading';

const USERS_PER_PAGE = 10;

export default function RewardsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'activated'>('all');
  const [stats, setStats] = useState({ total: 0, activated: 0, eligible: 0 });

  useEffect(() => {
    const fetchRewardUsers = async () => {
      try {
        const res = await fetch('/api/admin/rewards');
        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
        const data = await res.json();
        const allUsers = data.users || [];
        setUsers(allUsers);
        setStats({
          total: allUsers.length,
          eligible: allUsers.filter((u: any) => !u.badges?.includes('scan_10k_reward')).length,
          activated: allUsers.filter((u: any) => u.badges?.includes('scan_10k_reward')).length,
        });
      } catch (err) {
        console.error('Erreur récupération récompenses:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRewardUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    // Filtre statut
    if (statusFilter === 'activated' && !u.badges?.includes('scan_10k_reward')) return false;
    if (statusFilter === 'eligible' && u.badges?.includes('scan_10k_reward')) return false;

    // Filtre recherche
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const getPlanBadge = (plan?: string) => {
    const configs: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
      premium: { icon: <Crown className="w-3 h-3" />, className: 'bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20', label: 'Premium' },
      entreprise: { icon: <Building className="w-3 h-3" />, className: 'bg-purple-500/10 text-purple-300/60 border-purple-500/20', label: 'Entreprise' },
      basic: { icon: <UserIcon className="w-3 h-3" />, className: 'bg-gray-500/10 text-gray-300/60 border-gray-500/20', label: 'Basic' },
    };
    const config = configs[plan || 'basic'] || configs.basic;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${config.className}`}>
        {config.icon}{config.label}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour au dashboard
        </Link>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-500/20 border border-amber-500/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              Récompenses 10K Scans
            </h1>
            <p className="text-xs text-gray-400/60 font-light mt-1.5 ml-10">
              Gérez les utilisateurs éligibles à la réduction de -5% sur leur abonnement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400/60" />
            <span className="text-[10px] text-amber-400/50 font-light">Vue administrateur système</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div whileHover={{ y: -2 }} className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/[0.06] to-yellow-500/[0.03] border border-amber-500/20 text-center transition-all">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white">{stats.total}</p>
          <p className="text-[10px] text-amber-400/60 font-light">Total 10K+</p>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500/[0.06] to-teal-500/[0.03] border border-emerald-500/20 text-center transition-all">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
            <Gift className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">{stats.activated}</p>
          <p className="text-[10px] text-emerald-400/60 font-light">Activées</p>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="rounded-2xl p-4 bg-gradient-to-br from-cyan-500/[0.06] to-blue-500/[0.03] border border-cyan-500/20 text-center transition-all">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-2">
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-white">-5%</p>
          <p className="text-[10px] text-cyan-400/60 font-light">Réduction</p>
        </motion.div>
      </div>

      {/* Filtres + Recherche */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
          {[
            { value: 'all', label: 'Tous', icon: <Users className="w-3 h-3" /> },
            { value: 'eligible', label: 'Éligibles', icon: <Trophy className="w-3 h-3" /> },
            { value: 'activated', label: 'Activées', icon: <Gift className="w-3 h-3" /> },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => { setStatusFilter(item.value as any); setCurrentPage(1); }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-light rounded-md transition-colors whitespace-nowrap ${
                statusFilter === item.value ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
          <Input
            placeholder="Rechercher par nom, email ou username..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl w-full"
          />
        </div>
      </div>

      {/* Liste */}
      {paginatedUsers.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-amber-400/40" />
          </div>
          <p className="text-gray-400/60 text-sm font-light mb-1">Aucun utilisateur trouvé</p>
          <p className="text-xs text-gray-500/40 font-light">
            {statusFilter !== 'all' ? 'Essayez de changer les filtres' : 'Aucun utilisateur n\'a atteint 10 000 scans'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {paginatedUsers.map((u, index) => {
            const hasActivated = u.badges?.includes('scan_10k_reward');
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`rounded-2xl p-4 backdrop-blur-sm border transition-all w-full ${
                  hasActivated
                    ? 'bg-emerald-500/[0.02] border-emerald-500/20 hover:bg-emerald-500/[0.04]'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  {/* Infos utilisateur */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        hasActivated
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                          : 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20'
                      }`}>
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <UserIcon className={`w-4 h-4 ${hasActivated ? 'text-emerald-400/60' : 'text-amber-400/60'}`} />
                        )}
                      </div>
                      {/* Pastille statut */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        hasActivated ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-white/70 font-medium truncate">{u.full_name}</p>
                        {getPlanBadge(u.plan)}
                        {hasActivated ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-emerald-500/10 text-emerald-300/60 border-emerald-500/20">
                            <Gift className="w-3 h-3" />-5% Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-amber-500/10 text-amber-300/60 border-amber-500/20">
                            <Trophy className="w-3 h-3" />Éligible
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400/50 font-light mt-0.5">@{u.username}</p>
                      <p className="text-[11px] text-gray-500/40 font-light truncate mt-0.5">{u.email}</p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 flex-shrink-0 lg:ml-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-amber-400 tabular-nums">
                        {(u.scans_count || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-500 font-light">scans</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 font-medium">
                        {hasActivated ? (
                          <span className="text-emerald-400">-5%</span>
                        ) : (
                          <span className="text-amber-400">-5%</span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500 font-light">réduction</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500/50 font-light">
                        {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-gray-500/40 font-light">Inscription</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-gray-500/50 font-light">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} · Page {currentPage}/{totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            ).map(page => (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 p-0 text-xs font-light rounded-lg ${
                  page === currentPage
                    ? 'bg-white/[0.06] text-white/80'
                    : 'text-gray-400/60 hover:text-white/70'
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-gray-500/30 font-light pt-4 border-t border-white/[0.04]">
        <span>Les réductions s'appliquent automatiquement au prochain paiement</span>
        <span>Mis à jour en temps réel</span>
      </div>
    </div>
  );
}