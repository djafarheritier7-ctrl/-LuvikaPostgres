// src/components/admin/AdminActions.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, CreditCard, Scan, Package, Shield, BarChart3, 
  Send, Eye, MessageCircle, QrCode, AlertTriangle, FileText 
} from 'lucide-react';
import UserSelector from '../../src/app/admin/UserSelector';
import { createClient } from '../../src/lib/supabase/client';

type Stats = {
  total_users: number;
  active_subscriptions: number;
  total_scans: number;
  orders: number;
  nfc_cards: number;
};

// ✅ Type cohérent — importé depuis UserSelector via fichier séparé
export type User = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  subscription_plan: 'basic' | 'premium' | 'entreprise';
};

export default function AdminActions() {
  const t = useTranslations();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 🔹 Récupère les statistiques en temps réel
  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      try {
        const [
          { count: total_users },
          { count: active_subscriptions },
          { count: total_scans },
          { count: orders },
          { count: nfc_cards }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('scans').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('nfc_cards').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          total_users: total_users || 0,
          active_subscriptions: active_subscriptions || 0,
          total_scans: total_scans || 0,
          orders: orders || 0,
          nfc_cards: nfc_cards || 0,
        });
      } catch (err: any) {
        console.error('❌ Erreur stats:', err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
console.log('📧 Utilisateur sélectionné:', selectedUser);
  
const handleSendWelcomeEmail = async () => {
  if (!selectedUser?.email) {
    setToast({ type: 'error', message: 'Veuillez sélectionner un utilisateur' });
    return;
  }

  setIsSending(true);
  try {
    const res = await fetch('/api/admin/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: selectedUser.email }),
    });

    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.error || 'Échec de l\'envoi');
    }

    setToast({ 
      type: 'success', 
      message: `Email de bienvenue envoyé à ${selectedUser.email}` 
    });
    
    // ✅ Optionnel : Reset après 3 secondes
    setTimeout(() => {
      setToast(null);
      setSelectedUser(null);
    }, 3000);
  } catch (err: any) {
    console.error('📧 Erreur envoi email:', err);
    setToast({ 
      type: 'error', 
      message: err.message || 'Erreur lors de l\'envoi de l\'email' 
    });
  } finally {
    setIsSending(false);
  }
};

  // 🔹 Modules admin
  const modules = [
    { key: 'subscriptions', icon: CreditCard, title: t('admin.modules.subscriptions.title'), description: t('admin.modules.subscriptions.description'), href: '/admin/admin/subscriptions', stat: stats?.active_subscriptions },
    { key: 'nfc', icon: Shield, title: t('admin.modules.nfc.title'), description: t('admin.modules.nfc.description'), href: '/admin/admin/nfc', stat: stats?.nfc_cards },
    { key: 'users', icon: Users, title: t('admin.modules.users.title'), description: t('admin.modules.users.description'), href: '/admin/admin/users', stat: stats?.total_users },
    { key: 'orders', icon: Package, title: t('admin.modules.orders.title'), description: t('admin.modules.orders.description'), href: '/admin/admin/orders', stat: stats?.orders },
    { key: 'contact_requests', icon: MessageCircle, title: 'Messages visiteurs', description: 'Gérez les demandes de contact', href: '/admin/admin/contact-requests', badge: { color: 'bg-yellow-500/20 text-yellow-300', icon: AlertTriangle } },
    { key: 'events', icon: QrCode, title: 'Événements', description: 'Créez et gérez des QR codes d’événements', href: '/admin/admin/events', badge: { color: 'bg-cyan-500/20 text-cyan-300', icon: Eye } },
    { key: 'upgrade_requests', icon: FileText, title: 'Demandes de mise à niveau', description: 'Approuvez ou rejetez les demandes Premium', href: '/admin/admin/upgrade-requests', badge: { color: 'bg-purple-500/20 text-purple-300', icon: Shield } },
    { key: 'analytics', icon: BarChart3, title: t('admin.modules.analytics.title'), description: t('admin.modules.analytics.description'), href: '/admin/admin/analytics' },
  ];

  return (
    <div className="space-y-6">
      {/* 🔹 Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg ${
          toast.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {toast.message}
        </div>
      )}

      {/* 🔹 Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: t('admin.stats.total_users'), value: stats?.total_users, icon: Users, color: 'text-blue-400' },
          { label: t('admin.stats.active_subscriptions'), value: stats?.active_subscriptions, icon: CreditCard, color: 'text-cyan-400' },
          { label: t('admin.stats.total_scans'), value: stats?.total_scans, icon: Scan, color: 'text-purple-400' },
          { label: t('admin.stats.orders'), value: stats?.orders, icon: Package, color: 'text-emerald-400' },
          { label: t('admin.stats.nfc_cards'), value: stats?.nfc_cards, icon: Shield, color: 'text-indigo-400' },
        ].map((item, i) => (
          <Card key={i} className="glass-border bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-xl font-bold text-white">{loading ? '...' : item.value}</p>
                </div>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🔹 Email de bienvenue */}
      <Card className="glass-border rounded-xl bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Send className="h-5 w-5" />
            {t('admin.actions.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/5 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-white">{t('admin.actions.welcome_email.title')}</h3>
              <p className="text-sm text-gray-400 mt-1">{t('admin.actions.welcome_email.description')}</p>
              <div className="mt-3 max-w-md">
                <UserSelector
                  onSelect={setSelectedUser}
                  selectedUser={selectedUser}
                  displayField="email"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSendWelcomeEmail}
              disabled={!selectedUser || isSending}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 shrink-0"
            >
              {isSending ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2">⚙️</span>
                  {t('admin.actions.sending')}
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('admin.actions.welcome_email.button')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          const BadgeIcon = module.badge?.icon;
          return (
            <Card key={module.key} className="glass-border bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-blue-300">
                    <Icon className="h-5 w-5" />
                    {module.title}
                  </CardTitle>
                  {module.badge && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${module.badge.color}`}>
                      {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                      {module.stat || 'Nouveau'}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">{module.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                  onClick={() => router.push(module.href)}
                >
                  {t('admin.modules.subscriptions.action') || 'Accéder'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}