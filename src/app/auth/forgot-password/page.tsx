// src/app/auth/forgot-password/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/src/lib/supabase/client';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgot_password');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => emailInputRef.current?.focus(), 100);
  }, []);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendReset = async () => {
    if (!isValidEmail) {
      setError(t('error_invalid_email'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (sendError) throw sendError;

      setSuccess(t('success'));
      setTimeout(() => router.push('/auth/sign-in'), 3000);
    } catch (err: any) {
      setError(err.message?.includes('Invalid email')
        ? t('error_no_account')
        : t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && isValidEmail) {
      handleSendReset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(6,182,212,0.03),transparent_50%)]" />
      </div>

      {/* Retour */}
      <Link href="/auth/sign-in" className="absolute top-6 left-6 z-10 text-gray-400/60 hover:text-cyan-300/70 transition-colors text-xs flex items-center gap-1.5 font-light">
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('back_to_login')}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
          {/* Icône */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-blue-500/[0.08] flex items-center justify-center border border-white/[0.06]">
              <Mail className="w-5 h-5 text-cyan-300/60" />
            </div>
          </div>

          <h1 className="text-lg font-semibold text-center text-white/80 mb-1">
            {t('title')}
          </h1>
          <p className="text-gray-400/60 text-center text-xs font-light mb-5">
            {t('subtitle')}
          </p>

          {/* Messages */}
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
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/[0.08] flex items-start gap-2"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300/60 text-xs font-light">{success}</p>
                  <p className="text-emerald-300/40 text-[11px] font-light mt-0.5">{t('check_spam')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendReset(); }} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs text-gray-400/70 font-light mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400/60" />
                {t('email_label')}
              </Label>
              <Input
                ref={emailInputRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('email_placeholder')}
                className="h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl focus:border-cyan-400/30 font-light"
                autoComplete="email"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !isValidEmail}
              className="w-full h-9 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-xl transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t('sending')}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {t('submit')}
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
            <Link href="/auth/sign-in" className="text-xs text-cyan-400/60 hover:text-cyan-300/70 font-light">
              {t('back_to_login')}
            </Link>
            <div className="mt-3 flex justify-center gap-3 text-[11px] text-gray-500/50 font-light">
              <Link href="/privacy" className="hover:text-cyan-400/60 transition-colors">{tCommon('privacy_link')}</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-cyan-400/60 transition-colors">{tCommon('terms_link')}</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-cyan-400/60 transition-colors">{tCommon('contact_link')}</Link>
            </div>
          </div>
        </div>

        {/* Signature */}
        <p className="mt-5 text-center text-[11px] text-gray-500/50 font-light">
          {t('signature')}
        </p>
      </motion.div>
    </div>
  );
}