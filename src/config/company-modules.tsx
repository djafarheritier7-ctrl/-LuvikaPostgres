// src/config/company-modules.tsx
import {
  UtensilsCrossed, Store, Truck, Hotel, Pill, Scissors,
  Briefcase, ShoppingCart, Cpu, GraduationCap, Stethoscope, HeartPulse,
  Home, Dumbbell, Wine, Croissant, Book, Fuel, Wrench, Bus, Plane,
  Monitor, Camera, HardHat, Wheat, HandHeart, Landmark, MoreHorizontal,
  Package, Users, Calendar, BarChart3, Settings,
  CreditCard, Star, Image as ImageIcon,
  FileText, ShoppingBag, Music, BedDouble, ClipboardList,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { COMPANY_TYPES_DATA, type CompanyTypeConfigData, type CompanyModuleConfig } from './company-modules.config';

// Types pour l'utilisation dans les composants
export interface CompanyModule {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  path: string;
  required: boolean;
  category: 'core' | 'commerce' | 'management' | 'communication' | 'specialized';
}

export interface CompanyTypeConfig {
  label: string;
  icon: ReactNode;
  color: string;
  modules: CompanyModule[];
  fields: { name: string; label: string; type: string; placeholder?: string; required?: boolean }[];
  features: CompanyTypeConfigData['features'];
}

// Map des icônes
const iconMap: Record<string, ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed className="w-4 h-4" />,
  Store: <Store className="w-4 h-4" />,
  Truck: <Truck className="w-4 h-4" />,
  Hotel: <Hotel className="w-4 h-4" />,
  Pill: <Pill className="w-4 h-4" />,
  Scissors: <Scissors className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  ShoppingCart: <ShoppingCart className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Stethoscope: <Stethoscope className="w-4 h-4" />,
  HeartPulse: <HeartPulse className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Dumbbell: <Dumbbell className="w-4 h-4" />,
  Wine: <Wine className="w-4 h-4" />,
  Croissant: <Croissant className="w-4 h-4" />,
  Book: <Book className="w-4 h-4" />,
  Fuel: <Fuel className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  Bus: <Bus className="w-4 h-4" />,
  Plane: <Plane className="w-4 h-4" />,
  Monitor: <Monitor className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  HardHat: <HardHat className="w-4 h-4" />,
  Wheat: <Wheat className="w-4 h-4" />,
  HandHeart: <HandHeart className="w-4 h-4" />,
  Landmark: <Landmark className="w-4 h-4" />,
  MoreHorizontal: <MoreHorizontal className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  Image: <ImageIcon className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Music: <Music className="w-4 h-4" />,
  BedDouble: <BedDouble className="w-4 h-4" />,
  ClipboardList: <ClipboardList className="w-4 h-4" />,
};

// Convertir les données en config avec icônes
function convertToConfig(data: CompanyTypeConfigData): CompanyTypeConfig {
  return {
    ...data,
    icon: iconMap[data.iconName] || <MoreHorizontal className="w-4 h-4" />,
    modules: data.modules.map(m => ({
      ...m,
      icon: iconMap[m.iconName] || <MoreHorizontal className="w-4 h-4" />,
    })),
  };
}

// Map complète avec icônes
const COMPANY_TYPES_MAP_WITH_ICONS: Record<string, CompanyTypeConfig> = {};
Object.entries(COMPANY_TYPES_DATA).forEach(([key, value]) => {
  COMPANY_TYPES_MAP_WITH_ICONS[key] = convertToConfig(value);
});

// src/config/company-modules.tsx - modifier le fallback

export const getCompanyConfig = (type: string): CompanyTypeConfig => {
  return COMPANY_TYPES_MAP_WITH_ICONS[type] || {
    label: 'Autre',
    icon: <MoreHorizontal className="w-4 h-4" />,
    color: 'from-gray-400/60 to-gray-500/60',
    modules: [
      // ✅ Ajouter les modules de base pour TOUS les types
      { id: 'orders', label: 'Commandes', description: 'Suivi des commandes', icon: <ShoppingBag className="w-4 h-4" />, path: '/dashboard/entreprise/orders', required: true, category: 'commerce' },
      { id: 'cards', label: 'Cartes Membres', description: 'Gérez les cartes NFC', icon: <CreditCard className="w-4 h-4" />, path: '/dashboard/entreprise/cards', required: false, category: 'management' },
      { id: 'analytics', label: 'Analytiques', description: 'Statistiques', icon: <BarChart3 className="w-4 h-4" />, path: '/dashboard/entreprise/analytics', required: false, category: 'management' },
      { id: 'settings', label: 'Paramètres', description: 'Configuration', icon: <Settings className="w-4 h-4" />, path: '/dashboard/entreprise/settings', required: true, category: 'management' },
    ],
    fields: [
      { name: 'activity', label: 'Activité principale', type: 'text' },
    ],
    features: {},
  };
};

export const getCompanyModules = (type: string, features?: Record<string, boolean>): CompanyModule[] => {
  const config = getCompanyConfig(type);
  let modules = [...config.modules];
  
  if (features) {
    modules = modules.filter(module => {
      if (module.required) return true;
      const featureKey = module.id as keyof typeof features;
      return features[featureKey] !== false;
    });
  }
  
  return modules;
};

export { COMPANY_TYPES_DATA };