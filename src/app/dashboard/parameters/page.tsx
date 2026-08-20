// src/app/dashboard/parameters/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, ShieldCheck, Save, Settings, Link, Copy, Timer,
  HelpCircle, EyeOff, Fingerprint
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/src/lib/supabase/client';
import Loading from '@/src/components/system/Loading';

type Profile = {
  id: string;
  username?: string | null;
  is_public?: boolean | null;
  accepts_contact_requests?: boolean | null;
  enable_connection_alerts?: boolean | null;
  deactivated?: boolean | null;
  [key: string]: any;
};

export default function ParametersPage() {
  const t = useTranslations('dashboard.settings');
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/sign-in'); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile({ ...data, enable_connection_alerts: data.enable_connection_alerts ?? true });
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('profiles').update({
      is_public: profile.is_public,
      accepts_contact_requests: profile.accepts_contact_requests,
      enable_connection_alerts: profile.enable_connection_alerts,
    }).eq('id', profile.id);
    toast.success('✅ Paramètres enregistrés');
    setSaving(false);
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ deactivated: true, deactivation_reason: deactivationReason }).eq('id', user.id);
    await supabase.auth.signOut();
    toast.success('Compte désactivé');
    router.push('/');
  };

  const handleDelete = async () => {
    if (!deletePassword) { toast.warning('Mot de passe requis'); return; }
    setDeleting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.auth.signInWithPassword({ email: user.email!, password: deletePassword });
    if (error) { toast.error('Mot de passe incorrect'); setDeleting(false); return; }
    await fetch('/api/account/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
    await supabase.auth.signOut();
    toast.success('Compte supprimé');
    router.push('/');
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl"><Settings className="w-5 h-5 text-cyan-400" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('parameters.title')}</h1>
            <p className="text-sm text-gray-400">{t('parameters.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="border-white/20 text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-1" /> 
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Save className="w-4 h-4 mr-1" /> {saving ? '...' : ''}
          </Button>
        </div>
      </div>

      {/* 🔒 Confidentialité / Biométrie */}
      <Card className="glass-border bg-white/5 border-white/10 mb-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <EyeOff className="w-4 h-4 text-purple-400" />
            <h2 className="text-white font-semibold">Confidentialité</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">Vos paramètres de confidentialité et sécurité sont protégés.</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white text-sm">Profil public</Label>
                <p className="text-xs text-gray-400">Rendre votre profil visible</p>
              </div>
              <Switch checked={profile?.is_public === true} onCheckedChange={c => setProfile(p => ({ ...p!, is_public: c }))} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white text-sm">Demandes de contact</Label>
                <p className="text-xs text-gray-400">Autoriser les visiteurs à vous contacter</p>
              </div>
              <Switch checked={profile?.accepts_contact_requests === true} onCheckedChange={c => setProfile(p => ({ ...p!, accepts_contact_requests: c }))} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white text-sm">Alertes de connexion</Label>
                <p className="text-xs text-gray-400">Notification à chaque nouvelle connexion</p>
              </div>
              <Switch checked={profile?.enable_connection_alerts === true} onCheckedChange={c => setProfile(p => ({ ...p!, enable_connection_alerts: c }))} />
            </div>
          </div>

          {/* Biométrie */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Fingerprint className="w-4 h-4 text-purple-400" />
              <h3 className="text-white text-sm font-semibold">Authentification biométrique</h3>
              <Badge className="bg-yellow-500/20 text-yellow-300 text-[10px] border-yellow-500/30">Bientôt disponible</Badge>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Utilisez votre empreinte digitale, Face ID ou Windows Hello pour vous connecter rapidement et en toute sécurité.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>✅ Sécurité de niveau bancaire (FIDO2)</p>
              <p>✅ Aucune donnée biométrique stockée sur nos serveurs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lien profil */}
      <Card className="glass-border bg-white/5 border-white/10 mb-6">
        <CardContent className="p-5">
          <Label className="text-white text-sm mb-2 block">URL de votre profil</Label>
          <div className="flex">
            <Input value={`https://luvika.me/${profile?.username}`} readOnly className="rounded-r-none bg-white/5 border-white/10 text-cyan-300 text-sm" />
            <Button variant="outline" size="icon" className="rounded-l-none border-white/10 text-gray-400" onClick={() => { navigator.clipboard.writeText(`https://luvika.me/${profile?.username}`); toast.success('Copié !'); }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gestion du compte */}
      <Card className="glass-border bg-white/5 border-white/10 mb-6">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Désactiver temporairement</p>
              <p className="text-xs text-gray-400">Votre profil sera masqué. Réactivation possible sur demande.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDeactivateModal(true)} className="border-amber-500/30 text-amber-300 text-xs">Désactiver</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Supprimer définitivement</p>
              <p className="text-xs text-gray-400">Action irréversible.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(true)} className="border-red-500/30 text-red-300 text-xs">Supprimer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Aide */}
      <p className="text-xs text-gray-500 text-center">
        <HelpCircle className="w-3 h-3 inline mr-1" />
        Besoin d'aide ? <a href="mailto:support@luvika.me" className="text-cyan-400 hover:underline">support@luvika.me</a>
      </p>

      {/* Modal Désactivation */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeactivateModal(false)}>
          <div className="w-full max-w-sm glass-border bg-gray-900 rounded-2xl p-6 border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-3">Désactiver votre compte</h3>
            <Textarea value={deactivationReason} onChange={e => setDeactivationReason(e.target.value)} placeholder="Raison (optionnelle)" className="mb-4 bg-white/5 border-white/10 text-white text-sm" rows={3} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeactivateModal(false)} className="flex-1 border-white/20 text-gray-300">Annuler</Button>
              <Button onClick={handleDeactivate} disabled={deactivating} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">{deactivating ? '...' : 'Confirmer'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="w-full max-w-sm glass-border bg-gray-900 rounded-2xl p-6 border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-3">Supprimer définitivement</h3>
            <Input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Votre mot de passe" className="mb-4 bg-white/5 border-white/10 text-white" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1 border-white/20 text-gray-300">Annuler</Button>
              <Button onClick={handleDelete} disabled={deleting || !deletePassword} className="flex-1 bg-red-600 hover:bg-red-700 text-white">{deleting ? '...' : 'Supprimer'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}