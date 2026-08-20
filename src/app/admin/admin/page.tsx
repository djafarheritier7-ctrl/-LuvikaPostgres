// src/app/admin/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Building, Users, Package, TrendingUp, Wallet, RefreshCw, Activity, UserPlus, ArrowUpRight, Zap, Link, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/src/lib/supabase/client';
import { AdminCard } from '@/src/components/admin/AdminCard';
import Loading from '@/src/components/system/Loading';
import { motion } from 'framer-motion';

type AdminStats = {
  totalEnterprises: number;
  totalEmployees: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalEnterprises: 0, totalEmployees: 0, totalOrders: 0,
    totalRevenue: 0, activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        enterprisesRes, employeesRes, ordersRes, subscriptionsRes,
        recentOrders, recentUsers
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('orders').select('id, created_at, product_type').order('created_at', { ascending: false }).limit(3),
        supabase.from('profiles').select('id, full_name, username, created_at, plan').order('created_at', { ascending: false }).limit(3),
      ]);

      setStats({
        totalEnterprises: enterprisesRes.count || 0,
        totalEmployees: employeesRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue: 0,
        activeSubscriptions: subscriptionsRes.count || 0,
      });

      // Activités récentes
      const acts = [
        ...(recentOrders?.data || []).map((o: any) => ({
          icon: <Package className="w-4 h-4 text-amber-400/70" />,
          title: 'Nouvelle commande',
          desc: o.product_type || 'Commande',
          time: o.created_at,
          badge: 'Commande',
        })),
        ...(recentUsers?.data || []).map((u: any) => ({
          icon: <UserPlus className="w-4 h-4 text-emerald-400/70" />,
          title: u.full_name || 'Nouvel utilisateur',
          desc: `@${u.username}`,
          time: u.created_at,
          badge: u.plan === 'premium' ? 'Premium' : u.plan === 'entreprise' ? 'Entreprise' : 'Basic',
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setActivities(acts);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Loading />;

  const statCards = [
    { title: 'Entreprises', value: stats.totalEnterprises, icon: <Building className="w-4 h-4" />, color: 'from-blue-500/60 to-cyan-500/60' },
    { title: 'Employés', value: stats.totalEmployees, icon: <Users className="w-4 h-4" />, color: 'from-cyan-500/60 to-teal-500/60' },
    { title: 'Commandes', value: stats.totalOrders, icon: <Package className="w-4 h-4" />, color: 'from-amber-500/60 to-orange-500/60' },
    { title: 'Revenus', value: `${stats.totalRevenue.toLocaleString('fr-FR')} $`, icon: <Wallet className="w-4 h-4" />, color: 'from-emerald-500/60 to-teal-500/60' },
    { title: 'Abonnements', value: stats.activeSubscriptions, icon: <TrendingUp className="w-4 h-4" />, color: 'from-violet-500/60 to-purple-500/60' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white/80">Tableau de bord</h1>
          <p className="text-xs text-gray-400/60 font-light mt-1">Supervisez toutes les activités de la plateforme.</p>
        </div>
        <Button
          onClick={() => { setRefreshing(true); fetchData(); }}
          disabled={refreshing}
          className="h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat, i) => (
          <AdminCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Activité récente */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400/60" />
          Activité récente
        </h2>

        {activities.length === 0 ? (
          <p className="text-xs text-gray-400/60 font-light text-center py-8">Aucune activité récente.</p>
        ) : (
          <div className="space-y-2">
            {activities.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 font-medium truncate">{activity.title}</p>
                  <p className="text-[11px] text-gray-400/50 font-light truncate">{activity.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge className="text-[10px] bg-white/[0.03] border-white/[0.06] text-gray-400/60 font-light">
                    {activity.badge}
                  </Badge>
                  <p className="text-[10px] text-gray-500/50 font-light mt-0.5">
                    {new Date(activity.time).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500/40 group-hover:text-cyan-400/60 transition-colors flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[11px] text-gray-500/40 font-light">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Temps réel via Supabase
        </span>
        <span>Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}