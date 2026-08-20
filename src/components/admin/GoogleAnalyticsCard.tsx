// src/components/admin/GoogleAnalyticsCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapPin, BarChart3, Users, Clock, TrendingUp, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

type AnalyticsData = {
  configured: boolean;
  summary?: { totalUsers: number; totalPageViews: number; avgSessionDuration: number; avgBounceRate: number; period: string };
  daily?: Array<{ date: string; activeUsers: number; pageViews: number; avgSessionDuration: number; bounceRate: number; newUsers: number }>;
  byCountry?: Array<{ country: string; city: string; pageViews: number; users: number; newUsers: number }>;
  error?: string;
};

export function GoogleAnalyticsCard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics/google');
      if (!res.ok) throw new Error((await res.json()).error || `Erreur ${res.status}`);
      setData(await res.json());
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les données');
      setData({ configured: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  // Non configuré
  if (data?.configured === false && !loading) {
    return (
      <div className="rounded-2xl p-5 bg-amber-500/[0.03] backdrop-blur-sm border border-amber-500/[0.08]">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400/60 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-300/70 mb-1">Google Analytics non configuré</h3>
            <p className="text-xs text-amber-200/50 font-light mb-2">Configurez les variables d'environnement pour afficher les statistiques.</p>
            <a href="https://developers.google.com/analytics" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400/60 hover:text-cyan-300/70 font-light underline">
              Guide de configuration
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Chargement
  if (loading || !data?.summary) {
    return (
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-cyan-400/60 animate-spin" />
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.daily?.map(d => format(new Date(`${d.date.slice(0,4)}-${d.date.slice(4,6)}-${d.date.slice(6,8)}`), 'dd MMM', { locale: fr })) || [],
    datasets: [
      { label: 'Utilisateurs', data: data.daily?.map(d => d.activeUsers) || [], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', tension: 0.3, fill: true, pointRadius: 2 },
      { label: 'Pages vues', data: data.daily?.map(d => d.pageViews) || [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', tension: 0.3, fill: true, borderDash: [4, 4], pointRadius: 2 },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const, labels: { color: '#94a3b8', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' }, beginAtZero: true },
    },
  };

  const countryChartData = {
    labels: data.byCountry?.map(item => item.country) || [],
    datasets: [
      { label: 'Pages vues', data: data.byCountry?.map(item => item.pageViews) || [], backgroundColor: 'rgba(245,158,11,0.5)', borderColor: 'rgba(245,158,11,0.8)', borderWidth: 1, borderRadius: 3 },
      { label: 'Utilisateurs', data: data.byCountry?.map(item => item.users) || [], backgroundColor: 'rgba(14,165,233,0.5)', borderColor: 'rgba(14,165,233,0.8)', borderWidth: 1, borderRadius: 3 },
    ],
  };

  const countryChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const, labels: { color: '#94a3b8', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 }, callback: (v: any) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v }, grid: { color: 'rgba(255,255,255,0.03)' }, beginAtZero: true },
      y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
    },
  };

  const statCards = [
    { icon: Users, label: 'Utilisateurs', value: data.summary.totalUsers.toLocaleString('fr-FR'), color: 'text-cyan-400/60' },
    { icon: BarChart3, label: 'Pages vues', value: data.summary.totalPageViews.toLocaleString('fr-FR'), color: 'text-emerald-400/60' },
    { icon: Clock, label: 'Session moy.', value: `${Math.round(data.summary.avgSessionDuration)}s`, color: 'text-amber-400/60' },
    { icon: TrendingUp, label: 'Rebond', value: `${data.summary.avgBounceRate.toFixed(1)}%`, color: 'text-purple-400/60' },
  ];

  return (
    <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400/60" />
            Google Analytics
          </h3>
          <p className="text-[11px] text-gray-500/50 font-light mt-0.5">{data.summary.period}</p>
        </div>
        <button onClick={fetchAnalytics} className="p-1.5 text-gray-400/50 hover:text-cyan-400/60 rounded-lg hover:bg-white/[0.04] transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((stat, i) => (
          <div key={i} className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="text-[11px] text-gray-500/60 font-light">{stat.label}</span>
            </div>
            <p className="text-lg font-semibold text-white/80">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Graphique principal */}
      <div className="h-72 mb-6">
        {data.daily && data.daily.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-500/40 font-light">Aucune donnée disponible</div>
        )}
      </div>

      {/* Pays */}
      {data.byCountry && data.byCountry.length > 0 && (
        <div className="pt-5 border-t border-white/[0.06]">
          <h4 className="text-xs font-semibold text-white/60 flex items-center gap-2 mb-3">
            <MapPin className="w-3.5 h-3.5 text-amber-400/60" />
            Vues par pays
          </h4>
          <div className="h-64">
            <Bar data={countryChartData} options={countryChartOptions} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {data.byCountry.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#0ea5e9' : i === 2 ? '#8b5cf6' : '#10b981' }} />
                <div className="min-w-0">
                  <p className="text-[11px] text-white/70 font-medium truncate">{item.country}</p>
                  <p className="text-[10px] text-gray-500/50 font-light">{item.pageViews.toLocaleString('fr-FR')} vues</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}