// src/app/admin/admin/nfc/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Smartphone, Search, Plus, X, RefreshCw,
  Lock, Unlock, AlertTriangle, XCircle, User, Calendar,
  Key, CheckCircle, Mail, Send, ShieldCheck, Building, Crown
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type NfcCard = {
  id: string;
  card_id: string;
  status: 'active' | 'lost' | 'blocked' | 'inactive';
  activated_at: string | null;
  created_at: string;
  profiles: { full_name: string; username: string; email: string; plan?: string | null } | null;
  matricule?: string | null;
};

const ITEMS_PER_PAGE = 8;

export default function NfcPage() {
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'lost' | 'blocked' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [usersWithOrders, setUsersWithOrders] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [createdCard, setCreatedCard] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [sendingMatricule, setSendingMatricule] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('nfc_cards')
        .select('*, profiles!left(full_name, username, email, plan)')
        .order('created_at', { ascending: false });
      setCards(data || []);
      setLoading(false);
    };
    fetchCards();
  }, []);

  const filtered = useMemo(() => {
    let result = cards.filter(card => {
      if (statusFilter !== 'all' && card.status !== statusFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          card.card_id.toLowerCase().includes(term) ||
          card.profiles?.full_name?.toLowerCase().includes(term) ||
          card.profiles?.username?.toLowerCase().includes(term) ||
          card.profiles?.email?.toLowerCase().includes(term)
        );
      }
      return true;
    });
    return result;
  }, [cards, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => setCurrentPage(1), [statusFilter, search]);

  const statusConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    active: { icon: <Unlock className="w-3 h-3" />, className: 'bg-emerald-500/10 text-emerald-300/60 border-emerald-500/20', label: 'Active' },
    lost: { icon: <AlertTriangle className="w-3 h-3" />, className: 'bg-amber-500/10 text-amber-300/60 border-amber-500/20', label: 'Perdue' },
    blocked: { icon: <Lock className="w-3 h-3" />, className: 'bg-red-500/10 text-red-300/60 border-red-500/20', label: 'Bloquée' },
    inactive: { icon: <XCircle className="w-3 h-3" />, className: 'bg-gray-500/10 text-gray-300/60 border-gray-500/20', label: 'Inactive' },
  };

  const planConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    premium: { icon: <Crown className="w-3 h-3" />, className: 'bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20', label: 'Premium' },
    entreprise: { icon: <Building className="w-3 h-3" />, className: 'bg-purple-500/10 text-purple-300/60 border-purple-500/20', label: 'Entreprise' },
    basic: { icon: <User className="w-3 h-3" />, className: 'bg-gray-500/10 text-gray-300/60 border-gray-500/20', label: 'Basic' },
  };

  const fetchUsersWithOrders = async () => {
    setLoadingUsers(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('id, user_id, quantity, status, created_at, profiles!inner(id, full_name, username, email, plan)')
      .in('status', ['pending', 'processing'])
      .eq('product_type', 'nfc_premium')
      .order('created_at', { ascending: false });
    setUsersWithOrders(data || []);
    setLoadingUsers(false);
  };

  const openCreateModal = async () => {
    setShowCreateModal(true);
    await fetchUsersWithOrders();
  };

  const handleCreateCard = async () => {
    if (!selectedUserId) { toast.warning('Sélectionnez un utilisateur'); return; }
    setCreatingCard(true);
    try {
      const order = usersWithOrders.find(o => o.user_id === selectedUserId);
      const res = await fetch('/api/admin/nfc/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order?.id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setCreatedCard(result.card);
      toast.success('Carte NFC créée');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingCard(false);
    }
  };

  const handleSendMatricule = async () => {
    if (!createdCard?.matricule) return;
    setSendingMatricule(true);
    try {
      const order = usersWithOrders.find(o => o.user_id === createdCard.user_id);
      const res = await fetch('/api/admin/nfc/send-matricule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: createdCard.id, email: order?.profiles?.email, matricule: createdCard.matricule, full_name: order?.profiles?.full_name }),
      });
      if (!res.ok) throw new Error();
      toast.success('Matricule envoyé par email');
      setShowCreateModal(false);
      setCreatedCard(null);
      setSelectedUserId(null);
      setModalSearch('');
      window.location.reload();
    } catch {
      toast.error('Erreur envoi email');
    } finally {
      setSendingMatricule(false);
    }
  };

  const updateCardStatus = async (cardId: string, action: 'block' | 'activate') => {
    const res = await fetch(`/api/admin/nfc/${cardId}/${action}`, { method: 'POST' });
    if (res.ok) { toast.success(action === 'block' ? 'Carte bloquée' : 'Carte réactivée'); window.location.reload(); }
    else { toast.error('Erreur'); }
  };

  if (loading) return <Loading />;

  const filteredUsers = usersWithOrders.filter(o => {
    if (!modalSearch) return true;
    const t = modalSearch.toLowerCase();
    return o.profiles?.full_name?.toLowerCase().includes(t) || o.profiles?.email?.toLowerCase().includes(t);
  });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white/80">Cartes NFC</h1>
            <p className="text-xs text-gray-400/60 font-light mt-1">{filtered.length} carte{filtered.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
              {['all', 'active', 'lost', 'blocked', 'inactive'].map((v) => (
                <button key={v} onClick={() => setStatusFilter(v as any)}
                  className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors ${
                    statusFilter === v ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                  }`}>{v === 'all' ? 'Tous' : v === 'active' ? 'Actives' : v === 'lost' ? 'Perdues' : v === 'blocked' ? 'Bloquées' : 'Inactives'}</button>
              ))}
            </div>
            <Button onClick={openCreateModal} className="h-8 text-xs bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 text-white font-light rounded-lg">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Créer
            </Button>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
        <Input placeholder="Rechercher par nom, email ou ID carte..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl w-full" />
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <Smartphone className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
          <p className="text-gray-400/60 text-sm font-light">Aucune carte NFC trouvée</p>
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {paginated.map((card) => {
            const st = statusConfig[card.status] || statusConfig.inactive;
            const pl = planConfig[card.profiles?.plan || 'basic'] || planConfig.basic;
            return (
              <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all w-full">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-4 h-4 text-amber-400/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-white/70 font-medium">{card.profiles?.full_name || 'Sans propriétaire'}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${st.className}`}>{st.icon}{st.label}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${pl.className}`}>{pl.icon}{pl.label}</span>
                      </div>
                      <p className="text-[11px] text-gray-500/40 font-mono mt-0.5">{card.card_id}</p>
                      {card.matricule && <p className="text-[11px] text-amber-400/50 font-light mt-0.5">Matricule: {card.matricule}</p>}
                      <p className="text-[10px] text-gray-500/40 font-light mt-0.5">Créée le {new Date(card.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 lg:ml-4">
                    {card.status === 'active' ? (
                      <Button onClick={() => updateCardStatus(card.id, 'block')}
                        className="h-7 text-[11px] border border-red-500/[0.15] text-red-400/60 hover:text-red-300/70 hover:bg-red-500/[0.04] font-light rounded-lg">
                        <Lock className="w-3 h-3 mr-1" /> Bloquer
                      </Button>
                    ) : (
                      <Button onClick={() => updateCardStatus(card.id, 'activate')}
                        className="h-7 text-[11px] bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white font-light rounded-lg">
                        <RefreshCw className="w-3 h-3 mr-1" /> Réactiver
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <p className="text-[11px] text-gray-500/50 font-light">Page {currentPage} sur {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(page => (
              <Button key={page} variant="ghost" size="sm" onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 p-0 text-xs font-light rounded-lg ${page === currentPage ? 'bg-white/[0.06] text-white/80' : 'text-gray-400/60 hover:text-white/70'}`}>
                {page}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowCreateModal(false); setCreatedCard(null); setSelectedUserId(null); }}>
          <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white/80">{createdCard ? 'Matricule généré' : 'Créer une carte NFC'}</h2>
              <button onClick={() => { setShowCreateModal(false); setCreatedCard(null); setSelectedUserId(null); }} className="text-gray-400/60 hover:text-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!createdCard ? (
              <div className="space-y-3">
                <Input placeholder="Rechercher un utilisateur..." value={modalSearch} onChange={e => setModalSearch(e.target.value)}
                  className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
                
                {loadingUsers ? (
                  <p className="text-xs text-gray-400/60 font-light text-center py-8">Chargement...</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-1.5">
                    {filteredUsers.map((order) => (
                      <div key={order.id} onClick={() => setSelectedUserId(order.user_id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          selectedUserId === order.user_id ? 'bg-amber-500/[0.08] border border-amber-500/[0.15]' : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
                        }`}>
                        <p className="text-xs text-white/70 font-medium">{order.profiles?.full_name}</p>
                        <p className="text-[11px] text-gray-400/50 font-light">{order.profiles?.email} • {order.quantity} carte{order.quantity > 1 ? 's' : ''}</p>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && <p className="text-xs text-gray-400/60 font-light text-center py-4">Aucune commande en attente</p>}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1 h-8 text-xs text-gray-400/60 hover:text-white/70 font-light rounded-lg">Annuler</Button>
                  <Button onClick={handleCreateCard} disabled={!selectedUserId || creatingCard}
                    className="flex-1 h-8 text-xs bg-gradient-to-r from-amber-600/80 to-orange-600/80 text-white font-light rounded-lg">
                    {creatingCard ? 'Création...' : 'Créer la carte'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.08] text-center">
                  <p className="text-[11px] text-amber-400/60 font-light mb-1">Matricule généré</p>
                  <p className="text-2xl font-bold text-amber-400/80 tracking-wider">{createdCard.matricule}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setCreatedCard(null)} className="flex-1 h-8 text-xs text-gray-400/60 hover:text-white/70 font-light rounded-lg">Autre carte</Button>
                  <Button onClick={handleSendMatricule} disabled={sendingMatricule}
                    className="flex-1 h-8 text-xs bg-gradient-to-r from-emerald-600/80 to-cyan-600/80 text-white font-light rounded-lg">
                    <Send className="w-3 h-3 mr-1" /> {sendingMatricule ? 'Envoi...' : 'Envoyer par email'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}