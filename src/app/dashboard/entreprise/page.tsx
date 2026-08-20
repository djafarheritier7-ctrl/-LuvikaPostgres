// src/app/dashboard/entreprise/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { 
  Settings, Package, Users, TrendingUp, BarChart3, 
  ShoppingBag, Calendar, CreditCard, Star, Image,
  MessageSquare, Bell, ArrowRight, Plus, ChevronRight,
  Wifi, MapPin, Clock, Phone, Mail, Globe,
  ClipboardList,
  FileText,
  ImageIcon,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCompanyModules, CompanyModule, getCompanyConfig } from '@/src/config/company-modules';
import Loading from '@/src/components/system/Loading';

export default function EnterpriseDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    members: 0,
    rating: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/sign-in'); return; }

      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!companyData) {
        // Rediriger vers la configuration si pas encore configuré
        router.push('/dashboard/entreprise/setup');
        return;
      }

      setCompany(companyData);

      // Charger les statistiques selon le type d'entreprise
      await loadStats(companyData);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const loadStats = async (companyData: any) => {
    const companyId = companyData.id;
    
    // Stats communes
    const [
      { count: ordersCount },
      { count: membersCount },
    ] = await Promise.all([
      supabase.from('ecommerce_orders').select('*', { count: 'exact', head: true }).eq('seller_id', companyId),
      supabase.from('org_cards').select('*', { count: 'exact', head: true }).eq('org_id', companyId),
    ]);

    setStats({
      orders: ordersCount || 0,
      revenue: 0, // À calculer selon les commandes
      members: membersCount || 0,
      rating: 4.5, // À récupérer des reviews
    });
  };

  if (loading) return <Loading />;

  const companyConfig = getCompanyConfig(company.company_type);
  const modules = getCompanyModules(company.company_type, companyConfig.features);
  
  // Grouper les modules par catégorie
  const modulesByCategory = modules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, CompanyModule[]>);

  const categoryLabels: Record<string, string> = {
    core: 'Principaux',
    commerce: 'Commerce',
    management: 'Gestion',
    communication: 'Communication',
    specialized: 'Spécialisés',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    core: <Package className="w-4 h-4" />,
    commerce: <ShoppingBag className="w-4 h-4" />,
    management: <TrendingUp className="w-4 h-4" />,
    communication: <MessageSquare className="w-4 h-4" />,
    specialized: <Star className="w-4 h-4" />,
  };

  // Widgets rapides selon le type
const quickActions: Record<string, { label: string; icon: React.ReactNode; path: string }[]> = {
  restaurant: [
    { label: 'Nouveau plat', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Commandes', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
    { label: 'Réservations', icon: <Calendar className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/reservations' },
  ],
  bakery: [
    { label: 'Nouveau produit', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Commandes', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
  ],
  bar: [
    { label: 'Nouvelle boisson', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Événements', icon: <Calendar className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/events' },
  ],
  supermarket: [
    { label: 'Nouveau produit', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Commandes', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
    { label: 'Livraisons', icon: <Truck className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/delivery' },
  ],
  clinic: [
    { label: 'Nouveau RDV', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/appointments' },
    { label: 'Patients', icon: <Users className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/patients' },
    { label: 'Ordonnances', icon: <ClipboardList className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/prescriptions' },
  ],
  medical: [
    { label: 'Nouveau RDV', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/appointments' },
    { label: 'Patients', icon: <Users className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/patients' },
  ],
  pharmacy: [
    { label: 'Nouveau produit', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Commandes', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
  ],
  hotel: [
    { label: 'Nouvelle chambre', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/rooms' },
    { label: 'Réservations', icon: <Calendar className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/bookings' },
    { label: 'Room Service', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
  ],
  beauty: [
    { label: 'Nouveau RDV', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/appointments' },
    { label: 'Services', icon: <FileText className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
  ],
  gym: [
    { label: 'Nouvel abonnement', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Cours', icon: <Calendar className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/appointments' },
    { label: 'Membres', icon: <Users className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/cards' },
  ],
  agency: [
    { label: 'Nouveau service', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Messages', icon: <MessageSquare className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/messages' },
  ],
  tech: [
    { label: 'Nouveau service', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Équipe', icon: <Users className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/staff' },
  ],
  repair: [
    { label: 'Nouveau RDV', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/appointments' },
    { label: 'Commandes', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
  ],
  photography: [
    { label: 'Nouvelle séance', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/appointments' },
    { label: 'Galerie', icon: <ImageIcon className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/gallery' },
  ],
  cybercafe: [
    { label: 'Nouveau forfait', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Cartes', icon: <CreditCard className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/cards' },
  ],
  school: [
    { label: 'Nouvel élève', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/patients' },
    { label: 'Enseignants', icon: <Users className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/staff' },
    { label: 'Événements', icon: <Calendar className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/events' },
  ],
  library: [
    { label: 'Nouveau livre', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Commandes', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
  ],
  transport: [
    { label: 'Nouveau billet', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/bookings' },
    { label: 'Abonnés', icon: <CreditCard className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/cards' },
  ],
  travel: [
    { label: 'Nouvelle offre', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Réservations', icon: <Calendar className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/bookings' },
  ],
  gasstation: [
    { label: 'Nouveau produit', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Fidélité', icon: <CreditCard className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/cards' },
  ],
  realestate: [
    { label: 'Nouveau bien', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Visites', icon: <Calendar className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/appointments' },
  ],
  construction: [
    { label: 'Nouveau projet', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Équipe', icon: <Users className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/staff' },
  ],
  farm: [
    { label: 'Nouveau produit', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Commandes', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
  ],
  ngo: [
    { label: 'Nouveau bénévole', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/staff' },
    { label: 'Événements', icon: <Calendar className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/events' },
    { label: 'Messages', icon: <MessageSquare className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/messages' },
  ],
  bank: [
    { label: 'Nouveau RDV', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/appointments' },
    { label: 'Employés', icon: <Users className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/staff' },
  ],
  shop: [
    { label: 'Nouvel article', icon: <Plus className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/menu' },
    { label: 'Commandes', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
    { label: 'Fidélité', icon: <CreditCard className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/cards' },
  ],
  other: [
    { label: 'Cartes', icon: <CreditCard className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/cards' },
    { label: 'Commandes', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/dashboard/entreprise/orders' },
  ],
};

  return (
    <div className="w-full max-w-full space-y-8">
      {/* Header avec info entreprise */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-sm border border-white/[0.08]"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${companyConfig.color} flex items-center justify-center`}>
              {companyConfig.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white/90">{company.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className="bg-white/[0.06] text-white/60 text-[11px] font-light border-white/[0.08]">
                  {companyConfig.label}
                </Badge>
                {company.verified && (
                  <Badge className="bg-emerald-500/10 text-emerald-300/70 text-[11px] font-light border-emerald-500/20">
                    Vérifié
                  </Badge>
                )}
              </div>
              {company.description && (
                <p className="text-sm text-gray-400/60 font-light mt-2 max-w-xl">{company.description}</p>
              )}
            </div>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/entreprise/settings')}
            variant="outline" 
            className="h-9 text-xs border-white/[0.08] text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg"
          >
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Paramètres
          </Button>
        </div>

        {/* Infos rapides */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/[0.04]">
          {company.address && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400/60 font-light">
              <MapPin className="w-3.5 h-3.5" />
              {company.address}
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400/60 font-light">
              <Phone className="w-3.5 h-3.5" />
              {company.phone}
            </div>
          )}
          {company.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400/60 font-light">
              <Mail className="w-3.5 h-3.5" />
              {company.email}
            </div>
          )}
          {company.opening_hours && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400/60 font-light">
              <Clock className="w-3.5 h-3.5" />
              {company.opening_hours}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <ShoppingBag className="w-5 h-5 text-emerald-400/70" />, label: 'Commandes', value: stats.orders },
          { icon: <TrendingUp className="w-5 h-5 text-cyan-400/70" />, label: 'Revenus', value: `${stats.revenue.toLocaleString()} $` },
          { icon: <Users className="w-5 h-5 text-violet-400/70" />, label: 'Membres', value: stats.members },
          { icon: <Star className="w-5 h-5 text-amber-400/70" />, label: 'Note', value: `${stats.rating}/5` },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] text-center"
          >
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <p className="text-lg font-semibold text-white/80">{stat.value}</p>
            <p className="text-xs text-gray-400/60 font-light">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      {quickActions[company.company_type as keyof typeof quickActions] && (
        <div className="flex gap-2">
          {quickActions[company.company_type as keyof typeof quickActions].map((action, i) => (
            <Button
              key={i}
              onClick={() => router.push(action.path)}
              className="h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-lg"
            >
              {action.icon}
              <span className="ml-1.5">{action.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Modules par catégorie */}
      {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-white/60 flex items-center gap-2">
            {categoryIcons[category]}
            {categoryLabels[category] || category}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryModules.map((module) => (
              <motion.button
                key={module.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(module.path)}
                className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                    {module.icon}
                  </div>
                  {module.required && (
                    <Badge className="bg-cyan-500/10 text-cyan-300/60 text-[9px] font-light border-cyan-500/20">
                      Requis
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm text-white/70 font-medium mb-1">{module.label}</h3>
                <p className="text-[11px] text-gray-400/50 font-light leading-tight">{module.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Configuration rapide si pas complète */}
      {company.company_config && Object.keys(company.company_config).length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 bg-amber-500/[0.04] border border-amber-500/[0.12]"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-amber-400/70" />
            </div>
            <div>
              <h3 className="text-sm text-amber-300/70 font-medium mb-1">Configuration incomplète</h3>
              <p className="text-xs text-amber-400/50 font-light mb-3">
                Complétez la configuration de votre {companyConfig.label.toLowerCase()} pour débloquer toutes les fonctionnalités.
              </p>
              <Button
                onClick={() => router.push(`/dashboard/entreprise/setup/${company.company_type}`)}
                className="h-8 text-xs bg-amber-600/60 hover:bg-amber-500/60 text-white font-light rounded-lg"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Configurer maintenant
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}