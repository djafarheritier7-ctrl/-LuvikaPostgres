// src/components/dashboard/DashboardContent.tsx
'use client';

import { useState, useEffect, useMemo, useRef, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  Heart, Download, X, Mail, Check, Settings, AlertTriangle, MessageSquare, Send, Eye, Award, Folder, Building, Plus, Calendar, 
  QrCode, Package, ArrowUp, Search, Users, ChevronRight, ShoppingBag, UserPlus, UserMinus,Layers,AlertCircle, CreditCard, XCircle,
  User, Globe, Calendar as Briefcase, MapPin, Cake, Link as EyeOff, LogOut, ShieldAlert, Star, Crown, BellRing, Infinity as InfinityIcon, Circle,
  Info, Lock, Zap, Unlock, MessageCircle, Search as SearchIcon, CheckCircle, BarChart3, Leaf, RefreshCw, Clock, Trophy,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { generateQRBase64 } from '../../../lib/qr';
import SearchModal from '../../../src/components/dashboard/SearchModal';
import FollowersModal from '../../../src/components/dashboard/FollowersModal';
import ContactRequestsSection from '../../../src/components/dashboard/ContactRequestsSection';
import AnalyticsTrends from '../../../src/components/dashboard/AnalyticsTrends';
import EventAttendeesSection from '../../../src/components/dashboard/EventAttendeesSection';
import DashboardQuickMenu from '../../../src/components/dashboard/DashboardQuickMenu';
import PortfolioModal from '../../../src/components/dashboard/PortfolioModal';
import CertificatesModal from '../../../src/components/dashboard/CertificatesModal';
import CreateEventForm from '../events/CreateEventForm';
import { createClient } from '../../../src/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import NFCManagementModal from './Modals/NFCManagementModal';
import NFCModal from './Modals/NFCModal';
import { NFCCard } from '../../types/nfc';
import { normalizeNfcCard } from '@/src/lib/utils/nfc';
import CompanyTypeModal from './CompanyTypeModal';
import ContactRequestsModal from '../../../src/components/dashboard/ContactRequestsSection';
import BadgeLevel from '../ui/BadgeLevel';
import { getBadgeInfo } from '@/src/lib/utils/badgeLevel';

const formatDistance = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays > 0) return `${diffDays} ${t('time.days', { count: diffDays })}`;
  if (diffHrs > 0) return `${diffHrs} ${t('time.hours', { count: diffHrs })}`;
  if (diffMin > 0) return `${diffMin} ${t('time.minutes', { count: diffMin })}`;
  return `${diffSec} ${t('time.seconds', { count: diffSec })}`;
};

const formatExpirationDate = (expiresAt: string | undefined) => {
  if (!expiresAt) return null;
  
  const date = new Date(expiresAt);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    date: date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }),
    daysLeft: Math.max(0, diffDays),
    isExpiringSoon: diffDays <= 7,
  };
};

const SuccessModal = ({
  isOpen,
  onClose,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
        onClick={onClose}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-cyan-300/30"
              style={{
                left: `${10 + i * 15}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ['-80px', '100vh'],
                scale: [0, 1.2, 0],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 40 }}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative backdrop-blur-2xl bg-white/10 dark:bg-black/20 rounded-2xl border border-white/15 shadow-xl w-full max-w-sm overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: 0 }}
            transition={{ duration: 4, ease: 'easeOut' }}
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-white z-10"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="px-6 py-8 text-center relative z-10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow">
              {title}
            </h3>
            <p className="text-gray-200 text-sm drop-shadow-sm">
              {message}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// 🔹 ✅ Modal : Message personnalisé (avec possibilité de répondre aux messages)
const CustomMessageModal = ({
  isOpen,
  onClose,
  messages = [], // Liste des messages reçus
  replyingTo, // ID du message auquel on répond
  replyContent,
  onReplyChange,
  onSendReply,
  onSendCustomMessage,
  customMessage,
  onCustomMessageChange,
  sending,
}: {
  isOpen: boolean;
  onClose: () => void;
  messages?: { id: string; name: string; email: string; message: string; created_at: string; replied_at?: string }[];
  replyingTo?: string | null;
  replyContent?: string;
  onReplyChange?: (v: string) => void;
  onSendReply?: (messageId: string) => void;
  onSendCustomMessage?: () => void;
  customMessage?: string;
  onCustomMessageChange?: (v: string) => void;
  sending?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] max-h-[85vh] overflow-y-auto p-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white/80 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400/60" />
            Messages
          </h2>
          <button onClick={onClose} className="text-gray-400/60 hover:text-white/70">
            <X className="w-4 h-4" />
          </button>
        </div>

                 {/* Liste des messages reçus */}
        {messages && messages.length > 0 && (
          <div className="space-y-2 mb-4">
            {messages.map((msg) => (
              <div key={msg.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-xs text-white/70 font-medium">{msg.name}</p>
                    <p className="text-[11px] text-gray-400/50 font-light">{msg.email}</p>
                    <p className="text-[10px] text-gray-500/40 font-light mt-0.5">
                      {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.replied_at ? (
                    <span className="text-[10px] text-emerald-400/60 font-light bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">Répondu</span>
                  ) : (
                    <button
                      onClick={() => onReplyChange?.(replyingTo === msg.id ? '' : msg.id)}
                      className={`text-[10px] font-light px-1.5 py-0.5 rounded-full transition-all flex-shrink-0 ${
                        replyingTo === msg.id
                          ? 'bg-cyan-500/10 text-cyan-300/60 border border-cyan-500/20'
                          : 'text-cyan-400/60 hover:text-cyan-300/70 hover:bg-cyan-500/[0.04]'
                      }`}
                    >
                      {replyingTo === msg.id ? 'Fermer' : 'Répondre'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-300/70 font-light mt-1.5">{msg.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Si aucun message */}
        {(!messages || messages.length === 0) && (
          <p className="text-xs text-gray-400/60 font-light text-center py-6">Aucun message reçu.</p>
        )}

        {/* Nouveau message personnalisé */}
        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-xs text-gray-400/60 font-light mb-2">Nouveau message</p>
          <textarea
            value={customMessage || ''}
            onChange={e => onCustomMessageChange?.(e.target.value)}
            placeholder="Écrivez votre message..."
            rows={3}
            className="w-full text-xs bg-white/[0.03] border border-white/[0.08] text-white/80 rounded-xl p-2.5 resize-none font-light placeholder:text-gray-500/40"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={onClose}
              className="flex-1 h-7 text-[11px] text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg transition-all"
            >
              Annuler
            </button>
            <button
              onClick={onSendCustomMessage}
              disabled={sending || !customMessage?.trim()}
              className="flex-1 h-7 text-[11px] bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg transition-all disabled:opacity-50"
            >
              <Send className="w-3 h-3 mr-1" />
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
// 🔹 ✅ Modal : Upgrade
const UpgradeModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}) => {
  const t = useTranslations('dashboard.subscription');
  if (!isOpen) return null;
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6"
      >
<Card className="glass-border bg-gradient-to-b relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-blue-500/20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: ['-100px', '100vh'],
                  x: [0, Math.sin(i) * 100],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <CardContent className="relative z-10 pt-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {t('request_upgrade')}
              </h2>
              <p className="text-gray-300">
                Un administrateur vous contactera sous 24h pour finaliser votre passage à Pro ou Bussness.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                onClick={onConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi...' : '✅ Envoyer la demande'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

// 🔹 ✅ Modal : QR Code
const QRModal = ({
  isOpen,
  onClose,
  profileUrl,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  username: string;
}) => {
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadQR = () => {
    const canvas = document.querySelector('#qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${username}_luvika_qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  useEffect(() => {
    if (isOpen) {
      import('qrcode').then(QRCode => {
        QRCode.default.toCanvas(
          document.getElementById('qr-canvas') as HTMLCanvasElement,
          profileUrl,
          { width: 256, color: { dark: '#2563eb', light: '#ffffff' } }
        );
      });
    }
  }, [isOpen, profileUrl]);
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-white/15"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">QR Code</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white rounded-xl">
              <canvas id="qr-canvas" width="256" height="256" className="mx-auto" />
            </div>
            <p className="text-gray-300 mt-3">
              Scannez pour accéder à votre profil LUVIKA
            </p>
          </div>
          <p className="text-sm text-gray-400 bg-black/20 p-3 rounded-lg mb-4 break-all">
            {profileUrl}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={copyLink}
            >
              {copied ? '✅ Copié !' : '📋 Copier'}
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-600 to-blue-500"
              onClick={downloadQR}
            >
              <Download className="w-4 h-4 mr-1" />
              Télécharger
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


const SignOutConfirmSheet = ({
  isOpen,
  onClose,
  onConfirm,
  tNavbar,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tNavbar: (key: string) => string;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="w-full sm:max-w-sm mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-4 sm:mx-0 mb-6 sm:mb-0 rounded-2xl p-6 bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
            {/* Icône */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400/70" />
              </div>
            </div>

            {/* Titre */}
            <h3 className="text-lg font-semibold text-white/80 text-center mb-1.5">
              {tNavbar('sign_out_confirm_title')}
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-400/60 text-center font-light mb-6">
              {tNavbar('sign_out_confirm_message')}
            </p>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={onConfirm}
                className="w-full h-10 inline-flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-500 hover:to-rose-500 text-white font-light rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                {tNavbar('sign_out_confirm_yes')}
              </button>

              <button
                onClick={onClose}
                className="w-full h-10 inline-flex items-center justify-center gap-2 text-sm text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
                {tNavbar('sign_out_confirm_no')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
// 🔹 ✅ Composant bulles (réutilisable partout)
const IceBubbles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="bubble bubble-1" />
    <div className="bubble bubble-2" />
    <div className="bubble bubble-3" />
    <div className="bubble bubble-4" />
    <div className="bubble bubble-5" />
  </div>
);

// 🔹 Types
type Profile = {
  verified: import("react/jsx-runtime").JSX.Element;
  id: string;
  full_name: string;
  username: string;
  job_title?: string;
  is_public?: boolean;
  bio_short?: string;
  sections_visibility?: Record<string, boolean>;
  accepts_contact_requests?: boolean;
  plan?: string | null;
  likes_count?: number;
  // 🔹 Ajouter avatar_url
  avatar_url?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string; // ou bio_short seulement
  skills?: string[] | any[]; // à affiner
  links?: { url: string; title: string }[];
  certificates?: any[]; // selon structure réelle
  portfolio?: any[];
};

type Action = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  disabled?: boolean;
};
type Card = {
  matricule: string;
  id: string;
  card_id: string;
  status: 'active' | 'lost' | 'blocked' | 'inactive' | 'reported';
  created_at: string;
};

type Scan = {
  id: string;
  scan_type: string;
  created_at: string;
  profiles?: { full_name?: string; username?: string };
};
type Props = {
  user: { id: string };
  profile: Profile;
  cards: Card[];
  recentScans: Scan[];
  totalScans: number;
  qrBase64: string;
  profileUrl: string;
  planColors: Record<string, string>;
  isAdmin: boolean;
  totalFollowers: number;
  refreshProfile: () => Promise<void>;
};
type EventData = {
  title: string;
  description?: string;
  location?: string;
  starts_at: string; // ISO 8601
  ends_at?: string;
  is_public: boolean;
  max_participants?: number;
};

export default function DashboardContent({
  user, profile, cards, recentScans,
  totalScans, qrBase64, profileUrl, planColors, isAdmin, totalFollowers, refreshProfile,
}: Props) {
  const t = useTranslations('dashboard');
  const tNavbar = useTranslations('navbar');
  const locale = useLocale();
  const router = useRouter();
  const [hasLiked, setHasLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scansCount, setScansCount] = useState(0);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isCertificatesModalOpen, setIsCertificatesModalOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [isNFCModalOpen, setIsNFCModalOpen] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [selectedCardForManagement, setSelectedCardForManagement] = useState<NFCCard | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [nfcCards, setNfcCards] = useState<NFCCard[]>([]);
  const [isTransparent, setIsTransparent] = useState(false);
  const [showCompanyTypeModal, setShowCompanyTypeModal] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');
  const [needsCompanyType, setNeedsCompanyType] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [hasScanReward, setHasScanReward] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);


// states (si non déjà présents)
const [actionsOpen, setActionsOpen] = useState(false);
const actionsRef = useRef<HTMLDivElement | null>(null);

// close dropdown on outside click / Escape
useEffect(() => {
  function onClick(e: MouseEvent) {
    if (!actionsRef.current) return;
    if (!(e.target instanceof Node)) return;
    if (!actionsRef.current.contains(e.target)) setActionsOpen(false);
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') setActionsOpen(false);
  }
  document.addEventListener('mousedown', onClick);
  document.addEventListener('keydown', onKey);
  return () => {
    document.removeEventListener('mousedown', onClick);
    document.removeEventListener('keydown', onKey);
  };
}, []);

  const [sectionsVisibility, setSectionsVisibility] = useState<Record<string, boolean>>(
    profile.sections_visibility || {
      bio: true,
      contact: true,
      social: true,
      portfolio: true,
      certificates: true,
    }
  );
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [acceptsContactRequests, setAcceptsContactRequests] = useState(
    profile.accepts_contact_requests ?? true
  );
  const [reportReason, setReportReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [activeCardStats, setActiveCardStats] = useState<{ scans: number; unique_visitors: number } | null>(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingMessagesCount, setLoadingMessagesCount] = useState(true);
  const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');
  const [checkingUpgrade, setCheckingUpgrade] = useState(true);

  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);


 // Archiver / Désarchiver
async function toggleArchive(eventId: string, archive: boolean) {
  setIsActionLoading(true);
  try {
    const res = await fetch(`/api/events/${eventId}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: archive ? 'archive' : 'unarchive' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Échec opération');

    toast.success(archive ? 'Événement archivé' : 'Événement restauré');
    router.refresh();
  } catch (err: any) {
    console.error('Archive error', err);
    toast.error(err?.message || 'Erreur lors de l’opération');
  } finally {
    setIsActionLoading(false);
  }
}

// Supprimer
async function handleDeleteEvent(eventId: string) {
  if (!confirm('Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible.')) return;
  setIsActionLoading(true);
  try {
    const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Erreur suppression');

    toast.success('Événement supprimé');
    setIsEventModalOpen(false); // fermer la modal si nécessaire
    setSelectedEventId(null);
    router.refresh();
  } catch (err: any) {
    console.error('Delete error', err);
    toast.error(err?.message || 'Impossible de supprimer');
  } finally {
    setIsActionLoading(false);
  }
}

// Nettoyer la sélection quand modal ferme
useEffect(() => {
  if (!isEventModalOpen) setSelectedEventId(null);
}, [isEventModalOpen]);

  // Fonction pour charger le top 5
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/leaderboard?limit=5`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Erreur leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };
// 🔹 Mapping du plan utilisateur pour la logique NFC
const userPlan = useMemo(() => {
  const plan = (profile.plan || 'gratuit').toLowerCase();
  if (plan === 'premium') return 'professionnel';
  if (plan === 'entreprise') return 'business';
  return 'gratuit';
}, [profile.plan]);

// Fonction pour déterminer si l'utilisateur peut commander plus de cartes
const canOrderMoreCards = useMemo(() => {
  if (userPlan === 'business') return true;       // Illimité
  if (userPlan === 'professionnel') return cards.length < 10;  // Max 10
  if (userPlan === 'gratuit') return cards.length < 1;         // Max 1
  return false;
}, [userPlan, cards.length]);


// Gestionnaire pour l'upgrade de plan
const handleUpgradePlan = () => {
  window.location.href = '/pricing?upgrade=true';
};
  
    // 🔹 Fonction pour fermer les modaux contrôlés par activeModal
  const closeModal = () => {
  setActiveModal(null);
};
const updateUnreadCount = (count: number) => {
  // Utiliser requestAnimationFrame pour être sûr d'être hors du cycle de rendu
  requestAnimationFrame(() => {
    setUnreadMessagesCount(Math.max(0, count));
  });
};

// Ajoutez cet état
const [subscriptionData, setSubscriptionData] = useState<{
  plan: string;
  status: string;
  expires_at: string | null;
  started_at: string | null;
} | null>(null);

// Ajoutez ce useEffect pour charger les données réelles
useEffect(() => {
  const fetchSubscription = async () => {
    if (!profile?.id) return;
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, expires_at, started_at')
        .eq('profile_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSubscriptionData(data);
      }
    } catch (err) {
      console.error('❌ Erreur chargement abonnement:', err);
    }
  };

  fetchSubscription();
}, [profile?.id]);

  const subscription = useMemo(() => {
    // Utiliser les données réelles de la table subscriptions si disponibles
    if (subscriptionData) {
      return {
        plan: subscriptionData.plan as 'basic' | 'premium' | 'entreprise',
        active: subscriptionData.status === 'active' && (
          !subscriptionData.expires_at || 
          new Date(subscriptionData.expires_at) > new Date()
        ),
        expires_at: subscriptionData.expires_at || undefined,
        started_at: subscriptionData.started_at || undefined,
      };
    }
    
    // Fallback sur les données du profil
    const plan = (profile.plan || 'basic').toLowerCase() as 'basic' | 'premium' | 'entreprise';
    return { 
      plan, 
      active: plan === 'premium' || plan === 'entreprise', 
      expires_at: undefined,
      started_at: undefined,
    };
  }, [profile.plan, subscriptionData]);

  const handleLike = () => setHasLiked(!hasLiked);
  
// Ajouter cette fonction pour charger les messages
const fetchMessages = async () => {
  try {
    const res = await fetch(`/api/contact-requests?profile_id=${profile.id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.requests || []);
    }
  } catch (err) {
    console.error('Erreur chargement messages:', err);
  }
};

// Charger les messages quand le modal s'ouvre
useEffect(() => {
  if (activeModal === 'message') {
    fetchMessages();
  }
}, [activeModal]);

useEffect(() => {
  console.log('🔍 Vérification récompense:', { scansCount, profileId: profile.id });
  
  if (scansCount >= 10000) {
    const rewardApplied = localStorage.getItem(`luvika_scan_reward_${profile.id}`);
    console.log('🎯 Reward check:', { rewardApplied });
    
    if (!rewardApplied) {
      console.log('🏆 Affichage modal récompense !');
      setHasScanReward(true);
      setShowRewardModal(true);
    }
  }
}, [scansCount, profile.id]);

const handleApplyScanReward = async () => {
  try {
    const res = await fetch('/api/subscription/apply-scan-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profile.id,
        discount_percent: 5,
        reason: '10 000 scans atteints',
      }),
    });

    if (res.ok) {
      localStorage.setItem(`luvika_scan_reward_${profile.id}`, 'true');
      setHasScanReward(false);
      setShowRewardModal(false);
      toast.success('🎉 Récompense débloquée !', {
        description: '5% de réduction appliquée à votre abonnement mensuel.',
        icon: <Trophy className="w-4 h-4 text-amber-400" />,
      });
    } else {
      throw new Error();
    }
  } catch (err) {
    toast.error('Erreur', {
      description: 'Impossible d\'appliquer la réduction.',
    });
  }
};

// Fonction pour envoyer une réponse
const handleSendReply = async (messageId: string) => {
  if (!replyContent.trim()) return;
  setSendingReply(true);
  try {
    const res = await fetch('/api/contact-requests/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: messageId, message: replyContent }),
    });
    if (res.ok) {
      toast.success('Réponse envoyée');
      setReplyContent('');
      setReplyingTo(null);
      fetchMessages();
    } else {
      throw new Error();
    }
  } catch {
    toast.error('Erreur');
  } finally {
    setSendingReply(false);
  }
};



  // 🔹 Nouveaux gestionnaires d'actions
  const handleQuickAction = (actionId: string) => {
    // 🔹 Rediriger vers les nouvelles pages
    switch (actionId) {
      case 'statistics':
        router.push('/dashboard/statistics');
        break;
      case 'messages':
        router.push('/dashboard/messages');
        break;
      case 'subscribers':
        router.push('/dashboard/subscribers');
        break;
      case 'card-config':
        router.push('/dashboard/card-config');
        break;
      case 'orders':
      router.push(isAdmin ? '/admin/orders' : '/dashboard/orders');
        break;
      case 'parameters':
        router.push('/dashboard/parameters');
        break;
      case 'profile':
        router.push(`/${locale}/${profile.username}`);
        break;
      case 'event':
        setIsEventModalOpen(true);
        break;
      case 'event-create':
        setIsEventFormOpen(true);
        break;
      case 'portfolio':
        setIsPortfolioModalOpen(true);
        break;
      case 'certificates':
        setIsCertificatesModalOpen(true);
        break;
      case 'logout':
        setShowSignOutConfirm(true);
        break;
      case 'message':
        setActiveModal('message');
        break;
      default:
        setActiveModal(actionId);
    }
  };
  // 🔹 Rediriger vers la page de gestion des cartes
const handleManageCards = () => {
  router.push('/dashboard/nfc');
};

useEffect(() => {
  console.log('🔍 Modaux actifs:', {
    activeModal,
    isPortfolioModalOpen,
    isCertificatesModalOpen,
    isContactModalOpen,
    showSignOutConfirm
  });
}, [activeModal, isPortfolioModalOpen, isCertificatesModalOpen, isContactModalOpen, showSignOutConfirm]);
// 🔹 Rediriger vers la page de commande de carte
const handleOrderCard = () => {
  router.push('/dashboard/orders');
};

// 🔹 Vérifier si l'utilisateur a au moins une carte commandée
const hasOrderedCard = cards.length > 0;

// 🔹 Obtenir la carte active (la plus récente)
const activeCard = cards[0];
  const updateVisibility = (section: string, checked: boolean) => {
    const newVisibility = { ...sectionsVisibility, [section]: checked };
    setSectionsVisibility(newVisibility);
    saveSectionsVisibility(newVisibility);
  };
  
  const handleExport = async () => {
    try {
      const res = await fetch('/api/scans/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luvika-scans-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('❌ Échec de l’export');
    }
  };

  const fetchUnreadMessagesCount = async () => {
  try {
    setLoadingMessagesCount(true);
    // Ajouter un cache-buster pour éviter le cache
    const res = await fetch(`/api/contact-requests/count?status=unread&_t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      setUnreadMessagesCount(data.count || 0);
    }
  } catch (err) {
    console.error('❌ Erreur chargement compteur messages:', err);
  } finally {
    setLoadingMessagesCount(false);
  }
};

  useEffect(() => {
  const checkUpgradeStatus = async () => {
    if (!profile?.id) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('upgrade_requests')
        .select('status')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setUpgradeStatus(data.status);
      }
    } catch (err) {
      setUpgradeStatus('idle');
    } finally {
      setCheckingUpgrade(false);
    }
  };

  if (profile?.plan !== 'entreprise') {
    checkUpgradeStatus();
  } else {
    setCheckingUpgrade(false);
  }
}, [profile?.id, profile?.plan]);

// Modifier handleUpgradeRequest pour mettre à jour l'état local
const handleUpgradeRequest = async () => {
  if (!user || !profile) return;
  setIsSubmitting(true);
  try {
    let targetPlan = 'premium';
    if (profile.plan === 'premium') {
      targetPlan = 'entreprise';
    }
    const res = await fetch('/api/upgrade-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        profile_id: profile.id,
        target_plan: targetPlan
      }),
    });
    if (res.ok) {
      setUpgradeStatus('pending'); // ✅ Met à jour l'état local
      closeModal();
      toast.success('Demande envoyée', {
        description: 'Un administrateur examinera votre demande sous 24h.',
      });
    } else {
      throw new Error();
    }
  } catch {
    toast.error('Erreur', {
      description: 'Impossible d\'envoyer la demande.',
    });
  } finally {
    setIsSubmitting(false);
  }
};

const loadNfcCards = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  const { data, error } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (!error && data) {
    setNfcCards(data.map(normalizeNfcCard)); // ✅ Normalisation propre
  }
};

// Dans le useEffect initial
useEffect(() => {
  loadNfcCards();
}, []);
// 🔹 Charger les cartes NFC AVEC statistiques depuis la table scans existante
const fetchCards = async () => {
  try {
    setLoadingCards(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // 🔹 Récupérer les cartes NFC
    const { data: cardsData, error: cardsError } = await supabase
      .from('nfc_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (cardsError) throw cardsError;
    setNfcCards(cardsData || []); // ✅ Utilise setNfcCards au lieu de setCards

    // 🔹 Récupérer les stats depuis la table scans EXISTANTE
    const { data: scansData, error: scansError } = await supabase
      .from('scans')
      .select('scanner_id')
      .eq('profile_id', user.id)
      .eq('scan_type', 'nfc');

    if (scansError) throw scansError;

    // 🔹 Calculer les statistiques
    const totalScans = scansData?.length || 0;
   const uniqueVisitors = new Set(
  scansData?.map((scan: any) => scan.scanner_id).filter(Boolean) || []
).size;

    setActiveCardStats({
      scans: totalScans,
      unique_visitors: uniqueVisitors
    });
  } catch (err) {
    console.error('❌ Erreur chargement cartes:', err);
  } finally {
    setLoadingCards(false);
  }
};
// 🔹 Dans useEffect existant, ajouter le chargement des cartes
useEffect(() => {
  if (profile) {
    fetchCards();
    // ... autres fetch existants
  }
}, [profile]);
  const saveSectionsVisibility = async (newVisibility: Record<string, boolean>) => {
    try {
      const res = await fetch('/api/profile/sections-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, sections_visibility: newVisibility }),
      });
      if (!res.ok) throw new Error('Échec sauvegarde');
    } catch (err) {
      console.error('❌ Sauvegarde sections échouée:', err);
    }
  };
  
  const toggleContactRequests = async () => {
    try {
      const res = await fetch('/api/profile/contact-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, enabled: !acceptsContactRequests }),
      });
      if (res.ok) {
        setAcceptsContactRequests(!acceptsContactRequests);
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec. Veuillez réessayer.');
    }
  };
  
  const handleReportCard = async () => {
    if (!reportReason) return;
    const reason = reportReason === 'other' ? customReason : reportReason;
    try {
      const res = await fetch('/api/profile/report-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, reason, profile_id: profile.id }),
      });
      if (res.ok) {
        alert('✅ Carte signalée.');
        closeModal();
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec.');
    }
  };
  
  const handleSendCustomMessage = async () => {
    if (!customMessage.trim()) return;
    try {
      const res = await fetch('/api/profile/custom-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, message: customMessage }),
      });
      if (res.ok) {
        setCustomMessage('');
        alert('✅ Message envoyé.');
        closeModal();
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec.');
    }
  };
  
  const handleCreateEvent = async (data: any) => {
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(errorData.error || 'Échec de la création');
    }

    const eventData = await res.json();
    setIsEventFormOpen(false);
    toast.success('Événement créé', {
      description: 'Votre événement a été créé avec succès.',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400/70" />,
    });
  } catch (err: any) {
    console.error('Erreur création événement:', err);
    toast.error('Erreur', {
      description: err.message || 'Veuillez réessayer.',
    });
  }
};

  // 🔹 ✅ Nouveau gestionnaire de déconnexion
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        setShowFarewell(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec de la déconnexion. Veuillez réessayer.');
    }
  };
  
  const [hasCompany, setHasCompany] = useState(false);
useEffect(() => {
  const checkCompany = async () => {
    if (user?.id && subscription.plan === 'entreprise') {
      const supabase = createClient();
      const { data } = await supabase
        .from('companies')
        .select('id, company_type')
        .eq('owner_id', user.id)
        .single();
      
      setHasCompany(!!data);
      
      if (data) {
        setCompanyId(data.id); // ✅ AJOUTE CECI
        if (!data.company_type) {
          setNeedsCompanyType(true);
        }
      }
    }
  };
  checkCompany();
}, [user?.id, subscription.plan]);

useEffect(() => {
  if (needsCompanyType && hasCompany && !showCompanyTypeModal && companyId) {
    setShowCompanyTypeModal(true);
  }
}, [needsCompanyType, hasCompany, showCompanyTypeModal, companyId]);

// 5. En bas du JSX, avant la fermeture du return, ajouter le modal :
{showCompanyTypeModal && companyId && (
  <CompanyTypeModal
    isOpen={showCompanyTypeModal}
    onClose={() => setShowCompanyTypeModal(false)}
    companyId={companyId}
  />
)}
  useEffect(() => {
  if (unreadMessagesCount > 0 && !loadingMessagesCount) {
    // Jouer un son discret
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }
}, [unreadMessagesCount]);

useEffect(() => {
  const fetchScans = async () => {
    try {
      const res = await fetch(`/api/analytics?profile_id=${profile.id}&range=all&t=${Date.now()}`);
      const { total } = await res.json();
      console.log('📊 API analytics retour:', total); // ✅ Debug
      setScansCount(total || 0);
    } catch (err) {
      console.warn('⚠️ Failed to load scans count');
    }
  };
  fetchScans();
}, [profile.id]);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('open') === 'upgrade') {
      setActiveModal('upgrade');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);
  useEffect(() => {
  if (profile.accepts_contact_requests) {
    fetchUnreadMessagesCount();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadMessagesCount, 30000);
    return () => clearInterval(interval);
  }
}, [profile.accepts_contact_requests]);

  
  // 🔹 ✅ Nouveaux quickActions - version compacte et glassmorphic
const quickActions: Action[] = [
  { id: 'profile', label: 'Profil', icon: <User size={18} />, color: 'from-cyan-500 to-blue-500' },
  { id: 'statistics', label: 'Statistiques', icon: <BarChart3 size={18} />, color: 'from-purple-500 to-indigo-500' },
  { id: 'subscribers', label: 'Abonnés', icon: <Users size={18} />, color: 'from-emerald-500 to-teal-500' },
  { id: 'card-config', label: 'Carte', icon: <CreditCard size={18} />, color: 'from-amber-500 to-orange-500' },
  { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={18} />, color: 'from-blue-900 to-blue-800' },
  { id: 'portfolio', label: 'Portfolio', icon: <Folder size={18} />, color: 'from-sky-500 to-cyan-500' },
  { id: 'certificates', label: 'Certificat', icon: <Award size={18} />, color: 'from-yellow-500 to-amber-500' },
  { id: 'parameters', label: 'Paramètres', icon: <Settings size={18} />, color: 'from-slate-500 to-gray-500' },
  { id: 'message', label: 'Messages', icon: <MessageSquare size={18} />, color: 'from-green-500 to-emerald-500' },
  { id: 'logout', label: 'Déconnexion', icon: <LogOut size={18} />, color: 'from-red-500 to-rose-500' },
];
  
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qr = await generateQRBase64(profileUrl, { size: 300, color: '#2563eb' });
        setQrImage(qr);
      } catch (err) {
        console.error('❌ QR generation failed:', err);
        setQrError('QR indisponible.');
      }
    };
    if (profileUrl) generateQR();
  }, [profileUrl]);
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        setShowSuccessModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const [profileCompletion, setProfileCompletion] = useState(0);

// 🔹 Calculer le pourcentage de complétion du profil
const calculateProfileCompletion = (profile: any) => {
  let score = 0;
  const totalPoints = 10;

  if (profile.avatar_url) score += 2;
  if (profile.bio_short || profile.bio_long) score += 1;
  if (profile.email) score += 1;
  if (profile.phone) score += 1;
  if (profile.address) score += 1;
  
  // Skills (array dans profiles)
  if (profile.skills && profile.skills.length > 0) score += 1;

  // Links : au moins un lien social renseigné
const hasLinks = !!(
    profile.website ||
    profile.linkedin ||
    profile.github ||
    profile.instagram ||
    profile.tiktok ||
    profile.snapchat ||
    profile.pinterest ||
    profile.discord ||
    profile.reddit ||
    profile.threads ||
    profile.portfolio_url
  );
  if (hasLinks) score += 1;

  // Certificates (table jointe)
  if (profile.certificates && profile.certificates.length > 0) score += 1;

  // Portfolio (table jointe)
  if (profile.portfolios && profile.portfolios.length > 0) score += 1;

  return Math.round((score / totalPoints) * 100);
};

// 🔹 ✅ NOUVEAU : Mettre à jour la complétion quand le profil change
useEffect(() => {
  if (profile) {
    const completion = calculateProfileCompletion(profile);
    setProfileCompletion(completion);
  }
}, [profile]);

// 🔹 Recherche d'utilisateurs
const handleSearch = async (query: string) => {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    setIsSearching(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        username,
        avatar_url,
        plan
      `)
      .ilike('full_name', `%${query}%`)
      .neq('id', user.id)
      .limit(10);

    if (error) throw error;
    
    setSearchResults(data || []);
    
    // Charger le statut de suivi
    if (data && data.length > 0) {
      const followerIds = data.map((p: { id: any; }) => p.id);
      const { data: followers } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', user.id)
        .in('follower_id', followerIds);

      const statusMap: Record<string, boolean> = {};
      (followers || []).forEach((f: { follower_id: string | number; }) => {
        statusMap[f.follower_id] = true;
      });
      setFollowStatus(statusMap);
    }
  } catch (err) {
    console.error('❌ Erreur recherche:', err);
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};

// 🔹 Toggle follow/unfollow
const handleToggleFollow = async (profileId: string) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const isFollowing = followStatus[profileId];
    
    if (isFollowing) {
      // Unfollow
      await supabase
        .from('followers')
        .delete()
        .eq('follower_id', profileId)
        .eq('following_id', user.id);
      
      setFollowStatus(prev => ({ ...prev, [profileId]: false }));
    } else {
      // Follow
      await supabase
        .from('followers')
        .insert({
          follower_id: profileId,
          following_id: user.id
        });
      
      setFollowStatus(prev => ({ ...prev, [profileId]: true }));
    }
  } catch (err) {
    console.error('❌ Erreur follow/unfollow:', err);
    alert('❌ Échec de l\'opération');
  }
};
  

return (
  <div className="space-y-0 pb-24 bg-transparent">
    
    {/* 🔒 HEADER FIXE - Barre d'icônes + Badge niveau */}
    <div className="sticky top-0 z-40 backdrop-blur-xl -mx-4 px-4 pb-4 pt-3 sm:pt-4 border-b border-white/[0.04]">
      
      {/* Barre d'icônes compacte */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* ⬅️ Boutons Événements à gauche */}
        <div className="flex items-center gap-2">
          {(subscription.plan === 'premium' || (subscription.plan === 'entreprise' && hasCompany)) && (
            <Button
              onClick={() => setIsEventModalOpen(true)}
              variant="ghost"
              size="sm"
              className="h-9 px-3 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 text-cyan-300 hover:text-cyan-200 transition-all duration-300"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium hidden sm:inline">Événements</span>
            </Button>
          )}
          {(subscription.plan === 'premium' || (subscription.plan === 'entreprise' && hasCompany)) && (
            <Button
              onClick={() => setIsEventFormOpen(true)}
              variant="ghost"
              size="sm"
              className="h-9 px-3 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 text-emerald-300 hover:text-emerald-200 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium hidden sm:inline">Créer</span>
            </Button>
          )}
        </div>

        {/* ➡️ Icônes à droite */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchModalOpen(true)}
            className="h-10 w-10 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 transition-all duration-300">
            <SearchIcon className="h-5 w-5 text-purple-300" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsContactModalOpen(true)}
            className="h-10 w-10 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 transition-all duration-300 relative">
            <Mail className="h-5 w-5 text-green-300" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0a0a0f]">
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </span>
            )}
          </Button>
          <div className="relative">
  <Button 
    variant="ghost" 
    size="icon"
    className="h-10 w-10 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 transition-all duration-300"
  >
    <Heart 
      size={18} 
      className={(profile?.likes_count ?? 0) > 0 ? 'fill-red-500 text-red-300' : 'text-gray-400'} 
    />
  </Button>
  
  {/* Compteur de likes */}
  {(profile?.likes_count ?? 0) > 0 && (
    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-[3px] border-[#0a0a0f] px-1 leading-none">
      {profile.likes_count! > 99 ? '99+' : profile.likes_count}
    </span>
  )}
</div>
        </div>
      </div>

      {/* Badge niveau - CLIQUABLE pour voir le classement */}
{scansCount > 0 && (
  <div className="mt-3">
    {(() => {
      const badgeInfo = getBadgeInfo(scansCount);
      const isMaxLevel = badgeInfo.nextThreshold === Infinity;
      const nextThreshold = isMaxLevel ? scansCount : (badgeInfo.nextThreshold || scansCount + 50);
      const progress = isMaxLevel ? 100 : Math.min((scansCount / nextThreshold) * 100, 100);

      return (
        <button
          onClick={() => {
            fetchLeaderboard();
            setShowLeaderboardModal(true);
          }}
          className={`w-full relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
            isMaxLevel 
              ? 'bg-gradient-to-br from-amber-500/[0.06] to-yellow-500/[0.03] border-amber-500/20 hover:border-amber-500/30' 
              : 'bg-gradient-to-br from-cyan-500/[0.06] to-blue-500/[0.03] border-cyan-500/10 hover:border-cyan-500/20'
          }`}
        >
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${
            isMaxLevel ? 'bg-amber-500/5' : 'bg-cyan-500/5'
          }`} />
          <div className="relative flex items-center gap-3 px-4 py-2.5 text-left">
            <div className="flex-shrink-0">
              <BadgeLevel info={badgeInfo} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-bold text-white">{scansCount.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium uppercase ${isMaxLevel ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {badgeInfo.level} · {badgeInfo.label}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                </div>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full rounded-full ${isMaxLevel ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-gray-500">{scansCount.toLocaleString()} / {isMaxLevel ? '∞' : nextThreshold.toLocaleString()}</span>
                <span className="text-[9px] text-gray-500">
                  {isMaxLevel ? '🏆 Niveau max' : `Prochain : ${nextThreshold.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        </button>
      );
    })()}
  </div>
)}
    </div>


{/* 🔹 Carte profil utilisateur - DESIGN ULTRA PREMIUM */}
<motion.div
  whileHover={{ y: -3, scale: 1.015 }}
  whileTap={{ scale: 0.99 }}
  onClick={() => router.push('/dashboard/settings')}
  className={`
    relative
    p-4
    cursor-pointer
    transition-all duration-300
    flex items-center gap-4
    group
    overflow-visible
    rounded-2xl
    bg-gradient-to-br 
    ${
      subscription.plan === 'premium'
        ? 'from-cyan-900/30 via-blue-900/20 to-transparent'
        : subscription.plan === 'entreprise'
        ? 'from-purple-900/30 via-indigo-900/20 to-transparent'
        : 'from-blue-900/30 via-gray-900/20 to-transparent'
    }
    before:content-['']
    before:absolute
    before:inset-0
    before:bg-gradient-to-r
    before:from-transparent
    before:via-white/5
    before:to-transparent
    before:opacity-0
    group-hover:before:opacity-100
    before:transition-opacity
    before:duration-500
    border border-white/10
    backdrop-blur-xl
    shadow-xl
    shadow-black/40
    hover:shadow-2xl
    hover:shadow-cyan-500/10
    hover:border-cyan-500/30
    active:scale-[0.995]
  `}
>
  {/* 🌊 Fond animé */}
  <div className="absolute inset-0 overflow-hidden rounded-2xl">
    <div className="absolute -left-1/2 -top-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
  </div>

  {/* 🖼️ Avatar + statut + plan - CONTENEUR AMÉLIORÉ */}
  <div className="relative shrink-0">
    {/* 🔹 Cercle de fond animé */}
    <div className={`
      absolute inset-0 rounded-full
      ${
        subscription.plan === 'premium'
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
          : subscription.plan === 'entreprise'
          ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20'
          : 'bg-gradient-to-r from-blue-500/20 to-gray-500/20'
      }
      opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl
    `} />
    
    {/* 🔹 Avatar avec effet hover */}
    <div className={`
      relative rounded-full overflow-hidden
      transition-all duration-500
      group-hover:scale-105
      group-hover:rotate-3
      border-2
      ${
        subscription.plan === 'premium'
          ? 'border-cyan-400/50 group-hover:border-cyan-400'
          : subscription.plan === 'entreprise'
          ? 'border-purple-400/50 group-hover:border-purple-400'
          : 'border-blue-400/50 group-hover:border-blue-400'
      }
      shadow-2xl
      shadow-black/50
    `}>
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.full_name}
          className="w-16 h-16 object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          <User className="w-9 h-9 text-gray-300" />
        </div>
      )}
      
      {/* 🔹 Overlay dégradé */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>

    {/* 🟢 Statut en ligne - AMÉLIORÉ */}
    <div className="absolute -top-1 -right-1 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-75" />
        <div className="relative w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black shadow-lg shadow-green-500/50" />
      </div>
      <span className="absolute -right-8 -top-1 text-[10px] font-medium text-green-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        En ligne
      </span>
    </div>

    {/* 🔰 Icône plan - BADGE ÉLÉGANT */}
    <div className={`
      absolute -bottom-1.5 -right-1.5
      w-7 h-7
      rounded-xl
      flex items-center justify-center
      border-2 border-white/30
      shadow-2xl shadow-black/60
      z-20
      ${
        subscription.plan === 'premium'
          ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
          : subscription.plan === 'entreprise'
          ? 'bg-gradient-to-br from-purple-600 to-indigo-700'
          : 'bg-gradient-to-br from-blue-600 to-gray-700'
      }
      transform transition-all duration-300
      group-hover:scale-110
      group-hover:rotate-12
      overflow-hidden
    `}>
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      {subscription.plan === 'premium' && <Crown className="w-3.5 h-3.5 text-white drop-shadow-md" />}
      {subscription.plan === 'entreprise' && <Building className="w-3.5 h-3.5 text-white drop-shadow-md" />}
      {subscription.plan === 'basic' && <Star className="w-3.5 h-3.5 text-white drop-shadow-md" />}
      
      {/* 🔹 Étoile scintillante */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    </div>
  </div>

  {/* 👤 Infos utilisateur - AMÉLIORÉES */}
  <div className="relative flex-1 min-w-0 z-10">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200 group-hover:from-cyan-100 transition-all duration-300">
            {profile.full_name}
          </h3>
          {profile.verified && (
            <Badge className="bg-blue-500/20 border-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full">
              <Check className="w-3 h-3" />
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs font-medium text-cyan-300/90">@{profile.username}</p>
          <span className="text-[9px] text-gray-500">•</span>
          <div className={`
            flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full
            ${
              subscription.plan === 'premium'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                : subscription.plan === 'entreprise'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
            }
          `}>
            {subscription.plan === 'premium' && <Crown className="w-2.5 h-2.5" />}
            {subscription.plan === 'entreprise' && <Building className="w-2.5 h-2.5" />}
            {subscription.plan === 'basic' && <Star className="w-2.5 h-2.5" />}
            <span>
              {subscription.plan === 'premium' ? 'Premium' : 
               subscription.plan === 'entreprise' ? 'Entreprise' : 'Basic'}
            </span>
          </div>
        </div>
      </div>

      {/* 🔹 Indicateur de complétion - DESIGN ULTRA ÉLÉGANT */}
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          {/* 🔸 Badge pourcentage AMÉLIORÉ */}
          <div className={`
            flex items-center justify-center
            min-w-[32px] h-6 px-2
            rounded-xl
            text-xs font-bold
            shadow-lg
            ${
              profileCompletion >= 80
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                : profileCompletion >= 50
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-yellow-500/30'
                : 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-red-500/30'
            }
            transform transition-all duration-300
            group-hover:scale-105
            relative
            overflow-hidden
          `}>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {profileCompletion}%
            <div className="absolute -right-1 -top-1 w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          
          {/* 🔸 Icône contextuelle avec animation */}
          <motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 0.2 }}
/>
        </div>

        {/* 🔸 Barre de progression ÉLÉGANTE */}
        <div className="w-full mt-2">
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(profileCompletion, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`
                h-full rounded-full relative overflow-hidden
                ${
                  profileCompletion >= 80
                    ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600'
                    : profileCompletion >= 50
                    ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600'
                    : 'bg-gradient-to-r from-red-500 via-orange-500 to-red-600'
                }
                shadow-lg
              `}
            >
              {/* 🔹 Animation scintillante */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              
              {/* 🔹 Points lumineux */}
              <div className="absolute inset-0 flex items-center justify-between px-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-1 bg-white rounded-full"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          <p className="text-[11px] mt-1 text-right font-medium flex items-center justify-end gap-1">
  {profileCompletion >= 80 ? (
    <>
      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
      <span className="text-green-500">Profil complet</span>
    </>
  ) : profileCompletion >= 50 ? (
    <>
      <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
      <span className="text-yellow-500">Encore quelques infos</span>
    </>
  ) : (
    <>
      <User className="w-3.5 h-3.5 text-gray-400" />
      <span className="text-gray-400">Complétez votre profil</span>
    </>
  )}
</p>
        </div>
      </div>
    </div>

    {/* 🔹 Action au hover - AMÉLIORÉE */}
    <div className={`
      mt-3 p-2.5 rounded-xl
      bg-white/5 border border-white/10
      flex items-center justify-between
      opacity-0 group-hover:opacity-100
      translate-y-2 group-hover:translate-y-0
      transition-all duration-300
      group-hover:bg-gradient-to-r
      ${
        subscription.plan === 'premium'
          ? 'group-hover:from-cyan-500/10 group-hover:to-blue-500/10'
          : subscription.plan === 'entreprise'
          ? 'group-hover:from-purple-500/10 group-hover:to-indigo-500/10'
          : 'group-hover:from-blue-500/10 group-hover:to-gray-500/10'
      }
    `}>
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-cyan-400" />
        <span className="font-medium text-sm bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
          Modifier le profil
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-cyan-400 transform transition-transform group-hover:translate-x-1" />
    </div>
  </div>

  
</motion.div>
<style>{`
  @keyframes floatBubble {
    0% { transform: translateY(0) scale(0.6); opacity: 0.6; }
    100% { transform: translateY(-15px) scale(1.2); opacity: 0; }
  }
  .bubble {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 70%);
    pointer-events: none;
    filter: blur(0.2px);
    opacity: 0.4;
    animation: floatBubble 1.5s ease-out forwards;
    z-index: 1;
  }
  .bubble-1 { animation-delay: 0s; left: 25%; bottom: 1px; width: 2.5px; height: 2.5px; }
  .bubble-2 { animation-delay: 0.2s; left: 45%; bottom: 1px; width: 2px; height: 2px; }
  .bubble-3 { animation-delay: 0.4s; left: 65%; bottom: 1px; width: 3px; height: 3px; }
  .bubble-4 { animation-delay: 0.6s; left: 80%; bottom: 1px; width: 2.2px; height: 2.2px; }
  .dashboard-action-btn {
    position: relative;
    overflow: visible !important;
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
  }
  .dashboard-action-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.12) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
  }
  .dashboard-action-btn:hover::after {
    opacity: 1;
  }
  .dashboard-action-btn:hover {
    transform: translateY(-2px) scale(1.02) !important;
    box-shadow: var(--hover-shadow) !important;
  }
  .dashboard-action-btn:active {
    transform: translateY(0.5px) scale(0.985) !important;
  }
`}</style>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
  
  {/* 🌐 Voir mon profil public */}
  <Link href={`/${locale}/${profile.username}`} target="_blank" className="group">
    <div className={`
      dashboard-action-btn
      relative overflow-hidden
      rounded-2xl p-4
      bg-gradient-to-br from-cyan-500/10 to-blue-500/10
      border border-cyan-500/20
      hover:border-cyan-400/40
      transition-all duration-300
      cursor-pointer
      shadow-md shadow-cyan-500/5
      hover:shadow-xl hover:shadow-cyan-500/15
      [--hover-shadow:0_8px_25px_-5px_rgba(6,182,212,0.25),0_4px_10px_-5px_rgba(59,130,246,0.15)]
    `}
      onMouseMove={(e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
        btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
      }}
    >
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">Mon profil public</p>
          <p className="text-xs text-cyan-300/70 mt-0.5">@{profile.username}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
          <span className="text-cyan-300 text-sm">→</span>
        </div>
      </div>
    </div>
  </Link>

  {/* 🏢 Espace Business */}
  {subscription.plan === 'entreprise' && hasCompany && (
    <Link href="/dashboard/entreprise" className="group">
      <div className={`
        dashboard-action-btn
        relative overflow-hidden
        rounded-2xl p-4
        bg-gradient-to-br from-violet-500/10 to-purple-500/10
        border border-violet-500/20
        hover:border-violet-400/40
        transition-all duration-300
        cursor-pointer
        shadow-md shadow-violet-500/5
        hover:shadow-xl hover:shadow-violet-500/15
        [--hover-shadow:0_8px_25px_-5px_rgba(139,92,246,0.25),0_4px_10px_-5px_rgba(124,58,237,0.15)]
      `}
        onMouseMove={(e) => {
          const btn = e.currentTarget;
          const rect = btn.getBoundingClientRect();
          btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
          btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
        }}
      >
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <div className="bubble bubble-1" />
          <div className="bubble bubble-2" />
          <div className="bubble bubble-3" />
          <div className="bubble bubble-4" />
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-violet-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">Espace Business</p>
            <p className="text-xs text-violet-300/70 mt-0.5">Gérez votre organisation</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
            <span className="text-violet-300 text-sm">→</span>
          </div>
        </div>
      </div>
    </Link>
  )}
</div>

  {/* ========================================
   SECTION: Gestion des Cartes NFC
   ======================================== */}
<Card className={`glass-section border border-white/15 rounded-xl gap-4 mt-4 ${
  isTransparent 
    ? 'bg-transparent backdrop-blur-none' 
    : 'bg-white/5 backdrop-blur-sm'
}`}>
  <CardHeader className="border-b border-white/10 pb-4">
    <CardTitle className="flex items-center flex-wrap gap-3">
      {/* Icône NFC */}
      <div className="p-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg">
        <CreditCard className="w-5 h-5 text-purple-400" />
      </div>
      
      <span>{t('nfc.title') || 'Carte NFC'}</span>
      
      {/* Badge statut dynamique */}
      {loadingCards ? (
        <div className="w-20 h-6 bg-white/10 rounded-lg animate-pulse" />
      ) : hasOrderedCard ? (
        <Badge 
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
            ${
              activeCard?.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : activeCard?.status === 'lost'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : activeCard?.status === 'blocked'
                ? 'bg-red-500/15 text-red-300 border-red-500/30'
                : activeCard?.status === 'reported'
                ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                : 'bg-gray-500/15 text-gray-300 border-gray-500/30'
            }
          `}
        >
          {/* Icône selon statut */}
          {activeCard?.status === 'active' && <CheckCircle className="w-3 h-3" />}
          {activeCard?.status === 'lost' && <XCircle className="w-3 h-3" />}
          {activeCard?.status === 'blocked' && <ShieldAlert className="w-3 h-3" />}
          {activeCard?.status === 'reported' && <AlertTriangle className="w-3 h-3" />}
          {(!activeCard?.status || activeCard?.status === 'inactive') && <AlertTriangle className="w-3 h-3" />}
          
          {/* Label selon statut */}
          {activeCard?.status === 'active' && (t('nfc.active') || 'Active')}
          {activeCard?.status === 'lost' && (t('nfc.lost') || 'Perdue')}
          {activeCard?.status === 'blocked' && 'Bloquée'}
          {activeCard?.status === 'reported' && (t('nfc.reported') || 'Signalée')}
          {(!activeCard?.status || activeCard?.status === 'inactive') && (t('nfc.inactive') || 'Inactive')}
        </Badge>
      ) : (
        <Badge className="bg-red-500/15 text-red-300 border-red-500/30 inline-flex items-center gap-1.5">
          <XCircle className="w-3 h-3" />
          {t('nfc.none') || 'Aucune'}
        </Badge>
      )}

      {/* Badge de limite selon le plan */}
      {userPlan && (
        <Badge className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
          ${userPlan === 'business' 
            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' 
            : userPlan === 'professionnel'
            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
            : 'bg-gray-500/15 text-gray-300 border-gray-500/30'
          }
        `}>
          {userPlan === 'business' && <InfinityIcon className="w-3 h-3" />}
          {userPlan === 'professionnel' && <Layers className="w-3 h-3" />}
          {userPlan === 'gratuit' && <Circle className="w-3 h-3" />}
          
          {userPlan === 'business' && 'Illimité'}
          {userPlan === 'professionnel' && `${cards.length}/10`}
          {userPlan === 'gratuit' && `${cards.length}/1`}
        </Badge>
      )}
    </CardTitle>
  </CardHeader>
  
  <CardContent className="pt-4">
    {/* Message de limite atteinte */}
    {!canOrderMoreCards && hasOrderedCard && (
      <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p className="text-sm text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            {userPlan === 'gratuit' 
              ? 'Limite de carte NFC atteinte pour le plan Gratuit (1 carte maximum).'
              : 'Limite de cartes NFC atteinte pour le plan Professionnel (10 cartes maximum).'
            }
          </span>
        </p>
        <p className="text-xs text-amber-400/70 mt-1">
          Passez au plan supérieur pour commander plus de cartes NFC.
        </p>
      </div>
    )}

    {/* Message plan Gratuit : avertissement avant commande */}
    {!hasOrderedCard && userPlan === 'gratuit' && (
      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300 flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Le plan Gratuit inclut <strong>1 carte NFC</strong>. Une fois commandée, vous ne pourrez plus en commander d'autre.</span>
        </p>
      </div>
    )}

    {/* Cas 1: Pas de carte */}
    {!hasOrderedCard && (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-gray-300">
            {t('nfc.no_card_message') || 'Vous n\'avez pas encore de carte NFC LUVIKA.'}
          </p>
          <p className="text-sm text-gray-400">
            {t('nfc.no_card_description') || 'Commandez votre carte NFC personnalisée pour partager facilement vos informations en un simple tap.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">
                {t('nfc.benefit1_title') || 'Livraison rapide'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {t('nfc.benefit1_desc') || 'Recevez votre carte en 3-5 jours ouvrables'}
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">
                {t('nfc.benefit2_title') || 'Personnalisable'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {t('nfc.benefit2_desc') || 'Design unique avec votre QR code et infos'}
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">
                {t('nfc.benefit3_title') || 'Durabilité'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {t('nfc.benefit3_desc') || 'Carte en PVC haute qualité, résistante à l\'eau'}
            </p>
          </div>
        </div>

        {/* Bouton commander - toujours visible car pas de carte */}
        <Button
          onClick={handleOrderCard}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
          {t('nfc.order_button') || 'Commander ma carte NFC'}
          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    )}

    {/* Cas 2: A des cartes */}
    {hasOrderedCard && (
      <div className="space-y-4">
        {/* Message contextuel selon statut */}
        {activeCard?.status === 'lost' && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Carte déclarée perdue</span>
            </p>
            <p className="text-xs text-amber-400/70 mt-1">
              Votre carte a été désactivée. Commandez-en une nouvelle ou contactez le support.
            </p>
          </div>
        )}

        {activeCard?.status === 'blocked' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-medium">Carte bloquée</span>
            </p>
            <p className="text-xs text-red-400/70 mt-1">
              Votre carte a été bloquée pour des raisons de sécurité. Contactez le support pour la débloquer.
            </p>
          </div>
        )}

        {activeCard?.status === 'reported' && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm text-orange-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Carte signalée</span>
            </p>
            <p className="text-xs text-orange-400/70 mt-1">
              Votre carte est en cours de vérification par notre équipe.
            </p>
          </div>
        )}

        {/* Détails de la carte */}
        <div className="space-y-3">
          <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
            activeCard?.status === 'active'
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : activeCard?.status === 'lost'
              ? 'bg-amber-500/5 border-amber-500/20'
              : activeCard?.status === 'blocked'
              ? 'bg-red-500/5 border-red-500/20'
              : activeCard?.status === 'reported'
              ? 'bg-orange-500/5 border-orange-500/20'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeCard?.status === 'active'
                  ? 'bg-emerald-500/20'
                  : activeCard?.status === 'lost'
                  ? 'bg-amber-500/20'
                  : activeCard?.status === 'blocked'
                  ? 'bg-red-500/20'
                  : activeCard?.status === 'reported'
                  ? 'bg-orange-500/20'
                  : 'bg-purple-500/20'
              }`}>
                <CreditCard className={`w-5 h-5 ${
                  activeCard?.status === 'active' ? 'text-emerald-400' :
                  activeCard?.status === 'lost' ? 'text-amber-400' :
                  activeCard?.status === 'blocked' ? 'text-red-400' :
                  activeCard?.status === 'reported' ? 'text-orange-400' :
                  'text-purple-400'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {t('nfc.card_id') || 'Carte'} #{activeCard?.card_id || activeCard?.matricule || activeCard?.id?.slice(0, 8)}
                </p>
                <p className="text-xs text-gray-400">
                  Créée le {new Date(activeCard?.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {activeCard?.matricule && (
                  <p className="text-xs text-gray-500 font-mono">
                    Matricule: {activeCard.matricule}
                  </p>
                )}
              </div>
            </div>
            <Badge 
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                ${
                  activeCard?.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : activeCard?.status === 'lost'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : activeCard?.status === 'blocked'
                    ? 'bg-red-500/15 text-red-300 border-red-500/30'
                    : activeCard?.status === 'reported'
                    ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                    : 'bg-gray-500/15 text-gray-300 border-gray-500/30'
                }
              `}
            >
              {activeCard?.status === 'active' && <><CheckCircle className="w-3 h-3" /> Active</>}
              {activeCard?.status === 'lost' && <><XCircle className="w-3 h-3" /> Perdue</>}
              {activeCard?.status === 'blocked' && <><ShieldAlert className="w-3 h-3" /> Bloquée</>}
              {activeCard?.status === 'reported' && <><AlertTriangle className="w-3 h-3" /> Signalée</>}
              {(!activeCard?.status || activeCard?.status === 'inactive') && <><AlertTriangle className="w-3 h-3" /> Inactive</>}
            </Badge>
          </div>
        </div>

        {/* Liste de toutes les cartes (si plusieurs) */}
        {cards.length > 1 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300">Toutes vos cartes</h4>
              {userPlan !== 'business' && (
                <span className="text-xs text-gray-400">
                  {cards.length} / {userPlan === 'professionnel' ? '10' : '1'}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    card.status === 'active'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : card.status === 'lost'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : card.status === 'blocked'
                      ? 'bg-red-500/5 border-red-500/20'
                      : card.status === 'reported'
                      ? 'bg-orange-500/5 border-orange-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`relative flex h-2.5 w-2.5`}>
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        card.status === 'active' ? 'bg-emerald-400' :
                        card.status === 'lost' ? 'bg-amber-400' :
                        card.status === 'blocked' ? 'bg-red-400' :
                        card.status === 'reported' ? 'bg-orange-400' :
                        'bg-gray-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        card.status === 'active' ? 'bg-emerald-400' :
                        card.status === 'lost' ? 'bg-amber-400' :
                        card.status === 'blocked' ? 'bg-red-400' :
                        card.status === 'reported' ? 'bg-orange-400' :
                        'bg-gray-400'
                      }`} />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white">
                        Carte #{card.card_id || card.matricule || card.id.slice(0, 8)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(card.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] ${
                    card.status === 'active' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                    card.status === 'lost' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                    card.status === 'blocked' ? 'bg-red-500/15 text-red-300 border-red-500/30' :
                    card.status === 'reported' ? 'bg-orange-500/15 text-orange-300 border-orange-500/30' :
                    'bg-gray-500/15 text-gray-300 border-gray-500/30'
                  }`}>
                    {card.status === 'active' && 'Active'}
                    {card.status === 'lost' && 'Perdue'}
                    {card.status === 'blocked' && 'Bloquée'}
                    {card.status === 'reported' && 'Signalée'}
                    {(!card.status || card.status === 'inactive') && 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              loadNfcCards();
              setIsNFCModalOpen(true);
            }}
            className="flex-1 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-purple-300 font-semibold py-3 rounded-lg transition-all duration-300 group relative"
          >
            <Settings className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            {t('nfc.manage_button') || 'Gérer mes cartes'}
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Bouton Commander - visible seulement si peut encore commander */}
          {canOrderMoreCards ? (
            <Button
              onClick={handleOrderCard}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              {t('nfc.order_another') || 'Commander une autre'}
            </Button>
          ) : (
            <Button
              disabled
              className="flex-1 bg-gray-600/50 text-gray-400 font-semibold py-3 rounded-lg cursor-not-allowed border border-gray-500/20"
            >
              <Lock className="mr-2 h-4 w-4" />
              Limite atteinte
            </Button>
          )}
        </div>

        {/* Bouton upgrade pour plans limités */}
        {!canOrderMoreCards && userPlan !== 'business' && (
          <Button
            onClick={handleUpgradePlan}
            className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 font-semibold py-3 rounded-lg transition-all duration-300"
          >
            <Zap className="mr-2 h-4 w-4" />
            {userPlan === 'gratuit' 
              ? 'Passer au plan Professionnel ou Business'
              : 'Passer au plan Business (illimité)'
            }
          </Button>
        )}

        {/* Message d'information */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            <span className="font-medium">{t('nfc.tip') || '💡 Astuce:'}</span>{' '}
            {t('nfc.tip_message') || 'Personnalisez le contenu de votre carte NFC dans les paramètres pour contrôler les informations partagées.'}
          </p>
        </div>
      </div>
    )}

    {/* Indicateur de chargement */}
    {loadingCards && (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-gray-400">Chargement...</span>
      </div>
    )}
  </CardContent>
</Card>
  {/* 🔹 Abonnement - Design avec barre de jours restants */}
<motion.div
  whileHover={{ y: -1 }}
  className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-full transition-all duration-300 hover:border-cyan-500/30  gap-4 mt-4"
>
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center flex-wrap gap-3">
      <div className={`p-2 rounded-lg ${
        subscription.plan === 'premium' ? 'bg-cyan-500/10 text-cyan-400' :
        subscription.plan === 'entreprise' ? 'bg-purple-500/10 text-purple-400' :
        'bg-blue-500/10 text-blue-400'
      }`}>
        <CreditCard className="w-5 h-5" />
      </div>
      
      <span className="text-lg font-semibold text-white">{t('subscription.title')}</span>
      
      <Badge className={`text-xs font-medium ${
        subscription.plan === 'premium' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
        subscription.plan === 'entreprise' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
        'bg-blue-500/20 text-blue-300 border-blue-500/30'
      }`}>
        {subscription.plan === 'premium' && <Crown className="w-3 h-3 mr-1" />}
        {subscription.plan === 'entreprise' && <Building className="w-3 h-3 mr-1" />}
        {t(`subscription.plans.${subscription.plan}`) || subscription.plan}
      </Badge>

      <div className="flex items-center gap-1.5 ml-auto">
        <div className={`w-2 h-2 rounded-full ${subscription.active ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
        <span className={`text-xs ${subscription.active ? 'text-green-400' : 'text-yellow-400'}`}>
          {subscription.active ? 'Actif' : 'Inactif'}
        </span>
      </div>
    </CardTitle>
  </CardHeader>
  
  <CardContent className="pt-0 space-y-4">
    {/* Barre de progression des jours restants - DONNÉES RÉELLES */}
    {subscription.active && subscription.expires_at && (
      <div className="space-y-2">
        {(() => {
          const now = new Date();
          const expiresAt = new Date(subscription.expires_at);
          const startedAt = subscription.started_at ? new Date(subscription.started_at) : new Date(expiresAt.getTime() - 30 * 86400000);
          
          const totalDuration = expiresAt.getTime() - startedAt.getTime();
          const elapsed = now.getTime() - startedAt.getTime();
          const remaining = expiresAt.getTime() - now.getTime();
          
          const totalDays = Math.ceil(totalDuration / 86400000);
          const remainingDays = Math.max(0, Math.ceil(remaining / 86400000));
          const elapsedDays = totalDays - remainingDays;
          const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
          
          const getBarColor = () => {
            if (remainingDays <= 5) return 'from-red-500 to-rose-500';
            if (remainingDays <= 10) return 'from-amber-500 to-orange-500';
            return 'from-emerald-500 to-teal-500';
          };

          const getTextColor = () => {
            if (remainingDays <= 5) return 'text-red-400';
            if (remainingDays <= 10) return 'text-amber-400';
            return 'text-emerald-400';
          };

          return (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-400/60 font-light">Période d'abonnement</span>
                <span className={`text-[11px] font-medium ${getTextColor()}`}>
                  {remainingDays} jour{remainingDays > 1 ? 's' : ''} restant{remainingDays > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="relative h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${getBarColor()}`}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-lg" />
                </motion.div>
              </div>

              <div className="flex justify-between text-[9px] text-gray-500/40 font-light">
                <span>{startedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                <span className={remainingDays <= 5 ? 'text-red-400/60' : ''}>
                  {remainingDays <= 5 ? '⚠️ Expire bientôt' : `Expire le ${expiresAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                </span>
                <span>{expiresAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
              </div>
            </>
          );
        })()}
      </div>
    )}

    {/* Si pas de date d'expiration (abonnement à vie) */}
{subscription.active && !subscription.expires_at && (
  <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15 text-center">
    <p className="text-xs text-emerald-400/60 font-light">
      {subscriptionData?.status === 'active' && !subscriptionData?.expires_at 
        ? 'Abonnement à vie — pas de date d\'expiration' 
        : 'Abonnement actif'}
    </p>
  </div>
)}

    {/* Carte info */}
    <div className={`p-3 rounded-xl border ${
      subscription.active 
        ? 'bg-emerald-500/[0.04] border-emerald-500/15' 
        : 'bg-amber-500/[0.04] border-amber-500/15'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400/60 font-light">Plan actuel</span>
        <span className={`text-xs font-medium ${
          subscription.plan === 'premium' ? 'text-cyan-400' :
          subscription.plan === 'entreprise' ? 'text-purple-400' : 'text-blue-400'
        }`}>
          {subscription.plan === 'premium' ? 'Premium' :
           subscription.plan === 'entreprise' ? 'Entreprise' : 'Basic'}
        </span>
      </div>
      {subscription.active ? (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400/60 font-light">Renouvellement</span>
          <span className="text-xs text-gray-400/60 font-light">Automatique</span>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400/60 font-light">Statut</span>
          <span className="text-xs text-amber-400/60 font-light">Inactif</span>
        </div>
      )}
    </div>

    {/* Message */}
    {subscription.active ? (
      <p className="text-xs text-gray-400/50 font-light">Votre abonnement est actif et renouvelé automatiquement.</p>
    ) : (
      <p className="text-xs text-gray-400/50 font-light">💡 Passez au niveau supérieur pour débloquer toutes les fonctionnalités.</p>
    )}
    
    {/* Bouton d'upgrade */}
    {profile.plan !== 'entreprise' && (
      <>
        {checkingUpgrade ? (
          <div className="w-full mt-2 h-9 bg-white/[0.03] rounded-xl animate-pulse" />
        ) : upgradeStatus === 'pending' ? (
          <button disabled className="w-full mt-2 h-9 inline-flex items-center justify-center gap-2 text-xs bg-amber-500/10 text-amber-300/60 border border-amber-500/20 font-light rounded-xl cursor-not-allowed">
            <Clock className="w-4 h-4" />
            Demande en attente
          </button>
        ) : (
          <button
            onClick={() => setActiveModal('upgrade')}
            className={`w-full mt-2 h-9 inline-flex items-center justify-center gap-2 text-xs font-light rounded-xl transition-all ${
              profile.plan === 'basic'
                ? 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white'
                : 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 text-white'
            }`}
          >
            {profile.plan === 'basic' ? (
              <><Crown className="w-4 h-4" />Passer à Premium</>
            ) : (
              <><Building className="w-4 h-4" />Passer à Entreprise</>
            )}
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        )}
      </>
    )}
  </CardContent>
</motion.div>
      {/* 🔹 Menu flottant - reste en overlay */}
    <DashboardQuickMenu 
      onAction={handleQuickAction} 
      actions={quickActions} 
      userPlan={userPlan}
    />

{/* 🔹 MODAL RÉCOMPENSE 10K SCANS - Design léger */}
<AnimatePresence>
  {showRewardModal && (
    <motion.div
      key="scan-reward-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowRewardModal(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-900/95 rounded-2xl border border-white/[0.06] shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Lueur subtile */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="relative p-5">
          {/* Icône + Titre sur même ligne */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-500/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
            </motion.div>
            <div>
              <h2 className="text-base font-semibold text-white">10 000 Scans !</h2>
              <p className="text-[11px] text-amber-400/60 font-light">Récompense débloquée</p>
            </div>
          </div>

          {/* Carte récompense */}
          <div className="bg-gradient-to-br from-amber-500/[0.04] to-yellow-500/[0.02] border border-amber-500/10 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-light">Réduction abonnement</span>
              <span className="text-lg font-bold text-amber-400">-5%</span>
            </div>
            <div className="h-px bg-white/[0.04] mb-2" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-light">Valable sur le prochain paiement</span>
              <span className="text-[10px] text-emerald-400/60 bg-emerald-500/5 px-2 py-0.5 rounded-full">Activable</span>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowRewardModal(false)}
              className="flex-1 h-9 text-xs text-gray-500 hover:text-gray-300 hover:bg-white/[0.02] font-light rounded-xl transition-all"
            >
              Plus tard
            </button>
            <button
              onClick={handleApplyScanReward}
              className="flex-1 h-9 text-xs bg-amber-500/90 hover:bg-amber-400 text-white font-medium rounded-xl transition-all shadow-sm shadow-amber-500/10"
            >
              Activer la réduction
            </button>
          </div>

          <p className="text-[10px] text-gray-600 text-center mt-3 font-light">
            Appliquée automatiquement lors de votre prochain paiement
          </p>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* 🔹 MODAL CLASSEMENT - Top 5 avec badge réduction */}
<AnimatePresence>
  {showLeaderboardModal && (
    <motion.div
      key="leaderboard-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowLeaderboardModal(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-900/95 rounded-2xl border border-white/[0.06] shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-yellow-500/20 border border-amber-500/20 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white/80">Top Scanners</h2>
              <p className="text-[10px] text-gray-500 font-light">Les plus actifs</p>
            </div>
          </div>
          <button
            onClick={() => setShowLeaderboardModal(false)}
            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Podium compact */}
        <div className="flex items-end justify-center gap-3 py-4 border-b border-white/[0.04]">
          {/* 2ème */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300/20 to-slate-400/10 border border-slate-400/20 flex items-center justify-center mb-1">
              <Trophy className="w-4 h-4 text-slate-300" />
            </div>
            <div className="w-14 h-10 bg-gradient-to-t from-slate-400/10 to-transparent rounded-t-lg border border-slate-400/10 flex items-center justify-center">
              <span className="text-base font-bold text-slate-300">2</span>
            </div>
          </div>

          {/* 1er */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center mb-1"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
            </motion.div>
            <div className="w-14 h-14 bg-gradient-to-t from-amber-400/10 to-transparent rounded-t-lg border border-amber-400/20 flex items-center justify-center">
              <span className="text-xl font-bold text-amber-400">1</span>
            </div>
          </div>

          {/* 3ème */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 border border-orange-400/20 flex items-center justify-center mb-1">
              <Trophy className="w-4 h-4 text-orange-300" />
            </div>
            <div className="w-14 h-8 bg-gradient-to-t from-orange-400/10 to-transparent rounded-t-lg border border-orange-400/10 flex items-center justify-center">
              <span className="text-base font-bold text-orange-300">3</span>
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className="p-3 max-h-[50vh] overflow-y-auto">
          {loadingLeaderboard ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-light">Aucune donnée</p>
            </div>
          ) : (
            <div className="space-y-1">
              {leaderboardData.map((user, index) => {
                const positionStyles = [
                  { bg: 'bg-amber-500/5', border: 'border-amber-500/10', badge: 'bg-amber-400/20 text-amber-400' },
                  { bg: 'bg-slate-400/5', border: 'border-slate-400/10', badge: 'bg-slate-300/20 text-slate-300' },
                  { bg: 'bg-orange-500/5', border: 'border-orange-500/10', badge: 'bg-orange-400/20 text-orange-400' },
                  { bg: 'bg-white/[0.02]', border: 'border-white/[0.04]', badge: 'bg-white/[0.06] text-gray-400' },
                  { bg: 'bg-white/[0.02]', border: 'border-white/[0.04]', badge: 'bg-white/[0.06] text-gray-400' },
                ];
                const s = positionStyles[index] || positionStyles[4];
                const badges = user.badges || [];
                const hasReward = badges.includes('scan_10k_reward');

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-pointer ${s.bg} ${s.border}`}
                    onClick={() => window.open(`/${locale}/${user.username}`, '_blank')}
                  >
                    {/* Position */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.badge}`}>
                      {index <= 2 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-white/70 font-medium truncate">
                          {user.full_name || user.username}
                        </p>
                        {/* Badge réduction -5% */}
                        {hasReward && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5 flex-shrink-0">
                            <Trophy className="w-2.5 h-2.5" />
                            -5%
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 font-light">@{user.username}</p>
                    </div>

                    {/* Scans */}
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-bold tabular-nums ${index === 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                        {(user.scans_count || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/[0.04] flex justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-gray-500 font-light">Temps réel</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
  {/* 🔹 MODAL ÉVÉNEMENTS */}
  {isEventModalOpen && (
    <motion.div
      key="event-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setIsEventModalOpen(false)}
    >
              <motion.div
                initial={{ 
                  scale: 0.95, 
                  opacity: 0,
                  y: 20 
                }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  y: 0,
                  transition: { 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 300,
                    mass: 0.5
                  }
                }}
                exit={{ 
                  scale: 0.95, 
                  opacity: 0,
                  y: 20,
                  transition: { duration: 0.2 }
                }}
                className="relative w-full max-w-4xl h-[90vh] flex flex-col bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/10"
                onClick={e => e.stopPropagation()}
              >
                {/* 🔘 Bouton fermeture (toujours visible) */}
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-gray-300 hover:text-white transition-all duration-300 shadow-lg shadow-black/50 backdrop-blur-sm"
                  aria-label="Fermer la fenêtre"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>

                {/* 📱 CONTENEUR SCROLL PRINCIPAL - Structure optimale */}
                <div className="flex-1 min-h-0 overflow-y-auto ">

                  {/* 🔹 HEADER FIXE (ne scroll pas) */}
<div className="sticky top-0 z-40 bg-gradient-to-b from-gray-900/95 to-transparent backdrop-blur-sm border-b border-white/10 py-4 px-6">
  <div className="flex items-center gap-3">
    <div className="p-2 bg-cyan-500/10 rounded-xl">
      <Calendar className="w-6 h-6 text-cyan-400" />
    </div>

    <div className="flex-1">
      <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
        Gestion des événements
      </h2>
      <p className="mt-1.5 text-sm text-gray-400 max-w-2xl">
        Visualisez les participants, scannez des QR codes et gérez vos événements en temps réel
      </p>
    </div>

    {/* Responsive actions: desktop (md+) inline, mobile (<md) dropdown */}

<div className="ml-4">
  {/* Desktop buttons */}
  <div className="hidden md:flex items-center gap-2">
    <button
      onClick={() => toggleArchive(selectedEventId!, true)}
      disabled={isActionLoading || !selectedEventId}
      className="px-3 py-1 rounded-md bg-amber-600 text-white text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Archiver l'événement"
    >
      Archiver
    </button>

    <button
      onClick={() => toggleArchive(selectedEventId!, false)}
      disabled={isActionLoading || !selectedEventId}
      className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Désarchiver l'événement"
    >
      Désarchiver
    </button>

    <button
      onClick={() => handleDeleteEvent(selectedEventId!)}
      disabled={isActionLoading || !selectedEventId}
      className="px-3 py-1 rounded-md bg-red-600 text-white text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Supprimer l'événement"
    >
      Supprimer
    </button>
  </div>

  {/* Mobile: compact menu */}
  <div className="relative md:hidden" ref={actionsRef}>
    <button
      onClick={() => setActionsOpen((s) => !s)}
      aria-expanded={actionsOpen}
      aria-haspopup="menu"
      className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-200"
      title="Actions"
      type="button"
    >
      <MoreHorizontal className="w-5 h-5" />
    </button>

    {/* Dropdown panel */}
    <div
      role="menu"
      aria-label="Actions événement"
      className={`absolute right-0 mt-2 w-44 origin-top-right rounded-md ring-1 ring-black/30 bg-gray-800 shadow-lg z-50 ${
        actionsOpen ? 'block' : 'hidden'
      }`}
    >
      <div className="py-1">
        <button
          role="menuitem"
          onClick={() => { setActionsOpen(false); toggleArchive(selectedEventId!, true); }}
          disabled={isActionLoading || !selectedEventId}
          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Archiver
        </button>

        <button
          role="menuitem"
          onClick={() => { setActionsOpen(false); toggleArchive(selectedEventId!, false); }}
          disabled={isActionLoading || !selectedEventId}
          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Désarchiver
        </button>

        <button
          role="menuitem"
          onClick={() => { setActionsOpen(false); handleDeleteEvent(selectedEventId!); }}
          disabled={isActionLoading || !selectedEventId}
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</div>
  </div>
</div>

                  {/* 🔹 CONTENU SCROLLABLE (zone principale) */}
                  <div className="flex-grow overflow-y-auto overscroll-contain py-4 px-4 sm:px-6 md:px-8">
                    {/* ✅ Contenu principal avec gestion de scroll */}
                    <div className="space-y-6">
<EventAttendeesSection
  plan={profile.plan ?? null}
  onSelectEvent={(id) => setSelectedEventId(id)}
/>                     
                      {/* 🔹 Espacement en bas pour le footer */}
                      <div className="h-6" />
                    </div>
                  </div>

                  {/* 🔹 FOOTER FIXE (ne scroll pas) */}
                  <div className="sticky bottom-0 z-40 bg-gradient-to-t from-gray-900/95 to-transparent backdrop-blur-sm border-t border-white/10 py-4 px-6">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      <span>Données mises à jour en temps réel</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

{/* 🔹 MODAL CRÉATION ÉVÉNEMENT - SCROLL FONCTIONNEL ET COULEURS CORRIGÉES */}
{isEventFormOpen && (
  <motion.div
    key="event-form-modal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
    exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    onClick={() => setIsEventFormOpen(false)}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 backdrop-blur-xl rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-900/50"
      onClick={e => e.stopPropagation()}
    >
      {/* 🌿 Décorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* 🔘 Bouton fermeture */}
      <button
        onClick={() => setIsEventFormOpen(false)}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-gray-300 hover:text-white transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10 p-6">
        {/* HEADER */}
        <div className="mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
              <Plus className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Créer un nouvel événement</h2>
              <p className="text-xs text-cyan-200/70 mt-0.5">Configuration rapide et sécurisée</p>
            </div>
          </div>
        </div>

        {/* FORMULAIRE */}
        <CreateEventForm
          onSubmit={async (data) => {
            try {
              const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
                throw new Error(errorData.error || 'Échec de la création');
              }
              
              const eventData = await response.json();
              console.log('✅ Événement créé:', eventData);
              setIsEventFormOpen(false);
              toast.success('🎉 Événement créé avec succès !');
            } catch (error: any) {
              console.error('❌ Erreur création:', error);
              toast.error('❌ Erreur lors de la création', {
                description: error.message || "Vérifiez vos informations et réessayez.",
                duration: 5000,
              });
            }
          }}
          onClose={() => setIsEventFormOpen(false)}
          isLoading={false}
        />

        {/* FOOTER */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            Données sécurisées et chiffrées
          </p>
        </div>
      </div>
    </motion.div>
  </motion.div>
)}
  
  {/* 🔹 MODAUX INDÉPENDANTS - CLÉS STATIQUES (pas de Date.now !) */}
  {isPortfolioModalOpen && (
  <PortfolioModal
    key="portfolio-modal"
    isOpen={true}
    onClose={() => setIsPortfolioModalOpen(false)}
    profileId={profile.id}
    onSuccess={refreshProfile}   // 👈 callback après sauvegarde
  />
)}
{isCertificatesModalOpen && (
  <CertificatesModal
    key="certificates-modal"
    isOpen={true}
    onClose={() => setIsCertificatesModalOpen(false)}
    profileId={profile.id}
    onSuccess={refreshProfile}
  />
)}
  {activeModal === 'upgrade' && profile.plan !== 'entreprise' && (
    <UpgradeModal
      key="modal-upgrade"
      isOpen={true}
      onClose={closeModal}
      onConfirm={handleUpgradeRequest}
      isSubmitting={isSubmitting}
    />
  )}
  {activeModal === 'followers' && (
    <FollowersModal
      key="modal-followers"
      isOpen={true}
      onClose={closeModal}
      profileId={profile.id}
      totalFollowers={totalFollowers || 0}
    />
  )}

{isContactModalOpen && (
  <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-gray-900/95 to-black/95 border border-white/10 shadow-2xl">
      <ContactRequestsModal
        isOpen={true}
        onClose={() => {
          setIsContactModalOpen(false);
          // ✅ Rafraîchir le compteur à la fermeture du modal
          fetchUnreadMessagesCount();
        }}
        onMarkAsRead={updateUnreadCount}
      />
    </div>
  </div>
)}

{/* 🔹 MODAL MESSAGES (avec réponse) */}
{activeModal === 'message' && (
  <CustomMessageModal
    isOpen={true}
    onClose={closeModal}
    messages={messages}
    replyingTo={replyingTo}
    replyContent={replyContent}
    onReplyChange={(v) => {
      if (v === '') {
        setReplyingTo(null);
      }
      setReplyContent(typeof v === 'string' ? v : '');
    }}
    onSendReply={handleSendReply}
    onSendCustomMessage={handleSendCustomMessage}
    customMessage={customMessage}
    onCustomMessageChange={setCustomMessage}
    sending={sendingReply}
  />
)}
{showSignOutConfirm && (
  <SignOutConfirmSheet
    isOpen={true}
    onClose={() => setShowSignOutConfirm(false)}
    onConfirm={handleLogout}
    tNavbar={tNavbar}
  />
)}

  {/* 🔹 MODAUX NFC - CONDITIONNELS AVEC CLÉS EXPLICITES */}
  {isNFCModalOpen && ( // ✅ Conditionnel + key explicite
    <NFCModal
      key="nfc-modal" // 🔑 CLÉ MANQUANTE AJOUTÉE
      isOpen={true}
      onClose={() => setIsNFCModalOpen(false)}
      cards={nfcCards}
      onManageCard={(card) => {
        setSelectedCardForManagement(card);
        setIsNFCModalOpen(false);
        setIsManagementModalOpen(true);
      }}
    />
  )}
  {isManagementModalOpen && ( // ✅ Conditionnel + key explicite
    <NFCManagementModal
      key="nfc-management-modal" // 🔑 CLÉ MANQUANTE AJOUTÉE
      isOpen={true}
      onClose={() => {
        setIsManagementModalOpen(false);
        setSelectedCardForManagement(null);
      }}
      card={selectedCardForManagement}
      onActionComplete={() => {
        loadNfcCards();
        toast.success('✅ Action effectuée avec succès');
      }}
    />
  )}
 {/* 🔹 MODAL RECHERCHE - AJOUT DE key */}
  {isSearchModalOpen && (
    <motion.div
      key="search-modal" // 🔑 CLÉ MANQUANTE AJOUTÉE
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setIsSearchModalOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-2xl p-6 border border-white/15 h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🔹 En-tête du modal */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Search className="w-6 h-6 text-purple-400" />
              Rechercher des profils Luvika
            </h2>
            <p className="text-sm text-gray-400">
              Trouvez et suivez d'autres utilisateurs de la plateforme
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchModalOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 🔹 Barre de recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* 🔹 Indicateur de chargement */}
        {isSearching && searchQuery && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mr-3" />
            <span className="text-gray-400 text-lg">Recherche en cours...</span>
          </div>
        )}

        {/* 🔹 Résultats de recherche */}
{searchQuery && !isSearching && searchResults.length > 0 && (
  <div className="space-y-3">
    {searchResults.map((result, index) => (
      <div
        key={result.id ?? result.username ?? `search-${index}`}
        onClick={() => router.push(`/${locale}/${result.username}`)}
        className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center overflow-hidden">
              {result.avatar_url ? (
                <img
                  src={result.avatar_url}
                  alt={result.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium text-white truncate">
                  {result.full_name}
                </div>
                {result.plan && (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {result.plan}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-400 truncate">
                @{result.username}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Empêche la redirection vers le profil
                handleToggleFollow(result.id);
              }}
              className={`h-9 ${
                followStatus[result.id]
                  ? 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
            >
              {followStatus[result.id] ? (
                <>
                  <UserMinus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Suivi</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Suivre</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/${locale}/${result.username}`, '_blank');
              }}
              className="h-9 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

        {/* 🔹 Message "Aucun résultat" */}
        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
            <div className="flex justify-center mb-4">
              <Search className="w-12 h-12 text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg mb-2">
              Aucun utilisateur trouvé pour "{searchQuery}"
            </p>
            <p className="text-gray-500 text-sm">
              Essayez un autre nom ou username
            </p>
          </div>
        )}

        {/* 🔹 Message initial */}
        {!searchQuery && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Commencez à taper pour rechercher...</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      {/* Modal succès */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t('subscription.success_title') || '✅ Succès !'}
        message={t('subscription.success_message') || 'Un admin vous contactera sous 24h.'}
      />
    </div>
  );
}