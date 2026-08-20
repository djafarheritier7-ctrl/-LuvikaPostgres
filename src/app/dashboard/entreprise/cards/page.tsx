// src/app/dashboard/entreprise/cards/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import {
  Plus, Search, CreditCard, QrCode,
  CheckCircle, XCircle, Clock,
  MoreVertical, Trash2, ArrowLeft, Download,
  ChevronDown, ChevronUp, Edit, Upload, ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/src/lib/supabase/client';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type OrgCard = {
  id: string;
  org_id: string;
  member_id: string | null;
  card_number: string;
  status: string;
  role_in_org: string | null;
  member_name: string | null;
  member_email: string | null;
  member_surname: string | null;
  member_given_name: string | null;
  member_phone: string | null;
  member_position: string | null;
  member_department: string | null;
  member_blood_group: string | null;
  member_nationality: string | null;
  member_access_level: string | null;
  member_work_hours: string | null;
  member_photo_url: string | null;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
};

export default function OrgCardsPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

  const [cards, setCards] = useState<OrgCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<OrgCard | null>(null);
  const [selectedCardForQR, setSelectedCardForQR] = useState<OrgCard | null>(null);
  const [companyId, setCompanyId] = useState<string>('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const emptyForm = {
    full_name: '', email: '', role_in_org: '',
    valid_from: new Date().toISOString().split('T')[0], valid_until: '',
    member_surname: '', member_given_name: '', member_phone: '',
    member_position: '', member_department: '', member_blood_group: '',
    member_nationality: '', member_access_level: '', member_work_hours: '',
    member_photo_url: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app';

  useEffect(() => {
    if (showQRModal && selectedCardForQR && qrCanvasRef.current) {
      import('qrcode').then(QRCode => {
        QRCode.default.toCanvas(
          qrCanvasRef.current,
          `${baseUrl}/${locale}/card/${selectedCardForQR.card_number}`,
          { width: 200, color: { dark: '#1e293b', light: '#ffffff' } }
        );
      });
    }
  }, [showQRModal, selectedCardForQR, baseUrl, locale]);

  const fetchCards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
    if (!company) return;
    setCompanyId(company.id);
    const { data, error } = await supabase.from('org_cards').select('*').eq('org_id', company.id).order('created_at', { ascending: false });
    if (error) { console.error('Erreur fetchCards:', error); toast.error('Erreur chargement'); }
    else setCards(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

 const uploadPhoto = async (file: File, cardNumber: string): Promise<string | null> => {
  // ⚠️ Le shim local ne fournit pas encore `storage`.
  // L’upload de photo est donc désactivé pour le moment.
  console.warn('📷 Upload photo désactivé : `supabase.storage` non implémenté dans le shim.');
  return null;
};

  const resetForm = () => {
    setFormData(emptyForm);
    setShowAdvancedFields(false);
    setPhotoFile(null); setPhotoPreview(null);
    setEditPhotoFile(null); setEditPhotoPreview(null);
  };

  const handleCreate = async () => {
    if (!formData.full_name || !formData.email) { toast.warning('Champs requis', { description: 'Nom et email sont obligatoires.' }); return; }
    setCreating(true);
    const cardNumber = `ORG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const validUntil = formData.valid_until || null;
    let photoUrl = null;
    if (photoFile) photoUrl = await uploadPhoto(photoFile, cardNumber);

    const { error } = await supabase.from('org_cards').insert({
      org_id: companyId, card_number: cardNumber,
      member_name: formData.full_name.trim(), member_email: formData.email.trim(),
      role_in_org: formData.role_in_org || null,
      valid_from: formData.valid_from || new Date().toISOString(), valid_until: validUntil,
      member_surname: formData.member_surname || null, member_given_name: formData.member_given_name || null,
      member_phone: formData.member_phone || null, member_position: formData.member_position || null,
      member_department: formData.member_department || null, member_blood_group: formData.member_blood_group || null,
      member_nationality: formData.member_nationality || null, member_access_level: formData.member_access_level || null,
      member_work_hours: formData.member_work_hours || null, member_photo_url: photoUrl,
      status: 'inactive',
    });

    if (error) { toast.error('Erreur', { description: error.message }); }
    else { toast.success('Carte créée', { description: 'La carte a été ajoutée avec succès.', icon: <CheckCircle className="w-4 h-4 text-emerald-400/70" /> }); setShowCreateModal(false); resetForm(); fetchCards(); }
    setCreating(false);
  };

  const openEditModal = (card: OrgCard) => {
    setSelectedCard(card);
    setFormData({
      full_name: card.member_name || '', email: card.member_email || '',
      role_in_org: card.role_in_org || '',
      valid_from: card.valid_from ? card.valid_from.split('T')[0] : new Date().toISOString().split('T')[0],
      valid_until: card.valid_until ? card.valid_until.split('T')[0] : '',
      member_surname: card.member_surname || '', member_given_name: card.member_given_name || '',
      member_phone: card.member_phone || '', member_position: card.member_position || '',
      member_department: card.member_department || '', member_blood_group: card.member_blood_group || '',
      member_nationality: card.member_nationality || '', member_access_level: card.member_access_level || '',
      member_work_hours: card.member_work_hours || '', member_photo_url: card.member_photo_url || '',
    });
    setEditPhotoFile(null); setEditPhotoPreview(card.member_photo_url || null);
    setShowEditModal(true); setShowMenu(null);
  };

  const handleUpdate = async () => {
    if (!selectedCard || !formData.full_name || !formData.email) { toast.warning('Champs requis', { description: 'Nom et email sont obligatoires.' }); return; }
    setSaving(true);
    let photoUrl = formData.member_photo_url;
    if (editPhotoFile) { const uploaded = await uploadPhoto(editPhotoFile, selectedCard.card_number); if (uploaded) photoUrl = uploaded; }
    const validUntil = formData.valid_until || null;

    const { error } = await supabase.from('org_cards').update({
      member_name: formData.full_name.trim(), member_email: formData.email.trim(),
      role_in_org: formData.role_in_org || null,
      valid_from: formData.valid_from || new Date().toISOString(), valid_until: validUntil,
      member_surname: formData.member_surname || null, member_given_name: formData.member_given_name || null,
      member_phone: formData.member_phone || null, member_position: formData.member_position || null,
      member_department: formData.member_department || null, member_blood_group: formData.member_blood_group || null,
      member_nationality: formData.member_nationality || null, member_access_level: formData.member_access_level || null,
      member_work_hours: formData.member_work_hours || null, member_photo_url: photoUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', selectedCard.id);

    if (error) { toast.error('Erreur', { description: error.message }); }
    else { toast.success('Carte mise à jour', { icon: <CheckCircle className="w-4 h-4 text-emerald-400/70" /> }); setShowEditModal(false); resetForm(); fetchCards(); }
    setSaving(false);
  };

  const updateStatus = async (cardId: string, newStatus: string) => {
    const { error } = await supabase.from('org_cards').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', cardId);
    if (error) toast.error('Échec');
    else { toast.success(`Carte ${newStatus === 'active' ? 'activée' : newStatus}`); fetchCards(); }
    setShowMenu(null);
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('Supprimer définitivement cette carte ?')) return;
    const { error } = await supabase.from('org_cards').delete().eq('id', cardId);
    if (error) toast.error('Échec suppression');
    else toast.success('Carte supprimée');
    setShowMenu(null); fetchCards();
  };

  const exportCSV = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Poste', 'Département', 'Rôle', 'Statut', 'N° Carte', 'Valide du', 'Valide jusqu\'au', 'Créée le'];
    const rows = cards.map(c => [c.member_surname || c.member_name || '', c.member_given_name || '', c.member_email || '', c.member_phone || '', c.member_position || '', c.member_department || '', c.role_in_org || '', c.status, c.card_number, c.valid_from ? new Date(c.valid_from).toLocaleDateString('fr-FR') : '-', c.valid_until ? new Date(c.valid_until).toLocaleDateString('fr-FR') : 'Sans limite', new Date(c.created_at).toLocaleDateString('fr-FR')]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `membres-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  const filteredCards = cards.filter(card => {
    const searchStr = (card.card_number + card.member_name + card.member_email + card.member_surname + card.member_given_name + card.member_phone).toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase()) && (statusFilter === 'all' || card.status === statusFilter);
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-300/70 border-emerald-500/20',
      inactive: 'bg-gray-500/10 text-gray-300/70 border-gray-500/20',
      suspended: 'bg-amber-500/10 text-amber-300/70 border-amber-500/20',
      revoked: 'bg-red-500/10 text-red-300/70 border-red-500/20'
    };
    const labels: Record<string, string> = { active: 'Active', inactive: 'Inactive', suspended: 'Suspendue', revoked: 'Révoquée' };
    return <Badge className={`text-[10px] font-light ${styles[status] || styles.inactive}`}>{labels[status] || status}</Badge>;
  };

  if (loading) return <Loading />;

  const stats = [
    { label: 'Total', value: cards.length, color: 'text-white/80' },
    { label: 'Actives', value: cards.filter(c => c.status === 'active').length, color: 'text-emerald-400/70' },
    { label: 'Suspendues', value: cards.filter(c => c.status === 'suspended').length, color: 'text-amber-400/70' },
    { label: 'Révoquées', value: cards.filter(c => c.status === 'revoked').length, color: 'text-red-400/70' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/entreprise')} className="h-8 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg mb-3">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Retour
          </Button>
          <h1 className="text-xl font-semibold text-white/80">Cartes Membres</h1>
          <p className="text-xs text-gray-400/60 font-light mt-1">Gérez les cartes d'identité de votre organisation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline" className="h-8 text-xs border-white/[0.08] text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Exporter
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateModal(true); }} className="h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-lg">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Nouvelle carte
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] text-center">
            <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400/60 font-light">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-8 text-xs bg-white/[0.03] border border-white/[0.08] text-white/70 rounded-lg px-3 font-light"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
          <option value="suspended">Suspendues</option>
          <option value="revoked">Révoquées</option>
        </select>
      </div>

      {/* Liste des cartes */}
      <div className="space-y-2">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
            <CreditCard className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
            <p className="text-gray-400/60 text-sm font-light">Aucune carte trouvée</p>
            <Button onClick={() => { resetForm(); setShowCreateModal(true); }} className="mt-3 h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg">
              Créer une première carte
            </Button>
          </div>
        ) : filteredCards.map(card => (
          <div key={card.id} className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              {card.member_photo_url ? (
                <img src={card.member_photo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-white/[0.08]" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-violet-400/60" />
                </div>
              )}
              <div>
                <p className="text-sm text-white/70 font-medium">
                  {card.member_surname && card.member_given_name ? `${card.member_surname} ${card.member_given_name}` : card.member_name || 'Sans nom'}
                </p>
                <p className="text-[11px] text-gray-400/60 font-light">{card.member_position && <span className="mr-2">{card.member_position}</span>}{card.card_number}</p>
                {card.role_in_org && <Badge className="mt-1 bg-violet-500/10 text-violet-300/60 border-violet-500/15 text-[10px] font-light">{card.role_in_org}</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge(card.status)}
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowMenu(showMenu === card.id ? null : card.id)} className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
                <AnimatePresence>
                  {showMenu === card.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-8 w-44 bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] rounded-xl py-1 shadow-xl z-50">
                      <button onClick={() => { setShowMenu(null); setSelectedCardForQR(card); setShowQRModal(true); }} className="w-full text-left px-3 py-2 text-xs text-cyan-400/70 hover:bg-white/[0.04] flex items-center gap-2 font-light"><QrCode className="w-3.5 h-3.5" /> Voir QR Code</button>
                      <button onClick={() => openEditModal(card)} className="w-full text-left px-3 py-2 text-xs text-blue-400/70 hover:bg-white/[0.04] flex items-center gap-2 font-light"><Edit className="w-3.5 h-3.5" /> Modifier</button>
                      <hr className="border-white/[0.04] my-1" />
                      {card.status !== 'active' && <button onClick={() => updateStatus(card.id, 'active')} className="w-full text-left px-3 py-2 text-xs text-emerald-400/70 hover:bg-white/[0.04] flex items-center gap-2 font-light"><CheckCircle className="w-3.5 h-3.5" /> Activer</button>}
                      {card.status === 'active' && <button onClick={() => updateStatus(card.id, 'suspended')} className="w-full text-left px-3 py-2 text-xs text-amber-400/70 hover:bg-white/[0.04] flex items-center gap-2 font-light"><Clock className="w-3.5 h-3.5" /> Suspendre</button>}
                      <button onClick={() => updateStatus(card.id, 'revoked')} className="w-full text-left px-3 py-2 text-xs text-red-400/70 hover:bg-white/[0.04] flex items-center gap-2 font-light"><XCircle className="w-3.5 h-3.5" /> Révoquer</button>
                      <hr className="border-white/[0.04] my-1" />
                      <button onClick={() => deleteCard(card.id)} className="w-full text-left px-3 py-2 text-xs text-red-400/70 hover:bg-white/[0.04] flex items-center gap-2 font-light"><Trash2 className="w-3.5 h-3.5" /> Supprimer</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal QR */}
      <AnimatePresence>
        {showQRModal && selectedCardForQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowQRModal(false); setSelectedCardForQR(null); }}>
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] text-center" onClick={e => e.stopPropagation()}>
              <h2 className="text-base font-semibold text-white/80 mb-1">QR Code</h2>
              <p className="text-xs text-gray-400/60 font-light mb-3">{selectedCardForQR.member_name} · {selectedCardForQR.card_number}</p>
              <div className="bg-white p-3 rounded-xl inline-block mb-3">
                <canvas ref={qrCanvasRef} width="180" height="180" />
              </div>
              <p className="text-[11px] text-gray-500/50 font-light mb-3">{baseUrl}/{locale}/card/{selectedCardForQR.card_number}</p>
              <div className="flex gap-2">
                <Button onClick={() => { const canvas = qrCanvasRef.current; if (!canvas) return; const link = document.createElement('a'); link.download = `carte-${selectedCardForQR.card_number}.png`; link.href = canvas.toDataURL('image/png'); link.click(); toast.success('QR Code téléchargé'); }} variant="outline" className="flex-1 h-8 text-xs border-white/[0.08] text-gray-400/60 hover:text-white/70 font-light rounded-lg">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Télécharger
                </Button>
                <Button onClick={() => { setShowQRModal(false); setSelectedCardForQR(null); }} variant="ghost" className="flex-1 h-8 text-xs text-gray-400/60 hover:text-white/70 font-light rounded-lg">
                  Fermer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Création/Édition - simplifié pour la réponse, même structure que QR modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowCreateModal(false); resetForm(); }}>
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-base font-semibold text-white/80 mb-4">Créer une carte membre</h2>
              {/* Formulaire identique avec inputs styled légers */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Nom *</label><Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                  <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Prénom</label><Input value={formData.member_given_name} onChange={e => setFormData({...formData, member_given_name: e.target.value})} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                </div>
                <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Email *</label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Téléphone</label><Input value={formData.member_phone} onChange={e => setFormData({...formData, member_phone: e.target.value})} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                  <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Poste</label><Input value={formData.member_position} onChange={e => setFormData({...formData, member_position: e.target.value})} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                </div>
                <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Rôle</label><Input value={formData.role_in_org} onChange={e => setFormData({...formData, role_in_org: e.target.value})} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1 h-8 text-xs text-gray-400/60 hover:text-white/70 font-light rounded-lg">Annuler</Button>
                  <Button onClick={handleCreate} disabled={creating} className="flex-1 h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg">{creating ? 'Création...' : 'Créer'}</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}