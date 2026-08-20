// src/components/profile/PublicProfileClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ContactSection from './ContactSection';
import SocialSection from './SocialSection';
import EventsSection from './EventsSection';

import {
  Heart, Phone, Mail, MessageCircle, MapPin,
  Instagram, Globe, Download, ExternalLink, Crown,
  CheckCircle, ArrowUp, ChevronDown, Send, Link as LinkIcon,
  Cake, Tag, Briefcase, Calendar, Github, Linkedin, FileText, Share as ShareIcon,
  X, MoreVertical,
  PhoneCall,
  ArrowUpRight,
  Share2,
  User,
  Users,
  CreditCard,
  BarChart3,
  UserPlus,
  GraduationCap,
  MoreHorizontal,
  PenTool,
  Search,
  Star,
  Youtube
} from 'lucide-react';
import { SiTiktok } from "react-icons/si";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlacialLikeButton from './GlacialLikeButton';
import ScanTracker from './ScanTracker';
import QRModal from './QRModal';
import { Card } from '@/components/ui/card';
import ContactModal from './ContactModal';
import PortfolioSection from './PortfolioSection';
import CertificatesSection from './CertificatesSection';
import ProfileModal from './ProfileModal';
import { Folder, Award } from 'lucide-react';
import ActionItem from './ActionItem';
import FloatingButtons from './ProfileActions';
import ContactForm from './ContactForm';
import { createClient } from '../../lib/supabase/client';
import FollowersList from './FollowersList';
import { PublicProfile } from '../../types/profile';
import FollowersModal from '../dashboard/FollowersModal';
import ProfileCard3D from '@/components/cards/ProfileCard3D';

// 🔹 Types
type Profile = {
  badges: any;
  created_at: any;
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio_short: string | null;
  bio_long: string | null;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  likes_count?: number;
  nfc_cards?: { status: string }[];
  tiktok: string | null;
  linkedin: string | null;
  snapchat: string | null;
  telegram: string | null;
  github: string | null;
  discord: string | null;
  reddit: string | null;
  pinterest: string | null;
  threads: string | null;
  calendly: string | null;
  portfolio_url: string | null;
  cv_url: string | null;
  custom_link_url: string | null;
  nickname: string | null;
  pronouns: string | null;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  city: string | null;
  country: string | null;
  timezone: string | null;
  availability: 'available' | 'unavailable' | 'by_appointment' | null;
  skills: string[] | null;
  professional_status: 'student' | 'employed' | 'freelance' | 'open_to_work' | 'other' | null;
  website: string | null;
  address: string | null;
  theme: { primary: string; background: string };
  is_public: boolean;
  plan: string;
  accepts_contact_requests: boolean;
  hide_birth_year: boolean;
  disable_birthday_icon: boolean;
  verified: boolean;
  sections_visibility?: Record<string, boolean>;
  events?: boolean;
  business?: boolean;
  articles?: boolean;
  youtube: string | null;
};

type CardConfig = {
  id: string;
  profile_id: string;
  scan_type: string; // Plus flexible
  enabled: boolean;
  priority?: number;
  created_at: string;
  updated_at: string;
};

type Props = {
  profile: Profile;
  cardConfigs?: CardConfig[]; // ← Optionnel
  followers: number;
  following: number;
  isOwner: boolean;
  isInitiallyFollowing: boolean;
  currentUserId: string | null;
  onFollowChange?: (newCount: number, isNowFollowing: boolean) => void;
  scansCount?: number;
  lastUpdate?: Date;
};

const isSectionEnabled = (section: string, configs?: CardConfig[]): boolean => {
  if (!Array.isArray(configs) || configs.length === 0) return false;
  return configs.some(cfg => cfg.scan_type === section && cfg.enabled);
};

// 🔹 Composant SocialCard - SÉCURISÉ pour Tailwind (pas de classes dynamiques)
const SocialCard: React.FC<{
  platform: 'instagram' | 'linkedin' | 'github' | 'pinterest' | 'tiktok' | 'snapchat' | 'telegram' | 'discord' | 'threads' | 'youtube' | 'reddit';
  label: string;
  handle: string;
  href: string;
  gradient?: string;
  icon: React.ReactNode;
}> = ({ platform, label, handle, href, icon }) => {
  // Mapping sécurisé des styles par plateforme (évite les classes dynamiques)
  const platformStyles = {
    instagram: { 
      bg: 'from-pink-500 to-rose-500', 
      border: 'border-pink-500/20', 
      hover: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
      text: 'text-pink-400'
    },
    linkedin: { 
      bg: 'from-blue-600 to-cyan-500', 
      border: 'border-blue-500/20', 
      hover: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
      text: 'text-blue-400'
    },
    github: { 
      bg: 'from-gray-700 to-gray-500', 
      border: 'border-gray-500/20', 
      hover: 'hover:border-gray-500/40 hover:shadow-gray-500/10',
      text: 'text-gray-400'
    },
    tiktok: { 
      bg: 'from-black to-gray-800', 
      border: 'border-gray-700/20', 
      hover: 'hover:border-gray-700/40 hover:shadow-gray-700/10',
      text: 'text-white'
    },
    snapchat: { 
      bg: 'from-yellow-400 to-amber-400', 
      border: 'border-yellow-400/20', 
      hover: 'hover:border-yellow-400/40 hover:shadow-yellow-400/10',
      text: 'text-yellow-400'
    },
    telegram: { 
      bg: 'from-blue-400 to-cyan-400', 
      border: 'border-blue-400/20', 
      hover: 'hover:border-blue-400/40 hover:shadow-blue-400/10',
      text: 'text-blue-400'
    },
    pinterest: { 
      bg: 'from-red-600 to-rose-600', 
      border: 'border-red-500/20', 
      hover: 'hover:border-red-500/40 hover:shadow-red-500/10',
      text: 'text-red-400'
    },
    discord: { 
      bg: 'from-indigo-500 to-blue-600', 
      border: 'border-indigo-500/20', 
      hover: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10',
      text: 'text-indigo-400'
    },
    reddit: { 
      bg: 'from-orange-500 to-red-500', 
      border: 'border-orange-500/20', 
      hover: 'hover:border-orange-500/40 hover:shadow-orange-500/10',
      text: 'text-orange-400'
    },
    youtube: {
    bg: 'from-red-600 to-rose-600',
    border: 'border-red-500/20',
    hover: 'hover:border-red-500/40 hover:shadow-red-500/10',
    text: 'text-red-400',
  },
  threads: {
    bg: 'from-neutral-800 to-neutral-700',
    border: 'border-neutral-600/20',
    hover: 'hover:border-neutral-600/40 hover:shadow-neutral-600/10',
    text: 'text-neutral-400',
  },
  };

  const styles = platformStyles[platform];


  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`block bg-gradient-to-br from-${styles.bg.split(' ')[0].replace('from-', '')}/30 to-${styles.bg.split(' ')[1].replace('to-', '')}/20 ${styles.border} rounded-2xl p-5 cursor-pointer transition-all duration-300 ${styles.hover}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${styles.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <ExternalLink className={`w-4 h-4 ${styles.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
        <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
          {label}
          <ArrowUpRight className={`w-3 h-3 ${styles.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </h3>
        <p className="text-xs text-gray-300 group-hover:text-white transition-colors line-clamp-1">
          {handle}
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}/70`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}/50`}></div>
        </div>
      </a>
    </motion.div>
  );
};

// 🔹 BioToggle (inchangé)
const BioToggle = ({ bio }: { bio: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLParagraphElement>(null);
  const truncatedRef = useRef<HTMLParagraphElement>(null);
  const words = bio.split(' ');
  const truncated = words.length > 30
    ? words.slice(0, 30).join(' ') + '…'
    : bio;

  useEffect(() => {
    if (!contentRef.current || !truncatedRef.current) return;
    const fullHeight = contentRef.current.scrollHeight;
    const truncHeight = truncatedRef.current.scrollHeight;
    if (expanded) {
      setHeight(truncHeight);
      requestAnimationFrame(() => setHeight('auto'));
    } else {
      setHeight(fullHeight);
      requestAnimationFrame(() => setHeight(truncHeight));
    }
  }, [expanded, bio]);
  
  return (
    <div className="relative">
      <p ref={contentRef} className="absolute opacity-0 pointer-events-none whitespace-pre-line">
        {bio}
      </p>
      <motion.p
        initial={false}
        animate={{ height }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-gray-300 text-sm leading-relaxed overflow-hidden"
      >
        <span ref={truncatedRef} className="inline-block transition-opacity duration-300">
          {expanded ? bio : truncated}
        </span>
      </motion.p>
      {words.length > 30 && (
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1.5 group"
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
        >
          {expanded ? (
            <>
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              Voir plus
            </>
          )}
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
        </motion.button>
      )}
    </div>
  );
};

const isBirthdayToday = (localProfile: Profile) => {
  if (!localProfile.birth_day || !localProfile.birth_month || localProfile.disable_birthday_icon) return false;
  const today = new Date();
  return today.getDate() === localProfile.birth_day && today.getMonth() + 1 === localProfile.birth_month;
};

const getMonthName = (month: number): string => {
  const months = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  return months[month - 1] || '';
};


export default function PublicProfileClient({
  profile,
  cardConfigs = [], // ← Valeur par défaut SÉCURISÉE
  followers: initialFollowers = 0,
  following: initialFollowing = 0,
  isOwner = false,
  isInitiallyFollowing = false,
  currentUserId = null,
  onFollowChange,
  lastUpdate,
}: Props) {
  const router = useRouter();
  const [showQRModal, setShowQRModal] = useState(false);
  const [hasLostCard, setHasLostCard] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [scansCount, setScansCount] = useState(0);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowers);
  const [localProfile, setLocalProfile] = useState<Profile>(profile);
  const [localCardConfigs, setLocalCardConfigs] = useState<CardConfig[]>(cardConfigs);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showCard3D, setShowCard3D] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showAvatarFullscreen, setShowAvatarFullscreen] = useState(false);

  const showBirthday = 
  isSectionEnabled('profile', localCardConfigs) && 
  !localProfile.disable_birthday_icon;

const showAvailability = 
  isSectionEnabled('profile', localCardConfigs);
// 🔹 CORRECTION CRITIQUE : Supprimez sections_visibility_extended (n'existe PAS dans PublicProfile)
const profileWithVisibility: PublicProfile = {
  ...localProfile,
  sections_visibility: {
    contact: isSectionEnabled('contact', localCardConfigs),
    social: isSectionEnabled('social', localCardConfigs),
    links: isSectionEnabled('link', localCardConfigs)
        || isSectionEnabled('custom', localCardConfigs)
        || isSectionEnabled('cv', localCardConfigs),
    portfolio: isSectionEnabled('portfolio', localCardConfigs)
        || isSectionEnabled('cv', localCardConfigs),
    certificates: isSectionEnabled('certificates', localCardConfigs)
        || isSectionEnabled('cv', localCardConfigs),
    bio: isSectionEnabled('profile', localCardConfigs),
    identity: isSectionEnabled('profile', localCardConfigs),
    professional: isSectionEnabled('profile', localCardConfigs)
        || isSectionEnabled('cv', localCardConfigs),
    location: isSectionEnabled('profile', localCardConfigs),
    skills: isSectionEnabled('skills', localCardConfigs)
        || isSectionEnabled('cv', localCardConfigs),
  }
};
  // 🔹 Applique le thème dynamiquement
  useEffect(() => {
    const root = document.documentElement;
    const { primary = '#2563eb', background = '#0f172a' } = localProfile.theme || {};
    root.style.setProperty('--profile-primary', primary);
    root.style.setProperty('--profile-background', background);
  }, [localProfile.theme]);

  useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
    setFollowersCount(initialFollowers);
  }, [isInitiallyFollowing, initialFollowers]);

  const handleFollowToggle = async () => {
    if (!currentUserId) return router.push('/auth/sign-in');
    const supabase = createClient();
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('followed_id', localProfile.id);
      onFollowChange?.(followersCount - 1, false);
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, followed_id: localProfile.id });
      onFollowChange?.(followersCount + 1, true);
    }
    setIsFollowing(!isFollowing);
    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      const res = await fetch(`/api/portfolio?profile_id=${localProfile.id}`);
      const { portfolios, certificates } = await res.json();
      setPortfolios(portfolios);
      setCertificates(certificates);
    };
    fetchPortfolio();
  }, [localProfile.id]);

  useEffect(() => {
    fetch(`/api/analytics?profile_id=${localProfile.id}&range=all`)
      .then(res => res.json())
      .then(data => setScansCount(data.total || 0))
      .catch(console.warn);
  }, [localProfile.id]);

  useEffect(() => {
    const activeOrLostCards = (localProfile.nfc_cards || []).filter(
      card => card.status === 'active' || card.status === 'lost'
    );
    setHasLostCard(activeOrLostCards.some(card => card.status === 'lost'));
    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: localProfile.id, scan_type: 'qr_profile' }),
    }).catch(console.warn);
  }, [localProfile.id]);

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app')
    .replace(/\s+$/, '')
    .replace(/\/+$/, '');
  const profileUrl = `${baseUrl}/${profile.username}`;
  const shortId = localProfile.id.substring(0, 6).replace(/[+/]/g, 'x').toLowerCase();
  const shortUrl = `https://luvika.me/u/${shortId}`;

  const cleanCoverUrl = (localProfile.cover_url || '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const coverUrl = cleanCoverUrl && cleanCoverUrl !== 'null' && cleanCoverUrl !== ''
    ? cleanCoverUrl.startsWith('http')
      ? cleanCoverUrl
      : `${baseUrl}/${cleanCoverUrl.replace(/^\/+/, '')}`
    : '/default.png';

  const [bubbles, setBubbles] = useState<Array<{id: number, w: number, h: number, l: number, t: number}>>([]);
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
  const generated = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    w: 6 + Math.random() * 20,
    h: 6 + Math.random() * 20,
    l: Math.random() * 100,
    t: Math.random() * 100,
  }));
  setBubbles(generated);
}, []);

  // 🔑 CORRECTION CRITIQUE : Synchronisation PROP → STATE
useEffect(() => {
  if (Array.isArray(cardConfigs)) {
    setLocalCardConfigs(cardConfigs);
    console.log('🔄 cardConfigs synchronisés:', cardConfigs.length, 'configs');
  }
}, [cardConfigs]); // Déclenche à chaque mise à jour Realtime du wrapper

{/* 🔹 INDICATEUR DE DEBUG (optionnel) */}
{process.env.NODE_ENV === 'development' && (
  <div className="fixed bottom-4 left-4 bg-black/80 text-cyan-300 px-3 py-1.5 rounded text-xs z-50">
    <div>Configs: {localCardConfigs.length}</div>
    <div>Enabled: {localCardConfigs.filter(c => c.enabled).length}</div>
    <div>Profile section: {isSectionEnabled('profile', localCardConfigs) ? '✅' : '❌'}</div>
  </div>
)}


  // 🔹 Composant réutilisable pour les cartes de statistiques
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  gradient: string;
  borderColor: string;
  hoverColor: string;
  pulse?: boolean;
  pulseColor?: string;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  gradient, 
  borderColor, 
  hoverColor,
  pulse = false,
  pulseColor = "rgba(16,185,129,0.35)",
  children 
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`group bg-gradient-to-br ${gradient} ${borderColor} rounded-2xl p-5 transition-all duration-300 ${hoverColor} relative overflow-hidden`}
  >
    {/* Pulse effect */}
    {pulse && (
      <motion.div
        animate={{
          boxShadow: [
            `0 0 0 0 ${pulseColor}`,
            `0 0 0 8px ${pulseColor}00`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
      />
    )}

    <div className="flex flex-col items-center text-center">
      {/* Icon container */}
      <div className="mb-3 relative">
        {icon}
      </div>

      {/* Label */}
      <span className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-1">
        {label}
      </span>

      {/* Value */}
      <span className="text-2xl font-bold text-white">
        {value}
      </span>

      {/* Children (optionnel - pour le bouton Like) */}
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  </motion.div>
);
interface IdentityBadgeProps {
  icon: React.ReactNode;
  label: string;
  gradient: string;
  borderColor: string;
  textColor: string;
}

const IdentityBadge: React.FC<IdentityBadgeProps> = ({ 
  icon, 
  label, 
  gradient, 
  borderColor, 
  textColor 
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`group flex items-center gap-1.5 px-3 py-1.5 ${gradient} ${borderColor} rounded-full border transition-all duration-300 hover:${borderColor.replace('20', '40')} backdrop-blur-sm`}
  >
    {icon}
    <span className={`font-medium ${textColor} group-hover:brightness-110 transition-all`}>
      {label}
    </span>
  </motion.div>
);
// 🔹 Composant ProfessionalStatusBadge CORRIGÉ (sans erreur de type)
interface ProfessionalStatusBadgeProps {
  status: string;
}

// ✅ Configuration définie SÉPARÉMENT (pas d'auto-référence)
const STATUS_CONFIG = {
  student: {
    icon: <GraduationCap className="w-4 h-4 text-amber-400" />,
    label: 'Étudiant',
    gradient: 'from-amber-500/15 to-orange-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-300',
    hover: 'hover:border-amber-500/40'
  },
  employed: {
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    label: 'En poste',
    gradient: 'from-emerald-500/15 to-green-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-300',
    hover: 'hover:border-emerald-500/40'
  },
  freelance: {
    icon: <PenTool className="w-4 h-4 text-cyan-400" />,
    label: 'Freelance',
    gradient: 'from-cyan-500/15 to-teal-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-300',
    hover: 'hover:border-cyan-500/40'
  },
  open_to_work: {
    icon: <Search className="w-4 h-4 text-rose-400" />,
    label: 'Ouvert à des opportunités',
    gradient: 'from-rose-500/15 to-pink-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-300',
    hover: 'hover:border-rose-500/40'
  },
  other: {
    icon: <MoreHorizontal className="w-4 h-4 text-gray-400" />,
    label: 'Autre',
    gradient: 'from-gray-500/15 to-gray-600/10',
    border: 'border-gray-500/20',
    text: 'text-gray-300',
    hover: 'hover:border-gray-500/40'
  }
} as const; // ✅ 'as const' pour inférer les types littéraux

const ProfessionalStatusBadge: React.FC<ProfessionalStatusBadgeProps> = ({ status }) => {
  // ✅ Récupération SÉCURISÉE avec fallback
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.other;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`group flex items-center gap-1.5 px-3 py-1.5 ${config.gradient} ${config.border} ${config.hover} rounded-full border transition-all duration-300 backdrop-blur-sm`}
    >
      {config.icon}
      <span className={`font-medium ${config.text} group-hover:brightness-110 transition-all`}>
        {config.label}
      </span>
    </motion.div>
  );
};

// 🔹 Composant réutilisable pour les cartes d'information
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  borderColor: string;
  hoverColor: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  icon, 
  label, 
  value, 
  gradient, 
  borderColor, 
  hoverColor 
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`group bg-gradient-to-br ${gradient} ${borderColor} rounded-xl p-4 transition-all duration-300 ${hoverColor}`}
  >
    <div className="flex items-start gap-3">
      <div className="mt-1 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white font-semibold mt-1 break-words">{value}</p>
      </div>
    </div>
  </motion.div>
);
 // 🔹 Helper pour extraire le domaine d'une URL
const tryGetDomain = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    // Si l'URL n'est pas valide, retourne une version nettoyée
    return url
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace('www.', '');
  }
};

// 🔹 Nettoie le handle pour l'affichage (supprime protocole, domaine, etc.)
const cleanSocialHandle = (input: string, platformDomain: string): string => {
  return input
    .trim()
    .replace(/^https?:\/\//, '')          // Supprime http:// ou https://
    .replace(/^www\./, '')                // Supprime www.
    .replace(new RegExp(`^${platformDomain.replace('.', '\\.')}/?`, 'i'), '') // Supprime domaine de la plateforme
    .replace(/^\/+|\/+$/g, '')            // Supprime slashes initiaux/finaux
    .substring(0, 30)                     // Tronque à 30 caractères
    .replace(/\/.*/, '');                 // Garde uniquement le username (supprime /projets/etc)
};

// 🔹 Garantit une URL absolue valide
const ensureAbsoluteUrl = (input: string, baseUrl: string): string => {
  const trimmed = input.trim();
  // Si déjà une URL absolue, retourne telle quelle
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Sinon, construit l'URL complète
  const cleanPath = trimmed.replace(/^\/+/, ''); // Supprime slashes initiaux
  return `${baseUrl}${cleanPath}`;
};

// 🔹 Détection des sections à afficher
const showContactSection = isSectionEnabled('contact', localCardConfigs) && (
  localProfile.email?.trim() ||
  localProfile.phone?.trim() ||
  localProfile.whatsapp?.trim() ||
  localProfile.address?.trim() ||
  localProfile.website?.trim()
);

const showSkillsSection = 
  // Option CV : affiche la section (quel que soit le contenu)
  isSectionEnabled('cv', localCardConfigs) ||
  // Sinon, affiche la section si une sous-option est activée ET qu'il y a du contenu
  ((isSectionEnabled('portfolio', localCardConfigs) && (portfolios?.length || 0) > 0) ||
   (isSectionEnabled('certificates', localCardConfigs) && (certificates?.length || 0) > 0) ||
   (isSectionEnabled('skills', localCardConfigs) && (localProfile.skills?.length || 0) > 0));

const showCustomLinkSection = isSectionEnabled('custom', localCardConfigs) && localProfile.custom_link_url?.trim();

const showSocialSection = isSectionEnabled('social', localCardConfigs) && (
  localProfile.instagram?.trim() ||
  localProfile.linkedin?.trim() ||
  localProfile.github?.trim() ||
  localProfile.tiktok?.trim() ||
  localProfile.snapchat?.trim() ||
  localProfile.telegram?.trim() ||
  localProfile.pinterest?.trim() ||
  localProfile.discord?.trim() ||
  localProfile.reddit?.trim() ||
  localProfile.threads?.trim() ||
  localProfile.youtube?.trim()
);

const showLinksSection = 
  (isSectionEnabled('link', localCardConfigs) || 
   isSectionEnabled('cv', localCardConfigs)) &&
  (
    // vCard est toujours disponible si la section est activée
    true || 
    localProfile.cv_url?.trim() ||
    localProfile.calendly?.trim() ||
    localProfile.portfolio_url?.trim()
  );



  return (
    <div className="relative min-h-screen dynamic-bg">
      {/* Styles dynamiques */}
      <style jsx global>{`
        :root {
          --profile-primary: #2563eb;
          --profile-background: ;
        }
        .dynamic-bg {
          background-color: transparent !important;
        }
        .dynamic-border {
          border-color: var(--profile-primary) !important;
        }
        .dynamic-text {
          color: var(--profile-primary) !important;
        }
        .dynamic-gradient {
          background: linear-gradient(90deg, var(--profile-primary), #0ea5e9) !important;
        }
        .dynamic-button {
          background-color: var(--profile-primary) !important;
          border-color: var(--profile-primary) !important;
        }
        .dynamic-button:hover {
          opacity: 0.9;
        }
        .dynamic-badge {
          background-color: var(--profile-primary) !important;
          color: white !important;
        }
      `}</style>

      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-indigo-900/5"></div>
        {isClient && (
  <div className="absolute inset-0 overflow-hidden">
    {bubbles.map(bubble => (
      <motion.div
        key={bubble.id}
        className="absolute rounded-full bg-white/5"
        style={{
          width: `${bubble.w}px`,
          height: `${bubble.h}px`,
          left: `${bubble.l}%`,
          top: `${bubble.t}%`,
        }}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.sin(bubble.id) * 30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + bubble.id * 0.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: bubble.id * 0.2,
              }}
            />
          ))}
        </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
<motion.header
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  className="relative mb-8"
>
  {/* 🔹 Bannière de couverture */}
  {localProfile.cover_url && (
<div className="absolute inset-x-0 top-0 h-48 md:h-68 overflow-hidden rounded-t-2xl">
      <img
        src={localProfile.cover_url}
        alt="Bannière de profil"
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-blue-900/40 to-transparent"></div>
    </div>
  )}

  {/* 🔹 CONTENEUR PRINCIPAL - Optimisé mobile */}
  <div className="pt-40 md:pt-48 px-4 md:px-0">
    {/* 🔹 CONTENEUR FLEX : Avatar + Texte sur même ligne (mobile) / Colonne (desktop) */}
    <div className="flex flex-row items-start md:flex-col md:items-center">
      {/* 🔹 AVATAR CONTAINER - Fixe sur mobile, centré sur desktop */}
      <div className="relative flex-shrink-0">
        {localProfile.avatar_url ? (
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              src={localProfile.avatar_url}
              alt={`${localProfile.full_name} - Photo de profil`}
              onClick={() => setShowAvatarFullscreen(true)}
              className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-white/30 shadow-xl cursor-pointer hover:opacity-80 transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-2xl md:text-3xl font-bold text-white border-4 border-white/30 shadow-xl cursor-pointer hover:opacity-80 transition-all duration-300"
            onClick={() => setShowAvatarFullscreen(true)}
          >
            {localProfile.full_name?.charAt(0).toUpperCase() || '?'}
          </motion.div>
        )}

        {/* 🔹 BADGE PLAN - Positionné RELATIVEMENT à l'avatar */}
        {localProfile.plan && localProfile.plan !== 'basic' && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute -top-1.5 -right-1.5 z-10"
          >
            <Badge className={`px-1.5 py-0.5 text-[10px] md:text-xs font-medium rounded-full border border-white/20 shadow ${
  localProfile.plan === 'premium'
    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
    : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
}`}>
  {localProfile.plan === 'premium' ? (
    <>
      <Crown className="w-3 h-3 mr-0.5" />
      Premium
    </>
  ) : (
    <>
      <Briefcase className="w-3 h-3 mr-0.5" />
      Business
    </>
  )}
</Badge>

          </motion.div>
        )}
      </div>
{/* 🔹 Badge Pionnier LUVIKA - Version élégante */}
{localProfile.badges?.includes('pioneer') && (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
    className="absolute -bottom-2 -right-2"
  >
    <div className="relative group">
      {/* Anneau lumineux */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-600/80 to-orange-600/80 backdrop-blur-sm border border-amber-400/40 shadow-lg">
        {/* Étoile animée */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Star className="w-3 h-3 text-white fill-amber-300" />
        </motion.div>
        
        <span className="text-xs font-bold text-white tracking-wide">PIONNIER</span>
        
        {/* Petit point lumineux */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-amber-300"
        />
      </div>
    </div>
  </motion.div>
)}
      {/* 🔹 TEXTE : Username + Full Name - À droite de l'avatar sur mobile */}
      <motion.div 
  className="ml-3 mt-8 md:ml-0 md:mt-4 text-left md:text-center flex-1 min-w-0"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
>

        {/* 🔹 USERNAME - Sur même ligne que l'avatar */}
        <p className="text-cyan-300 md:justify-center font-mono text-sm flex items-center gap-1.5 flex-wrap">
          @{localProfile.username}
          {localProfile.verified && (
            <img
              src="/badge.png"
              alt="✅ Vérifié"
              className="w-4 h-4 rounded-full flex-shrink-0"
              title="Profil vérifié"
            />
          )}
        </p>
        
        {/* 🔹 FULL NAME - En dessous du username, aligné à gauche */}
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mt-0.5 flex flex-wrap items-center gap-1.5">
          {localProfile.full_name}
          {isBirthdayToday(localProfile) && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              title="Joyeux anniversaire ! 🎉"
              className="flex-shrink-0"
            >
              <Cake className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
            </motion.div>
          )}
        </h1>
      </motion.div>
    </div>
  </div>
</motion.header>

{/* 🔹 IDENTITÉ & PROFESSIONNEL - Design premium en badges thématiques */}
{isSectionEnabled('profile', localCardConfigs) && (
<div className="-mt-6 md:mt-4 max-w-4xl mx-auto px-4">
    <div className="flex flex-wrap justify-center items-center gap-2.5 md:gap-3">
    

      {/* 💼 Job Title & Company - Badge premium */}
      {(localProfile.job_title || localProfile.company) && (
        <IdentityBadge
          icon={<Briefcase className="w-4 h-4 text-blue-400" />}
          label={
            localProfile.job_title && localProfile.company
              ? `${localProfile.job_title} · ${localProfile.company}`
              : localProfile.job_title || localProfile.company || ''
          }
          gradient="from-blue-500/15 to-indigo-500/10"
          borderColor="border-blue-500/20"
          textColor="text-blue-300"
        />
      )}

      {/* 🎯 Professional Status - Badge premium avec icône contextuelle */}
      {localProfile.professional_status && (
        <ProfessionalStatusBadge status={localProfile.professional_status} />
      )}
  </div>
  </div>
)}

{/* 🔹 SECTION STATS - Icônes avec compteurs au survol ET au clic */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
  className="w-full px-4 mt-6"
>
  <div className="max-w-xl mx-auto">
    
    {/* Ligne décorative subtile */}
    <div className="mb-5 flex justify-center">
      <div className="w-10 h-0.5 bg-gradient-to-r from-cyan-400/50 to-blue-500/50 rounded-full" />
    </div>

    {/* Barre d'icônes centrée */}
    <div className="flex items-center justify-center gap-1">
      
      {/* ❤️ Likes - survol=compteur, clic=like */}
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="group relative"
      >
        <div className="p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
          <GlacialLikeButton profileId={localProfile.id} initialLikes={localProfile.likes_count || 0} hideCount />
        </div>
        {/* Tooltip compteur */}
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-white/[0.08] rounded-lg px-2.5 py-1 shadow-xl">
            <p className="text-[11px] font-semibold text-white whitespace-nowrap">
              ❤️ {localProfile.likes_count || 0} J'aime
            </p>
          </div>
        </div>
      </motion.div>

      {/* Séparateur */}
      <span className="w-px h-5 bg-white/[0.06] mx-2" />

      {/* 👥 Followers - survol=compteur, clic=modal */}
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="group relative"
      >
        <button
          onClick={() => setShowFollowersModal(true)}
          className="p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
          aria-label="Voir les abonnés"
        >
          <Users className="w-5 h-5 text-cyan-400" />
        </button>
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-white/[0.08] rounded-lg px-2.5 py-1 shadow-xl">
            <p className="text-[11px] font-semibold text-white whitespace-nowrap">
              👥 {followersCount} Abonnés
            </p>
          </div>
        </div>
      </motion.div>

      {/* Séparateur */}
      <span className="w-px h-5 bg-white/[0.06] mx-2" />

      {/* 📱 Abonnements - survol=compteur, clic=modal */}
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="group relative"
      >
        <button
          onClick={() => setShowFollowingModal(true)}
          className="p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
          aria-label="Voir les abonnements"
        >
          <UserPlus className="w-5 h-5 text-purple-400" />
        </button>
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-white/[0.08] rounded-lg px-2.5 py-1 shadow-xl">
            <p className="text-[11px] font-semibold text-white whitespace-nowrap">
              📱 {initialFollowing} Suivi(e)s
            </p>
          </div>
        </div>
      </motion.div>

           {/* Séparateur */}
      <span className="w-px h-5 bg-white/[0.06] mx-2" />

      {/* 🪪 Carte NFC - Visible uniquement par le propriétaire */}
      {isOwner && (
        <>
          {(() => {
            const nfcCards = localProfile.nfc_cards || [];
            const getStatus = () => {
              if (!nfcCards.length) return { label: 'Aucune', dot: 'bg-gray-400', icon: 'text-gray-400', color: 'gray' };
              if (nfcCards.some(c => c.status === 'blocked')) return { label: 'Bloquée', dot: 'bg-red-400', icon: 'text-red-400', color: 'red' };
              if (nfcCards.some(c => c.status === 'reported')) return { label: 'Signalée', dot: 'bg-orange-400', icon: 'text-orange-400', color: 'orange' };
              if (nfcCards.some(c => c.status === 'lost')) return { label: 'Perdue', dot: 'bg-amber-400', icon: 'text-amber-400', color: 'amber' };
              if (nfcCards.some(c => c.status === 'active')) return { label: 'Active', dot: 'bg-emerald-400 animate-pulse', icon: 'text-emerald-400', color: 'emerald' };
              return { label: 'Inactive', dot: 'bg-gray-400', icon: 'text-gray-400', color: 'gray' };
            };
            const s = getStatus();

            return (
              <motion.div
                whileHover={{ scale: 1 }}
                className="group relative"
              >
                <button
                  onClick={() => setShowCard3D(!showCard3D)}
                  className="p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-1.5"
                  aria-label="Voir la carte NFC"
                >
                  <CreditCard className={`w-5 h-5 ${s.icon}`} />
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
                </button>

                <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20">
                  <div className="bg-slate-800/95 backdrop-blur-sm border border-white/[0.08] rounded-lg px-2.5 py-1 shadow-xl">
                    <p className="text-[11px] font-semibold text-white whitespace-nowrap">
                      🪪 NFC · {s.label}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {showCard3D && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-30"
                    >
                      <div className="w-[300px]">
                        <ProfileCard3D onTap={() => setShowCard3D(false)} />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowCard3D(false); }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30">
                  <div className="w-[300px]">
                    <ProfileCard3D onTap={() => {}} />
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </>
      )}
 {/* 🔹 BOUTON S'ABONNER - Visible pour les visiteurs connectés (non propriétaires) */}
      {!isOwner && currentUserId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center w-full mt-2"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFollowToggle}
            className={`
              group relative overflow-hidden
              px-5 py-2 rounded-full
              font-medium text-sm
              transition-all duration-300
              ${isFollowing 
                ? 'bg-white/[0.06] border border-white/[0.12] text-gray-300 hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/25' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35'
              }
            `}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {isFollowing ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Abonné
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  S'abonner
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      )}

    </div>

    {/* Indicateur temps réel */}
    <div className="mt-5 flex justify-center">
      <div className="inline-flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="text-[10px] text-gray-500/40 font-light">En direct</span>
      </div>
    </div>

  </div>
</motion.div>

{/* 🔹 MODALS pour Followers et Following */}
<AnimatePresence>
  {showFollowersModal && (
    <FollowersModal
      key="modal-followers"
      isOpen={showFollowersModal}
      onClose={() => setShowFollowersModal(false)}
      profileId={localProfile.id}
      totalFollowers={followersCount}
    />
  )}
  {showFollowingModal && (
    <FollowersModal
      key="modal-following"
      isOpen={showFollowingModal}
      onClose={() => setShowFollowingModal(false)}
      profileId={localProfile.id}
      totalFollowers={initialFollowing}
    />
  )}
</AnimatePresence>

    {/* 🔹 BIO - Design premium avec citation et animation subtile */}
{isSectionEnabled('profile', localCardConfigs) && localProfile.bio_short && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 }}
    className="relative max-w-3xl mx-auto mt-8 px-4 md:px-0"
  >
    <div className="relative bg-gradient-to-br from-cyan-900/10 to-blue-900/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
      {/* Décoration citation */}
      <div className="absolute -top-4 -left-4 w-16 h-16 opacity-20">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.72 11.05c-.38-.23-.77-.44-1.19-.64-.42-.2-.87-.38-1.35-.53-.48-.15-.99-.26-1.54-.34-.55-.08-1.13-.12-1.74-.12-.83 0-1.54.14-2.14.42-.6.28-1.08.66-1.44 1.14-.36.48-.54 1.04-.54 1.68 0 .56.15 1.06.45 1.5.3.44.71.81 1.23 1.11.52.3 1.12.53 1.8.69.68.16 1.41.24 2.19.24.36 0 .71-.02 1.05-.06.34-.04.66-.09.96-.15.3-.06.58-.14.84-.24.26-.1.48-.22.66-.36l.63-.49c.12-.09.25-.16.39-.21.14-.05.28-.08.42-.09.14-.01.28.01.42.06.14.05.26.13.36.24l1.17 1.38c.08.1.14.21.18.33.04.12.06.25.06.39 0 .14-.02.27-.06.39-.04.12-.1.23-.18.33l-1.5 1.77c-.24.28-.56.5-1 .66-.44.16-1 .24-1.68.24-.68 0-1.28-.11-1.8-.33-.52-.22-.96-.52-1.32-.9-.36-.38-.63-.82-.81-1.32-.18-.5-.27-1.03-.27-1.59 0-.72.18-1.37.54-1.95.36-.58.86-1.06 1.5-1.44.64-.38 1.39-.66 2.25-.84.86-.18 1.78-.27 2.76-.27.6 0 1.17.05 1.71.15.54.1 1.04.24 1.5.42.46.18.86.4 1.2.66.34.26.6.56.78.9.18.34.27.71.27 1.11 0 .24-.04.47-.12.69-.08.22-.2.42-.36.6-.16.18-.36.32-.6.42-.24.1-.52.15-.84.15-.24 0-.46-.04-.66-.12-.2-.08-.38-.18-.54-.3-.16-.12-.28-.26-.36-.42-.08-.16-.12-.34-.12-.54 0-.16.03-.31.09-.45.06-.14.14-.26.24-.36.1-.1.22-.18.36-.24.14-.06.29-.09.45-.09.12 0 .23.02.33.06.1.04.19.1.27.18l.48.48z" />
          <path d="M21.72 11.05c-.38-.23-.77-.44-1.19-.64-.42-.2-.87-.38-1.35-.53-.48-.15-.99-.26-1.54-.34-.55-.08-1.13-.12-1.74-.12-.83 0-1.54.14-2.14.42-.6.28-1.08.66-1.44 1.14-.36.48-.54 1.04-.54 1.68 0 .56.15 1.06.45 1.5.3.44.71.81 1.23 1.11.52.3 1.12.53 1.8.69.68.16 1.41.24 2.19.24.36 0 .71-.02 1.05-.06.34-.04.66-.09.96-.15.3-.06.58-.14.84-.24.26-.1.48-.22.66-.36l.63-.49c.12-.09.25-.16.39-.21.14-.05.28-.08.42-.09.14-.01.28.01.42.06.14.05.26.13.36.24l1.17 1.38c.08.1.14.21.18.33.04.12.06.25.06.39 0 .14-.02.27-.06.39-.04.12-.1.23-.18.33l-1.5 1.77c-.24.28-.56.5-1 .66-.44.16-1 .24-1.68.24-.68 0-1.28-.11-1.8-.33-.52-.22-.96-.52-1.32-.9-.36-.38-.63-.82-.81-1.32-.18-.5-.27-1.03-.27-1.59 0-.72.18-1.37.54-1.95.36-.58.86-1.06 1.5-1.44.64-.38 1.39-.66 2.25-.84.86-.18 1.78-.27 2.76-.27.6 0 1.17.05 1.71.15.54.1 1.04.24 1.5.42.46.18.86.4 1.2.66.34.26.6.56.78.9.18.34.27.71.27 1.11 0 .24-.04.47-.12.69-.08.22-.2.42-.36.6-.16.18-.36.32-.6.42-.24.1-.52.15-.84.15-.24 0-.46-.04-.66-.12-.2-.08-.38-.18-.54-.3-.16-.12-.28-.26-.36-.42-.08-.16-.12-.34-.12-.54 0-.16.03-.31.09-.45.06-.14.14-.26.24-.36.1-.1.22-.18.36-.24.14-.06.29-.09.45-.09.12 0 .23.02.33.06.1.04.19.1.27.18l.48.48z" />
        </svg>
      </div>
      
      <div className="relative z-10">
        <p className="text-gray-300 text-lg md:text-xl leading-relaxed italic text-center">
          "{localProfile.bio_short}"
        </p>
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  </motion.div>
)}

{/* 🔹 INFOS SUPPLÉMENTAIRES - Design en cartes modernes */}
{isSectionEnabled('profile', localCardConfigs) && (localProfile.birth_day || localProfile.city || localProfile.country || localProfile.availability) && (  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.9 }}
    className="max-w-4xl mx-auto mt-8 px-4 md:px-0"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 🎂 Anniversaire */}
      {localProfile.birth_day && localProfile.birth_month && (
        <InfoCard
          icon={<Cake className="w-5 h-5 text-pink-400" />}
          label="Anniversaire"
          value={`${localProfile.birth_day} ${getMonthName(localProfile.birth_month)}${!localProfile.hide_birth_year && localProfile.birth_year ? ` ${localProfile.birth_year}` : ''}`}
          gradient="from-pink-500/15 to-rose-500/10"
          borderColor="border-pink-500/20"
          hoverColor="hover:border-pink-500/40 hover:shadow-pink-500/10"
        />
      )}

      {/* 📍 Localisation */}
      {(localProfile.city || localProfile.country) && (
        <InfoCard
          icon={<MapPin className="w-5 h-5 text-amber-400" />}
          label="Localisation"
          value={[localProfile.city, localProfile.country].filter(Boolean).join(', ')}
          gradient="from-amber-500/15 to-orange-500/10"
          borderColor="border-amber-500/20"
          hoverColor="hover:border-amber-500/40 hover:shadow-amber-500/10"
        />
      )}

      {/* ✅ Disponibilité */}
      {localProfile.availability && (
        <InfoCard
          icon={
            <CheckCircle className={`w-5 h-5 ${
              localProfile.availability === 'available' ? 'text-emerald-400' :
              localProfile.availability === 'unavailable' ? 'text-red-400' : 'text-cyan-400'
            }`} />
          }
          label="Disponibilité"
          value={
            localProfile.availability === 'available' ? 'Disponible' :
            localProfile.availability === 'unavailable' ? 'Indisponible' : 'Sur RDV'
          }
          gradient={
            localProfile.availability === 'available' ? 'from-emerald-500/15 to-green-500/10' :
            localProfile.availability === 'unavailable' ? 'from-red-500/15 to-rose-500/10' : 'from-cyan-500/15 to-blue-500/10'
          }
          borderColor={
            localProfile.availability === 'available' ? 'border-emerald-500/20' :
            localProfile.availability === 'unavailable' ? 'border-red-500/20' : 'border-cyan-500/20'
          }
          hoverColor={
            localProfile.availability === 'available' ? 'hover:border-emerald-500/40 hover:shadow-emerald-500/10' :
            localProfile.availability === 'unavailable' ? 'hover:border-red-500/40 hover:shadow-red-500/10' : 'hover:border-cyan-500/40 hover:shadow-cyan-500/10'
          }
        />
      )}
    </div>
  </motion.div>
)}
  
  {showContactSection && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1 }}
    className="w-full px-4 mt-8"
  >
    <div className="max-w-4xl mx-auto">
      {/* Titre section */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PhoneCall className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Contact</h2>
        </div>
        <p className="text-sm text-gray-400">
          Connectez-vous avec {localProfile.full_name} via vos canaux préférés
        </p>
      </div>

    {/* 🔹 Grid moderne avec cards */}
<div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 📧 Email */}
      {isSectionEnabled('contact', localCardConfigs) && localProfile.email && (
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <ActionItem
            icon={
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-white" />
              </div>
            }
            label="Email"
            value={localProfile.email}
            href={`mailto:${localProfile.email}`}
            className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            gradient="from-cyan-500 to-blue-500"
          />
        </motion.div>
      )}

      {/* 📞 Téléphone */}
      {isSectionEnabled('contact', localCardConfigs) && localProfile.phone && (
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <ActionItem
            icon={
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-white" />
              </div>
            }
            label="Appeler"
            value={localProfile.phone}
            href={`tel:${localProfile.phone}`}
            className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            gradient="from-green-500 to-emerald-500"
          />
        </motion.div>
      )}

      {/* 💬 WhatsApp */}
      {isSectionEnabled('contact', localCardConfigs) && localProfile.whatsapp && (
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <ActionItem
            icon={
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
            }
            label="WhatsApp"
            value={localProfile.whatsapp}
            href={`https://wa.me/${localProfile.whatsapp.replace(/\D/g, '')}`}
            className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            gradient="from-emerald-500 to-lime-500"
          />
        </motion.div>
      )}

      {/* 📍 Adresse */}
      {isSectionEnabled('contact', localCardConfigs) && localProfile.address && (
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <ActionItem
            icon={
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            }
            label="Carte"
            value={localProfile.address}
            href={`https://maps.google.com/?q=${encodeURIComponent(localProfile.address)}`}
            className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            gradient="from-amber-500 to-orange-500"
          />
        </motion.div>
      )}

      {/* 🌐 Site web */}
      {isSectionEnabled('contact', localCardConfigs) && localProfile.website && (
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <ActionItem
            icon={
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-white" />
              </div>
            }
            label="Site"
            value={localProfile.website.replace(/^https?:\/\//, '')}
            href={localProfile.website}
            className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            gradient="from-blue-500 to-indigo-500"
          />
        </motion.div>
      )}
    </div>

{/* Divider décoratif */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          <span>Informations de contact sécurisées</span>
        </div>
      </div>
    </div>
  </motion.div>
)}
    {/* 🔹 Section Actions Portfolio/Certificats/Compétences/Liens */}
{showSkillsSection && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.7 }}
    className="w-full px-4 mt-10"
  >
    <div className="max-w-5xl mx-auto">
      {/* Titre section */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Mes compétences & réalisations</h2>
        </div>
        <p className="text-sm text-gray-400">
          Découvrez mes projets, certifications et expertises professionnelles
        </p>
      </div>

    {/* Grille responsive moderne */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 📁 Portfolio - CORRIGÉ avec sécurité de type */}
      {(isSectionEnabled('portfolio', localCardConfigs) || isSectionEnabled('cv', localCardConfigs)) && (portfolios?.length || 0) > 0 && (
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <div
            onClick={() => setShowPortfolioModal(true)}
            className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/20">
                {portfolios?.length || 0}
              </Badge>
            </div>
            <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
              Portfolio
              <ArrowUpRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-gray-300 group-hover:text-cyan-300 transition-colors">
              Projets réalisés
            </p>
            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" 
                style={{ width: `${Math.min((portfolios?.length || 0) * 15, 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🏆 Certificats - CORRIGÉ avec sécurité de type */}
      {(isSectionEnabled('certificates', localCardConfigs) || isSectionEnabled('cv', localCardConfigs)) && (certificates?.length || 0) > 0 && (
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <div
            onClick={() => setShowCertificatesModal(true)}
            className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border border-amber-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/20">
                {certificates?.length || 0}
              </Badge>
            </div>
            <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
              Certifications
              <ArrowUpRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-gray-300 group-hover:text-amber-300 transition-colors">
              Diplômes & accréditations
            </p>
            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" 
                style={{ width: `${Math.min((certificates?.length || 0) * 20, 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🏷️ Compétences - CORRIGÉ avec sécurité de type (clé de l'erreur) */}
      {(isSectionEnabled('skills', localCardConfigs) || isSectionEnabled('cv', localCardConfigs)) && (localProfile.skills?.length || 0) > 0 && (
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <div
            onClick={() => setShowSkillsModal(true)}
            className="bg-gradient-to-br from-purple-900/30 to-fuchsia-900/20 border border-purple-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/20">
                {localProfile.skills?.length || 0} {/* ✅ Correction clé */}
              </Badge>
            </div>
            <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
              Compétences
              <ArrowUpRight className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-gray-300 group-hover:text-purple-300 transition-colors">
              Expertises techniques
            </p>
            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" 
                style={{ width: `${Math.min((localProfile.skills?.length || 0) * 10, 100)}%` }} 
              ></div>
            </div>
          </div>
        </motion.div>
      )}</div>

    {/* Message si aucune section activée */}
    {[
      ((isSectionEnabled('portfolio', localCardConfigs) || isSectionEnabled('cv', localCardConfigs)) && (portfolios?.length || 0) > 0),
      ((isSectionEnabled('certificates', localCardConfigs) || isSectionEnabled('cv', localCardConfigs)) && (certificates?.length || 0) > 0),
      ((isSectionEnabled('skills', localCardConfigs) || isSectionEnabled('cv', localCardConfigs)) && (localProfile.skills?.length || 0) > 0)
    ].filter(Boolean).length === 0 && (
      <div className="mt-8 py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucune ressource disponible</h3>
          <p className="text-gray-400 mb-4">
            Cette personne n'a pas encore partagé de portfolio, certifications ou compétences.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContactModal(true)}
            className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            Contacter cette personne
          </Button>
        </div>
      </div>
    )}

      {/* Divider décoratif */}
      <div className="mt-10 pt-8 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          <span>Compétences professionnelles vérifiées</span>
        </div>
      </div>
    </div>
  </motion.div>
)}

        <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.1 }}
  className="mt-6 px-4 md:px-0"
>
  <FloatingButtons
    profile={profileWithVisibility} // ✅ Utilisez le profil compatible
    setShowQRModal={setShowQRModal}
    onContactClick={() => setShowContactModal(true)}
  />
</motion.div>

{showContactSection && <ContactSection profile={localProfile} cardConfigs={[]} />}
{showSocialSection && <SocialSection profile={localProfile} cardConfigs={localCardConfigs} />}
        
        {/* 🔹 Section Liens (vCard, CV, RDV, Portfolio) */}
{showLinksSection && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.4 }}
    className="w-full px-4 mt-10"
  >
    <div className="max-w-5xl mx-auto">
      {/* Titre section */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Download className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Ressources & Documents</h2>
        </div>
        <p className="text-sm text-gray-400">
          Téléchargez ma carte de visite ou accédez à mes documents professionnels
        </p>
      </div>

    {/* Grille responsive moderne */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 📇 vCard - TOUJOURS AFFICHÉ si section activée */}
      {(isSectionEnabled('link', localCardConfigs) || 
        isSectionEnabled('custom', localCardConfigs) || 
        isSectionEnabled('cv', localCardConfigs)) && (
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <button
            onClick={() => {
              const vCard = `BEGIN:VCARD\r
VERSION:3.0\r
FN:${localProfile.full_name || ''}\r
ORG:${localProfile.company || ''}\r
TITLE:${localProfile.job_title || ''}\r
TEL;TYPE=WORK,VOICE:${localProfile.phone || ''}\r
TEL;TYPE=CELL,VOICE:${localProfile.whatsapp || ''}\r
EMAIL:${localProfile.email || ''}\r
ADR;TYPE=WORK:;;${localProfile.address || ''};;;;\r
URL:${localProfile.website || ''}\r
NOTE:Contact via LUVIKA — ${shortUrl}\r
END:VCARD`;
              const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${localProfile.username || 'contact'}.vcf`;
              a.click();
              URL.revokeObjectURL(url);
              
              // Analytics tracking
              console.log('✅ vCard téléchargée');
            }}
            className="w-full bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/20">
                .vcf
              </Badge>
            </div>
            <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
              Télécharger vCard
              <ArrowUpRight className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-gray-300 group-hover:text-purple-300 transition-colors">
              Carte de visite numérique
            </p>
            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-full"></div>
            </div>
          </button>
        </motion.div>
      )}

      {/* 📄 CV */}
      {(isSectionEnabled('link', localCardConfigs) || 
        isSectionEnabled('custom', localCardConfigs) || 
        isSectionEnabled('cv', localCardConfigs)) && localProfile.cv_url?.trim() && (
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <a
            href={localProfile.cv_url.trim().startsWith('http') 
              ? localProfile.cv_url.trim() 
              : `https://${localProfile.cv_url.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-gray-900/30 to-slate-900/20 border border-gray-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-gray-500/40 hover:shadow-lg hover:shadow-gray-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
              Voir mon CV
              <ArrowUpRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-gray-300 group-hover:text-white transition-colors line-clamp-1">
              {tryGetDomain(localProfile.cv_url.trim()) || 'Document PDF'}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            </div>
          </a>
        </motion.div>
      )}

      {/* 📅 Calendly */}
      {(isSectionEnabled('link', localCardConfigs) || 
        isSectionEnabled('custom', localCardConfigs) || 
        isSectionEnabled('cv', localCardConfigs)) && localProfile.calendly?.trim() && (
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <a
            href={localProfile.calendly.trim().startsWith('http') 
              ? localProfile.calendly.trim() 
              : `https://${localProfile.calendly.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <ExternalLink className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
              Prendre un RDV
              <ArrowUpRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-gray-300 group-hover:text-cyan-300 transition-colors">
              Planifier une rencontre
            </p>
            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full w-full"></div>
            </div>
          </a>
        </motion.div>
      )}

      {/* 🎨 Portfolio URL */}
      {(isSectionEnabled('link', localCardConfigs) || 
        isSectionEnabled('custom', localCardConfigs) || 
        isSectionEnabled('cv', localCardConfigs)) && localProfile.portfolio_url?.trim() && (
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <a
            href={localProfile.portfolio_url.trim().startsWith('http') 
              ? localProfile.portfolio_url.trim() 
              : `https://${localProfile.portfolio_url.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
              Portfolio en ligne
              <ArrowUpRight className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-gray-300 group-hover:text-blue-300 transition-colors line-clamp-1">
              {tryGetDomain(localProfile.portfolio_url.trim()) || 'Voir mes projets'}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
            </div>
          </a>
        </motion.div>
      )}
    </div>

    {/* Message si aucune section activée */}
    {[
      (isSectionEnabled('link', localCardConfigs) || isSectionEnabled('custom', localCardConfigs) || isSectionEnabled('cv', localCardConfigs)),
      localProfile.cv_url?.trim(),
      localProfile.calendly?.trim(),
      localProfile.portfolio_url?.trim()
    ].filter(Boolean).length === 0 && (
      <div className="mt-8 py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Download className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun document disponible</h3>
          <p className="text-gray-400 mb-4">
            Cette personne n'a pas encore partagé de documents ou liens professionnels.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContactModal(true)}
            className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            Contacter cette personne
          </Button>
        </div>
      </div>
    )}

      {/* Divider décoratif */}
      <div className="mt-10 pt-8 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
          <span>Documents professionnels</span>
        </div>
      </div>
    </div>
  </motion.div>
)}
{/* 🔹 Section Lien personnalisé indépendante */}
{showCustomLinkSection && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.5 }}
    className="w-full px-4 mt-10"
  >
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <LinkIcon className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Lien personnalisé</h2>
        </div>
        <p className="text-sm text-gray-400">
          Découvrez le lien personnalisé de {localProfile.full_name}
        </p>
      </div>
      <div className="grid grid-cols-1">
        <motion.div whileHover={{ y: -6, scale: 1.03 }} className="group">
          <a
            href={localProfile.custom_link_url!.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-indigo-900/30 to-violet-900/20 border border-indigo-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <ExternalLink className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
              Lien personnalisé
              <ArrowUpRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-gray-300 group-hover:text-white transition-colors line-clamp-1">
              {tryGetDomain(localProfile.custom_link_url!.trim()) || localProfile.custom_link_url!.trim()}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
            </div>
          </a>
        </motion.div>
      </div>
    </div>
  </motion.div>
)}

{/* ✅ Section Événements */}
{isSectionEnabled('event', localCardConfigs) && (
  <EventsSection profileId={localProfile.id} />
)}
        <ScanTracker profileId={localProfile.id} />

        {/* 🔹 TOUS LES MODALS - Structure unifiée dans UN SEUL AnimatePresence */}
<AnimatePresence mode="wait">
  {/* 📱 QR Code Modal */}
  {showQRModal && (
    <QRModal
      key="qr-modal"
      isOpen={showQRModal}
      onClose={() => setShowQRModal(false)}
      profileUrl={profileUrl}
      username={localProfile.username}
      shortUrl={shortUrl}
      avatarUrl={localProfile.avatar_url || undefined}
    />
  )}

  {/* 📩 Contact Modal - INSTANCE UNIQUE (fusion des deux états) */}
  {(isContactModalOpen || showContactModal) && (
    <ContactModal
      key="contact-modal"
      isOpen={isContactModalOpen || showContactModal}
      onClose={() => {
        setIsContactModalOpen(false);
        setShowContactModal(false);
      }}
      profileId={localProfile.id}
    />
  )}

  {/* 📁 Portfolio Modal - Design enrichi */}
  {showPortfolioModal && (
    <ProfileModal
      key="portfolio-modal"
      isOpen={showPortfolioModal}
      onClose={() => setShowPortfolioModal(false)}
      title="Portfolio"
      icon={<Folder className="w-5 h-5 text-cyan-400" />}
      gradient="from-cyan-500 to-blue-500"
    >
      <PortfolioSection items={portfolios} />
    </ProfileModal>
  )}

  {/* 🏆 Certifications Modal - Design enrichi */}
  {showCertificatesModal && (
    <ProfileModal
      key="certificates-modal"
      isOpen={showCertificatesModal}
      onClose={() => setShowCertificatesModal(false)}
      title="Certifications"
      icon={<Award className="w-5 h-5 text-amber-400" />}
      gradient="from-amber-500 to-yellow-500"
    >
      <CertificatesSection items={certificates} />
    </ProfileModal>
  )}

  {/* 🏷️ Compétences Modal - DESIGN COMPLÈTEMENT REPENSÉ */}
  {showSkillsModal && (
    <ProfileModal
      key="skills-modal"
      isOpen={showSkillsModal}
      onClose={() => setShowSkillsModal(false)}
      title="Compétences"
      icon={<Tag className="w-5 h-5 text-purple-400" />}
      gradient="from-purple-500 to-fuchsia-500"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-2">
        {localProfile.skills?.map((skill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="group"
          >
            <Badge 
              variant="secondary" 
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200 group-hover:border-purple-500/30"
            >
              {skill}
            </Badge>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 text-center text-sm text-gray-400">
        {localProfile.skills?.length || 0} compétences professionnelles
      </div>
    </ProfileModal>
  )}

  {/* 👤 Avatar Fullscreen - DESIGN PREMIUM AMÉLIORÉ */}
  {showAvatarFullscreen && (
    <motion.div
      key="avatar-fullscreen"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: { duration: 0.25, ease: "easeOut" }
      }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.2, ease: "easeIn" }
      }}
      onClick={() => setShowAvatarFullscreen(false)}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-black/95 to-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          transition: { 
            type: "spring", 
            stiffness: 350, 
            damping: 30,
            mass: 0.5
          }
        }}
        exit={{ 
          scale: 0.95, 
          opacity: 0, 
          y: 20,
          transition: { duration: 0.2 }
        }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl mx-auto aspect-square sm:aspect-video"
      >
        {/* 🔘 Bouton fermeture premium */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAvatarFullscreen(false)}
          className="absolute -top-4 -right-2 sm:-top-6 sm:-right-4 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 backdrop-blur-sm text-white shadow-lg shadow-black/50 z-50 transition-all duration-200 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Fermer"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </motion.button>

        {/* 🖼️ Conteneur image avec gestion d'erreur robuste */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl shadow-black/50 border border-white/10">
          <img
  src={localProfile.avatar_url || '/default-avatar.png'}
  alt={`${localProfile.full_name} - Photo de profil`}
  className="w-full h-full object-contain sm:object-cover"
  onError={(e) => {
    const img = e.target as HTMLImageElement; // ✅ Cast explicite UNE FOIS
    img.src = '/default-avatar.png';
    img.classList.add('bg-gradient-to-br', 'from-gray-800', 'to-gray-900');
  }}
  loading="lazy"
/>
          
          {/* 💡 Badge info utilisateur + Bouton téléchargement */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">{localProfile.full_name}</p>
                <p className="text-xs text-gray-300">@{localProfile.username}</p>
              </div>
            </div>
            
            {localProfile.avatar_url && (
              <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={(e) => {
    e.stopPropagation();
    // ✅ On sait que avatar_url existe car le bouton est conditionnellement rendu
    const url = localProfile.avatar_url!;
    const link = document.createElement('a');
    link.href = url; // ✅ TypeScript accepte car url est string
    link.download = `${localProfile.username || 'avatar'}-luvika.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Optionnel : toast.success('✅ Photo téléchargée');
  }}
  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:shadow-cyan-500/40"
>
  <Download className="w-4 h-4" />
  <span className="hidden sm:inline">Télécharger</span>
</motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
  </AnimatePresence>
  </div></div>
  );
}