// src/app/admin/admin/contact-requests/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Mail, User, Send, RefreshCw,
  ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight,
  UserPlus, PartyPopper, Clock, CheckCircle, Users
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type NewUser = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  plan: string;
  created_at: string;
  welcome_email_sent: boolean;
};

const ITEMS_PER_PAGE = 8;

export default function NewUsersPage() {
  const [users, setUsers] = useState<NewUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'not_sent' | 'sent'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchNewUsers = async () => {
      const supabase = createClient();
      // Récupérer les utilisateurs créés dans les 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username, email, plan, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      // Vérifier si un email de bienvenue a déjà été envoyé (localStorage admin)
      const sentUsers = JSON.parse(localStorage.getItem('luvika_welcome_emails_sent') || '[]');
      
      setUsers((data || []).map((u: any) => ({
        ...u,
        welcome_email_sent: sentUsers.includes(u.id),
      })));
      setLoading(false);
    };
    fetchNewUsers();
  }, []);

  const filtered = useMemo(() => {
    let result = users.filter(u => {
      if (filter === 'not_sent' && u.welcome_email_sent) return false;
      if (filter === 'sent' && !u.welcome_email_sent) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          u.full_name?.toLowerCase().includes(term) ||
          u.username?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
        );
      }
      return true;
    });
    return result;
  }, [users, filter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => setCurrentPage(1), [filter, search]);

  const handleSendWelcomeEmail = async (userId: string, email: string, name: string) => {
    setSendingIds(prev => new Set(prev).add(userId));
    try {
      const res = await fetch('/api/admin/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, name }),
      });

      if (res.ok) {
        // Marquer comme envoyé dans le localStorage admin
        const sentUsers = JSON.parse(localStorage.getItem('luvika_welcome_emails_sent') || '[]');
        sentUsers.push(userId);
        localStorage.setItem('luvika_welcome_emails_sent', JSON.stringify(sentUsers));

        setUsers(prev => prev.map(u => u.id === userId ? { ...u, welcome_email_sent: true } : u));
        toast.success('Email de bienvenue envoyé !', {
          description: `Envoyé à ${name}`,
          icon: <PartyPopper className="w-4 h-4 text-amber-400" />,
        });
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Erreur', { description: 'Impossible d\'envoyer l\'email' });
    } finally {
      setSendingIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleSendAll = async () => {
    const notSent = users.filter(u => !u.welcome_email_sent);
    if (notSent.length === 0) {
      toast.info('Tous les emails ont déjà été envoyés');
      return;
    }
    if (!confirm(`Envoyer un email de bienvenue aux ${notSent.length} nouveaux utilisateurs ?`)) return;

    for (const user of notSent) {
      await handleSendWelcomeEmail(user.id, user.email, user.full_name);
    }
  };

  const getPlanBadge = (plan: string) => {
    const configs: Record<string, { className: string; label: string }> = {
      premium: { className: 'bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20', label: 'Premium' },
      entreprise: { className: 'bg-purple-500/10 text-purple-300/60 border-purple-500/20', label: 'Entreprise' },
      basic: { className: 'bg-gray-500/10 text-gray-300/60 border-gray-500/20', label: 'Basic' },
    };
    const config = configs[plan] || configs.basic;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const notSentCount = users.filter(u => !u.welcome_email_sent).length;

  if (loading) return <Loading />;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-cyan-400" />
              </div>
              Nouveaux utilisateurs
            </h1>
            <p className="text-xs text-gray-400/60 font-light mt-1.5 ml-10">
              Souhaitez la bienvenue aux nouveaux membres de LUVIKA
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notSentCount > 0 && (
              <Button
                onClick={handleSendAll}
                className="h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-lg"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Envoyer à tous ({notSentCount})
              </Button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-400/60 font-light">{users.length} nouveaux / 7 jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-cyan-500/[0.06] to-blue-500/[0.03] border border-cyan-500/20 text-center">
          <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{users.length}</p>
          <p className="text-[10px] text-cyan-400/60 font-light">Nouveaux</p>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500/[0.06] to-teal-500/[0.03] border border-emerald-500/20 text-center">
          <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{users.length - notSentCount}</p>
          <p className="text-[10px] text-emerald-400/60 font-light">Accueillis</p>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/[0.06] to-yellow-500/[0.03] border border-amber-500/20 text-center">
          <Mail className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{notSentCount}</p>
          <p className="text-[10px] text-amber-400/60 font-light">En attente</p>
        </div>
      </div>

      {/* Filtres + Recherche */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'not_sent', label: 'En attente' },
            { value: 'sent', label: 'Accueillis' },
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl w-full"
          />
        </div>
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <UserPlus className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
          <p className="text-gray-400/60 text-sm font-light">Aucun nouvel utilisateur trouvé</p>
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {paginated.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-4 backdrop-blur-sm border transition-all w-full ${
                u.welcome_email_sent
                  ? 'bg-emerald-500/[0.02] border-emerald-500/20'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    u.welcome_email_sent
                      ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                      : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
                  }`}>
                    <User className={`w-4 h-4 ${u.welcome_email_sent ? 'text-emerald-400/60' : 'text-cyan-400/60'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white/70 font-medium truncate">{u.full_name}</p>
                      {getPlanBadge(u.plan)}
                      {u.welcome_email_sent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-emerald-500/10 text-emerald-300/60 border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />Accueilli
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light bg-amber-500/10 text-amber-300/60 border-amber-500/20">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400/50 font-light mt-0.5">@{u.username}</p>
                    <p className="text-[11px] text-gray-500/40 font-light truncate mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 lg:ml-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500/40 font-light flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!u.welcome_email_sent && (
                    <Button
                      onClick={() => handleSendWelcomeEmail(u.id, u.email, u.full_name)}
                      disabled={sendingIds.has(u.id)}
                      className="h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-lg"
                    >
                      {sendingIds.has(u.id) ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Accueillir
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <p className="text-[11px] text-gray-500/50 font-light">Page {currentPage} sur {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(page => (
              <Button key={page} variant="ghost" size="sm" onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 p-0 text-xs font-light rounded-lg ${page === currentPage ? 'bg-white/[0.06] text-white/80' : 'text-gray-400/60 hover:text-white/70'}`}>
                {page}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-gray-500/30 font-light pt-4 border-t border-white/[0.04]">
        <span>Les emails sont envoyés via le service SMTP configuré</span>
        <span>7 derniers jours</span>
      </div>
    </div>
  );
}