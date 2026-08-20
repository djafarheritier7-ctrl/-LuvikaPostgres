// src/config/company-icons.tsx
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

const ICON_MAP: Record<string, ReactNode> = {
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

export const getIcon = (name: string): ReactNode => {
  return ICON_MAP[name] || <MoreHorizontal className="w-4 h-4" />;
};