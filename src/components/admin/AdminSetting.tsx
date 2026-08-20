// src/components/admin/AdminSettings.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, User, Mail, Phone, Globe, MapPin, Eye, EyeOff, 
  Briefcase, Tag, Link as LinkIcon, Calendar, Plus, X,
  CheckCircle, AlertTriangle, Settings, ShieldCheck, Lock,
  Smartphone, Instagram, Cake, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/src/lib/supabase/client';
import Loading from '@/src/components/system/Loading';

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio_short: string | null;
  bio_long: string | null;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  tiktok: string | null;
  linkedin: string | null;
  snapchat: string | null;
  telegram: string | null;
  github: string | null;
  calendly: string | null;
  portfolio_url: string | null;
  cv_url: string | null;
  nickname: string | null;
  pronouns: string | null;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  city: string | null;
  country: string | null;
  timezone: string | null;
  availability: string | null;
  skills: string[] | null;
  professional_status: string | null;
  website: string | null;
  address: string | null;
  is_public: boolean;
  sections_visibility: Record<string, boolean>;
  plan: string;
  accepts_contact_requests: boolean;
  hide_birth_year: boolean;
  disable_birthday_icon: boolean;
  verified: boolean;
};

export default function AdminSettings() {
  const t = useTranslations('dashboard.settings');
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/sign-in'); return; }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data as Profile);
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const addSkill = () => {
    if (!newSkill.trim() || !profile) return;
    const updated = [...(profile.skills || []), newSkill.trim()].slice(0, 10);
    setProfile({ ...profile, skills: updated });
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    if (!profile) return;
    setProfile({ ...profile, skills: (profile.skills || []).filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name?.trim() || null,
          username: profile.username?.trim()?.toLowerCase() || null,
          bio_short: profile.bio_short,
          bio_long: profile.bio_long,
          job_title: profile.job_title,
          company: profile.company,
          email: profile.email,
          phone: profile.phone,
          whatsapp: profile.whatsapp,
          instagram: profile.instagram,
          tiktok: profile.tiktok,
          linkedin: profile.linkedin,
          telegram: profile.telegram,
          github: profile.github,
          calendly: profile.calendly,
          portfolio_url: profile.portfolio_url,
          cv_url: profile.cv_url,
          nickname: profile.nickname,
          pronouns: profile.pronouns,
          birth_day: profile.birth_day,
          birth_month: profile.birth_month,
          birth_year: profile.birth_year,
          city: profile.city,
          country: profile.country,
          timezone: profile.timezone,
          availability: profile.availability,
          skills: profile.skills,
          professional_status: profile.professional_status,
          website: profile.website,
          address: profile.address,
          is_public: profile.is_public,
          sections_visibility: profile.sections_visibility,
          accepts_contact_requests: profile.accepts_contact_requests,
          hide_birth_year: profile.hide_birth_year,
          disable_birthday_icon: profile.disable_birthday_icon,
          verified: profile.verified,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil enregistré avec succès.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la sauvegarde.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (!profile) return null;

  const socialFields = [
    { key: 'instagram', label: 'Instagram', icon: Instagram, prefix: '@' },
    { key: 'tiktok', label: 'TikTok', icon: Smartphone, prefix: '@' },
    { key: 'linkedin', label: 'LinkedIn', icon: Briefcase },
    { key: 'telegram', label: 'Telegram', icon: Smartphone, prefix: '@' },
    { key: 'github', label: 'GitHub', icon: Globe },
  ];

  const linkFields = [
    { key: 'portfolio_url', label: 'Portfolio', icon: Globe, placeholder: 'https://...' },
    { key: 'github', label: 'GitHub', icon: Globe, placeholder: 'https://github.com/...' },
    { key: 'calendly', label: 'Calendly', icon: Calendar, placeholder: 'https://calendly.com/...' },
    { key: 'cv_url', label: 'CV', icon: FileText, placeholder: 'URL de votre CV' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white/80">{t('title')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-[10px] font-light ${
              profile.plan === 'premium' ? 'bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20' :
              profile.plan === 'entreprise' ? 'bg-purple-500/10 text-purple-300/60 border-purple-500/20' :
              'bg-gray-500/10 text-gray-300/60 border-gray-500/20'
            }`}>
              {profile.plan === 'premium' ? 'Premium' : profile.plan === 'entreprise' ? 'Entreprise' : 'Basic'}
            </Badge>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-lg">
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl flex items-start gap-2 ${
              message.type === 'success' ? 'bg-emerald-500/[0.04] border border-emerald-500/[0.08]' : 'bg-red-500/[0.04] border border-red-500/[0.08]'
            }`}>
            {message.type === 'success' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-400/60 mt-0.5" />}
            <p className="text-xs font-light flex-1">{message.text}</p>
            <button onClick={() => setMessage(null)} className="text-gray-400/60 hover:text-white/70">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Identité */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400/60" /> Identité
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Nom complet</Label>
            <Input value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Nom d'utilisateur</Label>
            <Input value={profile.username || ''} onChange={e => setProfile({ ...profile, username: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Titre</Label>
            <Input value={profile.job_title || ''} onChange={e => setProfile({ ...profile, job_title: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Entreprise</Label>
            <Input value={profile.company || ''} onChange={e => setProfile({ ...profile, company: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs text-gray-400/70 font-light mb-1">Bio courte</Label>
            <Textarea value={profile.bio_short || ''} onChange={e => setProfile({ ...profile, bio_short: e.target.value })} rows={2} className="text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg resize-none" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-cyan-400/60" /> Contact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Email</Label>
            <Input type="email" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Téléphone</Label>
            <Input value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">WhatsApp</Label>
            <Input value={profile.whatsapp || ''} onChange={e => setProfile({ ...profile, whatsapp: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Site web</Label>
            <Input value={profile.website || ''} onChange={e => setProfile({ ...profile, website: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Instagram className="w-4 h-4 text-pink-400/60" /> Réseaux sociaux
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {socialFields.map(({ key, label, icon: Icon, prefix }) => (
            <div key={key}>
              <Label className="text-xs text-gray-400/70 font-light mb-1 flex items-center gap-1">
                <Icon className="w-3 h-3" /> {label}
              </Label>
              <Input
                value={(profile[key as keyof Profile] as string) || ''}
                onChange={e => setProfile({ ...profile, [key]: e.target.value || null })}
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg"
                placeholder={prefix ? `${prefix}votrecompte` : ''}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Compétences */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-400/60" /> Compétences
        </h2>
        <div className="flex gap-2 mb-3">
          <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Ajouter une compétence..." className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg flex-1" />
          <Button size="sm" onClick={addSkill} disabled={!newSkill.trim()} className="h-8 text-xs font-light rounded-lg">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill, i) => (
              <Badge key={i} className="bg-purple-500/10 text-purple-300/60 border-purple-500/15 text-[11px] font-light flex items-center gap-1">
                {skill}
                <button onClick={() => removeSkill(i)} className="hover:text-white/70"><X className="w-2.5 h-2.5" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Liens professionnels */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-blue-400/60" /> Liens professionnels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {linkFields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <Label className="text-xs text-gray-400/70 font-light mb-1 flex items-center gap-1">
                <Icon className="w-3 h-3" /> {label}
              </Label>
              <Input
                value={(profile[key as keyof Profile] as string) || ''}
                onChange={e => setProfile({ ...profile, [key]: e.target.value || null })}
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Localisation */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400/60" /> Localisation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Ville</Label>
            <Input value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Pays</Label>
            <Input value={profile.country || ''} onChange={e => setProfile({ ...profile, country: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-400/70 font-light mb-1">Fuseau horaire</Label>
            <Input value={profile.timezone || ''} onChange={e => setProfile({ ...profile, timezone: e.target.value })} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Visibilité & Confidentialité */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400/60" /> Visibilité & Confidentialité
        </h2>
        <div className="space-y-3">
          {[
            { key: 'is_public', label: 'Profil public', desc: 'Visible par tout le monde' },
            { key: 'accepts_contact_requests', label: 'Demandes de contact', desc: 'Autoriser les messages' },
            { key: 'hide_birth_year', label: 'Masquer l\'année', desc: 'Cacher l\'année de naissance' },
            { key: 'disable_birthday_icon', label: 'Icône anniversaire', desc: 'Désactiver l\'icône 🎂' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="text-xs text-white/70 font-medium">{label}</p>
                <p className="text-[11px] text-gray-400/50 font-light">{desc}</p>
              </div>
              <Switch
                checked={!!profile[key as keyof Profile]}
                onCheckedChange={checked => setProfile({ ...profile, [key]: checked })}
              />
            </div>
          ))}

          {/* Badge vérifié - entreprise only */}
          <div className={`flex items-center justify-between p-2.5 rounded-xl border ${profile.plan === 'entreprise' ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-white/[0.01] border-white/[0.02] opacity-60'}`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400/60" />
              <div>
                <p className="text-xs text-white/70 font-medium">Badge vérifié</p>
                <p className="text-[11px] text-gray-400/50 font-light">{profile.plan === 'entreprise' ? 'Afficher le badge de vérification' : 'Réservé aux entreprises'}</p>
              </div>
            </div>
            {profile.plan === 'entreprise' ? (
              <Switch checked={profile.verified} onCheckedChange={checked => setProfile({ ...profile, verified: checked })} />
            ) : (
              <Lock className="w-3.5 h-3.5 text-yellow-400/60" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}