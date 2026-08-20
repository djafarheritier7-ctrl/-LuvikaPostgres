// src/app/admin/admin/users/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserActions } from '@/components/admin/UserActions';
import {
  ArrowLeft, Users, Search, User as UserIcon, Crown, Building,
  Lock, Unlock, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Loading from '@/src/components/system/Loading';

const USERS_PER_PAGE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
        const data = await res.json();
        const usersWithStatus = (Array.isArray(data) ? data : []).map((u: any) => ({
          ...u,
          isBanned: u.banned_until && u.banned_until !== 'null' && new Date(u.banned_until) > new Date(),
        }));
        setUsers(usersWithStatus);
      } catch (err) {
        console.error('Erreur récupération utilisateurs:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = users.filter(user => {
      if (filter === 'banned') return user.isBanned;
      if (filter === 'active') return !user.isBanned;
      return true;
    });

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(u =>
        u.full_name?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [users, filter, search]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  useEffect(() => setCurrentPage(1), [filter, search]);

  const getRoleBadge = (plan?: string) => {
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

  const getStatusBadge = (isBanned: boolean) => (
    isBanned ? (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-red-500/10 text-red-300/60 border-red-500/20">
        <Lock className="w-3 h-3" />Banni
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-emerald-500/10 text-emerald-300/60 border-emerald-500/20">
        <Unlock className="w-3 h-3" />Actif
      </span>
    )
  );

  if (loading) return <Loading />;

  return (
    // ✅ Container fluide qui prend toute la largeur disponible
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white/80">Utilisateurs</h1>
            <p className="text-xs text-gray-400/60 font-light mt-1">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
              {[
                { value: 'all', label: 'Tous' },
                { value: 'active', label: 'Actifs' },
                { value: 'banned', label: 'Bannis' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value as any)}
                  className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors whitespace-nowrap ${
                    filter === item.value ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
        <Input
          placeholder="Rechercher par nom, email ou username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl w-full"
        />
      </div>

      {/* Liste - ✅ Grid responsive qui s'adapte à toutes les largeurs */}
      {paginatedUsers.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <Users className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
          <p className="text-gray-400/60 text-sm font-light">Aucun utilisateur trouvé</p>
          {(filter !== 'all' || search) && (
            <Button
              variant="ghost"
              onClick={() => { setFilter('all'); setSearch(''); }}
              className="mt-3 h-8 text-xs text-cyan-400/60 hover:text-cyan-300/70 font-light rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Réinitialiser les filtres
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {paginatedUsers.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all w-full"
            >
              {/* ✅ Layout responsive : empilé sur mobile, en ligne sur desktop */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                {/* Infos utilisateur */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4 h-4 text-cyan-400/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white/70 font-medium truncate">{u.full_name}</p>
                      {getStatusBadge(u.isBanned)}
                      {getRoleBadge(u.plan)}
                    </div>
                    <p className="text-[11px] text-gray-400/50 font-light mt-0.5">@{u.username}</p>
                    <p className="text-[11px] text-gray-500/40 font-light truncate mt-0.5">{u.email}</p>
                  </div>
                </div>
                
                {/* Actions - ✅ À droite sur desktop, en dessous sur mobile */}
                <div className="flex items-center justify-between lg:justify-end gap-2 flex-shrink-0 lg:ml-4">
                  <span className="text-[10px] text-gray-500/50 font-light">
                    {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <UserActions id={u.id} isSelf={false} username={u.username || 'utilisateur'} isBanned={u.isBanned} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination - ✅ Responsive */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <p className="text-[11px] text-gray-500/50 font-light">
            Page {currentPage} sur {totalPages}
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
    </div>
  );
}