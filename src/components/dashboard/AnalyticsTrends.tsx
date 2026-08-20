// src/components/dashboard/AnalyticsTrends.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { ArrowUp, TrendingUp } from 'lucide-react';
import { Button } from '../../../components/ui/button'; // ✅ Import séparé

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type AnalyticsData = {
  daily: { date: string; count: number }[];
  qrNfc: { qr_count: number; nfc_count: number; total: number };
  topIps: { ip_prefix: string; count: number }[];
};

export default function AnalyticsTrends({
  profileId,
  plan,
}: {
  profileId: string;
  plan: string | null;
}) {
  // 🔹 ✅ Freemium / Basic → affiche upgrade
  const isFreePlan = !plan || plan === 'freemium' || plan === 'basic';

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFreePlan) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?profile_id=${profileId}&range=${range}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('❌ Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [profileId, range, isFreePlan]);

  if (isFreePlan) {
    return (
      <Card className="glass-border bg-gradient-to-br from-gray-900/50 to-indigo-900/10 border border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-cyan-400" />
            📈 Vos tendances (Premium)
          </CardTitle>
          <p className="text-sm text-gray-400">
            Découvrez l’évolution de vos scans, QR vs NFC, et géolocalisation
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <ArrowUp className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="font-bold text-white mb-2">Débloquez les analytics pro</h3>
            <p className="text-gray-300 text-sm mb-4">
              Passez à <span className="font-medium text-purple-300">Premium</span> pour :
            </p>
            <ul className="text-left text-gray-400 text-xs space-y-1 mb-6 max-w-xs mx-auto">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Évolution quotidienne
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Répartition QR / NFC
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Top régions (anonymisé)
              </li>
            </ul>
            <Button
              variant="default"
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white"
              onClick={() => {
  // 🔹 🚀 Redirige vers page upgrade (simple et universel)
  window.location.href = '/dashboard?open=upgrade';
}}
            >
              🚀 Passer à Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

// ✅ Loader élégant
 
  const { daily = [], qrNfc = { qr_count: 0, nfc_count: 0, total: 0 }, topIps = [] } = data || {};

  const dailyChart = {
    labels: daily.map(d => d.date.split('-').slice(1).join('/')),
    datasets: [
      {
        label: 'Scans par jour',
        data: daily.map(d => d.count),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const qrNfcData = {
    labels: ['QR Code', 'NFC'],
    datasets: [
      {
        data: [qrNfc.qr_count, qrNfc.nfc_count],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <Card className="glass-border bg-transparent border-white/10">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-cyan-400" />
              📈 Vos tendances
            </CardTitle>
            <p className="text-sm text-gray-400">
              Scans des {range === 'week' ? '7 derniers jours' : '30 derniers jours'}
            </p>
          </div>
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setRange('week')}
              className={`px-3 py-1 text-xs rounded-md ${
                range === 'week' ? 'bg-cyan-500 text-white' : 'text-gray-300'
              }`}
            >
              7j
            </button>
            <button
              onClick={() => setRange('month')}
              className={`px-3 py-1 text-xs rounded-md ${
                range === 'month' ? 'bg-cyan-500 text-white' : 'text-gray-300'
              }`}
            >
              30j
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🔹 Graphe quotidien */}
          <div>
            <h3 className="font-medium text-white mb-3">évolution quotidienne</h3>
            <div className="h-48">
              <Bar
                data={dailyChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            </div>
          </div>

          {/* 🔹 Répartition + IPs */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-white mb-3">Répartition</h3>
              <div className="h-48 flex items-center justify-center">
                <Pie
                  data={qrNfcData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { color: '#9ca3af' } },
                    }
                  }}
                />
              </div>
            </div>

            {topIps.length > 0 && (
              <div>
                <h3 className="font-medium text-white mb-3">Top régions (anonymisé)</h3>
                <ul className="space-y-2">
                  {topIps.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.ip_prefix}</span>
                      <span className="text-cyan-400">{item.count} scans</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}