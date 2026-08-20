// src/app/admin/admin/subscriptions/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, CreditCard, Search, CheckCircle, XCircle, Calendar,
  User, Mail, RefreshCw, Crown, Building, Package,
  ChevronLeft, ChevronRight, ShieldCheck, Infinity, Clock, Edit3
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type Subscription = {
  id: string;
  plan: 'basic' | 'premium' | 'entreprise';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
  profiles: { full_name: string; username: string; email: string } | null;
};

const ITEMS_PER_PAGE = 8;

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [planFilter, setPlanFilter] = useState<'all' | 'basic' | 'premium' | 'entreprise'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // État pour le modal d'édition
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    subscription: Subscription | null;
  }>({ isOpen: false, subscription: null });
  
  // États pour le formulaire d'édition
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editIsLifetime, setEditIsLifetime] = useState(false);
  const [editPlan, setEditPlan] = useState<'basic' | 'premium' | 'entreprise'>('basic');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('subscriptions')
        .select('*, profiles!left(id, full_name, username, email)')
        .order('created_at', { ascending: false });
      setSubscriptions(data || []);
      setLoading(false);
    };
    fetchSubscriptions();
  }, []);

  const filtered = useMemo(() => {
    let result = subscriptions.filter(sub => {
      if (planFilter !== 'all' && sub.plan !== planFilter) return false;
      if (statusFilter === 'active' && sub.status !== 'active') return false;
      if (statusFilter === 'inactive' && sub.status === 'active') return false;
      if (search) {
        const term = search.toLowerCase();
        const p = sub.profiles;
        if (!p) return false;
        return (p.full_name?.toLowerCase().includes(term) || p.username?.toLowerCase().includes(term) || p.email?.toLowerCase().includes(term));
      }
      return true;
    });
    return result;
  }, [subscriptions, planFilter, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => setCurrentPage(1), [planFilter, statusFilter, search]);

  // Ouvrir le modal d'édition
  const openEditModal = (sub: Subscription) => {
    setEditModal({ isOpen: true, subscription: sub });
    setEditPlan(sub.plan);
    setEditIsLifetime(!sub.expires_at);
    setEditExpiresAt(sub.expires_at ? new Date(sub.expires_at).toISOString().slice(0, 16) : '');
  };

  // Fermer le modal d'édition
  const closeEditModal = () => {
    setEditModal({ isOpen: false, subscription: null });
  };

  // Mettre à jour l'abonnement (avec date d'expiration)
 const updateSubscription = async (id: string, data: {
  status?: string;
  plan?: string;
  expires_at?: string | null;
}) => {
  setUpdatingId(id);
  try {
    const res = await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      
      // Gérer l'erreur de doublon (409 Conflict)
      if (res.status === 409) {
        toast.error('Doublon détecté', {
          description: errorData.error || 'Cet utilisateur a déjà un abonnement pour ce plan.',
          duration: 5000,
        });
        return;
      }
      
      throw new Error(errorData.error || 'Erreur');
    }
    
    const updated = await res.json();
    toast.success('Abonnement mis à jour');
    
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    closeEditModal();
  } catch (err: any) {
    toast.error('Erreur lors de la mise à jour', {
      description: err.message,
    });
  } finally {
    setUpdatingId(null);
  }
};

  // Activer/Désactiver rapidement
const toggleStatus = async (id: string, newStatus: 'active' | 'canceled') => {
  setUpdatingId(id);
  try {
    const endpoint = newStatus === 'active' 
      ? `/api/admin/subscriptions/${id}/activate`
      : `/api/admin/subscriptions/${id}/deactivate`;
    
    const res = await fetch(endpoint, { method: 'POST' });
    
    if (!res.ok) {
      const errorData = await res.json();
      
      // Gérer l'erreur de doublon
      if (res.status === 409) {
        toast.error('Impossible d\'activer', {
          description: errorData.error || 'Un abonnement actif existe déjà pour ce plan.',
          duration: 5000,
        });
        return;
      }
      
      throw new Error(errorData.error || 'Erreur');
    }
    
    toast.success(newStatus === 'active' ? 'Abonnement activé' : 'Abonnement désactivé');
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  } catch (err: any) {
    toast.error('Erreur lors de la mise à jour', {
      description: err.message,
    });
  } finally {
    setUpdatingId(null);
  }
};

  const planConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    premium: { icon: <Crown className="w-3 h-3" />, className: 'bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20', label: 'Premium' },
    entreprise: { icon: <Building className="w-3 h-3" />, className: 'bg-purple-500/10 text-purple-300/60 border-purple-500/20', label: 'Entreprise' },
    basic: { icon: <Package className="w-3 h-3" />, className: 'bg-gray-500/10 text-gray-300/60 border-gray-500/20', label: 'Basic' },
  };

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
            <h1 className="text-xl font-semibold text-white/80">Abonnements</h1>
            <p className="text-xs text-gray-400/60 font-light mt-1">{filtered.length} abonnement{filtered.length > 1 ? 's' : ''}</p>
          </div>
          {/* Filtres rapides */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Plan */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
              {['all', 'basic', 'premium', 'entreprise'].map((v) => (
                <button key={v} onClick={() => setPlanFilter(v as any)}
                  className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors capitalize ${
                    planFilter === v ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                  }`}>{v === 'all' ? 'Tous' : v}</button>
              ))}
            </div>
            {/* Statut */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
              {['all', 'active', 'inactive'].map((v) => (
                <button key={v} onClick={() => setStatusFilter(v as any)}
                  className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors ${
                    statusFilter === v ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                  }`}>{v === 'all' ? 'Tous' : v === 'active' ? 'Actifs' : 'Inactifs'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
        <Input placeholder="Rechercher par nom, email..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl w-full" />
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <CreditCard className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
          <p className="text-gray-400/60 text-sm font-light">Aucun abonnement trouvé</p>
          {(planFilter !== 'all' || statusFilter !== 'all' || search) && (
            <Button variant="ghost" onClick={() => { setPlanFilter('all'); setStatusFilter('all'); setSearch(''); }}
              className="mt-3 h-8 text-xs text-cyan-400/60 hover:text-cyan-300/70 font-light rounded-lg">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Réinitialiser
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {paginated.map((sub) => (
            <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all w-full">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                {/* Infos */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-cyan-400/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white/70 font-medium">{sub.profiles?.full_name || 'Inconnu'}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${
                        sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-300/60 border-emerald-500/20' : 'bg-red-500/10 text-red-300/60 border-red-500/20'
                      }`}>
                        {sub.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {sub.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                      {(() => {
                        const cfg = planConfig[sub.plan] || planConfig.basic;
                        return (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${cfg.className}`}>
                            {cfg.icon}{cfg.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-[11px] text-gray-400/50 font-light mt-0.5">{sub.profiles?.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500/50 font-light">
                      <span>Créé le {new Date(sub.created_at).toLocaleDateString('fr-FR')}</span>
                      {sub.expires_at ? (
                        <span>• Expire le {new Date(sub.expires_at).toLocaleDateString('fr-FR')}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400/60">
                          • <Infinity className="w-3 h-3" /> À vie
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 lg:ml-4">
                  <span className="text-[10px] text-gray-500/40 font-light"><ShieldCheck className="w-3 h-3 inline mr-0.5" />{sub.id.slice(0, 8)}</span>
                  
                  {/* Bouton Éditer */}
                  <Button onClick={() => openEditModal(sub)}
                    className="h-7 text-[11px] border border-blue-500/[0.15] text-blue-400/60 hover:text-blue-300/70 hover:bg-blue-500/[0.04] font-light rounded-lg">
                    <Edit3 className="w-3 h-3 mr-1" />
                    Éditer
                  </Button>
                  
                  {/* Toggle Activer/Désactiver */}
                  {sub.status !== 'active' ? (
                    <Button onClick={() => toggleStatus(sub.id, 'active')} disabled={updatingId === sub.id}
                      className="h-7 text-[11px] bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white font-light rounded-lg">
                      {updatingId === sub.id ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                      Activer
                    </Button>
                  ) : (
                    <Button onClick={() => toggleStatus(sub.id, 'canceled')} disabled={updatingId === sub.id}
                      className="h-7 text-[11px] border border-red-500/[0.15] text-red-400/60 hover:text-red-300/70 hover:bg-red-500/[0.04] font-light rounded-lg">
                      {updatingId === sub.id ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      Désactiver
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal d'édition de l'abonnement */}
      {editModal.isOpen && editModal.subscription && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeEditModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-xl">
                  <Edit3 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white/80">Modifier l'abonnement</h2>
                  <p className="text-xs text-gray-400/60 font-light">
                    {editModal.subscription.profiles?.full_name}
                  </p>
                </div>
              </div>
              <button onClick={closeEditModal} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Plan */}
              <div>
                <label className="text-xs text-gray-400/60 font-light mb-2 block">Plan</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value as any)}
                  className="w-full h-9 px-3 text-xs bg-white/[0.03] border border-white/[0.08] text-white/80 rounded-xl"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="entreprise">Entreprise</option>
                </select>
              </div>

              {/* À vie ou avec expiration */}
              <div>
                <label className="text-xs text-gray-400/60 font-light mb-2 block">Type d'abonnement</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditIsLifetime(true)}
                    className={`flex-1 h-9 rounded-xl text-xs font-light transition-all border ${
                      editIsLifetime
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/60'
                        : 'bg-white/[0.03] border-white/[0.08] text-gray-400/60 hover:text-white/70'
                    }`}
                  >
                    <Infinity className="w-3.5 h-3.5 inline mr-1.5" />
                    À vie
                  </button>
                  <button
                    onClick={() => setEditIsLifetime(false)}
                    className={`flex-1 h-9 rounded-xl text-xs font-light transition-all border ${
                      !editIsLifetime
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400/60'
                        : 'bg-white/[0.03] border-white/[0.08] text-gray-400/60 hover:text-white/70'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                    Avec expiration
                  </button>
                </div>
              </div>

              {/* Date d'expiration (si pas à vie) */}
              {!editIsLifetime && (
                <div>
                  <label className="text-xs text-gray-400/60 font-light mb-2 block">Date d'expiration</label>
                  <input
                    type="datetime-local"
                    value={editExpiresAt}
                    onChange={(e) => setEditExpiresAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full h-9 px-3 text-xs bg-white/[0.03] border border-white/[0.08] text-white/80 rounded-xl [color-scheme:dark]"
                  />
                  <p className="text-[10px] text-gray-500/50 font-light mt-1">
                    L'abonnement expirera automatiquement à cette date
                  </p>
                </div>
              )}

              {/* Message si à vie */}
              {editIsLifetime && (
                <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15">
                  <p className="text-xs text-emerald-400/60 font-light flex items-center gap-2">
                    <Infinity className="w-3.5 h-3.5" />
                    Abonnement à vie - n'expire jamais
                  </p>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={closeEditModal}
                  className="flex-1 h-9 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-xl transition-all border border-white/[0.08]"
                >
                  Annuler
                </button>
                <button
                  onClick={() => updateSubscription(editModal.subscription!.id, {
                    plan: editPlan,
                    expires_at: editIsLifetime ? null : new Date(editExpiresAt).toISOString(),
                    status: 'active', // On active automatiquement si on définit les paramètres
                  })}
                  disabled={updatingId === editModal.subscription!.id}
                  className="flex-1 h-9 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-xl transition-all disabled:opacity-50"
                >
                  {updatingId === editModal.subscription!.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Sauvegarder'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
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
    </div>
  );
}