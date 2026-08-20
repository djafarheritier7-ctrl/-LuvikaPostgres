// src/app/dashboard/card-config/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '../../../../components/ui/input';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Contact, Globe, Calendar, Link, FileText, Briefcase,
  CheckCircle, RefreshCw, ArrowLeft, X, Eye, QrCode,
  ChevronRight, Lock, Crown,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { createClient } from '../../../../src/lib/supabase/client';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type ScanConfig = {
  scan_type: string;
  enabled: boolean;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  premium?: boolean;
};

export default function CardConfigPage() {
  const t = useTranslations('dashboard.card_config');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, boolean>>({});
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  const [userPlan, setUserPlan] = useState('basic');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'locked'>('all');

  const isPremium = userPlan === 'premium' || userPlan === 'entreprise';

  const scanOptions: ScanConfig[] = [
    { scan_type: 'profile', enabled: configs.profile || false, label: t('types.profile'), description: t('descriptions.profile'), icon: <User className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500' },
    { scan_type: 'contact', enabled: configs.contact || false, label: t('types.contact'), description: t('descriptions.contact'), icon: <Contact className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
    { scan_type: 'social', enabled: configs.social || false, label: t('types.social'), description: t('descriptions.social'), icon: <Globe className="w-5 h-5" />, color: 'from-purple-500 to-indigo-500' },
    { scan_type: 'event', enabled: configs.event || false, label: 'Événements', description: 'Affiche vos événements publics à venir', icon: <Calendar className="w-5 h-5" />, color: 'from-amber-500 to-orange-500', premium: true },
    { scan_type: 'custom', enabled: configs.custom || false, label: 'Lien personnalisé', description: 'Affiche un lien vers votre site', icon: <Link className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' },
    { scan_type: 'cv', enabled: configs.cv || false, label: 'CV', description: 'Affiche votre CV', icon: <FileText className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500', premium: true },
    { scan_type: 'business', enabled: configs.business || false, label: t('types.business'), description: t('descriptions.business'), icon: <Briefcase className="w-5 h-5" />, color: 'from-gray-500 to-zinc-500', premium: true },
  ];

  const filteredOptions = scanOptions.filter(option => {
    if (activeTab === 'active') return option.enabled;
    if (activeTab === 'locked') return option.premium && !isPremium;
    return true;
  });

  const stats = {
    total: scanOptions.length,
    active: scanOptions.filter(opt => opt.enabled).length,
    locked: scanOptions.filter(opt => opt.premium && !isPremium).length,
  };

  const fetchConfigs = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase.from('profiles').select('plan, custom_link_url').eq('id', user.id).single();
    setUserPlan(profileData?.plan || 'basic');
    setCustomLinkUrl(profileData?.custom_link_url || '');

    const { data } = await supabase.from('card_configs').select('scan_type, enabled').eq('profile_id', user.id).in('scan_type', scanOptions.map(o => o.scan_type));
    const map: Record<string, boolean> = {};
    data?.forEach((cfg: any) => { map[cfg.scan_type] = cfg.enabled; }); // ✅ Correction ici
    setConfigs(map);
    setLoading(false);
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleToggle = async (scanType: string) => {
    const option = scanOptions.find(opt => opt.scan_type === scanType);
    if (option?.premium && !isPremium) {
      toast.warning('✨ Fonctionnalité Premium', { description: 'Débloquez toutes les options avec un abonnement Premium ou Entreprise' });
      return;
    }
    const current = configs[scanType];
    const next = !current;
    setSaving(scanType);
    setConfigs(prev => ({ ...prev, [scanType]: next }));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('card_configs').upsert({
      profile_id: user.id, scan_type: scanType, enabled: next,
      updated_at: new Date().toISOString(),
      priority: scanOptions.findIndex(o => o.scan_type === scanType) + 1,
    }, { onConflict: 'profile_id,scan_type' });

    if (error) {
      setConfigs(prev => ({ ...prev, [scanType]: current }));
      toast.error('Échec de la mise à jour');
    } else {
      toast.success(`✅ ${option?.label} ${next ? 'activé' : 'désactivé'}`);
    }
    setSaving(null);
  };

  const handleSaveCustomUrl = async () => {
    if (!customLinkUrl.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ custom_link_url: customLinkUrl.trim() }).eq('id', user.id);
    toast.success('✅ URL enregistrée');
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl"><QrCode className="w-5 h-5 text-cyan-400" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
            <p className="text-sm text-gray-400">Personnalisez les fonctionnalités de votre carte NFC et QR Code.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="border-white/20 text-gray-300">
          <ArrowLeft className="w-4 h-4 mr-1" />
        </Button>
      </div>

      {/* Stats + Filtres */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['all', 'active', 'locked'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === tab ? 'bg-cyan-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab === 'all' ? `Toutes (${stats.total})` : tab === 'active' ? `Activées (${stats.active})` : <><Lock className="w-3 h-3 inline mr-1" />Verrouillées ({stats.locked})</>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-4 h-4" />
            <span className="font-medium">{stats.active} </span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <Shield className="w-4 h-4" />
            <span className="font-medium">{stats.locked} </span>
          </div>
          {getPlanBadge(isPremium, userPlan)}
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filteredOptions.map((option, i) => {
          const isLocked = option.premium && !isPremium;
          return (
            <motion.div
              key={option.scan_type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !isLocked && handleToggle(option.scan_type)}
              className={`rounded-xl border transition-all duration-200 ${
                isLocked ? 'opacity-60 cursor-not-allowed border-white/5 bg-white/2' :
                option.enabled ? 'border-emerald-500/30 bg-emerald-500/5 cursor-pointer hover:border-emerald-500/50' :
                'border-white/10 bg-white/5 cursor-pointer hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shrink-0`}>
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">{option.label}</h3>
                    {option.enabled && <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Activé</Badge>}
                    {isLocked && <Badge className="bg-amber-500/20 text-amber-300 text-[10px]"><Lock className="w-3 h-3 mr-0.5 inline" />Premium</Badge>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{option.description}</p>
                </div>
                {!isLocked && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${option.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-500'}`}>
                    {option.enabled ? <CheckCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                )}
              </div>

              {option.scan_type === 'custom' && option.enabled && (
                <div className="px-4 pb-4" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={customLinkUrl}
                      onChange={e => setCustomLinkUrl(e.target.value)}
                      className="h-8 text-xs bg-white/5 border-white/10 text-white"
                    />
                    <Button size="sm" onClick={handleSaveCustomUrl} className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700">Enregistrer</Button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function getPlanBadge(isPremium: boolean, plan: string) {
  if (!isPremium) return <Badge className="bg-gray-700 text-gray-300 text-[10px]"><User className="w-3 h-3 mr-1 inline" />Basic</Badge>;
  return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px]"><Crown className="w-3 h-3 mr-1 inline" />{plan === 'premium' ? '' : ''}</Badge>;
}