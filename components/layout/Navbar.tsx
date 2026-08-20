// src/components/layout/Navbar.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LogOut, User as UserIcon, 
  Globe, Shield, Eye, Sparkle, Briefcase,
  Crown, Heart, ChevronDown
} from 'lucide-react';
import { SiSocialblade } from 'react-icons/si';
import { createClient } from '../../src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Locale = 'ar' | 'en' | 'es' | 'fr' | 'kg' | 'ln' | 'nl' | 'pt' | 'sw';

const languages: Record<Locale, { name: string; flag: string }> = {
  ar: { name: 'العربية', flag: '🇸🇦' },
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  kg: { name: 'Kikongo', flag: '🇨🇩' },
  ln: { name: 'Lingála', flag: '🇨🇩' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  pt: { name: 'Português', flag: '🇵🇹' },
  sw: { name: 'Kiswahili', flag: '🇹🇿' },
};

// Fallback sécurisé pour les locales inconnues
const safeLocale = (raw: string): Locale => {
  const normalized = raw.split('-')[0];
  return (languages[normalized as Locale] ? normalized : 'fr') as Locale;
};

const safeLang = (loc: Locale) => languages[loc] || languages.fr;

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    avatar_url: string | null;
    full_name: string | null;
    username: string | null;
    plan: string | null;
    likes_count?: number;
  } | null>(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const locale = safeLocale(useLocale() as string);
  const t = useTranslations();
  const router = useRouter();
  const cleanupExtensions = useCallback(() => {
    if (typeof document === 'undefined') return;

    // Nettoie les attributs existants
    document.querySelectorAll('[bis_skin_checked]').forEach((el) => {
      el.removeAttribute('bis_skin_checked');
    });

    // Observe et empêche les futurs ajouts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
          const target = mutation.target as Element;
          if (target.hasAttribute('bis_skin_checked')) {
            target.removeAttribute('bis_skin_checked');
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Exécute le nettoyage immédiatement et retourne la fonction de nettoyage
    const cleanup = cleanupExtensions();
    return cleanup;
  }, [cleanupExtensions]);

  // Récupération utilisateur et profil
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, username, plan, likes_count')
          .eq('id', session.user.id)
          .single();
        if (profileData) setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (profile?.avatar_url) setAvatarError(false);
  }, [profile?.avatar_url]);

  const handleSignOut = async () => {
    if (!window.confirm(t('navbar.sign_out_confirm_message'))) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  const changeLanguage = (newLocale: Locale) => {
    const segments = window.location.pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/') || '/');
    setMobileMenuOpen(false);
    setShowLangDropdown(false);
  };

  const role = user?.user_metadata?.role;
  const isAdmin = role === 'admin';
  const isUser = !!user && !isAdmin;

  const navLinks = useMemo(() => [
    { href: '/', label: t('navbar.home') },
    { href: `/${locale}/public/pricing`, label: t('navbar.pricing') },
    { href: `/${locale}/public/about`, label: t('navbar.about') },
    { href: `/${locale}/public/contact`, label: t('navbar.contact') },
  ], [locale, t]);

  const getUserInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  const handleAvatarError = () => {
    setAvatarError(true);
    console.warn('⚠️ Erreur chargement avatar');
  };

  const currentLang = safeLang(locale);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-cyan-900/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link
            href={isAdmin ? '/admin' : isUser ? '/dashboard' : '/'}
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <SiSocialblade className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                LUVIKA
              </span>
              <span className="text-[10px] font-medium text-cyan-600 -mt-0.5 hidden sm:block">
                Digital Identity
              </span>
            </div>
            {isAdmin && (
              <Badge className="ml-2 bg-amber-100 text-amber-700 border-amber-200 text-xs py-0 px-2 h-5">
                <Shield className="w-3 h-3 mr-1" /> Admin
              </Badge>
            )}
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAdmin && !isUser && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-gray-600 hover:text-cyan-600 font-medium transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-cyan-500 transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {/* Sélecteur de langue */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{currentLang.name}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>
              <AnimatePresence>
                {showLangDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-gray-200 shadow-xl py-1 z-50"
                  >
                    {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as Locale[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition ${
                          locale === lang ? 'text-cyan-600 font-medium bg-cyan-50/50' : 'text-gray-700'
                        }`}
                      >
                        <span>{languages[lang].name}</span>
                        <span className="text-lg">{languages[lang].flag}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Boutons CTA */}
            {isAdmin ? (
              <Link href="/admin">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md rounded-full px-5">
                  <Shield className="w-4 h-4 mr-2" /> Admin
                </Button>
              </Link>
            ) : isUser ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full px-5">
                  Tableau de bord
                </Button>
              </Link>
            ) : (
              <Link href="/auth/sign-in">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-full px-6 shadow-md shadow-blue-500/25">
                  {t('navbar.sign_in')}
                </Button>
              </Link>
            )}

            {/* Menu utilisateur connecté */}
            {user && (
              <div className="relative ml-1">
                <button
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                  className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-cyan-300 transition-all focus:outline-none"
                >
                  {profile?.avatar_url && !avatarError ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      onError={handleAvatarError}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {getUserInitial()}
                    </div>
                  )}
                  {profile?.plan && profile.plan !== 'basic' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${
                        profile.plan === 'premium' ? 'bg-amber-500' : 'bg-purple-500'
                      }`} />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      onMouseEnter={() => setShowUserMenu(true)}
                      onMouseLeave={() => setShowUserMenu(false)}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-gray-200 shadow-xl py-1 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {getUserInitial()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {profile?.plan && (
                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                  {profile.plan === 'premium' ? (
                                    <><Crown className="w-2.5 h-2.5 mr-0.5" /> Premium</>
                                  ) : (
                                    <><Briefcase className="w-2.5 h-2.5 mr-0.5" /> Business</>
                                  )}
                                </Badge>
                              )}
                              {isAdmin && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-amber-200 text-amber-700">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserIcon className="w-4 h-4 text-cyan-600" />
                          <span className="text-sm font-medium">{t('navbar.edit_profile')}</span>
                        </Link>
                        {isUser && profile?.username && (
                          <Link
                            href={`/${locale}/${profile.username}`}
                            target="_blank"
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Eye className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium">Voir profil public</span>
                            <div className="ml-auto flex items-center gap-1 text-pink-500 text-xs">
                              <Heart className="w-3 h-3 fill-current" />
                              <span>{profile.likes_count || 0}</span>
                            </div>
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">{t('navbar.sign_out')}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Bouton mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm"
          >
            <div className="px-4 py-4 space-y-3">
              {/* Langue mobile */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">{currentLang.name}</span>
                  </div>
                  <span className="text-lg">{currentLang.flag}</span>
                </button>
                <AnimatePresence>
                  {showLangDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-xl py-1 z-50"
                    >
                      {(['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as Locale[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => changeLanguage(lang)}
                          className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 ${
                            locale === lang ? 'text-cyan-600 bg-cyan-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span>{languages[lang].name}</span>
                          <span className="text-lg">{languages[lang].flag}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Liens navigation mobile */}
              {!isAdmin && !isUser && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-center text-gray-600 hover:text-cyan-600 font-medium transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Boutons action mobile */}
              <div className="pt-2 space-y-2">
                {isAdmin ? (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-full">
                      <Shield className="w-4 h-4 mr-2" /> Admin
                    </Button>
                  </Link>
                ) : isUser ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full">
                      Tableau de bord
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-full">
                      {t('navbar.sign_in')}
                    </Button>
                  </Link>
                )}
                {user && (
                  <Button
                    variant="destructive"
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('navbar.sign_out')}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}