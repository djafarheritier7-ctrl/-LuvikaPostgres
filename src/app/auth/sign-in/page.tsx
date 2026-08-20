// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/src/lib/supabase/client';

export default function SignInPage() {
  const t = useTranslations('auth.signin');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
        return;
      }
      setPageLoading(false);
      passwordInputRef.current?.focus();
    };
    checkSession();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(t('error_credentials'));
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('deactivated, role')
        .eq('id', user.id)
        .single();

      if (profile?.deactivated) {
        await supabase.auth.signOut();
        setError(t('error_deactivated'));
        setLoading(false);
        return;
      }

      const redirectTo = searchParams.get('redirect') || 
        (profile?.role === 'admin' || user.user_metadata?.role === 'admin' ? '/admin' : '/dashboard');
      
      router.push(redirectTo);
      router.refresh();
    }
  };

  if (pageLoading) {
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
            {tCommon('loading')}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond décoratif subtil */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(6,182,212,0.03),transparent_50%)]" />
      </div>

      {/* Lien retour */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 text-gray-400/60 hover:text-cyan-300/70 transition-colors text-xs flex items-center gap-1.5 group font-light"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        {tCommon('back_to_home')}
      </Link>

      {/* Carte principale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm relative"
      >
        <div className="relative rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
          {/* Ligne supérieure */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/60 to-blue-500/60 rounded-t-2xl" />

          {/* Icône */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-blue-500/[0.08] flex items-center justify-center border border-white/[0.06]">
              <User className="w-6 h-6 text-cyan-300/60" />
            </div>
          </div>

          <h1 className="text-xl font-semibold text-center text-white/80">
            {t('title')}
          </h1>
          <p className="text-gray-400/60 text-center text-xs font-light mt-1 mb-5">
            {t('subtitle')}
          </p>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08] flex items-start gap-2"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-400/60 shrink-0 mt-0.5" />
                <p className="text-red-300/60 text-xs font-light">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
              <Input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl focus:border-cyan-400/30 font-light"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
              <Input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl focus:border-cyan-400/30 font-light"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500/50 hover:text-cyan-400/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <Link
                href="/auth/forgot-password"
                className="text-cyan-400/60 hover:text-cyan-300/70 transition-colors text-xs font-light"
              >
                {t('forgot_password')}
              </Link>
              <div className="flex items-center gap-1 text-[11px] text-gray-500/50 font-light">
                <ShieldCheck className="w-3 h-3" />
                <span>{t('secure_badge')}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-xl transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('connecting')}
                </span>
              ) : (
                t('submit')
              )}
            </Button>
          </form>

          {/* Lien inscription */}
          <div className="mt-5 pt-4 text-center text-xs text-gray-400/60 font-light border-t border-white/[0.06]">
            {t('no_account')}{' '}
            <Link href="/auth/sign-up" className="text-cyan-400/60 hover:text-cyan-300/70 font-medium">
              {t('sign_up')}
            </Link>
          </div>

          {/* Liens légaux */}
          <div className="mt-5 flex justify-center gap-4 text-[11px] text-gray-500/50 font-light">
            <Link href="/privacy" className="hover:text-cyan-400/60 transition-colors">{t('privacy_link')}</Link>
            <Link href="/terms" className="hover:text-cyan-400/60 transition-colors">{t('terms_link')}</Link>
            <Link href="/contact" className="hover:text-cyan-400/60 transition-colors">{t('contact_link')}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}