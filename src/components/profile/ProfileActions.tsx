'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, QrCode, Share2, Mail, 
  ChevronUp, ChevronDown, X, 
  Download, Copy, Check 
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PublicProfile } from '../../types/profile';

type Props = {
  profile: PublicProfile;
  setShowQRModal: (val: boolean) => void;
  onContactClick?: () => void;
};

export default function FloatingButtons({ profile, setShowQRModal, onContactClick }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic en dehors
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen]);

  // Son léger (optionnel)
  const playSound = () => {
    if (typeof window !== 'undefined' && window.Audio) {
      const audio = new Audio('/tap.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }
  };

  const vibrate = (duration: number = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  // Télécharger vCard
  const downloadVCard = () => {
    playSound();
    vibrate(20);
    
    const { full_name = '', job_title = '', company = '', email = '', phone = '', whatsapp = '', address = '', city = '', country = '', website = '', username = '' } = profile;
    const profileUrl = `https://luvika.me/${username}`;
    const fullAddress = [address, city, country].filter(Boolean).join('; ');

    const vCardContent = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${full_name}`,
      job_title && `TITLE:${job_title}`,
      company && `ORG:${company}`,
      email && `EMAIL:${email}`,
      phone && `TEL;TYPE=WORK,VOICE:${phone}`,
      whatsapp && `TEL;TYPE=CELL,VOICE:${whatsapp}`,
      fullAddress && `ADR;TYPE=WORK:;;${fullAddress}`,
      website && `URL:${website}`,
      `NOTE:LUVIKA — ${profileUrl}`,
      'END:VCARD',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username || 'contact'}.vcf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Partager le profil
  const shareProfile = async () => {
    playSound();
    vibrate(20);
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name || 'Profil LUVIKA'}`,
          text: 'Découvrez ce profil sur LUVIKA',
          url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  // Copier dans le presse-papier
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const buttons = [
    { 
      id: 'vcard',
      label: 'Carte de visite', 
      icon: <Download className="w-4 h-4" />, 
      onClick: downloadVCard, 
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      description: 'Téléchargez ma carte'
    },
    { 
      id: 'qrcode',
      label: 'QR Code', 
      icon: <QrCode className="w-4 h-4" />, 
      onClick: () => { playSound(); vibrate(20); setShowQRModal(true); }, 
      gradient: 'from-purple-500 to-violet-500',
      bgGradient: 'from-purple-500/20 to-violet-500/20',
      description: 'Scanner mon QR'
    },
    { 
      id: 'share',
      label: 'Partager', 
      icon: <Share2 className="w-4 h-4" />, 
      onClick: shareProfile, 
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/20 to-orange-500/20',
      description: 'Partager mon profil'
    },
    { 
      id: 'contact',
      label: 'Message', 
      icon: <Mail className="w-4 h-4" />, 
      onClick: () => { playSound(); vibrate(20); onContactClick?.(); }, 
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/20 to-teal-500/20',
      description: 'Envoyer un message'
    },
  ];

  // Variantes d'animation corrigées
  const menuVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: { 
        staggerChildren: 0.03,
        staggerDirection: -1
      }
    }
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, x: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      x: 20, 
      scale: 0.8,
      transition: { duration: 0.15 }
    }
  };

  return (
    <>
      {/* Backdrop avec blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu flottant */}
      <motion.div
        ref={containerRef}
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Tooltip minimal */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute -top-12 right-0 bg-white/95 backdrop-blur-lg text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-gray-200/50 whitespace-nowrap pointer-events-none"
            >
              <span className="flex items-center gap-1.5">
                Menu
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons du menu */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="menu"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-3 flex flex-col items-end gap-2"
            >
              {buttons.map((btn) => (
                <motion.button
                  key={btn.id}
                  variants={buttonVariants}
                  whileHover={{ scale: 1.05, x: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    btn.onClick();
                    setIsOpen(false);
                  }}
                  className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl backdrop-blur-md border transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${btn.bgGradient.split(' ')[1]} 0%, ${btn.bgGradient.split(' ')[3]} 100%)`,
                    borderColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  {/* Icône */}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${btn.gradient} flex items-center justify-center shadow-md transition-transform group-hover:scale-110`}>
                    {btn.icon}
                  </div>
                  
                  {/* Texte */}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {btn.label}
                    </p>
                    <p className="text-[10px] text-white/60">
                      {btn.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton principal */}
        <motion.button
          onClick={() => {
            playSound();
            vibrate(10);
            setIsOpen(!isOpen);
          }}
          className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300"
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 0.95 : 1,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {/* Gradient background */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 transition-all duration-300 ${isOpen ? 'opacity-90' : 'opacity-100'}`} />
          
          {/* Effet de brillance */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent" />
          
          {/* Pulsation (quand fermé) */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-cyan-400"
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.5, 0, 0.5] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
            />
          )}
          
          {/* Icône */}
          <div className="relative z-10 text-white">
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <ChevronUp className="w-6 h-6" />
            )}
          </div>
        </motion.button>
      </motion.div>

      {/* Notification de copie */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 bg-gray-900/95 backdrop-blur-lg text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium border border-white/10"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Lien copié dans le presse-papier
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}