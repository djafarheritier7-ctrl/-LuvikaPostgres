// src/components/dashboard/AnalyticsChart.tsx
'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsChartProps {
  profileId: string;
}

export default function AnalyticsChart({ profileId }: AnalyticsChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/analytics/daily?profile_id=${profileId}&days=30`);
        
        if (!res.ok) {
          throw new Error('Erreur API');
        }

        const result = await res.json();
        
        // 🔹 Vérification de type SÉCURISÉE
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error('Données invalides:', result);
          setError('Format de données incorrect');
          setData([]);
        }
      } catch (err) {
        console.error('❌ Erreur chargement analytics:', err);
        setError('Impossible de charger les statistiques');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profileId]);

  // 🔹 Données par défaut si erreur ou loading
  const chartData = {
    labels: data.map(d => d.date) || [],
    datasets: [
      {
        label: 'Total Scans',
        data: data.map(d => d.scan_count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'QR Codes',
        data: data.map(d => d.qr_count) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'NFC',
        data: data.map(d => d.nfc_count) || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#9ca3af',
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p className="text-sm">{error || "Aucune donnée disponible"}</p>
          <p className="text-xs mt-1">Aucun scan enregistré ces 30 derniers jours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}