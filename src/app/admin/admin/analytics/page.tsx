// src/app/admin/admin/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Users, Scan, Package, CreditCard, TrendingUp,
  RefreshCw, Download, Activity, Clock, Calendar, Search,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';
import { GoogleAnalyticsCard } from '@/src/components/admin/GoogleAnalyticsCard';
import { AdminCard } from '@/src/components/admin/AdminCard';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

type Period = '7d' | '30d' | 'month' | 'year' | 'all';
type ChartPeriod = 'day' | 'week' | 'month' | 'year';

type AnalyticsStats = {
  total_users: number;
  total_scans: number;
  total_orders: number;
  total_nfc_cards: number;
  scans_last_7d: number;
  pending_orders: number;
  active_nfc_cards: number;
};

type ScanData = {
  period_label: string;
  scan_count: number;
  unique_users: number;
};

type ActivityItem = {
  id: string;
  event_type: string;
  description: string;
  user_name: string | null;
  created_at: string;
};

const ITEMS_PER_PAGE = 10;

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [scansData, setScansData] = useState<ScanData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('day');
  const [activityPage, setActivityPage] = useState(1);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Stats générales - compatibles avec le shim (pas de count/head)
      const [profilesData, scansDataRes, ordersData, nfcCardsData] = await Promise.all([
        supabase.from('profiles').select('id'),
        supabase.from('scans').select('id'),
        supabase.from('orders').select('id'),
        supabase.from('nfc_cards').select('id'),
      ]);

      setStats({
        total_users: profilesData.data?.length || 0,
        total_scans: scansDataRes.data?.length || 0,
        total_orders: ordersData.data?.length || 0,
        total_nfc_cards: nfcCardsData.data?.length || 0,
        scans_last_7d: 0,
        pending_orders: 0,
        active_nfc_cards: 0,
      });

      // Scans (données simulées)
      setScansData([
        { period_label: 'Lun', scan_count: 45, unique_users: 30 },
        { period_label: 'Mar', scan_count: 52, unique_users: 35 },
        { period_label: 'Mer', scan_count: 38, unique_users: 28 },
        { period_label: 'Jeu', scan_count: 65, unique_users: 42 },
        { period_label: 'Ven', scan_count: 70, unique_users: 48 },
        { period_label: 'Sam', scan_count: 55, unique_users: 38 },
        { period_label: 'Dim', scan_count: 30, unique_users: 22 },
      ]);

      // Activité récente
      const { data: orders } = await supabase
        .from('orders')
        .select('id, created_at, status, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: ActivityItem[] = [
        ...(orders || []).map((o: any) => ({
          id: o.id,
          event_type: 'order',
          description: `Commande ${o.status}`,
          user_name: Array.isArray(o.profiles) ? o.profiles[0]?.full_name : (o.profiles as any)?.full_name || 'Inconnu',
          created_at: o.created_at,
        })),
        ...(users || []).map((u: any) => ({
          id: u.id,
          event_type: 'user',
          description: 'Nouvelle inscription',
          user_name: u.full_name || 'Inconnu',
          created_at: u.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecentActivity(activities);
    } catch (err) {
      console.error('Erreur analytics:', err);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const totalActivityPages = Math.ceil(recentActivity.length / ITEMS_PER_PAGE);
  const paginatedActivity = recentActivity.slice((activityPage - 1) * ITEMS_PER_PAGE, activityPage * ITEMS_PER_PAGE);

  const formatDateTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { locale: fr, addSuffix: true });
  };

  if (loading) return <Loading />;

  const statCards = [
    { title: 'Utilisateurs', value: stats?.total_users || 0, icon: <Users className="w-4 h-4" />, color: 'from-cyan-500/60 to-blue-500/60' },
    { title: 'Scans totaux', value: stats?.total_scans || 0, icon: <Scan className="w-4 h-4" />, color: 'from-blue-500/60 to-indigo-500/60' },
    { title: 'Commandes', value: stats?.total_orders || 0, icon: <Package className="w-4 h-4" />, color: 'from-purple-500/60 to-pink-500/60' },
    { title: 'Cartes NFC', value: stats?.total_nfc_cards || 0, icon: <CreditCard className="w-4 h-4" />, color: 'from-amber-500/60 to-orange-500/60' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white/80">Analytics</h1>
            <p className="text-xs text-gray-400/60 font-light mt-1">Vue d'ensemble des performances</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
              {['7d', '30d', 'month', 'year', 'all'].map((v) => (
                <button key={v} onClick={() => setPeriod(v as Period)}
                  className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors ${
                    period === v ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                  }`}>{v === '7d' ? '7j' : v === '30d' ? '30j' : v === 'month' ? 'Mois' : v === 'year' ? 'Année' : 'Tout'}</button>
              ))}
            </div>
            <Button onClick={fetchAnalytics} className="h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <AdminCard key={i} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scans */}
        <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400/60" /> Activité des scans
            </h3>
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
              {['day', 'week', 'month'].map((v) => (
                <button key={v} onClick={() => setChartPeriod(v as ChartPeriod)}
                  className={`px-2 py-0.5 text-[10px] font-light rounded-md transition-colors ${
                    chartPeriod === v ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                  }`}>{v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'}</button>
              ))}
            </div>
          </div>
          <div className="h-48 flex items-end gap-2 px-2">
            {scansData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-cyan-500/60 to-cyan-500/20 rounded-t-md transition-all" style={{ height: `${(d.scan_count / 70) * 100}%`, minHeight: 4 }} />
                <span className="text-[10px] text-gray-500/50 font-light">{d.period_label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Google Analytics */}
        <GoogleAnalyticsCard />
      </div>

      {/* Activité récente */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400/60" /> Activité récente
        </h3>

        {paginatedActivity.length === 0 ? (
          <p className="text-xs text-gray-400/60 font-light text-center py-8">Aucune activité récente.</p>
        ) : (
          <div className="space-y-1.5">
            {paginatedActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  item.event_type === 'order' ? 'bg-purple-400/60' :
                  item.event_type === 'scan' ? 'bg-cyan-400/60' : 'bg-emerald-400/60'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 font-medium truncate">{item.description}</p>
                  <p className="text-[11px] text-gray-400/50 font-light truncate">{item.user_name || 'Anonyme'}</p>
                </div>
                <span className="text-[10px] text-gray-500/40 font-light flex-shrink-0">{formatDateTime(item.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination activité */}
        {totalActivityPages > 1 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[10px] text-gray-500/40 font-light">Page {activityPage} sur {totalActivityPages}</p>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="sm" onClick={() => setActivityPage(p => Math.max(1, p - 1))} disabled={activityPage === 1}
                className="h-6 w-6 p-0 text-gray-400/60 hover:text-white/70 rounded disabled:opacity-30">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map(page => (
                <Button key={page} variant="ghost" size="sm" onClick={() => setActivityPage(page)}
                  className={`h-6 w-6 p-0 text-[10px] font-light rounded ${page === activityPage ? 'bg-white/[0.06] text-white/80' : 'text-gray-400/60 hover:text-white/70'}`}>
                  {page}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setActivityPage(p => Math.min(totalActivityPages, p + 1))} disabled={activityPage === totalActivityPages}
                className="h-6 w-6 p-0 text-gray-400/60 hover:text-white/70 rounded disabled:opacity-30">
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}