// src/components/admin/AdminHeader.tsx
'use client';

import Link from 'next/link';
import { LogOut, Settings, Globe, User, Shield, ChevronDown, ArrowLeft } from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { SiSocialblade } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';

const languages: Record<string, { name: string; flag: string }> = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  pt: { name: 'Português', flag: '🇵🇹' },
  es: { name: 'Español', flag: '🇪🇸' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  sw: { name: 'Kiswahili', flag: '🇹🇿' },
  ln: { name: 'Lingala', flag: '🇨🇩' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
};

export function AdminHeader() {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations();
  const locale = useLocale();
  const [openLang, setOpenLang] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { router.push('/auth/sign-in'); return; }
        setUser(authUser);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, username, plan, role')
          .eq('id', authUser.id)
          .single();

        setProfile(profileData);
      } catch (err) {
        console.error('Erreur chargement user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setOpenLang(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setOpenUser(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/sign-in');
  };

  const changeLanguage = (lang: string) => {
    const currentPath = window.location.pathname.replace(/^\/[a-z]{2}/, '');
    router.push(`/${lang}${currentPath}`);
    setOpenLang(false);
  };

  const getUserInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left - Logo + Retour */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light"
            >
              <span className="hidden sm:inline">Accueil</span>
            </Link>

            <Link href="/admin" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-red-500/60 to-rose-500/60 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white/80" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white/80">LUVIKA</span>
                <span className="text-[10px] text-cyan-400/50 font-light">Admin</span>
              </div>
            </Link>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">

            {/* Langues */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => { setOpenLang(!openLang); setOpenUser(false); }}
                className="flex items-center gap-1.5 h-8 px-2.5 text-xs text-gray-400/60 hover:text-white/70 rounded-lg hover:bg-white/[0.04] transition-colors font-light"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{languages[locale]?.name || 'Langue'}</span>
                <span>{languages[locale]?.flag || '🌐'}</span>
              </button>

              <AnimatePresence>
                {openLang && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 w-40 bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] rounded-xl py-1 shadow-xl z-50"
                  >
                    {Object.entries(languages).map(([code, { name, flag }]) => (
                      <button
                        key={code}
                        onClick={() => changeLanguage(code)}
                        className={`w-full text-left px-3 py-2 text-xs font-light transition-colors flex items-center gap-2 ${
                          locale === code ? 'bg-white/[0.06] text-white/80' : 'text-gray-400/60 hover:text-white/70 hover:bg-white/[0.03]'
                        }`}
                      >
                        <span>{flag}</span>
                        <span>{name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div ref={userRef} className="relative">
              <button
                onClick={() => { setOpenUser(!openUser); setOpenLang(false); }}
                className="flex items-center gap-2 h-8 px-2 text-xs text-gray-400/60 hover:text-white/70 rounded-lg hover:bg-white/[0.04] transition-colors font-light"
              >
                {loading ? (
                  <div className="w-6 h-6 rounded-full bg-white/[0.04] animate-pulse" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500/40 to-blue-500/40 flex items-center justify-center text-white/70 text-xs font-medium">
                    {getUserInitial()}
                  </div>
                )}
                <span className="hidden sm:inline">{profile?.full_name || user?.email?.split('@')[0] || 'Admin'}</span>
                {user?.user_metadata?.role === 'admin' && (
                  <Shield className="w-3 h-3 text-amber-400/60" />
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${openUser ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openUser && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] rounded-xl py-1 shadow-xl z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.04]">
                      <p className="text-xs text-white/70 font-medium truncate">
                        {profile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                      </p>
                      <p className="text-[10px] text-gray-500/60 font-light truncate">{user?.email}</p>
                      {profile?.plan && (
                        <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-light ${
                          profile.plan === 'entreprise' ? 'bg-purple-500/10 text-purple-300/60 border border-purple-500/20' :
                          profile.plan === 'premium' ? 'bg-cyan-500/10 text-cyan-300/60 border border-cyan-500/20' :
                          'bg-gray-500/10 text-gray-300/60 border border-gray-500/20'
                        }`}>
                          {profile.plan}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => { setOpenUser(false); router.push('/dashboard/settings'); }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.03] transition-colors font-light flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Paramètres
                    </button>

                    <button
                      onClick={() => { setOpenUser(false); handleSignOut(); }}
                      className="w-full text-left px-3 py-2 text-xs text-red-400/60 hover:text-red-300/70 hover:bg-red-500/[0.04] transition-colors font-light flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Déconnexion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}