// src/app/documentation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Code, Database, Shield, Globe, 
  Smartphone, Calendar, CreditCard, 
  Search,
  User, QrCode, BarChart3, Settings,
  HelpCircle, Download, Infinity as InfinityIcon,
  Clock, ShieldCheck, Zap, 
  Bell, Mail, MessageSquare, Users, 
  Award, Star, Lock, RefreshCw, Eye,
  Server, Key, AlertTriangle, CheckCircle,
  XCircle, TrendingUp, Layers, Package,
  Building, Crown, Heart, Folder,
  ShoppingBag, LogOut, ChevronRight,
  Info,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Types
interface DocumentationItem {
  name?: string;
  title?: string;
  description?: string;
  fields?: string[];
  params?: string[];
  features?: string[];
  note?: string;  // ← AJOUTER CETTE LIGNE
}

interface DocumentationEndpoint {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  params?: string[];
  body?: Record<string, string>;
  response?: string;
}

interface DocumentationContent {
  title: string;
  content?: string;
  items?: (string | DocumentationItem)[];
  endpoints?: DocumentationEndpoint[];
  warning?: string;
  note?: string;
  tip?: string;
}

interface DocumentationSection {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  content: Record<string, DocumentationContent>;
}

// Sections de documentation
const documentationSections: DocumentationSection[] = [
  {
    id: 'overview',
    title: 'Aperçu',
    icon: Book,
    color: 'from-blue-500/60 to-cyan-500/60',
    description: 'Guide complet de la plateforme LUVIKA',
    content: {
      introduction: {
        title: 'Qu\'est-ce que LUVIKA ?',
        content: 'LUVIKA est une plateforme complète de cartes de visite numériques et de networking qui combine la technologie NFC, les codes QR et les technologies web modernes pour révolutionner la manière dont les professionnels se connectent et partagent leurs informations.',
        items: [
          'Cartes de visite NFC intelligentes avec suivi en temps réel',
          'Génération de codes QR personnalisés',
          'Système d\'abonnement flexible avec dates d\'expiration et option à vie',
          'Gestion complète des événements professionnels',
          'Tableau de bord analytics avec classement des utilisateurs',
          'Système de badges et récompenses (10K scans = -5% de réduction)',
          'Support multilingue (Français, Anglais, etc.)',
          'Mises à jour en temps réel via WebSockets Supabase',
          'Notifications sonores pour nouveaux messages',
          'Panneau d\'administration complet'
        ]
      },
      architecture: {
        title: 'Stack Technologique',
        items: [
          {
            name: 'Frontend',
            description: 'Next.js 16+ avec App Router, TypeScript, Tailwind CSS, Framer Motion',
            features: ['Turbopack', 'Server Components', 'App Router', 'Glassmorphism UI']
          },
          {
            name: 'Backend',
            description: 'Supabase (PostgreSQL, Auth, Realtime, Storage)',
            features: ['Row Level Security', 'JWT Authentication', 'WebSocket Realtime', 'File Storage']
          },
          {
            name: 'UI/UX',
            description: 'Bibliothèques et outils de design',
            features: ['Lucide React Icons', 'Sonner Toasts', 'QRCode.js', 'Next Intl i18n']
          }
        ]
      },
      quick_links: {
        title: 'Liens Rapides',
        items: [
          'Tableau de bord utilisateur → /dashboard',
          'Panneau d\'administration → /admin/admin',
          'Gestion des abonnements → /admin/admin/subscriptions',
          'Demandes d\'upgrade → /admin/admin/upgrade-requests',
          'Documentation → /documentation'
        ]
      }
    }
  },
  {
    id: 'user-guide',
    title: 'Guide Utilisateur',
    icon: HelpCircle,
    color: 'from-emerald-500/60 to-green-500/60',
    description: 'Guide étape par étape pour les débutants',
    content: {
      getting_started: {
        title: 'Premiers Pas',
        content: 'Bienvenue sur LUVIKA ! Ce guide vous aidera à comprendre et à utiliser toutes les fonctionnalités de notre plateforme.',
        items: [
          '1. Créez votre compte - Inscrivez-vous avec votre email',
          '2. Complétez votre profil - Ajoutez vos informations et votre photo',
          '3. Choisissez votre forfait - Basic (gratuit), Premium ou Entreprise',
          '4. Commandez votre carte NFC - Depuis le tableau de bord',
          '5. Partagez votre profil - NFC, QR code ou lien direct',
          '6. Suivez vos statistiques - Analytics en temps réel'
        ]
      },
      profile_completion: {
        title: 'Complétion du Profil',
        content: 'La barre de progression sur votre tableau de bord indique le niveau de complétion de votre profil. Visez 100% pour un profil professionnel complet.',
        items: [
          {
            name: 'Avatar (20%)',
            description: 'Ajoutez une photo professionnelle'
          },
          {
            name: 'Bio (10%)',
            description: 'Rédigez une biographie courte ou longue'
          },
          {
            name: 'Contact (30%)',
            description: 'Email, téléphone, adresse'
          },
          {
            name: 'Compétences (10%)',
            description: 'Listez vos compétences principales'
          },
          {
            name: 'Réseaux sociaux (10%)',
            description: 'Ajoutez au moins un lien social'
          },
          {
            name: 'Portfolio (10%)',
            description: 'Ajoutez des projets à votre portfolio'
          },
          {
            name: 'Certificats (10%)',
            description: 'Ajoutez vos certifications'
          }
        ]
      },
      dashboard_actions: {
        title: 'Actions du Tableau de Bord',
        content: 'Le menu rapide en bas de votre tableau de bord donne accès à toutes les fonctionnalités :',
        items: [
          { name: 'Profil', description: 'Voir votre profil public' },
          { name: 'Statistiques', description: 'Analytics détaillés de vos visites' },
          { name: 'Abonnés', description: 'Gérer vos followers' },
          { name: 'Carte', description: 'Configurer votre carte NFC' },
          { name: 'Commandes', description: 'Suivre vos commandes de cartes' },
          { name: 'Portfolio', description: 'Gérer vos projets' },
          { name: 'Certificats', description: 'Gérer vos certifications' },
          { name: 'Paramètres', description: 'Modifier vos informations' },
          { name: 'Messages', description: 'Consulter vos messages' }
        ]
      }
    }
  },
  {
    id: 'subscriptions-system',
    title: 'Système d\'Abonnement',
    icon: CreditCard,
    color: 'from-amber-500/60 to-orange-500/60',
    description: 'Gestion complète des abonnements et plans',
    content: {
      overview: {
        title: 'Vue d\'ensemble',
        content: 'Le système d\'abonnement LUVIKA permet une gestion flexible des plans utilisateurs avec support des abonnements à vie et à durée limitée.',
        items: [
          'Trois plans : Basic, Premium, Entreprise',
          'Abonnement à vie (expires_at = NULL)',
          'Abonnement avec date d\'expiration',
          'Demandes d\'upgrade avec validation admin',
          'Barre de progression visuelle des jours restants',
          'Désactivation automatique des anciens abonnements',
          'Contrainte unique : un seul abonnement par plan par utilisateur'
        ]
      },
      plans: {
        title: 'Plans Disponibles',
        items: [
          {
            name: 'Basic (Gratuit)',
            description: 'Pour les particuliers qui démarrent',
            features: [
              '1 carte NFC maximum',
              'Profil basique',
              'QR code standard',
              'Analytics limités',
              'Pas de création d\'événements',
              'Badge Star ★'
            ]
          },
          {
            name: 'Premium (Professionnel)',
            description: 'Pour les professionnels et freelances',
            features: [
              '10 cartes NFC maximum',
              'Profil avancé',
              'Création d\'événements',
              'Analytics détaillés',
              'Badge Crown ♛',
              'Support prioritaire'
            ]
          },
          {
            name: 'Entreprise (Business)',
            description: 'Pour les équipes et organisations',
            features: [
              'Cartes NFC illimitées',
              'Espace entreprise dédié',
              'Type d\'entreprise personnalisable',
              'Gestion d\'équipe',
              'Analytics avancés',
              'Badge Building 🏢',
              'Support dédié'
            ]
          }
        ]
      },
      lifetime_vs_dated: {
        title: 'Abonnement à Vie vs Avec Expiration',
        content: 'Deux types d\'abonnements sont supportés :',
        items: [
          {
            name: 'À Vie (Lifetime)',
            description: 'expires_at = NULL dans la base de données',
            features: [
              'N\'expire jamais',
              'Affiché avec l\'icône ∞ (infini)',
              'Message "Abonnement à vie — pas de date d\'expiration"',
              'Aucune barre de progression affichée'
            ]
          },
          {
            name: 'Avec Date d\'Expiration',
            description: 'expires_at = date précise',
            features: [
              'Barre de progression des jours restants',
              'Couleur change selon la proximité de l\'expiration :',
              '  • Vert : plus de 10 jours restants',
              '  • Orange : entre 5 et 10 jours restants',
              '  • Rouge : 5 jours ou moins',
              'Message d\'alerte "Expire bientôt"'
            ]
          }
        ]
      },
      admin_management: {
        title: 'Gestion Admin des Abonnements',
        content: 'Les administrateurs ont un contrôle total via le panneau /admin/admin/subscriptions.',
        items: [
          'Validation des demandes d\'upgrade avec choix de la date d\'expiration',
          'Édition des abonnements existants (plan, date, statut)',
          'Activation/Désactivation rapide',
          'Rejet automatique des demandes obsolètes (plan déjà à jour)',
          'Impossible d\'avoir deux abonnements du même plan pour un utilisateur',
          'Synchronisation automatique profiles.plan ← subscriptions'
        ],
        endpoints: [
          {
            method: 'POST',
            path: '/api/admin/upgrade-requests/:id/approved',
            description: 'Approuver une demande d\'upgrade',
            auth: true,
            body: {
              expires_at: 'string | null (null = à vie)',
              admin_notes: 'string (optionnel)'
            },
            response: '{ success: true, subscription: { plan, expires_at, is_lifetime } }'
          },
          {
            method: 'POST',
            path: '/api/admin/upgrade-requests/:id/rejected',
            description: 'Rejeter une demande d\'upgrade',
            auth: true
          },
          {
            method: 'PUT',
            path: '/api/admin/subscriptions/:id',
            description: 'Modifier un abonnement existant',
            auth: true,
            body: {
              plan: '"basic" | "premium" | "entreprise" (optionnel)',
              status: '"active" | "canceled" | "expired" | "pending" (optionnel)',
              expires_at: 'string | null (optionnel, null = à vie)'
            }
          },
          {
            method: 'POST',
            path: '/api/admin/subscriptions/:id/activate',
            description: 'Activer un abonnement (désactive automatiquement les autres)',
            auth: true
          },
          {
            method: 'POST',
            path: '/api/admin/subscriptions/:id/deactivate',
            description: 'Désactiver un abonnement (status → canceled)',
            auth: true
          }
        ]
      },
      business_rules: {
        title: 'Règles Métier',
        warning: 'Ces règles sont strictement appliquées par l\'API et les contraintes de base de données.',
        items: [
          '1. UN utilisateur = UN seul abonnement par plan (contrainte UNIQUE)',
          '2. L\'activation d\'un abonnement désactive automatiquement les autres',
          '3. Les demandes d\'upgrade sont rejetées si le plan est déjà à jour',
          '4. Les demandes en double sont automatiquement nettoyées',
          '5. Le profil est synchronisé avec l\'abonnement actif',
          '6. Ne JAMAIS modifier manuellement profiles.plan',
          '7. Toujours passer par la table subscriptions pour les changements de plan',
          '8. Un abonnement expiré ne donne plus accès aux fonctionnalités du plan'
        ]
      }
    }
  },
  {
    id: 'realtime-features',
    title: 'Temps Réel & Récompenses',
    icon: Zap,
    color: 'from-yellow-500/60 to-amber-500/60',
    description: 'Fonctionnalités en temps réel et système de récompenses',
    content: {
      channels: {
        title: 'Canaux Realtime Supabase',
        content: 'LUVIKA utilise 7 canaux Supabase Realtime pour des mises à jour instantanées.',
        items: [
          {
            name: 'Canal Messages',
            description: 'Notifications en temps réel des nouveaux messages de contact',
            features: ['Compteur non lus avec badge rouge', 'Notification sonore (notification.mp3)', 'Rafraîchissement automatique']
          },
          {
            name: 'Canal NFC',
            description: 'Mise à jour en temps réel des cartes NFC',
            features: ['Statistiques de scans', 'Statut des cartes (active/lost/blocked)', 'Visiteurs uniques']
          },
          {
            name: 'Canal Scans',
            description: 'Compteur de scans en direct',
            features: ['Total des scans', 'Progression des badges', 'Mise à jour du classement']
          },
          {
            name: 'Canal Likes',
            description: 'Mise à jour des likes en temps réel',
            features: ['Compteur de likes', 'Animation du cœur']
          },
          {
            name: 'Canal Followers',
            description: 'Nouveaux followers en temps réel',
            features: ['Compteur de followers', 'Liste des abonnés']
          },
          {
            name: 'Canal Portfolio',
            description: 'Mise à jour du portfolio et certificats',
            features: ['Projets ajoutés/supprimés', 'Certificats mis à jour']
          },
          {
            name: 'Canal Profile',
            description: 'Changements du profil en temps réel',
            features: ['Plan mis à jour', 'Informations modifiées']
          }
        ]
      },
      badges_system: {
        title: 'Système de Badges',
        content: 'Les utilisateurs gagnent des badges basés sur leur activité.',
        items: [
          {
            name: 'Badges de Niveau',
            description: 'Basés sur le nombre total de scans',
            features: [
              'Niveau 1 : 0-99 scans',
              'Niveau 2 : 100-499 scans',
              'Niveau 3 : 500-999 scans',
              'Niveau 4 : 1000-4999 scans',
              'Niveau 5 : 5000-9999 scans',
              'Niveau Max : 10000+ scans'
            ]
          },
          {
            name: 'Badge Récompense 10K',
            description: 'Badge spécial "scan_10k_reward" stocké dans profiles.badges[]',
            features: [
              'Débloqué à 10 000 scans',
              'Affiche une réduction de -5%',
              'Stocké dans le localStorage pour persistance',
              'Modal de récompense avec animation',
              'Bouton "Activer la réduction"'
            ]
          }
        ]
      },
      leaderboard: {
        title: 'Classement (Leaderboard)',
        content: 'Les utilisateurs peuvent voir le top 5 des scanners les plus actifs.',
        items: [
          'Accessible en cliquant sur le badge de niveau',
          'Podium visuel (1er, 2ème, 3ème)',
          'Badge -5% affiché pour les utilisateurs éligibles',
          'Redirection vers le profil en cliquant sur un utilisateur',
          'Données en temps réel'
        ]
      }
    }
  },
  {
    id: 'database',
    title: 'Base de Données',
    icon: Database,
    color: 'from-purple-500/60 to-pink-500/60',
    description: 'Structure complète de la base de données',
    content: {
      core_tables: {
        title: 'Tables Principales',
        items: [
          {
            name: 'profiles',
            description: 'Profils utilisateurs - table centrale du système',
            fields: [
              'id (UUID, PK, FK→auth.users)',
              'full_name (text)', 'username (text, UNIQUE)',
              'email (text)', 'avatar_url (text)',
              'plan (text, CHECK: basic/premium/entreprise)',
              'badges (text[], ex: ["scan_10k_reward"])',
              'scans_count (integer)', 'views_count (integer)',
              'verified (boolean)', 'role (text: user/admin)',
              'sections_visibility (jsonb)', 'skills (text[])',
              'birth_day/month/year (smallint)', 'country (text)',
              'professional_status (text)', 'website (text)',
              'linkedin, github, instagram, tiktok, etc. (text)'
            ]
          },
          {
            name: 'subscriptions',
            description: 'Abonnements - UNIQUE(profile_id, plan)',
            fields: [
              'id (UUID, PK)',
              'profile_id (UUID, FK→profiles)',
              'plan (text, CHECK: basic/premium/entreprise)',
              'status (text, CHECK: active/canceled/expired/pending)',
              'expires_at (timestamptz, NULL = à vie)',
              'started_at (timestamptz, NOT NULL)',
              'provider (text, default: manual)',
              'provider_id (text)',
              'created_at, updated_at (timestamptz)'
            ],
            note: 'INDEX UNIQUE idx_subscriptions_unique_plan_per_user ON (profile_id, plan)'
          },
          {
            name: 'upgrade_requests',
            description: 'Demandes de mise à niveau',
            fields: [
              'id (UUID, PK)',
              'profile_id (UUID, FK→profiles)',
              'target_plan (text)',
              'status (text: pending/approved/rejected)',
              'admin_notes (text)',
              'processed_at (timestamptz)',
              'created_at (timestamptz)'
            ]
          },
          {
            name: 'nfc_cards',
            description: 'Cartes NFC physiques',
            fields: [
              'id (UUID, PK)',
              'user_id (UUID, FK→auth.users)',
              'card_id (text)',
              'matricule (text)',
              'status (text: active/lost/blocked/inactive/reported)',
              'created_at (timestamptz)'
            ]
          }
        ]
      },
      supporting_tables: {
        title: 'Tables de Support',
        items: [
          {
            name: 'scans',
            description: 'Historique des scans NFC et QR',
            fields: ['id (UUID)', 'profile_id (UUID)', 'scanner_id (UUID)', 'scan_type (nfc/qr)', 'created_at']
          },
          {
            name: 'events',
            description: 'Événements (Premium/Entreprise)',
            fields: ['id (UUID)', 'title', 'description', 'location', 'starts_at', 'ends_at', 'is_public', 'max_participants', 'created_by']
          },
          {
            name: 'contact_requests',
            description: 'Messages de contact',
            fields: ['id (UUID)', 'profile_id', 'name', 'email', 'message', 'is_read', 'replied_at']
          },
          {
            name: 'companies',
            description: 'Entreprises (plan Entreprise)',
            fields: ['id (UUID)', 'owner_id (FK)', 'name', 'slug', 'company_type', 'plan']
          },
          {
            name: 'follows',
            description: 'Relations de suivi entre utilisateurs',
            fields: ['follower_id (UUID)', 'following_id (UUID)']
          },
          {
            name: 'likes',
            description: 'Likes sur les profils',
            fields: ['profile_id (UUID)', 'liked_by (UUID)']
          },
          {
            name: 'portfolios',
            description: 'Projets portfolio des utilisateurs',
            fields: ['id (UUID)', 'profile_id (FK)', 'title', 'description', 'url', 'image_url']
          },
          {
            name: 'certificates',
            description: 'Certifications des utilisateurs',
            fields: ['id (UUID)', 'profile_id (FK)', 'title', 'issuer', 'date', 'url']
          }
        ]
      },
      constraints_indexes: {
        title: 'Contraintes et Index Importants',
        items: [
          'UNIQUE (profile_id, plan) sur subscriptions',
          'UNIQUE (username) sur profiles',
          'UNIQUE (public_id) sur profiles',
          'CHECK sur profiles.plan, subscriptions.plan, subscriptions.status',
          'TRIGGER update_updated_at_column sur subscriptions et profiles',
          'INDEX sur profiles(username, full_name) pour la recherche',
          'INDEX sur subscriptions(profile_id), subscriptions(status), subscriptions(expires_at)',
          'INDEX sur profiles(views_count), profiles(deactivated_at)',
          'GIN INDEX sur profiles(badges) pour la recherche dans les tableaux'
        ]
      }
    }
  },
  {
    id: 'nfc-qr-codes',
    title: 'NFC & Codes QR',
    icon: QrCode,
    color: 'from-purple-500/60 to-pink-500/60',
    description: 'Partagez votre carte numérique instantanément',
    content: {
      nfc_cards: {
        title: 'Cartes NFC',
        content: 'Cartes physiques qui redirigent vers votre profil numérique lorsqu\'elles sont tapées sur un téléphone compatible NFC.',
        items: [
          'Commandez depuis Tableau de bord → Cartes NFC',
          'Limites par plan : Basic (1), Premium (10), Entreprise (Illimité)',
          'Chaque carte a un matricule unique',
          'Statuts : active, lost, blocked, inactive, reported',
          'Statistiques : scans totaux et visiteurs uniques',
          'Gestion : activation, désactivation, signalement de perte'
        ]
      },
      qr_codes: {
        title: 'Partage par Code QR',
        content: 'Générez des codes QR pour partager votre profil, événements ou cartes.',
        items: [
          'Génération en un clic depuis le tableau de bord',
          'Téléchargement en PNG',
          'Copie du lien de profil',
          'Personnalisation des couleurs (bleu par défaut)',
          'Suivi des scans QR'
        ]
      }
    }
  },

  {
    id: 'dashboard-features',
    title: 'Fonctionnalités Dashboard',
    icon: BarChart3,
    color: 'from-teal-500/60 to-cyan-500/60',
    description: 'Toutes les fonctionnalités du tableau de bord',
    content: {
      modals: {
        title: 'Modales du Dashboard',
        content: 'Le tableau de bord utilise de nombreuses modales pour les interactions utilisateur.',
        items: [
          { name: 'SuccessModal', description: 'Confirmation avec animation de bulles et barre de progression qui se réduit' },
          { name: 'CustomMessageModal', description: 'Messages de contact avec possibilité de répondre, liste des messages reçus' },
          { name: 'UpgradeModal', description: 'Demande de mise à niveau de plan avec animation de particules' },
          { name: 'QRModal', description: 'Génération et téléchargement de QR code en PNG' },
          { name: 'SignOutConfirmSheet', description: 'Confirmation de déconnexion avec animation spring depuis le bas' },
          { name: 'NFCModal', description: 'Vue d\'ensemble des cartes NFC avec actions rapides' },
          { name: 'NFCManagementModal', description: 'Administration détaillée d\'une carte NFC' },
          { name: 'SearchModal', description: 'Recherche d\'utilisateurs avec follow/unfollow et aperçu du profil' },
          { name: 'FollowersModal', description: 'Liste des abonnés avec pagination' },
          { name: 'PortfolioModal', description: 'Gestion des projets du portfolio' },
          { name: 'CertificatesModal', description: 'Gestion des certifications' },
          { name: 'CompanyTypeModal', description: 'Configuration du type d\'entreprise (plan Business uniquement)' },
          { name: 'LeaderboardModal', description: 'Classement Top 5 avec podium, badges et récompenses' },
          { name: 'RewardModal', description: 'Récompense 10K scans avec animation et bouton d\'activation' }
        ]
      },
      realtime: {
        title: 'Fonctionnalités Temps Réel du Dashboard',
        content: 'Le dashboard intègre plusieurs fonctionnalités temps réel via Supabase Realtime :',
        items: [
          { name: 'Compteur messages non lus', description: 'Badge rouge animé avec notification sonore (notification.mp3)' },
          { name: 'Compteur de scans', description: 'Mise à jour en direct du total affiché dans le header' },
          { name: 'Statistiques NFC', description: 'Scans totaux et visiteurs uniques mis à jour en temps réel' },
          { name: 'Likes', description: 'Animation du cœur et compteur en temps réel' },
          { name: 'Followers', description: 'Mise à jour du compteur d\'abonnés' },
          { name: 'Profil', description: 'Changements de plan et d\'informations en temps réel' }
        ]
      },
      ice_bubbles: {
        title: 'Effets Visuels et Animations',
        content: 'Le dashboard utilise des animations CSS personnalisées pour une expérience utilisateur premium.',
        items: [
          { name: 'Animation floatBubble', description: 'Bulles décoratives qui flottent vers le haut avec opacité décroissante' },
          { name: 'Effet dashboard-action-btn', description: 'Survol avec radial-gradient suivant la position de la souris' },
          { name: 'Animation shimmer', description: 'Effet de brillance sur les barres de progression' },
          { name: 'Glassmorphism', description: 'Effet de verre dépoli sur tous les composants (backdrop-blur)' },
          { name: 'Animation spring', description: 'Transitions fluides avec Framer Motion spring' }
        ]
      },
      quick_actions: {
        title: 'Menu Rapide (QuickActions)',
        content: 'Le menu flottant en bas du dashboard donne accès à 10 actions principales :',
        items: [
          { name: 'Profil', description: 'Voir le profil public' },
          { name: 'Statistiques', description: 'Analytics détaillés' },
          { name: 'Abonnés', description: 'Gérer les followers' },
          { name: 'Carte', description: 'Configurer la carte NFC' },
          { name: 'Commandes', description: 'Suivre les commandes' },
          { name: 'Portfolio', description: 'Gérer les projets' },
          { name: 'Certificats', description: 'Gérer les certifications' },
          { name: 'Paramètres', description: 'Modifier les informations' },
          { name: 'Messages', description: 'Consulter les messages' },
          { name: 'Déconnexion', description: 'Se déconnecter (avec confirmation)' }
        ]
      }
    }
  },
  {
    id: 'profile-features',
    title: 'Gestion du Profil',
    icon: User,
    color: 'from-green-500/60 to-emerald-500/60',
    description: 'Complétion, sections, visibilité et contacts',
    content: {
      completion: {
        title: 'Barre de Complétion du Profil',
        content: 'Le pourcentage de complétion est calculé sur 10 points et affiché avec une barre de progression colorée :',
        items: [
          { name: 'Avatar', description: '2 points - Photo de profil' },
          { name: 'Bio', description: '1 point - Biographie courte ou longue' },
          { name: 'Email', description: '1 point - Adresse email' },
          { name: 'Téléphone', description: '1 point - Numéro de téléphone' },
          { name: 'Adresse', description: '1 point - Adresse postale' },
          { name: 'Compétences', description: '1 point - Au moins une compétence listée' },
          { name: 'Réseaux sociaux', description: '1 point - Au moins un lien social' },
          { name: 'Certificats', description: '1 point - Au moins un certificat' },
          { name: 'Portfolio', description: '1 point - Au moins un projet' }
        ],
        note: 'Score total sur 10 points. Barre verte (≥80%), orange (≥50%), rouge (<50%).'
      },
      sections_visibility: {
        title: 'Visibilité des Sections',
        content: 'Les utilisateurs peuvent contrôler quelles sections sont visibles publiquement via sections_visibility (JSONB).',
        items: [
          'Bio : informations biographiques',
          'Contact : email, téléphone, adresse',
          'Social : liens vers les réseaux sociaux',
          'Portfolio : projets et réalisations',
          'Certificates : certifications et diplômes'
        ]
      },
      contact_requests: {
        title: 'Demandes de Contact',
        content: 'Système de messages entre utilisateurs avec notifications temps réel.',
        items: [
          { name: 'Toggle accepts_contact_requests', description: 'Active/désactive la réception de messages' },
          { name: 'Compteur de messages non lus', description: 'Badge rouge avec notification sonore' },
          { name: 'Réponses aux messages', description: 'Interface de réponse intégrée au modal CustomMessageModal' },
          { name: 'Rafraîchissement', description: 'Mise à jour toutes les 30 secondes + temps réel' }
        ]
      },
      search_follow: {
        title: 'Recherche et Suivi',
        content: 'Les utilisateurs peuvent rechercher et suivre d\'autres profils.',
        items: [
          'Recherche par nom complet (ilike)',
          'Limité à 10 résultats',
          'Bouton Suivre/Ne plus suivre avec retour visuel',
          'Aperçu rapide du profil (avatar, nom, plan)',
          'Redirection vers le profil public au clic'
        ]
      }
    }
  },
{
  id: 'public-profile',
  title: 'Profil Public',
  icon: Globe,
  color: 'from-sky-500/60 to-blue-500/60',
  description: 'Composants et fonctionnalités du profil public',
  content: {
    components: {
      title: 'Composants du Profil Public',
      items: [
        { name: 'BioToggle', description: 'Animation expand/collapse pour les bios longues (>30 mots)' },
        { name: 'SocialCard', description: 'Carte réseau social avec gradient personnalisé par plateforme' },
        { name: 'IdentityBadge', description: 'Badge pour le poste et l\'entreprise' },
        { name: 'ProfessionalStatusBadge', description: 'Badge de statut professionnel (étudiant, freelance, etc.)' },
        { name: 'StatCard', description: 'Carte statistique avec animation pulse' },
        { name: 'InfoCard', description: 'Carte d\'information (anniversaire, localisation, disponibilité)' },
        { name: 'FloatingButtons', description: 'Boutons d\'action flottants (QR, contact, partage)' },
        { name: 'ScanTracker', description: 'Traqueur de scans en temps réel' },
        { name: 'ProfileCard3D', description: 'Carte NFC 3D interactive' },
      ]
    },
    modals: {
      title: 'Modales du Profil Public',
      items: [
        { name: 'Avatar Fullscreen', description: 'Vue plein écran avec téléchargement' },
        { name: 'QR Modal', description: 'QR code avec copie et téléchargement' },
        { name: 'Contact Modal', description: 'Formulaire de contact' },
        { name: 'Portfolio Modal', description: 'Galerie de projets' },
        { name: 'Certificates Modal', description: 'Liste des certifications' },
        { name: 'Skills Modal', description: 'Grille de compétences en badges animés' },
        { name: 'Followers/Following Modals', description: 'Listes d\'abonnés avec pagination' },
      ]
    },
    sections: {
      title: 'Sections du Profil',
      items: [
        { name: 'Section Contact', description: 'Email, téléphone, WhatsApp, adresse, site web' },
        { name: 'Section Social', description: 'Réseaux sociaux avec SocialCard' },
        { name: 'Section Compétences', description: 'Portfolio, certifications, compétences' },
        { name: 'Section Liens', description: 'vCard, CV, Calendly, Portfolio URL' },
        { name: 'Section Lien Personnalisé', description: 'Lien custom configurable' },
      ]
    },
    realtime_wrapper: {
      title: 'Wrapper Temps Réel',
      content: 'Le PublicProfileClientWrapper gère la synchronisation en temps réel du profil public.',
      items: [
        'Optimistic followers avec useOptimistic',
        'Canaux Realtime : profil, follows, notifications, scans, likes, NFC, portfolio, card_configs',
        'Notifications navigateur pour nouveaux followers',
        'Indicateur de synchronisation (badge vert/jaune)',
        'Heartbeat 30s pour maintenir la connexion',
        'Gestion des profils privés (redirection /private)',
      ]
    }
  }
},
{
  id: 'enterprise',
  title: 'Espace Entreprise',
  icon: Building,
  color: 'from-violet-500/60 to-purple-500/60',
  description: 'Dashboard et configuration entreprise',
  content: {
    dashboard: {
      title: 'Dashboard Entreprise',
      content: 'Interface adaptative selon le type d\'entreprise avec modules dynamiques.',
      items: [
        { name: 'Header entreprise', description: 'Nom, type, description, badges vérifiés' },
        { name: 'Stats rapides', description: 'Commandes, revenus, membres, note' },
        { name: 'Quick actions', description: 'Actions contextuelles selon le type (ex: Nouveau plat pour restaurant)' },
        { name: 'Modules par catégorie', description: 'Grille de modules groupés (core, commerce, management, communication, specialized)' },
        { name: 'Alerte configuration', description: 'Bannière si configuration incomplète' },
      ]
    },
    setup: {
      title: 'Configuration du Type',
      content: 'Choix du type d\'entreprise parmi les templates disponibles.',
      items: [
        'Restaurant : menu digital, commandes, QR table',
        'Hôtel : réservations, chambres, services',
        'Clinique : RDV, patients, dossier médical',
        'E-commerce : produits, commandes, inventaire',
        'Agence : portfolio, RDV, contrats',
        'Freelance : portfolio, facturation, contrats',
        'Association : membres, événements, dons',
        'Éducation : cours, étudiants, certifications',
      ]
    },
    modules: {
      title: 'Système de Modules',
      content: 'Les modules sont chargés dynamiquement selon le type d\'entreprise via getCompanyModules().',
      items: [
        'Chaque module a : id, label, description, icône, chemin, catégorie, requis',
        'Catégories : core (obligatoire), commerce, management, communication, specialized',
        'Configuration via company-modules.config.ts',
        'Icônes dynamiques via company-icons.ts',
      ]
    }
  }
},
  {
    id: 'events',
    title: 'Événements',
    icon: Calendar,
    color: 'from-orange-500/60 to-red-500/60',
    description: 'Créer et gérer des événements professionnels',
    content: {
      creating_events: {
        title: 'Création d\'Événements',
        content: 'Disponible pour les plans Premium et Entreprise.',
        items: [
          'Accédez via Tableau de bord → Événements → Créer',
          'Formulaire avec titre, description, lieu, dates',
          'Option public/privé',
          'Nombre maximum de participants',
          'Génération automatique de QR code pour l\'événement',
          'Suivi des participants en temps réel'
        ]
      },
      event_management: {
        title: 'Gestion des Événements',
        content: 'Interface complète dans le modal événements.',
        items: [
          'Liste des participants avec statut',
          'Scan de QR codes pour l\'enregistrement',
          'Export des données participants',
          'Mise à jour en temps réel des inscriptions'
        ]
      }
    }
  },
  {
    id: 'admin-panel',
    title: 'Panneau d\'Administration',
    icon: ShieldCheck,
    color: 'from-red-500/60 to-rose-500/60',
    description: 'Gestion complète de la plateforme',
    content: {
      access: {
        title: 'Accès Admin',
        content: 'Seuls les utilisateurs avec profiles.role = \'admin\' peuvent accéder au panneau.',
        items: [
          'URL : /admin (dashboard admin)',
          'URL : /admin/admin/subscriptions (gestion abonnements)',
          'URL : /admin/admin/upgrade-requests (demandes upgrade)',
          'Vérification du rôle via user.user_metadata?.role',
          'Service role key utilisée pour les opérations sensibles'
        ]
      },
      subscriptions_page: {
        title: 'Page Abonnements (/admin/admin/subscriptions)',
        content: 'Interface complète de gestion des abonnements.',
        items: [
          'Filtres par plan (Basic, Premium, Entreprise)',
          'Filtres par statut (Actifs, Inactifs)',
          'Recherche par nom, email, username',
          'Pagination (8 par page)',
          'Bouton Éditer → modal avec :',
          '  • Changement de plan',
          '  • Choix À vie / Avec expiration',
          '  • Date d\'expiration (datetime-local)',
          'Boutons Activer/Désactiver',
          'Affichage : nom, email, plan, statut, dates, ID'
        ]
      },
      upgrade_requests_page: {
        title: 'Page Demandes Upgrade (/admin/admin/upgrade-requests)',
        content: 'Validation des demandes de mise à niveau.',
        items: [
          'Filtres par statut (Toutes, En attente, Approuvées, Rejetées)',
          'Détection automatique des demandes obsolètes',
          'Bouton Approuver → modal avec :',
          '  • Choix À vie / Avec expiration',
          '  • Date d\'expiration optionnelle',
          '  • Notes admin',
          'Bouton Rejeter',
          'Rejet automatique si plan déjà à jour'
        ]
      }
    }
  },
{
  id: 'ui-components',
  title: 'Composants UI',
  icon: Layers,
  color: 'from-violet-500/60 to-purple-500/60',
  description: 'Composants réutilisables et design system',
  content: {
    quick_menu: {
      title: 'DashboardQuickMenu',
      content: 'Menu d\'actions rapides avec deux modes : radial (desktop) et bottom sheet (mobile).',
      items: [
        { name: 'Mode Desktop', description: 'Disposition radiale calculée avec cos/sin, animation staggered' },
        { name: 'Mode Mobile', description: 'Bottom sheet avec geste tactile pour fermer (drag vers le bas > 80px)' },
        { name: 'Restrictions Plan', description: 'Actions grisées avec icône Lock pour le plan Gratuit (statistics, subscribers, portfolio, certificates)' },
        { name: 'getGradient()', description: 'Mapping des classes Tailwind vers des couleurs CSS pour les backgrounds' },
      ]
    },
    collapsible_section: {
      title: 'CollapsibleSection',
      content: 'Sections réductibles utilisées dans les paramètres.',
      items: [
        'Toggle expand/collapse avec ChevronUp/ChevronDown',
        'Icône et couleur personnalisables par section',
        'État géré par expandedSections (Record<string, boolean>)',
      ]
    },
    social_icons: {
      title: 'Icônes SVG Personnalisées',
      content: 'Icônes créées sur mesure pour les plateformes non disponibles dans Lucide.',
      items: [
        'SnapchatIcon, TelegramIcon, PinterestIcon',
        'DiscordIcon, RedditIcon, ThreadsIcon',
        'Utilisées dans settings/page.tsx et PublicProfileClient.tsx',
      ]
    }
  }
},
{
  id: 'onboarding',
  title: 'Onboarding',
  icon: UserPlus,
  color: 'from-emerald-500/60 to-green-500/60',
  description: 'Parcours de création de compte et complétion de profil',
  content: {
    complete_profile: {
      title: 'CompleteProfilePage',
      content: 'Formulaire en 3 étapes pour compléter le profil après inscription.',
      items: [
        { name: 'Étape 1 - Identité', description: 'Nom complet, username (vérifié en temps réel avec debounce 500ms)' },
        { name: 'Étape 2 - Contact', description: 'Téléphone, WhatsApp' },
        { name: 'Étape 3 - Bio', description: 'Poste, entreprise, bio courte (max 160 caractères)' },
        { name: 'Barre de progression', description: 'Animation fluide entre les étapes' },
        { name: 'Cookie signup_plan', description: 'Récupération du plan choisi lors de l\'inscription' },
        { name: 'Redirection', description: 'Si onboarding_done=true → skip automatique vers /dashboard' },
      ]
    },
    card_config: {
      title: 'Configuration de Carte (card-config)',
      content: 'Page de personnalisation des sections visibles sur la carte NFC/QR.',
      items: [
        { name: 'Types de sections', description: 'profile, contact, social, event, custom, cv, business' },
        { name: 'Filtres', description: 'Toutes, Activées, Verrouillées (Premium)' },
        { name: 'URL personnalisée', description: 'Champ input conditionnel pour le type "custom"' },
        { name: 'Upsert', description: 'Sauvegarde avec onConflict: profile_id,scan_type' },
        { name: 'Restrictions', description: 'Sections Premium grisées avec icône Lock pour plan Basic' },
      ]
    }
  }
},
{
  id: 'authentication',
  title: 'Authentification',
  icon: Lock,
  color: 'from-cyan-500/60 to-blue-500/60',
  description: 'Système d\'authentification complet',
  content: {
    flows: {
      title: 'Flux d\'Authentification',
      items: [
        { name: 'Inscription (sign-up)', description: 'Formulaire en 2 étapes : email → sécurité' },
        { name: 'Connexion (sign-in)', description: 'Email + mot de passe avec toggle visibilité' },
        { name: 'Mot de passe oublié', description: 'Envoi d\'email de réinitialisation via Supabase' },
        { name: 'Mise à jour mot de passe', description: 'Vérification OTP + nouveau mot de passe' },
        { name: 'Callback OAuth', description: 'Échange de code + cookie signup_plan' },
      ]
    },
    signup_details: {
      title: 'Détails Inscription',
      items: [
        { name: 'Validation email', description: 'Regex Gmail uniquement : /^[a-zA-Z0-9._%+-]+@gmail\\.com$/' },
        { name: 'Vérification disponibilité', description: 'Debounce 500ms, requête dans profiles.email' },
        { name: 'Règles mot de passe', description: '8+ caractères, majuscule, minuscule, chiffre, spécial' },
        { name: 'Barre de progression', description: 'Animation entre les étapes email → security' },
        { name: 'Modal bienvenue', description: 'Animation 🎉 après inscription réussie' },
        { name: 'Cookie signup_plan', description: 'Stockage du plan choisi (httpOnly: false, maxAge: 1h)' },
      ]
    },
    signin_details: {
      title: 'Détails Connexion',
      items: [
        { name: 'Vérification session existante', description: 'Redirection si déjà connecté' },
        { name: 'Vérification compte désactivé', description: 'profiles.deactivated = true → déconnexion + erreur' },
        { name: 'Redirection par rôle', description: 'admin → /admin, user → /dashboard' },
        { name: 'Toggle visibilité', description: 'Eye/EyeOff pour le champ mot de passe' },
        { name: 'Badge sécurité', description: 'ShieldCheck avec texte "Sécurisé"' },
      ]
    },
    password_reset: {
      title: 'Réinitialisation de Mot de Passe',
      items: [
        { name: 'Forgot Password', description: 'resetPasswordForEmail() avec redirectTo /auth/update-password' },
        { name: 'Redirection', description: '/auth/reset-password → /auth/update-password avec token_hash et type' },
        { name: 'Vérification OTP', description: 'verifyOtp({ token_hash, type: "recovery" })' },
        { name: 'Règles strictes', description: '8+ caractères, majuscule, minuscule, chiffre, spécial' },
        { name: 'Feedback visuel', description: '5 règles avec pastilles vertes/grises en temps réel' },
      ]
    },
    callback: {
      title: 'Callback OAuth',
      content: 'Endpoint appelé après vérification d\'email ou connexion OAuth.',
      items: [
        'Récupère le code depuis searchParams.code',
        'Échange le code contre une session : exchangeCodeForSession(code)',
        'Stocke le plan dans un cookie : signup_plan',
        'Redirige vers /complete-profile ou le next param',
      ]
    },
    error_page: {
      title: 'Page d\'Erreur',
      content: 'Page affichée en cas d\'erreur d\'authentification.',
      items: [
        'Récupère le message depuis searchParams.message',
        'Affiche le message dans une alerte amber',
        'Bouton retour vers /auth/sign-in',
        'Liens légaux : privacy, terms, contact',
      ]
    }
  }
},
{
  id: 'analytics-page',
  title: 'Page Statistiques',
  icon: BarChart3,
  color: 'from-cyan-500/60 to-blue-500/60',
  description: 'Analytics et graphiques pour les plans Premium',
  content: {
    features: {
      title: 'Fonctionnalités',
      items: [
        { name: 'KPIs', description: 'Total scans, NFC, QR Profil, QR Lien' },
        { name: 'Graphique Évolution', description: 'Line chart Chart.js avec données par jour' },
        { name: 'Graphique Répartition', description: 'Doughnut chart par type de scan' },
        { name: 'Filtres période', description: '7 jours, 30 jours, 90 jours, Tout' },
        { name: 'Derniers scans', description: 'Liste des 10 derniers avec visiteur et date' },
        { name: 'Export CSV', description: 'Téléchargement des données complètes' },
        { name: 'Restriction', description: 'Accès limité aux plans Premium et Entreprise' },
      ]
    }
  }
},
{
  id: 'subscribers-page',
  title: 'Page Abonnés',
  icon: Users,
  color: 'from-amber-500/60 to-orange-500/60',
  description: 'Gestion des followers et blocage',
  content: {
    features: {
      title: 'Fonctionnalités',
      items: [
        { name: 'RPC get_user_followers', description: 'Fonction PostgreSQL pour récupérer les followers avec infos' },
        { name: 'Statistiques', description: 'Total, Vérifiés, Bloqués' },
        { name: 'Recherche', description: 'Filtrage par nom ou username' },
        { name: 'Blocage/Déblocage', description: 'Table user_blocks, toggle avec retour visuel' },
        { name: 'Badges', description: 'Vérifié (ShieldCheck), Bloqué (Ban)' },
        { name: 'Export CSV', description: 'Téléchargement de la liste complète' },
      ]
    }
  }
},
  {
    id: 'api',
    title: 'Référence API',
    icon: Code,
    color: 'from-green-500/60 to-emerald-500/60',
    description: 'Points de terminaison et utilisation de l\'API',
    content: {
      auth: {
        title: 'Authentification',
        endpoints: [
          {
            method: 'POST',
            path: '/api/auth/sign-in',
            description: 'Connexion utilisateur',
            body: { email: 'string', password: 'string' }
          },
          {
            method: 'POST',
            path: '/api/auth/sign-up',
            description: 'Inscription utilisateur',
            body: { email: 'string', password: 'string', full_name: 'string' }
          },
          {
            method: 'POST',
            path: '/api/logout',
            description: 'Déconnexion',
            auth: true
          }
        ]
      },
      subscriptions_api: {
        title: 'API Abonnements',
        endpoints: [
          {
            method: 'GET',
            path: '/api/admin/subscriptions',
            description: 'Liste tous les abonnements (admin)',
            auth: true
          },
          {
            method: 'POST',
            path: '/api/admin/subscriptions',
            description: 'Créer un abonnement manuellement',
            auth: true,
            body: {
              profile_id: 'UUID',
              plan: '"basic" | "premium" | "entreprise"',
              expires_at: 'string | null'
            }
          },
          {
            method: 'PUT',
            path: '/api/admin/subscriptions/:id',
            description: 'Modifier un abonnement existant',
            auth: true,
            body: {
              plan: 'string (optionnel)',
              status: '"active" | "canceled" | "expired" | "pending" (optionnel)',
              expires_at: 'string | null (optionnel)'
            }
          },
          {
            method: 'POST',
            path: '/api/admin/subscriptions/:id/activate',
            description: 'Activer un abonnement',
            auth: true
          },
          {
            method: 'POST',
            path: '/api/admin/subscriptions/:id/deactivate',
            description: 'Désactiver un abonnement',
            auth: true
          }
        ]
      },
      upgrade_api: {
        title: 'API Demandes d\'Upgrade',
        endpoints: [
          {
            method: 'POST',
            path: '/api/upgrade-request',
            description: 'Soumettre une demande (utilisateur)',
            auth: true,
            body: {
              user_id: 'UUID',
              profile_id: 'UUID',
              target_plan: '"premium" | "entreprise"'
            }
          },
          {
            method: 'POST',
            path: '/api/admin/upgrade-requests/:id/approved',
            description: 'Approuver une demande (admin)',
            auth: true,
            body: {
              expires_at: 'string | null (null = à vie)',
              admin_notes: 'string (optionnel)'
            }
          },
          {
            method: 'POST',
            path: '/api/admin/upgrade-requests/:id/rejected',
            description: 'Rejeter une demande (admin)',
            auth: true
          }
        ]
      },
      other_api: {
        title: 'Autres Endpoints',
        endpoints: [
          {
            method: 'GET',
            path: '/api/leaderboard?limit=5',
            description: 'Classement des utilisateurs par scans'
          },
          {
            method: 'POST',
            path: '/api/subscription/apply-scan-reward',
            description: 'Appliquer la récompense 10K scans (-5%)',
            auth: true,
            body: {
  profile_id: 'UUID',
  discount_percent: '5',
  reason: 'string'
}
          },
          {
            method: 'GET',
            path: '/api/analytics?profile_id=:id&range=all',
            description: 'Statistiques de scans d\'un profil',
            auth: true
          },
          {
            method: 'GET',
            path: '/api/contact-requests/count?status=unread',
            description: 'Nombre de messages non lus',
            auth: true
          }
        ]
      }
    }
  },
  {
    id: 'deployment',
    title: 'Déploiement',
    icon: Globe,
    color: 'from-indigo-500/60 to-blue-500/60',
    description: 'Guide de déploiement en production',
    content: {
      requirements: {
        title: 'Prérequis',
        items: [
          'Node.js 18+',
          'npm ou yarn',
          'Compte Supabase (gratuit ou pro)',
          'Compte Vercel (recommandé pour l\'hébergement)',
          'Git pour le versionnement'
        ]
      },
      env_variables: {
        title: 'Variables d\'Environnement (.env.local)',
        items: [
          'NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...',
          'SUPABASE_SERVICE_ROLE_KEY=eyJ... (secret, pour les opérations admin)',
          'NEXT_PUBLIC_SITE_URL=https://luvika.vercel.app',
          'CRON_SECRET=votre_secret_cron (pour les tâches planifiées)'
        ]
      },
      database_setup: {
        title: 'Configuration Base de Données',
        content: 'Exécutez ces scripts SQL dans l\'ordre dans l\'éditeur SQL Supabase :',
        items: [
          '1. Créez les tables (profiles, subscriptions, upgrade_requests, etc.)',
          '2. Ajoutez les contraintes CHECK et UNIQUE',
          '3. Créez les index (idx_subscriptions_unique_plan_per_user, etc.)',
          '4. Ajoutez les triggers (update_updated_at_column)',
          '5. Configurez les politiques RLS (Row Level Security)',
          '6. Activez la replication en temps réel pour les tables nécessaires',
          '7. Vérifiez avec : SELECT plan, COUNT(*) FROM profiles GROUP BY plan;'
        ]
      },
      deployment_steps: {
        title: 'Étapes de Déploiement sur Vercel',
        items: [
          '1. git clone <repo-url>',
          '2. cd luvika && npm install',
          '3. Copiez .env.example vers .env.local et remplissez les variables',
          '4. npm run dev (test local)',
          '5. npm run build (vérification TypeScript et build)',
          '6. vercel --prod (déploiement)',
          '7. Configurez les variables d\'environnement dans Vercel Dashboard',
          '8. Ajoutez le domaine personnalisé si nécessaire',
          '9. Vérifiez le déploiement sur l\'URL de production'
        ]
      },
      post_deployment: {
        title: 'Post-Déploiement',
        items: [
          'Vérifiez que l\'authentification fonctionne',
          'Testez la création de compte et la connexion',
          'Vérifiez les abonnements (création, modification, expiration)',
          'Testez les fonctionnalités NFC et QR',
          'Vérifiez les notifications temps réel',
          'Configurez les tâches cron si nécessaire (Vercel Cron Jobs)'
        ]
      }
    }
  }
];

// Fonction pour générer le contenu Markdown
const generateDocumentationContent = () => {
  let content = '# Documentation LUVIKA\n\n';
  content += 'Guide complet pour comprendre, utiliser et contribuer à la plateforme LUVIKA.\n\n';
  content += '---\n\n';

  documentationSections.forEach(section => {
    content += `## ${section.title}\n\n`;
    content += `${section.description}\n\n`;

    Object.entries(section.content).forEach(([key, sectionContent]) => {
      content += `### ${sectionContent.title}\n\n`;
      
      if (sectionContent.content) {
        content += `${sectionContent.content}\n\n`;
      }

      if (sectionContent.warning) {
        content += `> ⚠️ **Attention :** ${sectionContent.warning}\n\n`;
      }

      if (sectionContent.note) {
        content += `> 📝 **Note :** ${sectionContent.note}\n\n`;
      }

      if (sectionContent.tip) {
        content += `> 💡 **Astuce :** ${sectionContent.tip}\n\n`;
      }

      if (sectionContent.items) {
        sectionContent.items.forEach((item: string | DocumentationItem) => {
          if (typeof item === 'string') {
            content += `- ${item}\n`;
          } else {
            content += `#### ${item.name || item.title || ''}\n`;
            if (item.description) content += `${item.description}\n\n`;
            if (item.fields) content += `**Champs:** ${item.fields.join(', ')}\n\n`;
            if (item.params) content += `**Paramètres:** ${item.params.join(', ')}\n\n`;
            if (item.features) {
              content += '**Fonctionnalités:**\n';
              item.features.forEach(f => content += `  - ${f}\n`);
              content += '\n';
            }
          }
        });
        content += '\n';
      }

      if (sectionContent.endpoints) {
        content += '#### Endpoints API\n\n';
        sectionContent.endpoints.forEach((endpoint) => {
          content += `**${endpoint.method}** \`${endpoint.path}\`\n`;
          content += `${endpoint.description}\n`;
          if (endpoint.auth) content += '- *Authentification requise*\n';
          if (endpoint.params) content += `- **Paramètres:** ${endpoint.params.join(', ')}\n`;
          if (endpoint.body) content += `- **Body:** \`${JSON.stringify(endpoint.body)}\`\n`;
          if (endpoint.response) content += `- **Réponse:** \`${endpoint.response}\`\n`;
          content += '\n';
        });
      }
    });

    content += '---\n\n';
  });

  return content;
};

const downloadDocumentation = () => {
  const content = generateDocumentationContent();
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'LUVIKA_Documentation.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSectionChange = (sectionId: string) => {
    setContentLoading(true);
    setActiveSection(sectionId);
    setTimeout(() => setContentLoading(false), 300);
  };

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-transparent flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
          />
          <span className="text-cyan-300/70 text-sm font-light tracking-wide">
            Chargement de la documentation...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
        <div className="container mx-auto px-4 py-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r  bg-transparent  px-3.5 py-1.5 rounded-full border border-cyan-500/20 mb-4">
              <Book className="w-3.5 h-3.5 text-cyan-300/80" />
              <span className="text-cyan-300/80 font-medium text-sm">Documentation</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white/90 to-cyan-200/70 bg-clip-text text-transparent mb-3">
              Documentation LUVIKA
            </h1>
            <p className="text-gray-300/70 max-w-2xl mx-auto text-sm font-light leading-relaxed mb-6">
              Guide complet pour comprendre, utiliser et contribuer à la plateforme LUVIKA.
              Découvrez toutes les fonctionnalités, l'architecture et les API.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/">
                <Button size="sm" variant="outline" className="text-xs border-white/20 text-gray-300 hover:bg-white/5">
                  <ChevronRight className="w-3.5 h-3.5 mr-1.5 rotate-180" />
                  Retour à l'accueil
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={downloadDocumentation} className="text-xs border-white/20 text-gray-300 hover:bg-white/5">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Télécharger (Markdown)
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="lg:col-span-1"
          >
            <div className="sticky top-4 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]">
              <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                <Book className="w-4 h-4 text-cyan-400/70" />
                Navigation
              </h3>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400/60 w-3.5 h-3.5" />
                <Input
                  placeholder="Rechercher une section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 placeholder:text-gray-500 rounded-xl"
                />
              </div>
              
              <div className="space-y-1 max-h-[70vh] overflow-y-auto">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-white/[0.06] border border-white/[0.1]'
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center flex-shrink-0`}>
                      <section.icon className="w-3.5 h-3.5 text-white/80" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white/80 truncate">{section.title}</div>
                      <div className="text-[10px] text-gray-500/70 truncate">{section.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {contentLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-20"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
                  />
                </motion.div>
              ) : (
                documentationSections.map((section) => (
                  activeSection === section.id && (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      {/* Section Header */}
                      <div className="rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                            <section.icon className="w-4.5 h-4.5 text-white/80" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-white/90">{section.title}</h2>
                            <p className="text-xs text-gray-400/70 font-light">{section.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content Cards */}
                      <div className="grid gap-3">
                        {Object.entries(section.content).map(([key, content]) => (
                          <div key={key} className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-300">
                            <h3 className="text-base font-semibold text-white/80 mb-3">{content.title}</h3>
                            
                            {content.content && (
                              <p className="text-gray-300/70 text-sm leading-relaxed font-light mb-3">{content.content}</p>
                            )}
                            
                            {content.warning && (
                              <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 mb-3">
                                <p className="text-xs text-amber-400/60 font-light flex items-start gap-2">
                                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  <span><strong>Attention :</strong> {content.warning}</span>
                                </p>
                              </div>
                            )}
                            
                            {content.note && (
                              <div className="p-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/15 mb-3">
                                <p className="text-xs text-blue-400/60 font-light flex items-start gap-2">
                                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  <span><strong>Note :</strong> {content.note}</span>
                                </p>
                              </div>
                            )}
                            
                            {content.tip && (
                              <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15 mb-3">
                                <p className="text-xs text-emerald-400/60 font-light flex items-start gap-2">
                                  <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  <span><strong>Astuce :</strong> {content.tip}</span>
                                </p>
                              </div>
                            )}
                            
                            {content.items && (
                              <div className="grid gap-2">
                                {content.items.map((item: string | DocumentationItem, index: number) => (
                                  <div key={index} className="flex items-start gap-2.5 p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${section.color} mt-1.5 flex-shrink-0`}></div>
                                    {typeof item === 'string' ? (
                                      <span className="text-gray-300/70 text-sm font-light">{item}</span>
                                    ) : (
                                      <div className="flex flex-col gap-1 w-full">
                                        <span className="text-white/80 text-sm font-medium">{item.name || item.title || ''}</span>
                                        {item.description && (
                                          <span className="text-gray-400/70 text-xs font-light">{item.description}</span>
                                        )}
                                        {item.fields && (
                                          <div className="flex flex-wrap gap-1.5 mt-1">
                                            {item.fields.map((field, i) => (
                                              <Badge key={i} variant="outline" className="text-[10px] border-white/10 text-gray-400/70 bg-transparent">
                                                {field}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                        {item.features && (
                                          <div className="flex flex-wrap gap-1.5 mt-1">
                                            {item.features.map((feature, i) => (
                                              <Badge key={i} variant="outline" className="text-[10px] border-white/10 text-gray-400/70 bg-transparent">
                                                {feature}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {content.endpoints && (
                              <div className="space-y-2.5 mt-3">
                                {content.endpoints.map((endpoint, index) => (
                                  <div key={index} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <Badge className={`text-[10px] bg-gradient-to-r ${section.color} text-white/80 border-0 px-2 py-0`}>
                                        {endpoint.method}
                                      </Badge>
                                      <code className="text-white/70 text-xs font-mono">{endpoint.path}</code>
                                      {endpoint.auth && (
                                        <Badge variant="outline" className="ml-auto text-[10px] border-white/10 text-gray-400/70 bg-transparent">
                                          <Lock className="w-2.5 h-2.5 mr-0.5" />
                                          Auth
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-gray-400/70 text-xs font-light mb-2">{endpoint.description}</p>
                                    {endpoint.body && (
                                      <div className="mb-1">
                                        <span className="text-[10px] text-gray-500/50">Body:</span>
                                        <code className="text-[10px] text-gray-400/60 ml-1">{JSON.stringify(endpoint.body)}</code>
                                      </div>
                                    )}
                                    {endpoint.response && (
                                      <div>
                                        <span className="text-[10px] text-gray-500/50">Réponse:</span>
                                        <code className="text-[10px] text-gray-400/60 ml-1">{endpoint.response}</code>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}