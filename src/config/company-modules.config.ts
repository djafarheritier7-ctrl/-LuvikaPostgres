// src/config/company-modules.config.ts

import { ReactNode } from "react";

export interface CompanyModuleConfig {
  id: string;
  label: string;
  description: string;
  iconName: string;
  path: string;
  required: boolean;
  category: 'core' | 'commerce' | 'management' | 'communication' | 'specialized';
}

export interface CompanyTypeConfigData {
  label: string;
  iconName: string;
  color: string;
  modules: CompanyModuleConfig[];
  fields: { name: string; label: string; type: string; placeholder?: string; required?: boolean }[];
  features: {
    onlineBooking?: boolean;
    delivery?: boolean;
    reservations?: boolean;
    menu?: boolean;
    rooms?: boolean;
    appointments?: boolean;
    prescriptions?: boolean;
    catalog?: boolean;
    loyalty?: boolean;
    reviews?: boolean;
    gallery?: boolean;
    events?: boolean;
    jobs?: boolean;
    blog?: boolean;
  };
}

// Modules communs réutilisables
const COMMON_MODULES = {
  orders: { id: 'orders', label: 'Commandes', description: 'Suivez les commandes en temps réel', iconName: 'ShoppingBag', path: '/dashboard/entreprise/orders', required: true, category: 'commerce' as const },
  reviews: { id: 'reviews', label: 'Avis Clients', description: 'Gérez les avis et notes', iconName: 'Star', path: '/dashboard/entreprise/reviews', required: false, category: 'communication' as const },
  gallery: { id: 'gallery', label: 'Galerie Photos', description: 'Photos et médias', iconName: 'Image', path: '/dashboard/entreprise/gallery', required: false, category: 'communication' as const },
  events: { id: 'events', label: 'Événements', description: 'Gérez vos événements', iconName: 'Calendar', path: '/dashboard/entreprise/events', required: false, category: 'specialized' as const },
  analytics: { id: 'analytics', label: 'Analytiques', description: 'Statistiques et rapports', iconName: 'BarChart3', path: '/dashboard/entreprise/analytics', required: false, category: 'management' as const },
  cards: { id: 'cards', label: 'Cartes Membres', description: 'Gérez les cartes NFC', iconName: 'CreditCard', path: '/dashboard/entreprise/cards', required: false, category: 'management' as const },
  messages: { id: 'messages', label: 'Messages', description: 'Messagerie clients', iconName: 'MessageSquare', path: '/dashboard/entreprise/messages', required: false, category: 'communication' as const },
  staff: { id: 'staff', label: 'Personnel', description: 'Gérez votre équipe', iconName: 'Users', path: '/dashboard/entreprise/staff', required: false, category: 'management' as const },
  settings: { id: 'settings', label: 'Paramètres', description: 'Configuration', iconName: 'Settings', path: '/dashboard/entreprise/settings', required: true, category: 'management' as const },
};

export const COMPANY_TYPES_DATA: Record<string, CompanyTypeConfigData> = {
  // ========================================
  // RESTAURATION
  // ========================================
  restaurant: {
    label: 'Restaurant',
    iconName: 'UtensilsCrossed',
    color: 'from-orange-500/60 to-red-500/60',
    fields: [
      { name: 'cuisine_type', label: 'Type de cuisine', type: 'text', placeholder: 'Italienne, Congolaise...' },
      { name: 'price_range', label: 'Gamme de prix', type: 'text', placeholder: '€, €€, €€€' },
      { name: 'specialties', label: 'Spécialités', type: 'textarea', placeholder: 'Plats signature...' },
    ],
    features: { menu: true, reservations: true, delivery: true, reviews: true, gallery: true, events: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Menu Digital', description: 'Gérez votre carte et vos plats', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { id: 'reservations', label: 'Réservations', description: 'Gérez les réservations de tables', iconName: 'Calendar', path: '/dashboard/entreprise/reservations', required: false, category: 'core' },
      { id: 'delivery', label: 'Livraison', description: 'Gérez vos zones de livraison', iconName: 'Truck', path: '/dashboard/entreprise/delivery', required: false, category: 'commerce' },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.events },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  bakery: {
    label: 'Boulangerie',
    iconName: 'Croissant',
    color: 'from-amber-500/60 to-yellow-600/60',
    fields: [
      { name: 'specialties', label: 'Spécialités', type: 'textarea', placeholder: 'Pains, viennoiseries...' },
    ],
    features: { menu: true, delivery: true, reviews: true, gallery: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Catalogue', description: 'Gérez vos produits', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  bar: {
    label: 'Bar / Lounge',
    iconName: 'Wine',
    color: 'from-purple-500/60 to-pink-500/60',
    fields: [
      { name: 'specialties', label: 'Spécialités', type: 'textarea', placeholder: 'Cocktails signature...' },
    ],
    features: { menu: true, events: true, reviews: true, gallery: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Carte', description: 'Gérez vos boissons', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.events },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  supermarket: {
    label: 'Supermarché',
    iconName: 'ShoppingCart',
    color: 'from-green-500/60 to-emerald-600/60',
    fields: [
      { name: 'departments', label: 'Rayons', type: 'textarea', placeholder: 'Fruits, Légumes, Boucherie...' },
    ],
    features: { catalog: true, delivery: true, loyalty: true, reviews: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Catalogue', description: 'Gérez vos produits', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { id: 'delivery', label: 'Livraison', description: 'Gérez les livraisons', iconName: 'Truck', path: '/dashboard/entreprise/delivery', required: false, category: 'commerce' },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  // ========================================
  // SANTÉ
  // ========================================
  clinic: {
    label: 'Clinique',
    iconName: 'HeartPulse',
    color: 'from-red-600/60 to-rose-600/60',
    fields: [
      { name: 'specialties', label: 'Spécialités médicales', type: 'textarea', placeholder: 'Cardiologie, Pédiatrie...' },
      { name: 'insurance_accepted', label: 'Assurances acceptées', type: 'textarea', placeholder: 'Liste des assurances...' },
    ],
    features: { appointments: true, onlineBooking: true, prescriptions: true },
    modules: [
      { id: 'appointments', label: 'Rendez-vous', description: 'Gérez les RDV patients', iconName: 'Calendar', path: '/dashboard/entreprise/appointments', required: true, category: 'core' },
      { id: 'patients', label: 'Patients', description: 'Dossiers patients', iconName: 'Users', path: '/dashboard/entreprise/patients', required: true, category: 'core' },
      { id: 'prescriptions', label: 'Ordonnances', description: 'Gérez les prescriptions', iconName: 'ClipboardList', path: '/dashboard/entreprise/prescriptions', required: false, category: 'specialized' },
      { ...COMMON_MODULES.staff, required: true },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards, required: true },
      { ...COMMON_MODULES.settings },
    ],
  },

  medical: {
    label: 'Cabinet Médical',
    iconName: 'Stethoscope',
    color: 'from-blue-600/60 to-cyan-600/60',
    fields: [
      { name: 'specialties', label: 'Spécialités', type: 'text', placeholder: 'Généraliste, Dentiste...' },
    ],
    features: { appointments: true, onlineBooking: true },
    modules: [
      { id: 'appointments', label: 'Rendez-vous', description: 'Gérez les RDV', iconName: 'Calendar', path: '/dashboard/entreprise/appointments', required: true, category: 'core' },
      { id: 'patients', label: 'Patients', description: 'Dossiers patients', iconName: 'Users', path: '/dashboard/entreprise/patients', required: true, category: 'core' },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  pharmacy: {
    label: 'Pharmacie',
    iconName: 'Pill',
    color: 'from-green-600/60 to-teal-600/60',
    fields: [
      { name: 'on_duty', label: 'Pharmacie de garde', type: 'text', placeholder: 'Oui / Non' },
    ],
    features: { catalog: true, delivery: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Catalogue', description: 'Produits pharmaceutiques', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { id: 'delivery', label: 'Livraison', description: 'Livraison de médicaments', iconName: 'Truck', path: '/dashboard/entreprise/delivery', required: false, category: 'commerce' },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  // ========================================
  // HÔTELLERIE
  // ========================================
  hotel: {
    label: 'Hôtel',
    iconName: 'Hotel',
    color: 'from-purple-500/60 to-indigo-500/60',
    fields: [
      { name: 'rooms_count', label: 'Nombre de chambres', type: 'number', placeholder: '50' },
      { name: 'amenities', label: 'Équipements', type: 'textarea', placeholder: 'WiFi, Piscine, Spa...' },
    ],
    features: { rooms: true, onlineBooking: true, reviews: true, gallery: true, events: true },
    modules: [
      { id: 'rooms', label: 'Chambres', description: 'Gérez vos chambres et tarifs', iconName: 'BedDouble', path: '/dashboard/entreprise/rooms', required: true, category: 'core' },
      { id: 'bookings', label: 'Réservations', description: 'Gérez les réservations', iconName: 'Calendar', path: '/dashboard/entreprise/bookings', required: true, category: 'core' },
      { ...COMMON_MODULES.orders, label: 'Room Service', required: false },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.events },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards, label: 'Cartes Fidélité' },
      { ...COMMON_MODULES.settings },
    ],
  },

  // ========================================
  // BEAUTÉ & BIEN-ÊTRE
  // ========================================
  beauty: {
    label: 'Salon de beauté',
    iconName: 'Scissors',
    color: 'from-pink-500/60 to-rose-500/60',
    fields: [
      { name: 'services', label: 'Services proposés', type: 'textarea', placeholder: 'Coiffure, Manucure...' },
    ],
    features: { appointments: true, onlineBooking: true, gallery: true, reviews: true },
    modules: [
      { id: 'appointments', label: 'Rendez-vous', description: 'Gérez les RDV clients', iconName: 'Calendar', path: '/dashboard/entreprise/appointments', required: true, category: 'core' },
      { id: 'menu', label: 'Services & Tarifs', description: 'Catalogue de prestations', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.cards, label: 'Cartes Fidélité' },
      { ...COMMON_MODULES.settings },
    ],
  },

  gym: {
    label: 'Salle de sport',
    iconName: 'Dumbbell',
    color: 'from-blue-500/60 to-indigo-500/60',
    fields: [
      { name: 'equipment', label: 'Équipements', type: 'textarea', placeholder: 'Musculation, Cardio...' },
    ],
    features: { appointments: true, onlineBooking: true, loyalty: true, events: true },
    modules: [
      { id: 'menu', label: 'Abonnements', description: 'Gérez les formules', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { id: 'appointments', label: 'Cours', description: 'Planning des cours collectifs', iconName: 'Calendar', path: '/dashboard/entreprise/appointments', required: false, category: 'core' },
      { ...COMMON_MODULES.cards, label: 'Cartes Membres', required: true },
      { ...COMMON_MODULES.events },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.settings },
    ],
  },

  // ========================================
  // SERVICES
  // ========================================
  agency: {
    label: 'Agence',
    iconName: 'Briefcase',
    color: 'from-sky-500/60 to-blue-600/60',
    fields: [
      { name: 'services', label: 'Services', type: 'textarea', placeholder: 'Marketing, Design, Conseil...' },
    ],
    features: { reviews: true, gallery: true, blog: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Services', description: 'Catalogue de services', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.staff },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.messages },
      { ...COMMON_MODULES.settings },
    ],
  },

  tech: {
    label: 'Tech / IT',
    iconName: 'Cpu',
    color: 'from-cyan-500/60 to-blue-500/60',
    fields: [
      { name: 'services', label: 'Services tech', type: 'textarea', placeholder: 'Développement, Réseau...' },
    ],
    features: { catalog: true, reviews: true, blog: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Services', description: 'Prestations techniques', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.staff },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  repair: {
    label: 'Réparation',
    iconName: 'Wrench',
    color: 'from-gray-500/60 to-slate-600/60',
    fields: [
      { name: 'services', label: 'Types de réparation', type: 'textarea', placeholder: 'Électronique, Mécanique...' },
    ],
    features: { appointments: true, reviews: true },
    modules: [
      { id: 'appointments', label: 'Rendez-vous', description: 'Gérez les RDV clients', iconName: 'Calendar', path: '/dashboard/entreprise/appointments', required: true, category: 'core' },
      { ...COMMON_MODULES.orders },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  photography: {
    label: 'Photographie',
    iconName: 'Camera',
    color: 'from-amber-500/60 to-orange-500/60',
    fields: [
      { name: 'specialties', label: 'Spécialités', type: 'text', placeholder: 'Mariage, Portrait, Événementiel...' },
    ],
    features: { gallery: true, onlineBooking: true, reviews: true },
    modules: [
      { id: 'appointments', label: 'Réservations', description: 'Séances photo', iconName: 'Calendar', path: '/dashboard/entreprise/appointments', required: true, category: 'core' },
      { ...COMMON_MODULES.orders },
      { ...COMMON_MODULES.gallery, required: true },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  cybercafe: {
    label: 'Cybercafé',
    iconName: 'Monitor',
    color: 'from-teal-500/60 to-cyan-600/60',
    fields: [
      { name: 'computers_count', label: 'Nombre de postes', type: 'number', placeholder: '20' },
    ],
    features: { loyalty: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Services', description: 'Forfaits et tarifs', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.cards, label: 'Cartes Fidélité', required: true },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.settings },
    ],
  },

  // ========================================
  // ÉDUCATION
  // ========================================
  school: {
    label: 'École',
    iconName: 'GraduationCap',
    color: 'from-blue-600/60 to-indigo-600/60',
    fields: [
      { name: 'levels', label: 'Niveaux', type: 'text', placeholder: 'Maternelle, Primaire, Secondaire...' },
    ],
    features: { events: true, gallery: true, blog: true },
    modules: [
      { id: 'staff', label: 'Enseignants', description: 'Corps professoral', iconName: 'Users', path: '/dashboard/entreprise/staff', required: true, category: 'management' },
      { id: 'students', label: 'Élèves', description: 'Gérez les inscriptions', iconName: 'Users', path: '/dashboard/entreprise/patients', required: true, category: 'core' },
      { ...COMMON_MODULES.events },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.cards, label: 'Badges Élèves' },
      { ...COMMON_MODULES.messages },
      { ...COMMON_MODULES.settings },
    ],
  },

  library: {
    label: 'Librairie',
    iconName: 'Book',
    color: 'from-amber-600/60 to-yellow-600/60',
    fields: [
      { name: 'categories', label: 'Catégories', type: 'textarea', placeholder: 'Roman, BD, Scolaire...' },
    ],
    features: { catalog: true, reviews: true, events: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Catalogue', description: 'Gérez vos livres', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.events },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  // ========================================
  // TRANSPORT & VOYAGE
  // ========================================
  transport: {
    label: 'Transport',
    iconName: 'Bus',
    color: 'from-yellow-500/60 to-orange-500/60',
    fields: [
      { name: 'routes', label: 'Lignes', type: 'textarea', placeholder: 'Ligne 1, Ligne 2...' },
    ],
    features: { onlineBooking: true, loyalty: true },
    modules: [
      { id: 'bookings', label: 'Réservations', description: 'Billets et réservations', iconName: 'Calendar', path: '/dashboard/entreprise/bookings', required: true, category: 'core' },
      { ...COMMON_MODULES.staff },
      { ...COMMON_MODULES.cards, label: 'Cartes Abonnés' },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.settings },
    ],
  },

  travel: {
    label: 'Voyage / Tourisme',
    iconName: 'Plane',
    color: 'from-sky-500/60 to-blue-500/60',
    fields: [
      { name: 'destinations', label: 'Destinations', type: 'textarea', placeholder: 'Paris, Dubai, Kinshasa...' },
    ],
    features: { onlineBooking: true, reviews: true, gallery: true },
    modules: [
      { id: 'bookings', label: 'Réservations', description: 'Forfaits et voyages', iconName: 'Calendar', path: '/dashboard/entreprise/bookings', required: true, category: 'core' },
      { id: 'menu', label: 'Offres', description: 'Forfaits et promotions', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  gasstation: {
    label: 'Station-service',
    iconName: 'Fuel',
    color: 'from-red-500/60 to-orange-600/60',
    fields: [
      { name: 'services', label: 'Services', type: 'textarea', placeholder: 'Carburant, Lavage, Boutique...' },
    ],
    features: { loyalty: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Produits', description: 'Boutique station', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: false, category: 'core' },
      { ...COMMON_MODULES.cards, label: 'Cartes Fidélité', required: true },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.settings },
    ],
  },

  // ========================================
  // IMMOBILIER & CONSTRUCTION
  // ========================================
  realestate: {
    label: 'Immobilier',
    iconName: 'Home',
    color: 'from-emerald-500/60 to-green-600/60',
    fields: [
      { name: 'properties_types', label: 'Types de biens', type: 'text', placeholder: 'Maisons, Appartements, Terrains...' },
    ],
    features: { catalog: true, gallery: true, onlineBooking: true },
    modules: [
      { id: 'menu', label: 'Annonces', description: 'Gérez vos biens', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { id: 'appointments', label: 'Visites', description: 'Planning des visites', iconName: 'Calendar', path: '/dashboard/entreprise/appointments', required: true, category: 'core' },
      { ...COMMON_MODULES.gallery, required: true },
      { ...COMMON_MODULES.messages },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  construction: {
    label: 'Construction',
    iconName: 'HardHat',
    color: 'from-orange-600/60 to-amber-600/60',
    fields: [
      { name: 'specialties', label: 'Spécialités', type: 'text', placeholder: 'Gros œuvre, Rénovation...' },
    ],
    features: { gallery: true, reviews: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Projets', description: 'Gérez vos chantiers', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.staff },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  // ========================================
  // AGRICULTURE
  // ========================================
  farm: {
    label: 'Ferme / Agriculture',
    iconName: 'Wheat',
    color: 'from-green-500/60 to-lime-600/60',
    fields: [
      { name: 'products', label: 'Produits', type: 'textarea', placeholder: 'Légumes, Fruits, Élevage...' },
    ],
    features: { catalog: true, delivery: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Produits', description: 'Catalogue produits', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.settings },
    ],
  },

  // ========================================
  // ORGANISATIONS
  // ========================================
  ngo: {
    label: 'ONG',
    iconName: 'HandHeart',
    color: 'from-red-500/60 to-rose-500/60',
    fields: [
      { name: 'mission', label: 'Mission', type: 'textarea', placeholder: 'Notre mission humanitaire...' },
    ],
    features: { events: true, gallery: true, blog: true, reviews: true },
    modules: [
      { ...COMMON_MODULES.staff, label: 'Bénévoles' },
      { id: 'donations', label: 'Dons', description: 'Suivi des dons', iconName: 'Heart', path: '/dashboard/entreprise/orders', required: false, category: 'commerce' },
      { ...COMMON_MODULES.events },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.messages },
      { ...COMMON_MODULES.cards, label: 'Badges Bénévoles' },
      { ...COMMON_MODULES.settings },
    ],
  },

  bank: {
    label: 'Banque',
    iconName: 'Landmark',
    color: 'from-blue-700/60 to-indigo-700/60',
    fields: [
      { name: 'services', label: 'Services bancaires', type: 'textarea', placeholder: 'Comptes, Crédits, Épargne...' },
    ],
    features: { appointments: true, onlineBooking: true },
    modules: [
      { id: 'appointments', label: 'Rendez-vous', description: 'RDV conseillers', iconName: 'Calendar', path: '/dashboard/entreprise/appointments', required: true, category: 'core' },
      { ...COMMON_MODULES.staff, label: 'Employés' },
      { ...COMMON_MODULES.cards, label: 'Badges Employés', required: true },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.messages },
      { ...COMMON_MODULES.settings },
    ],
  },

  shop: {
    label: 'Boutique',
    iconName: 'Store',
    color: 'from-violet-500/60 to-purple-600/60',
    fields: [
      { name: 'products', label: 'Types de produits', type: 'textarea', placeholder: 'Vêtements, Accessoires...' },
    ],
    features: { catalog: true, delivery: true, loyalty: true, reviews: true },
    modules: [
      { ...COMMON_MODULES.orders },
      { id: 'menu', label: 'Catalogue', description: 'Gérez vos articles', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { ...COMMON_MODULES.reviews },
      { ...COMMON_MODULES.gallery },
      { ...COMMON_MODULES.cards, label: 'Cartes Fidélité' },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.settings },
    ],
  },

  other: {
    label: 'Autre',
    iconName: 'MoreHorizontal',
    color: 'from-gray-400/60 to-gray-500/60',
    fields: [
      { name: 'activity', label: 'Activité principale', type: 'text', placeholder: 'Décrivez votre activité...' },
    ],
    features: {},
    modules: [
      { ...COMMON_MODULES.orders },
      { ...COMMON_MODULES.cards },
      { ...COMMON_MODULES.analytics },
      { ...COMMON_MODULES.settings },
    ],
  },
};

export const COMPANY_TYPES_MAP = COMPANY_TYPES_DATA;