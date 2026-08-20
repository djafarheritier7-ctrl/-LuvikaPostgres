// src/app/dashboard/statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, Eye, Download, RefreshCw,
  ArrowLeft, QrCode, Smartphone, Crown, Lock,
  BarChart2, LineChart, PieChart, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/src/lib/supabase/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler);

type AnalyticsData = { total: number; byType: { type: string; count: number }[]; byDay: { date: string; count: number }[]; recent: any[] };

export default function StatisticsPage() {
  const t = useTranslations('dashboard.statistics');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [userPlan, setUserPlan] = useState('basic');

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setHasAccess(false); setLoading(false); return; }
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
      const plan = profile?.plan || 'basic';
      setUserPlan(plan);
      const access = plan === 'premium' || plan === 'entreprise';
      setHasAccess(access);
      if (access) await fetchAnalytics();
      setLoading(false);
    };
    init();
  }, []);

  const fetchAnalytics = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const now = new Date();
    let start = new Date();
    if (dateRange === '7d') start.setDate(now.getDate() - 7);
    else if (dateRange === '30d') start.setDate(now.getDate() - 30);
    else if (dateRange === '90d') start.setDate(now.getDate() - 90);
    else start = new Date('2020-01-01');

    const { data: scans } = await supabase.from('scans').select('id, scan_type, created_at, profiles(full_name, username)')
      .eq('profile_id', user.id).gte('created_at', start.toISOString()).order('created_at', { ascending: false });

    const byType = ['nfc', 'qr_profile', 'qr_event'].map(type => ({ type, count: scans?.filter((s: any) => s.scan_type === type).length || 0 }));
    const dayMap = new Map<string, number>();
    scans?.forEach((s: any) => { const d = new Date(s.created_at).toLocaleDateString('fr-FR'); dayMap.set(d, (dayMap.get(d) || 0) + 1); });
    const byDay = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count })).slice(0, 14);

    setData({ total: scans?.length || 0, byType, byDay, recent: scans?.slice(0, 10) || [] });
  };

  useEffect(() => { if (hasAccess) fetchAnalytics(); }, [dateRange, hasAccess]);

  const handleExport = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: scans } = await supabase.from('scans').select('created_at, scan_type, profiles(full_name, username)').eq('profile_id', user.id).order('created_at', { ascending: false });
    if (!scans?.length) { toast.warning('Aucun scan'); return; }
    const csv = [['Date', 'Type', 'Visiteur'].join(','), ...scans.map((s: any) => [`"${new Date(s.created_at).toLocaleString('fr-FR')}"`, s.scan_type, `"${s.profiles?.[0]?.full_name || s.profiles?.[0]?.username || 'Anonyme'}"`].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `stats_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    toast.success('✅ Export CSV téléchargé');
  };

  const getCountByType = (type: string) => data?.byType.find(t => t.type === type)?.count || 0;

  const scanChartData = {
    labels: data?.byDay.map(d => d.date) || [],
    datasets: [{ label: 'Scans', data: data?.byDay.map(d => d.count) || [], borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.1)', borderWidth: 2, fill: true, tension: 0.3 }]
  };

  const typeChartData = {
    labels: ['NFC', 'QR Profil', 'QR Lien'],
    datasets: [{ data: [getCountByType('nfc'), getCountByType('qr_profile'), getCountByType('qr_event')], backgroundColor: ['rgba(245,158,11,0.7)', 'rgba(56,189,248,0.7)', 'rgba(16,185,129,0.7)'] }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8', precision: 0 }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true } } };

  if (loading) return <Loading />;

  if (hasAccess === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Statistiques Premium</h2>
        <p className="text-gray-400 mb-6">Cette fonctionnalité est réservée aux plans Premium et Entreprise.</p>
        <Button onClick={() => router.push('/dashboard/pricing')} className="bg-gradient-to-r from-cyan-500 to-blue-600">
          <Crown className="w-4 h-4 mr-2" /> Passer à Premium
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl"><BarChart3 className="w-5 h-5 text-cyan-400" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
            <p className="text-sm text-gray-400">{data?.total || 0} scans</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="border-white/20 text-gray-300"><ArrowLeft className="w-4 h-4 mr-1" /> </Button>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="border-white/20 text-gray-300"><RefreshCw className="w-4 h-4 mr-1" /> </Button>
          <Button size="sm" onClick={handleExport} className="bg-cyan-600 text-white"><Download className="w-4 h-4 mr-1" /> </Button>
        </div>
      </div>

      {/* Filtre période */}
      <div className="flex gap-2 mb-6">
        {['7d', '30d', '90d', 'all'].map(r => (
          <button key={r} onClick={() => setDateRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${dateRange === r ? 'bg-cyan-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {r === '7d' ? '7 jours' : r === '30d' ? '30 jours' : r === '90d' ? '90 jours' : 'Tout'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[{ label: 'Total', value: data?.total || 0, color: 'text-white', bg: 'bg-white/5' },
          { label: 'NFC', value: getCountByType('nfc'), color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'QR Profil', value: getCountByType('qr_profile'), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'QR Lien', value: getCountByType('qr_event'), color: 'text-emerald-400', bg: 'bg-emerald-500/10' }].map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4 border border-white/10`}>
            <p className="text-xs text-gray-400">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-border bg-white/5 border-white/10">
          <CardHeader><CardTitle className="text-white text-sm">Évolution</CardTitle></CardHeader>
          <CardContent className="h-64">{data?.byDay.length ? <Line data={scanChartData} options={chartOptions} /> : <p className="text-gray-500 text-center pt-20">Aucune donnée</p>}</CardContent>
        </Card>
        <Card className="glass-border bg-white/5 border-white/10">
          <CardHeader><CardTitle className="text-white text-sm">Répartition</CardTitle></CardHeader>
          <CardContent className="h-64 flex items-center justify-center">{data?.byType.length ? <Doughnut data={typeChartData} options={{ ...chartOptions, cutout: '70%' }} /> : <p className="text-gray-500">Aucune donnée</p>}</CardContent>
        </Card>
      </div>

      {/* Derniers scans */}
      <Card className="glass-border bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400" />Derniers scans</CardTitle></CardHeader>
        <CardContent>
          {!data?.recent.length ? <p className="text-gray-500 text-center py-8">Aucun scan</p> : (
            <div className="space-y-1">
              {data.recent.map(scan => (
                <div key={scan.id} className="flex items-center justify-between py-2 text-sm border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    {scan.scan_type === 'nfc' ? <Smartphone className="w-4 h-4 text-amber-400" /> : <QrCode className="w-4 h-4 text-cyan-400" />}
                    <span className="text-gray-300">{scan.profiles?.[0]?.full_name || scan.profiles?.[0]?.username || 'Anonyme'}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{new Date(scan.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}