// src/app/[locale]/admin/admin/inactive-accounts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  UserX, Mail, AlertTriangle, Trash2, Clock, 
  Search, Filter, RefreshCw,
  Loader2, CheckCircle, XCircle, Send
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type InactiveUser = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
  plan: string;
  days_inactive: number;
  warning_sent: boolean;
  warning_sent_at: string | null;
  scheduled_deletion: string | null;
};

export default function InactiveAccountsPage() {
  const t = useTranslations();
  const [users, setUsers] = useState<InactiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'warned' | 'not_warned'>('all');

  const fetchInactiveUsers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Récupérer le token de session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Session expirée');
        return;
      }

      // Appeler l'API avec le token d'authentification
      const res = await fetch('/api/admin/inactive-accounts/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors du chargement');
      }

      const data = await res.json();
      setUsers(data.users);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors du chargement des comptes inactifs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveUsers();
  }, []);

  // Envoyer des avertissements
  const sendWarnings = async (userIds: string[]) => {
    setSending(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/admin/inactive-accounts/warn', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userIds }),
      });
      
      if (!res.ok) throw new Error();
      
      toast.success(`Avertissements envoyés à ${userIds.length} utilisateur(s)`);
      setSelectedUsers([]);
      fetchInactiveUsers();
    } catch {
      toast.error('Erreur lors de l\'envoi des avertissements');
    } finally {
      setSending(false);
    }
  };

  // Supprimer les comptes
  const deleteAccounts = async (userIds: string[]) => {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/admin/inactive-accounts/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userIds }),
      });
      
      if (!res.ok) throw new Error();
      
      toast.success(`${userIds.length} compte(s) supprimé(s)`);
      setSelectedUsers([]);
      setShowDeleteConfirm(false);
      fetchInactiveUsers();
    } catch {
      toast.error('Erreur lors de la suppression des comptes');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'warned' ? user.warning_sent :
      !user.warning_sent;
    
    return matchesSearch && matchesFilter;
  });

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white/80 flex items-center gap-2">
            <UserX className="w-5 h-5 text-amber-400/60" />
            Comptes inactifs
          </h1>
          <p className="text-xs text-gray-400/60 font-light mt-1">
            Comptes sans connexion depuis plus de 30 jours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchInactiveUsers}
            variant="outline"
            className="h-8 text-xs font-light"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
          <p className="text-xs text-gray-400/60 font-light">Total inactifs</p>
          <p className="text-xl font-semibold text-white/80 mt-1">{users.length}</p>
        </div>
        <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
          <p className="text-xs text-gray-400/60 font-light">Avertis</p>
          <p className="text-xl font-semibold text-amber-300/70 mt-1">
            {users.filter(u => u.warning_sent).length}
          </p>
        </div>
        <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
          <p className="text-xs text-gray-400/60 font-light">Non avertis</p>
          <p className="text-xl font-semibold text-red-300/70 mt-1">
            {users.filter(u => !u.warning_sent).length}
          </p>
        </div>
        <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
          <p className="text-xs text-gray-400/60 font-light">Inactivité max</p>
          <p className="text-xl font-semibold text-purple-300/70 mt-1">
            {users.length > 0 ? Math.max(...users.map(u => u.days_inactive)) : 0} jours
          </p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="h-9 pl-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="h-9 px-3 text-xs bg-white/[0.03] border border-white/[0.08] text-gray-400/60 rounded-xl focus:outline-none focus:border-white/[0.15]"
          >
            <option value="all">Tous</option>
            <option value="warned">Avertis</option>
            <option value="not_warned">Non avertis</option>
          </select>

          <Button
            onClick={() => sendWarnings(selectedUsers)}
            disabled={selectedUsers.length === 0 || sending}
            className="h-9 text-xs bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 text-white font-light rounded-xl"
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Send className="w-3.5 h-3.5 mr-1.5" />
            )}
            Avertir ({selectedUsers.length})
          </Button>

          <Button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={selectedUsers.length === 0}
            className="h-9 text-xs bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-500 hover:to-rose-500 text-white font-light rounded-xl"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Supprimer ({selectedUsers.length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-cyan-400/60 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="w-10 h-10 text-gray-500/40 mb-3" />
            <p className="text-sm text-gray-400/60 font-light">
              {search ? 'Aucun utilisateur trouvé' : 'Aucun compte inactif'}
            </p>
            <p className="text-xs text-gray-500/40 font-light mt-1">
              {search ? 'Essayez une autre recherche' : 'Tous les comptes sont actifs'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleAll}
                      className="rounded border-white/[0.15] bg-white/[0.04]"
                    />
                  </th>
                  <th className="p-3 text-left text-[11px] text-gray-400/60 font-light">Utilisateur</th>
                  <th className="p-3 text-left text-[11px] text-gray-400/60 font-light">Email</th>
                  <th className="p-3 text-left text-[11px] text-gray-400/60 font-light">Plan</th>
                  <th className="p-3 text-left text-[11px] text-gray-400/60 font-light">Dernière connexion</th>
                  <th className="p-3 text-left text-[11px] text-gray-400/60 font-light">Inactivité</th>
                  <th className="p-3 text-left text-[11px] text-gray-400/60 font-light">Statut</th>
                  <th className="p-3 text-left text-[11px] text-gray-400/60 font-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="rounded border-white/[0.15] bg-white/[0.04]"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-gray-500/40 to-gray-600/40 flex items-center justify-center text-white/70 text-xs font-medium">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs text-white/70 font-medium">
                            {user.full_name || 'Sans nom'}
                          </p>
                          {user.username && (
                            <p className="text-[10px] text-gray-500/60 font-light">@{user.username}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gray-400/60 font-light">{user.email}</td>
                    <td className="p-3">
                      <Badge className={`text-[10px] font-light ${
                        user.plan === 'premium' ? 'bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20' :
                        user.plan === 'entreprise' ? 'bg-purple-500/10 text-purple-300/60 border-purple-500/20' :
                        'bg-gray-500/10 text-gray-300/60 border-gray-500/20'
                      }`}>
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-gray-400/60 font-light">
                      {user.last_sign_in_at 
                        ? format(new Date(user.last_sign_in_at), 'dd MMM yyyy', { locale: fr })
                        : 'Jamais connecté'
                      }
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-light ${
                        user.days_inactive > 90 ? 'text-red-400/60' :
                        user.days_inactive > 60 ? 'text-amber-400/60' :
                        'text-gray-400/60'
                      }`}>
                        {user.days_inactive} jours
                      </span>
                    </td>
                    <td className="p-3">
                      {user.warning_sent ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-amber-400/60" />
                          <span className="text-[10px] text-amber-400/60 font-light">
                            Averti le {user.warning_sent_at ? format(new Date(user.warning_sent_at), 'dd/MM') : 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-red-400/60 font-light">Non averti</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {!user.warning_sent && (
                          <button
                            onClick={() => sendWarnings([user.id])}
                            disabled={sending}
                            className="p-1.5 text-amber-400/60 hover:text-amber-300/70 rounded-lg hover:bg-amber-500/[0.04] transition-colors"
                            title="Envoyer avertissement"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleUser(user.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            selectedUsers.includes(user.id)
                              ? 'text-red-400/60 bg-red-500/[0.08]'
                              : 'text-gray-400/50 hover:text-red-400/60 hover:bg-red-500/[0.04]'
                          }`}
                          title={selectedUsers.includes(user.id) ? 'Désélectionner' : 'Sélectionner'}
                        >
                          {selectedUsers.includes(user.id) ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compteur */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500/50 font-light">
          {filteredUsers.length} compte(s) inactif(s) • {selectedUsers.length} sélectionné(s)
        </p>
      </div>

      {/* Modal confirmation suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400/60" />
              <h3 className="text-sm font-semibold text-white/80">Confirmer la suppression</h3>
            </div>
            <p className="text-xs text-gray-400/60 font-light mb-1">
              Vous allez supprimer définitivement <strong className="text-white/70">{selectedUsers.length} compte(s)</strong>.
            </p>
            <p className="text-xs text-red-400/50 font-light mb-4">
              Cette action est irréversible. Toutes les données associées seront perdues.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-8 text-xs text-gray-400/60 hover:text-white/70 rounded-lg hover:bg-white/[0.04] transition-colors font-light"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteAccounts(selectedUsers)}
                disabled={deleting}
                className="flex-1 h-8 text-xs bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-500 hover:to-rose-500 text-white font-light rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}