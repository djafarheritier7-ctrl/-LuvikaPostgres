// src/app/auth/error/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function ErrorPage() {
  const t = useTranslations('auth.error');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState(t('default_message'));

  useEffect(() => {
    const msg = searchParams.get('message') || t('unexpected_error');
    setMessage(msg);
  }, [searchParams, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(220,38,38,0.03),transparent_50%)]" />
      </div>

      {/* Retour */}
      <Link href="/" className="absolute top-6 left-6 z-10 text-gray-400/60 hover:text-amber-300/70 transition-colors text-xs flex items-center gap-1.5 font-light">
        <ArrowLeft className="w-3.5 h-3.5" />
        {tCommon('back_to_home')}
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] to-red-500/[0.08] flex items-center justify-center border border-white/[0.06]">
              <AlertCircle className="w-5 h-5 text-amber-300/60" />
            </div>
          </div>

          <h1 className="text-lg font-semibold text-center text-white/80 mb-1">
            {t('title')}
          </h1>
          <p className="text-gray-400/60 text-center text-xs font-light mb-5">
            {t('description')}
          </p>

          {/* Message d'erreur */}
          <div className="mb-5 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.08] flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400/60 shrink-0 mt-0.5" />
            <p className="text-amber-300/60 text-xs font-light">{message}</p>
          </div>

          {/* Bouton */}
          <Button
            onClick={() => router.push('/auth/sign-in')}
            className="w-full h-9 text-xs bg-gradient-to-r from-amber-600/80 to-red-600/80 hover:from-amber-500 hover:to-red-500 text-white font-light rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            {t('back_to_login_button')}
          </Button>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
            <Link href="/auth/sign-in" className="text-xs text-amber-400/60 hover:text-amber-300/70 font-light">
              {t('back_to_login')}
            </Link>
            <div className="mt-3 flex justify-center gap-3 text-[11px] text-gray-500/50 font-light">
              <Link href="/privacy" className="hover:text-amber-400/60 transition-colors">{tCommon('privacy_link')}</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-amber-400/60 transition-colors">{tCommon('terms_link')}</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-amber-400/60 transition-colors">{tCommon('contact_link')}</Link>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-gray-500/50 font-light">
          {t('signature')}
        </p>
      </motion.div>
    </div>
  );
}