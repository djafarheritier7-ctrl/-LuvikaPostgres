// src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Save, ImageIcon, Instagram, MapPin, User, Settings, Crown,
  Link as Briefcase, Github, Linkedin, Lock, ShieldCheck,
  RefreshCw, ArrowLeft,
  ChevronDown, ChevronUp, Menu, Youtube
} from 'lucide-react';
import { SiTiktok } from "react-icons/si";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/src/lib/supabase/client';
import DashboardQuickMenu from '@/src/components/dashboard/DashboardQuickMenu';

// Icônes personnalisées (inchangées, mais tronquées pour la réponse)
const Copy = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12v-4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6m4-10h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
  </svg>
);

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.333 13.5l-1.45 4.35c-.15.45-.6.6-1 .45L12 19l-6.5 3.5c-.4.2-.8-.1-.6-.5l1.5-6.5L3.5 12c-.2-.4 0-.8.4-.8l17-7c.4-.2.8.1.6.5l-2.5 12.5c-.1.5-.5.8-.9.6l-2.767-1.167z" />
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.2 13.5c-.3 1.2-.6 2.4-1.5 3-1.2-1.2-1.5-3-1.5-4.5 0-2.4 1.2-4.2 2.4-4.2 1.2 0 1.8.9 1.8 1.8 0 1.2-.6 3-1.5 3-.3 0-.6-.3-.6-.6 0-.6.3-1.2.6-1.8.6-.9.3-1.5-.3-1.5-.9 0-1.5 1.2-1.5 2.4 0 1.5.6 2.4 1.5 3z"/>
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const RedditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.8 14.2c-.4.4-.9.6-1.4.6s-1-.2-1.4-.6c-.2-.2-.5-.2-.7 0-.4.4-.9.6-1.4.6s-1-.2-1.4-.6c-.2-.2-.5-.2-.7 0-.2.2-.2.5 0 .7.6.6 1.4.9 2.1.9s1.6-.3 2.1-.9c.2-.2.2-.5 0-.7zm1.7-4.2c-.5 0-.9.4-.9.9s.4.9.9.9.9-.4.9-.9-.4-.9-.9-.9zm-8.2 0c-.5 0-.9.4-.9.9s.4.9.9.9.9-.4.9-.9-.4-.9-.9-.9z"/>
  </svg>
);

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.186 1.333c-5.873 0-10.667 4.794-10.667 10.667s4.794 10.667 10.667 10.667 10.667-4.794 10.667-10.667-4.794-10.667-10.667-10.667zm3.82 8.267c1.067.133 2.08.467 3 1l-.667 1.6c-.787-.4-1.6-.667-2.467-.733-1.267-.067-2.4.267-3.4 1-1.867 1.333-2.533 3.933-1.467 5.933.933 1.733 3.067 2.333 4.733 1.333 1.133-.667 1.867-1.933 2-3.267h-3.333v-1.867h5.333c.067.4.133.8.133 1.2 0 3.267-2.4 6-5.667 6-3.333 0-6-2.733-6-6s2.667-6 6-6c.733 0 1.467.133 2.133.4z"/>
  </svg>
);

type Profile = {
  id: string;
  full_name: string;
  username: string;
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
  pinterest: string | null;
  discord: string | null;
  reddit: string | null;
  threads: string | null;
  calendly: string | null;
  youtube: string | null;
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
  availability: 'available' | 'unavailable' | 'by_appointment' | null;
  skills: string[] | null;
  professional_status: 'student' | 'employed' | 'freelance' | 'open_to_work' | 'other' | null;
  website: string | null;
  address: string | null;
  theme: { primary: string; background: string };
  is_public: boolean;
  sections_visibility: Record<string, boolean>;
  plan: string;
  accepts_contact_requests: boolean;
  hide_birth_year: boolean;
  disable_birthday_icon: boolean;
  verified: boolean;
  enable_connection_alerts?: boolean | null;
};

const CollapsibleSection = ({
  id,
  title,
  icon: Icon,
  iconColor,
  children,
  expanded,
  onToggle,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) => (
  <section id={id} className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Icon className={iconColor} />
        {title}
      </h2>
      <button onClick={onToggle} className="text-gray-400 hover:text-white transition-colors">
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
    </div>
    {expanded && <Card className="glass-border bg-white/5 border-white/10">{children}</Card>}
  </section>
);

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    personal: true,
    professional: true,
    social: true,
    location: true,
    privacy: true,
    account: false,
  });

  const quickActions = [
    { id: 'save', label: '', icon: <Save className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
    { id: 'refresh', label: '', icon: <RefreshCw className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'back', label: '', icon: <ArrowLeft className="w-4 h-4" />, color: 'from-gray-500 to-gray-600' },
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) {
      toast.error(t('load_error'));
      return;
    }
    setProfile({ ...data, enable_connection_alerts: data.enable_connection_alerts ?? true });
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Realtime désactivé (non supporté par le shim)
  // useEffect(() => { ... }) supprimé

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    // ⚠️ Le shim local ne fournit pas `supabase.storage`.
    // L'upload d'image est donc temporairement désactivé.
    console.warn(`📷 Upload ${type} désactivé : \`supabase.storage\` non implémenté dans le shim.`);
    toast.info('Upload désactivé', { description: 'Le stockage local n’est pas encore configuré.' });
    e.target.value = '';
    return;
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const updates = {
      full_name: profile.full_name?.trim() || null,
      username: profile.username?.trim().toLowerCase() || null,
      avatar_url: profile.avatar_url,
      cover_url: profile.cover_url,
      bio_short: profile.bio_short,
      bio_long: profile.bio_long,
      job_title: profile.job_title,
      company: profile.company,
      email: profile.email,
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      instagram: profile.instagram?.replace(/^@/, '') || null,
      tiktok: profile.tiktok?.replace(/^@/, '') || null,
      linkedin: profile.linkedin?.replace(/^https?:\/\//, '') || null,
      snapchat: profile.snapchat?.replace(/^@/, '') || null,
      telegram: profile.telegram?.replace(/^@/, '') || null,
      github: profile.github?.replace(/^https?:\/\//, '') || null,
      pinterest: profile.pinterest?.replace(/^https?:\/\//, '') || null,
      discord: profile.discord?.replace(/^@/, '') || null,
      reddit: profile.reddit?.replace(/^u\//, '') || null,
      threads: profile.threads?.replace(/^@/, '') || null,
      calendly: profile.calendly?.replace(/^https?:\/\//, '') || null,
      youtube: profile.youtube?.replace(/^https?:\/\//, '') || null,
      portfolio_url: profile.portfolio_url?.replace(/^https?:\/\//, '') || null,
      cv_url: profile.cv_url?.replace(/^https?:\/\//, '') || null,
      nickname: profile.nickname,
      pronouns: profile.pronouns,
      birth_day: profile.birth_day,
      birth_month: profile.birth_month,
      birth_year: profile.birth_year,
      city: profile.city,
      country: profile.country,
      timezone: profile.timezone,
      availability: profile.availability,
      skills: profile.skills || [],
      professional_status: profile.professional_status,
      website: profile.website,
      address: profile.address,
      is_public: profile.is_public ?? true,
      accepts_contact_requests: profile.accepts_contact_requests ?? true,
      hide_birth_year: profile.hide_birth_year ?? false,
      disable_birthday_icon: profile.disable_birthday_icon ?? false,
      enable_connection_alerts: profile.enable_connection_alerts ?? true,
    };
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    if (error) toast.error('Erreur sauvegarde');
    else toast.success('Profil mis à jour');
    setSaving(false);
  };

  const handleQuickAction = (id: string) => {
    if (id === 'save') handleSave();
    if (id === 'refresh') fetchProfile();
    if (id === 'back') router.push('/dashboard');
  };

  const getCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.full_name, profile.username, profile.job_title, profile.bio_short, profile.email,
      profile.phone, profile.address, profile.website, profile.instagram, profile.avatar_url,
      profile.nickname, profile.pronouns, profile.birth_day, profile.city, profile.skills?.length,
    ].filter(f => f != null && f !== '');
    return Math.min(100, Math.round((fields.length / 15) * 100));
  };

  const getPlanBadge = () => {
    const plan = profile?.plan;
    if (plan === 'premium') return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500"><Crown className="w-3 h-3 mr-1" /> Premium</Badge>;
    if (plan === 'entreprise') return <Badge className="bg-gradient-to-r from-pink-500 to-rose-500"><Briefcase className="w-3 h-3 mr-1" /> Business</Badge>;
    return <Badge variant="secondary"><User className="w-3 h-3 mr-1" /> Basic</Badge>;
  };

  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                <Settings className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">Paramètres</h1>
            </div>
            <p className="text-gray-400">Gérez vos informations personnelles, professionnelles et vos préférences</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Complétion</span>
                    <span className="text-sm font-bold text-white">{getCompletion()}%</span>
                  </div>
                  <Progress value={getCompletion()} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-500" />
                </div>
                {getCompletion() < 100 && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-300">À compléter</Badge>}
              </div>
            </div>
            {getPlanBadge()}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="border-white/20 text-gray-300">← Retour</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-cyan-600 to-blue-600">💾 Enregistrer</Button>
        </div>
      </div>

      {/* Navigation latérale (simplifiée) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-border bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Menu className="w-4 h-4 text-cyan-400" /> Navigation</CardTitle></CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'Profil', icon: User },
                  { id: 'personal', label: 'Infos personnelles', icon: User },
                  { id: 'professional', label: 'Identité pro', icon: Briefcase },
                  { id: 'social', label: 'Réseaux sociaux', icon: Instagram },
                  { id: 'location', label: 'Localisation', icon: MapPin },
                  { id: 'privacy', label: 'Confidentialité', icon: ShieldCheck },
                  { id: 'account', label: 'Gestion du compte', icon: Lock },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Section Profil */}
          <CollapsibleSection id="profile" title="Profil" icon={User} iconColor="text-cyan-400" expanded={expandedSections.profile} onToggle={() => toggleSection('profile')}>
            <CardContent className="space-y-6">
              {profile.plan === 'basic' ? (
                <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                  <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white font-bold">Fonctionnalité Premium</p>
                  <p className="text-gray-400 text-sm mb-4">Débloquez les photos de profil et couverture.</p>
                  <Button onClick={() => router.push('/dashboard/pricing')} className="bg-gradient-to-r from-purple-600 to-pink-500">Passer à Premium</Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 flex items-center justify-center text-2xl font-bold text-white border-4 border-white/30">
                        {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" /> : profile.full_name?.slice(0,2).toUpperCase() || '?'}
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <Button size="sm" variant="ghost" className="bg-white/20" onClick={() => fileInputRef.current?.click()}>Changer</Button>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'avatar')} />
                    </div>
                    <div className="flex-1">
                      <Label>Photo de profil</Label>
                      <Button variant="outline" className="w-full mt-1" onClick={() => fileInputRef.current?.click()}>Télécharger</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Photo de couverture</Label>
                    <div className="w-full h-48 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-black/30 cursor-pointer relative overflow-hidden" onClick={() => coverInputRef.current?.click()}>
                      {profile.cover_url ? <img src={profile.cover_url} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400"><ImageIcon className="w-12 h-12 mx-auto mb-2" /><p>Ajouter une couverture</p></div>}
                    </div>
                    <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'cover')} />
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleSection>

          {/* Section Informations personnelles */}
          <CollapsibleSection id="personal" title="Informations personnelles" icon={User} iconColor="text-cyan-400" expanded={expandedSections.personal} onToggle={() => toggleSection('personal')}>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Nom complet</Label><Input value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} className="bg-white/5 border-white/20 text-white" /></div>
              <div><Label>Pseudo</Label><div className="flex"><span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-white/5 text-gray-400">@</span><Input value={profile.username || ''} onChange={e => setProfile({...profile, username: e.target.value})} className="rounded-l-none bg-white/5 border-white/20 text-white" /></div></div>
              <div><Label>Email</Label><Input type="email" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} className="bg-white/5 border-white/20 text-white" /></div>
              <div><Label>Téléphone</Label><Input value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="bg-white/5 border-white/20 text-white" /></div>
              <div className="md:col-span-2"><Label>Bio courte</Label><Textarea value={profile.bio_short || ''} onChange={e => setProfile({...profile, bio_short: e.target.value})} rows={2} className="bg-white/5 border-white/20 text-white" /></div>
              <div className="md:col-span-2"><Label>Bio complète</Label><Textarea value={profile.bio_long || ''} onChange={e => setProfile({...profile, bio_long: e.target.value})} rows={4} className="bg-white/5 border-white/20 text-white" /></div>
            </CardContent>
          </CollapsibleSection>

          {/* Section Identité professionnelle */}
          <CollapsibleSection id="professional" title="Identité professionnelle" icon={Briefcase} iconColor="text-emerald-400" expanded={expandedSections.professional} onToggle={() => toggleSection('professional')}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Titre</Label><Input value={profile.job_title || ''} onChange={e => setProfile({...profile, job_title: e.target.value})} className="bg-white/5 border-white/20 text-white" /></div>
                <div><Label>Organisation</Label><Input value={profile.company || ''} onChange={e => setProfile({...profile, company: e.target.value})} className="bg-white/5 border-white/20 text-white" /></div>
              </div>
              <div><Label>Statut</Label><div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {(['student','employed','freelance','open_to_work','other'] as const).map(s => (
                  <Button key={s} variant={profile.professional_status === s ? "default" : "outline"} size="sm" onClick={() => setProfile({...profile, professional_status: s})} className={profile.professional_status === s ? "bg-gradient-to-r from-cyan-600 to-blue-600" : "border-white/20 text-gray-300"}>
                    {s === 'student' && 'Étudiant'}{s === 'employed' && 'En poste'}{s === 'freelance' && 'Freelance'}{s === 'open_to_work' && 'Ouvert'}{s === 'other' && 'Autre'}
                  </Button>
                ))}
              </div></div>
              <div><Label>Compétences</Label><Input value={profile.skills?.join(', ') || ''} onChange={e => setProfile({...profile, skills: e.target.value.split(',').map(s=>s.trim()).filter(s=>s)})} placeholder="React, Node.js, ..." className="bg-white/5 border-white/20 text-white" /></div>
            </CardContent>
          </CollapsibleSection>

          {/* Section Réseaux sociaux */}
          <CollapsibleSection id="social" title="Réseaux sociaux" icon={Instagram} iconColor="text-pink-400" expanded={expandedSections.social} onToggle={() => toggleSection('social')}>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'instagram', label: 'Instagram', icon: Instagram, prefix: '@' },
                { key: 'tiktok', label: 'TikTok', icon: SiTiktok, prefix: '@' },
                { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                { key: 'snapchat', label: 'Snapchat', icon: SnapchatIcon, prefix: '@' },
                { key: 'telegram', label: 'Telegram', icon: TelegramIcon, prefix: '@' },
                { key: 'github', label: 'GitHub', icon: Github },
                { key: 'pinterest', label: 'Pinterest', icon: PinterestIcon, prefix: '@' },
                { key: 'discord', label: 'Discord', icon: DiscordIcon, prefix: '@' },
                { key: 'reddit', label: 'Reddit', icon: RedditIcon, prefix: 'u/' },                
                { key: 'youtube', label: 'YouTube', icon: Youtube, prefix: '@' },
                { key: 'threads', label: 'Threads', icon: ThreadsIcon, prefix: '@' },
              ].map(({ key, label, icon: Icon, prefix }) => (
                <div key={key} className="space-y-1">
                  <Label className="flex items-center gap-2"><Icon className="w-4 h-4" /> {label}</Label>
                  <div className="flex">
                    {prefix && <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-white/5 text-gray-400">{prefix}</span>}
                    <Input value={profile[key as keyof Profile]?.toString().replace(new RegExp(`^${prefix}`), '') || ''} onChange={e => setProfile({...profile, [key]: e.target.value ? (prefix ? `${prefix}${e.target.value}` : e.target.value) : null})} className={`${prefix ? 'rounded-l-none' : ''} bg-white/5 border-white/20 text-white`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleSection>

          {/* Section Localisation */}
          <CollapsibleSection id="location" title="Localisation" icon={MapPin} iconColor="text-amber-400" expanded={expandedSections.location} onToggle={() => toggleSection('location')}>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Ville</Label><Input value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} className="bg-white/5 border-white/20 text-white" /></div>
              <div><Label>Pays</Label><Input value={profile.country || ''} onChange={e => setProfile({...profile, country: e.target.value})} className="bg-white/5 border-white/20 text-white" /></div>
              <div><Label>Fuseau horaire</Label><Input value={profile.timezone || ''} onChange={e => setProfile({...profile, timezone: e.target.value})} className="bg-white/5 border-white/20 text-white" /></div>
              <div className="md:col-span-3 pt-4"><Label>Disponibilité</Label><div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(['available','unavailable','by_appointment'] as const).map(s => (
                  <Button key={s} variant={profile.availability === s ? "default" : "outline"} size="sm" onClick={() => setProfile({...profile, availability: s})} className={profile.availability === s ? "bg-gradient-to-r from-emerald-600 to-green-600" : "border-white/20 text-gray-300"}>
                    {s === 'available' && '✅ Disponible'}{s === 'unavailable' && '❌ Indisponible'}{s === 'by_appointment' && '📅 Sur RDV'}
                  </Button>
                ))}
              </div></div>
            </CardContent>
          </CollapsibleSection>

          {/* Section Confidentialité */}
          <CollapsibleSection id="privacy" title="Confidentialité" icon={ShieldCheck} iconColor="text-purple-400" expanded={expandedSections.privacy} onToggle={() => toggleSection('privacy')}>
           <CardContent className="space-y-4">
  <div className="flex justify-between items-center p-4 rounded-xl bg-purple-900/20">
    <div><Label>Profil public</Label><p className="text-xs text-gray-400">Rendre votre profil visible</p></div>
    <Switch checked={profile.is_public ?? false} onCheckedChange={c => setProfile({...profile, is_public: c})} className="data-[state=checked]:bg-purple-500" />
  </div>
  <div className="flex justify-between items-center p-4 rounded-xl bg-cyan-900/20">
    <div><Label>Alertes de connexion</Label><p className="text-xs text-gray-400">Recevoir des notifications</p></div>
    <Switch checked={profile.enable_connection_alerts ?? false} onCheckedChange={c => setProfile({...profile, enable_connection_alerts: c})} className="data-[state=checked]:bg-cyan-500" />
  </div>
  <div className="flex justify-between items-center p-4 rounded-xl bg-amber-900/20">
    <div><Label>Demandes de contact</Label><p className="text-xs text-gray-400">Autoriser les visiteurs à vous contacter</p></div>
    <Switch checked={profile.accepts_contact_requests ?? false} onCheckedChange={c => setProfile({...profile, accepts_contact_requests: c})} className="data-[state=checked]:bg-amber-500" />
  </div>
</CardContent>
          </CollapsibleSection>

          {/* Section Gestion du compte */}
          <CollapsibleSection id="account" title="Gestion du compte" icon={Lock} iconColor="text-red-400" expanded={expandedSections.account} onToggle={() => toggleSection('account')}>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/30">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div><Label className="text-amber-400">Désactiver temporairement</Label><p className="text-sm text-gray-400">Rendre votre profil invisible sans perdre vos données</p></div>
                  <Button variant="outline" className="border-amber-500/30 text-amber-300" onClick={() => toast.info('Fonctionnalité à venir')}>Désactiver</Button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div><Label className="text-red-400">Supprimer définitivement</Label><p className="text-sm text-gray-400">Action irréversible</p></div>
                  <Button variant="destructive" className="bg-red-500/20 text-red-300" onClick={() => toast.error('Contactez le support')}>Supprimer</Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleSection>
        </div>
      </div>

      <DashboardQuickMenu onAction={handleQuickAction} actions={quickActions} />
    </div>
  );
}