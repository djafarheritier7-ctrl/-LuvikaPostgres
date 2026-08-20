// src/components/download/DownloadContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, QrCode, Scan, Nfc, Smartphone, 
  CreditCard, Share2, Zap, ArrowRight, CheckCircle2,
  Smartphone as AndroidIcon, Apple, Monitor, Shield
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ProfileCard3D = dynamic(
  () => import('@/components/cards/ProfileCard3D'),
  {
    loading: () => (
      <div className="w-full aspect-[16/9] max-w-[480px] mx-auto rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    ),
    ssr: false
  }
);

type Step = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  highlight?: string;
};

type Platform = {
  icon: React.ReactNode;
  name: string;
  description: string;
  url: string;
  available: boolean;
  version?: string;
  size?: string;
  comingSoon?: boolean;
};

export default function DownloadContent({
  title,
  subtitle,
  step1_title,
  step1_desc,
  step2_title,
  step2_desc,
  step3_title,
  step3_desc,
  cta_title,
  cta_desc,
  download_now,
}: {
  title: string;
  subtitle: string;
  step1_title: string;
  step1_desc: string;
  step2_title: string;
  step2_desc: string;
  step3_title: string;
  step3_desc: string;
  cta_title: string;
  cta_desc: string;
  download_now: string;
}) {
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // ✅ Plateformes disponibles
  const platforms: Platform[] = [
    {
      icon: <AndroidIcon className="w-6 h-6" />,
      name: 'Android APK',
      description: 'Téléchargez directement le fichier APK pour Android',
      url: '/downloads/luvika-latest.apk',
      available: true,
      version: 'v2.4.1',
      size: '40,2 Mo',
    },
    {
      icon: <Apple className="w-6 h-6" />,
      name: 'App Store',
      description: 'Bientôt disponible sur l\'App Store',
      url: '#',
      available: false,
      comingSoon: true,
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      name: 'Web App',
      description: 'Utilisez la version web sans installation',
      url: '/',
      available: true,
      version: 'v2.4.1',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Démo automatique du scan
  useEffect(() => {
    if (loading) return;
    const demoInterval = setInterval(() => {
      setShowDemo(true);
      setTimeout(() => setShowDemo(false), 2000);
    }, 6000);
    return () => clearInterval(demoInterval);
  }, [loading]);

  const steps: Step[] = [
    {
      icon: <Download className="w-5 h-5" />,
      title: step1_title,
      desc: step1_desc,
      highlight: 'APK',
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: step2_title,
      desc: step2_desc,
      highlight: 'NFC',
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: step3_title,
      desc: step3_desc,
      highlight: 'Instant',
    },
  ];

  const handleDownload = (platform: Platform) => {
    if (!platform.available) return;
    setSelectedPlatform(platform.name);
    setDownloadStarted(true);
    
    // Simuler le démarrage du téléchargement
    setTimeout(() => {
      if (platform.url && platform.url.startsWith('/')) {
        window.open(platform.url, '_blank');
      } else if (platform.url) {
        window.location.href = platform.url;
      }
      setDownloadStarted(false);
    }, 1500);
  };

  const apkPlatform = platforms.find(p => p.name === 'Android APK');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-transparent flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
          />
          <span className="text-cyan-300/70 text-sm font-light tracking-wide">
            Préparation de votre expérience...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-transparent py-8 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AndroidIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-cyan-300/80 font-medium tracking-wide">
              Application Android disponible
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
            {title}
          </h1>

          <p className="text-base md:text-lg text-gray-300/80 max-w-2xl mx-auto font-light leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Section Téléchargement APK - Mise en avant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-emerald-500/[0.04] to-cyan-500/[0.04] backdrop-blur-sm border border-emerald-500/20 overflow-hidden relative">
            {/* Fond décoratif */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
              {/* Icône Android + Infos */}
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(16, 185, 129, 0.2)',
                      '0 0 40px rgba(16, 185, 129, 0.4)',
                      '0 0 20px rgba(16, 185, 129, 0.2)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center"
                >
                  <AndroidIcon className="w-10 h-10 md:w-12 md:h-12 text-emerald-400" />
                </motion.div>
              </div>

              {/* Texte */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    Application Android
                  </h3>
                  {apkPlatform?.version && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                      {apkPlatform.version}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300/80 mb-1">
                  Téléchargez l'APK pour Android — scannez vos cartes NFC en un clin d'œil
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-3 text-xs text-gray-400/60">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400/60" />
                    Sécurisé
                  </span>
                  <span>•</span>
                  <span>{apkPlatform?.size}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400/60" />
                    Gratuit
                  </span>
                </div>
              </div>

              {/* Bouton Télécharger */}
              <div className="flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(platforms[0])}
                  disabled={downloadStarted}
                  className={`
                    group relative inline-flex items-center gap-3 px-8 py-4 
                    rounded-2xl font-semibold text-sm transition-all duration-300
                    ${downloadStarted 
                      ? 'bg-emerald-500/20 text-emerald-300 cursor-wait'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/25'
                    }
                  `}
                >
                  {downloadStarted ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      >
                        <Download className="w-5 h-5" />
                      </motion.div>
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Télécharger l'APK
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4 opacity-70" />
                      </motion.div>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Carte interactive avec démo scan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-12"
        >
          {/* Indicateur de scan */}
          <AnimatePresence>
            {showDemo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Nfc className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <span className="text-xs text-cyan-300 font-medium">
                  Approchez votre téléphone
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ondes de scan simulées */}
          <AnimatePresence>
            {showDemo && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-3xl border border-cyan-400/40"
                    initial={{ opacity: 0.8, scale: 0.95 }}
                    animate={{ opacity: 0, scale: 1.15 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <ProfileCard3D onTap={() => setShowDemo(true)} />

          {/* Badge "Tap to preview" */}
          <motion.p
            className="text-center mt-4 text-xs text-gray-500/60 font-light"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            👆 Appuyez sur la carte pour voir l'animation de scan
          </motion.p>
        </motion.div>

        {/* Étapes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -4 }}
              onHoverStart={() => setActiveStep(i)}
              onHoverEnd={() => setActiveStep(null)}
              className="group relative"
            >
              <div className={`
                rounded-2xl p-6 h-full
                bg-white/[0.02] backdrop-blur-sm 
                border transition-all duration-300
                ${activeStep === i 
                  ? 'border-cyan-400/30 bg-white/[0.04] shadow-lg shadow-cyan-500/5' 
                  : 'border-white/[0.06] hover:border-white/[0.1]'
                }
              `}>
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center
                      transition-colors duration-300
                      ${activeStep === i 
                        ? 'bg-cyan-500/20 border-cyan-400/30' 
                        : 'bg-white/[0.03] border-white/[0.06]'
                      }
                      border
                    `}
                    animate={activeStep === i ? { scale: [1, 1.1, 1] } : {}}
                  >
                    <div className={activeStep === i ? 'text-cyan-300' : 'text-gray-400/60'}>
                      {step.icon}
                    </div>
                  </motion.div>
                  {step.highlight && (
                    <span className={`
                      text-[10px] px-2 py-0.5 rounded-full font-medium
                      transition-colors duration-300
                      ${activeStep === i 
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/20' 
                        : 'bg-white/[0.03] text-gray-500 border border-white/[0.04]'
                      }
                    `}>
                      {step.highlight}
                    </span>
                  )}
                </div>
                <h3 className={`
                  text-lg font-semibold mb-2 transition-colors duration-300
                  ${activeStep === i ? 'text-white' : 'text-white/70'}
                `}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400/70 font-light leading-relaxed">
                  {step.desc}
                </p>
                {i < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-cyan-400/30"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Autres plateformes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-sm font-medium text-gray-400/80 text-center mb-4">
            Également disponible sur
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {platforms.slice(1).map((platform, i) => (
              <motion.button
                key={i}
                whileHover={platform.available ? { scale: 1.02 } : {}}
                onClick={() => handleDownload(platform)}
                disabled={!platform.available}
                className={`
                  flex items-center gap-3 p-4 rounded-xl border transition-all duration-300
                  ${platform.available 
                    ? 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] cursor-pointer'
                    : 'bg-white/[0.01] border-white/[0.04] cursor-not-allowed opacity-50'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${platform.available ? 'bg-white/[0.05]' : 'bg-white/[0.02]'}
                `}>
                  <div className={platform.available ? 'text-gray-300' : 'text-gray-600'}>
                    {platform.icon}
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${platform.available ? 'text-white/80' : 'text-gray-600'}`}>
                      {platform.name}
                    </span>
                    {platform.comingSoon && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/20">
                        Bientôt
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500/60 mt-0.5">
                    {platform.description}
                  </p>
                </div>
                {platform.available && (
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="rounded-3xl p-8 md:p-10 bg-gradient-to-br from-cyan-500/[0.03] to-blue-500/[0.03] backdrop-blur-sm border border-white/[0.06] max-w-2xl mx-auto">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-5"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Download className="w-7 h-7 text-cyan-400" />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {cta_title}
            </h2>
            
            <p className="text-gray-300/70 text-sm md:text-base font-light mb-8 max-w-md mx-auto">
              {cta_desc}
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const apkSection = document.getElementById('apk-download');
                if (apkSection) {
                  apkSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-2xl text-white font-medium shadow-lg shadow-cyan-500/20 transition-all duration-300"
            >
              <span>{download_now}</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>

            {/* Avantages */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-white/[0.04]">
              {[
                { icon: Zap, text: 'Configuration 2 min' },
                { icon: Nfc, text: 'Compatible NFC' },
                { icon: QrCode, text: 'QR Code inclus' },
                { icon: CheckCircle2, text: 'Sans engagement' },
                { icon: AndroidIcon, text: 'Android APK dispo' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 text-xs text-gray-400/60"
                  whileHover={{ color: '#67e8f9' }}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}