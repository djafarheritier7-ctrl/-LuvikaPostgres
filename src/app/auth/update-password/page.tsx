// src/app/auth/update-password/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle, ArrowLeft, AlertCircle, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const t = (key: string) => {
  const translations: Record<string, string> = {
    'auth.reset.title': 'Nouveau mot de passe',
    'auth.reset.subtitle': 'Choisissez un mot de passe sécurisé',
    'auth.reset.new_password': 'Nouveau mot de passe',
    'auth.reset.submit': 'Mettre à jour',
    'auth.reset.success_title': 'Mot de passe mis à jour !',
    'auth.reset.success_message': 'Votre mot de passe a été changé. Vous pouvez vous connecter.',
    'auth.reset.verifying': 'Vérification...',
    'auth.reset.verifying_subtitle': 'Vérification du lien de réinitialisation',
    'auth.reset.invalid_link': 'Lien invalide ou expiré.',
    'auth.reset.error_update': 'Erreur lors de la mise à jour.',
    'auth.reset.back_to_login': 'Retour à la connexion',
    'auth.signin.submit': 'Se connecter',
    'auth.signup.password_length': '8 caractères minimum',
    'auth.signup.password_uppercase': 'Une majuscule',
    'auth.signup.password_lowercase': 'Une minuscule',
    'auth.signup.password_number': 'Un chiffre',
    'auth.signup.password_special': 'Un caractère spécial',
    'navbar.home': 'Accueil',
  };
  return translations[key] || key;
};

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const verifySession = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!tokenHash || type !== 'recovery') {
        setError(t('auth.reset.invalid_link'));
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery' as any,
        });

        if (verifyError) throw new Error(t('auth.reset.invalid_link'));

        setLoading(false);
        setTimeout(() => passwordInputRef.current?.focus(), 100);
      } catch (err: any) {
        setError(err.message || t('auth.reset.invalid_link'));
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams]);

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const allPasswordRulesMet = Object.values(passwordRules).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPasswordRulesMet) return;

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 2500);
    } catch (err: any) {
      setError(err.message || t('auth.reset.error_update'));
    }
  };

  // État loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Link href="/auth/sign-in" className="absolute top-6 left-6 z-10 text-gray-400/60 hover:text-cyan-300/70 transition-colors text-xs flex items-center gap-1.5 font-light">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('auth.reset.back_to_login')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-blue-500/[0.08] flex items-center justify-center mb-4 border border-white/[0.06]">
              <Lock className="w-5 h-5 text-cyan-300/60" />
            </div>
            <h1 className="text-lg font-semibold text-white/80 mb-2">{t('auth.reset.verifying')}</h1>
            <p className="text-gray-400/60 text-xs font-light mb-5">{t('auth.reset.verifying_subtitle')}</p>
            <Loader2 className="w-6 h-6 text-cyan-400/60 animate-spin mx-auto" />
          </div>
        </motion.div>
      </div>
    );
  }

  // État succès
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/[0.08] to-cyan-500/[0.08] flex items-center justify-center mb-4 border border-white/[0.06]">
              <CheckCircle className="w-5 h-5 text-emerald-300/60" />
            </div>
            <h1 className="text-lg font-semibold text-white/80 mb-2">{t('auth.reset.success_title')}</h1>
            <p className="text-gray-400/60 text-xs font-light mb-5">{t('auth.reset.success_message')}</p>
            <Button onClick={() => router.push('/auth/sign-in')}
              className="h-9 text-xs bg-gradient-to-r from-emerald-600/80 to-cyan-600/80 hover:from-emerald-500 hover:to-cyan-500 text-white font-light rounded-xl">
              {t('auth.signin.submit')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Formulaire principal
  return (
    <div className="min-h-screen bg-gradient-to-br bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(6,182,212,0.03),transparent_50%)]" />
      </div>

      <Link href="/auth/sign-in" className="absolute top-6 left-6 z-10 text-gray-400/60 hover:text-cyan-300/70 transition-colors text-xs flex items-center gap-1.5 font-light">
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('auth.reset.back_to_login')}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="w-full max-w-sm">
        <div className="rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
          {/* Icône */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-blue-500/[0.08] flex items-center justify-center border border-white/[0.06]">
              <Lock className="w-5 h-5 text-cyan-300/60" />
            </div>
          </div>

          <h1 className="text-lg font-semibold text-center text-white/80 mb-1">{t('auth.reset.title')}</h1>
          <p className="text-gray-400/60 text-center text-xs font-light mb-5">{t('auth.reset.subtitle')}</p>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08] flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-400/60 shrink-0 mt-0.5" />
                <p className="text-red-300/60 text-xs font-light">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-xs text-gray-400/70 font-light mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400/60" />
                {t('auth.reset.new_password')}
              </Label>
              <div className="relative">
                <Input
                  ref={passwordInputRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl focus:border-cyan-400/30 font-light pr-10"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500/50 hover:text-cyan-400/60 transition-colors">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Règles mot de passe */}
              <div className="mt-3 space-y-1.5">
                {Object.entries(passwordRules).map(([key, valid]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all ${valid ? 'bg-emerald-400/60' : 'bg-gray-600/50'}`} />
                    <span className={`text-[11px] font-light transition-colors ${valid ? 'text-emerald-400/60' : 'text-gray-500/50'}`}>
                      {t(`auth.signup.password_${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/[0.03] border border-blue-500/[0.06] text-xs text-blue-300/60 font-light flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Authentification à deux facteurs activée par défaut.</span>
            </div>

            <Button type="submit" disabled={!allPasswordRulesMet}
              className="w-full h-9 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-xl transition-all">
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              {t('auth.reset.submit')}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
            <Link href="/auth/sign-in" className="text-xs text-cyan-400/60 hover:text-cyan-300/70 font-light">
              {t('auth.reset.back_to_login')}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}