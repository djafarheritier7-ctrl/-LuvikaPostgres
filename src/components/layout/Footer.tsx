// src/components/layout/PublicProfileFooter.tsx
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, Twitter, Linkedin, 
  Heart, Globe, ChevronUp, Gavel,
  Sparkle, MapPin, Mail
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { SiSocialblade, SiInstagram } from 'react-icons/si';

export default function PublicProfileFooter() {
  const t = useTranslations('footer');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Liens
  const platformLinks = [
    { label: t('features'), href: '/features' },
    { label: t('pricing'), href: '/pricing' },
    { label: t('download'), href: '/download' },
    { label: t('documentation'), href: '/documentation' },
  ];

  const companyLinks = [
    { label: t('about'), href: '/about' },
    { label: t('contact'), href: '/contact' },
    { label: t('blog'), href: '/blog' },
  ];

  const legalLinks = [
    { label: t('privacy'), href: '/privacy' },
    { label: t('terms'), href: '/terms' },
    { label: t('cookies'), href: '/cookies' },
  ];

  // Réseaux sociaux
  const socials = [
    { Icon: Twitter, href: 'https://twitter.com/luvika', label: 'Twitter', color: 'text-cyan-400/60 group-hover:text-cyan-300/80', hover: 'hover:bg-cyan-500/5' },
    { Icon: SiInstagram, href: 'https://instagram.com/luvika', label: 'Instagram', color: 'text-pink-400/60 group-hover:text-pink-300/80', hover: 'hover:bg-pink-500/5' },
    { Icon: Linkedin, href: 'https://linkedin.com/company/luvika', label: 'LinkedIn', color: 'text-blue-400/60 group-hover:text-blue-300/80', hover: 'hover:bg-blue-500/5' },
    { Icon: Github, href: 'https://github.com/hassanpakou/Luvika2026', label: 'GitHub', color: 'text-gray-400/60 group-hover:text-gray-300/80', hover: 'hover:bg-gray-500/5' },
  ];

  // Liste des langues
  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'sw', label: 'Kiswahili' },
    { code: 'ln', label: 'Lingala' },
    { code: 'pt', label: 'Português' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
    { code: 'ko', label: '한국어' },
    { code: 'nl', label: 'Nederlands' },
  ];

  return (
    <footer className="w-full mt-auto relative border-t border-white/[0.06]">
      {/* Bouton "Retour en haut" */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 z-50 p-2.5 rounded-full bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white shadow-lg shadow-cyan-500/10 border border-white/[0.08] backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t('scroll_to_top')}
          >
            <ChevronUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500/60 to-blue-500/60 flex items-center justify-center">
                <SiSocialblade className="w-4 h-4 text-white/80" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400/80 to-blue-400/80">
                LUVIKA
              </span>
            </div>
            
            <p className="text-gray-400/60 text-sm leading-relaxed font-light max-w-sm">
              {t('tagline')}
            </p>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {socials.map(({ Icon, href, label, color, hover }) => (
                <Link 
                  key={label}
                  href={href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] ${hover} transition-all duration-300 group`}
                  aria-label={label}
                >
                  <Icon className={`w-4 h-4 ${color} transition-transform`} />
                </Link>
              ))}
            </div>
          </div>
          
          {/* Links */}
          <div className="grid grid-cols-3 gap-6">
            {/* Plateforme */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400/60" />
                {t('product')}
              </h3>
              <ul className="space-y-1.5">
                {platformLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400/50 hover:text-white/70 transition-colors text-xs font-light flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-cyan-400/0 group-hover:bg-cyan-400/50 transition-all duration-300" />
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Entreprise */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400/60" />
                {t('company')}
              </h3>
              <ul className="space-y-1.5">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400/50 hover:text-white/70 transition-colors text-xs font-light flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-rose-400/0 group-hover:bg-rose-400/50 transition-all duration-300" />
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Légal */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-amber-400/60" />
                {t('legal')}
              </h3>
              <ul className="space-y-1.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400/50 hover:text-white/70 transition-colors text-xs font-light flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-amber-400/0 group-hover:bg-amber-400/50 transition-all duration-300" />
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* CTA */}
          <div className="space-y-4">
            <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white/70 mb-1.5">{t('cta_title')}</h3>
              <p className="text-gray-400/60 text-xs font-light leading-relaxed mb-3">
                {t('cta_description')}
              </p>
              <Link
                href="/signup"
                className="inline-block bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-light px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                {t('cta_button')} →
              </Link>
            </div>
            
            {/* Langues */}
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-gray-400/50">
                  <Globe className="w-3 h-3" />
                  <span className="text-[10px] font-light">{t('available_languages')}</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {languages.map((lang) => (
                    <span 
                      key={lang.code} 
                      className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/[0.06] text-gray-400/60 font-light"
                    >
                      {lang.code}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-xs text-gray-500/60 font-light flex items-center justify-center gap-1.5 flex-wrap">
              © {new Date().getFullYear()} Luvika — {t('copyright')}
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-xs font-light">
              <Link href="/sitemap.xml" className="text-gray-500/60 hover:text-white/60 transition-colors">{t('sitemap')}</Link>
              <span className="hidden md:inline text-gray-700/50">•</span>
              <Link href="/security" className="text-gray-500/60 hover:text-white/60 transition-colors">{t('security')}</Link>
              <span className="hidden md:inline text-gray-700/50">•</span>
              <Link href="/status" className="text-gray-500/60 hover:text-white/60 transition-colors">{t('status')}</Link>
            </div>
          </div>
          
          {/* Badges + Contact */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[11px] text-gray-500/50 font-light">
            <div className="flex flex-wrap justify-center gap-4 items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                <span>{t('operational')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                <span>{t('made_in_africa')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                <span>{t('gdpr_compliant')}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500/50" />
                <span>Kinshasa, RDC</span>
              </div>
              <span className="hidden md:inline text-gray-700/50">•</span>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-gray-500/50" />
                <a href="mailto:support@luvika.me" className="hover:text-white/60 transition-colors">
                  support@luvika.me
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider subtil */}
      <div className="relative">
        <svg 
          viewBox="0 0 1440 30" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8"
        >
          <path 
            d="M0 30L1440 30L1440 0C1200 10 960 10 720 7C480 4 240 0 0 0L0 30Z" 
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </footer>
  );
}