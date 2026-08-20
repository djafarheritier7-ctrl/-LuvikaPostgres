// src/app/terms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, User, Lock, AlertTriangle, 
  RefreshCw, ArrowLeft, Sparkle, CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  const t = useTranslations('terms_page');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
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
            {t('loading')}
          </span>
        </motion.div>
      </div>
    );
  }

  const sections = [
    {
      title: t('sections.acceptance.title'),
      icon: CheckCircle,
      color: 'from-green-500/60 to-emerald-500/60',
      content: t('sections.acceptance.content')
    },
    {
      title: t('sections.account.title'),
      icon: User,
      color: 'from-blue-500/60 to-cyan-500/60',
      content: t('sections.account.content')
    },
    {
      title: t('sections.intellectual_property.title'),
      icon: Lock,
      color: 'from-purple-500/60 to-pink-500/60',
      content: t('sections.intellectual_property.content')
    },
    {
      title: t('sections.liability.title'),
      icon: AlertTriangle,
      color: 'from-amber-500/60 to-orange-500/60',
      content: t('sections.liability.content')
    },
    {
      title: t('sections.modifications.title'),
      icon: RefreshCw,
      color: 'from-cyan-500/60 to-blue-500/60',
      content: t('sections.modifications.content')
    }
  ];

  return (
    <AnimatePresence>
      <div className="min-h-screen bg-gradient-to-br bg-transparent py-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r bg-transparent px-3.5 py-1.5 rounded-full border border-cyan-500/20 mb-4">
              <span className="text-cyan-300/80 font-medium text-sm">{t('badge')}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white/90 to-cyan-200/70 bg-clip-text text-transparent mb-3">
              {t('title')}
            </h1>
            <p className="text-gray-300/70 max-w-2xl mx-auto text-sm font-light leading-relaxed">
              {t('description')}
            </p>
            
            <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500/60 to-blue-400/60 mx-auto mt-4 rounded-full"></div>
            
            <Badge className="mt-3 bg-blue-500/10 text-blue-300/70 border-blue-500/20 text-xs py-0.5 px-2 backdrop-blur-sm">
              {t('effective_date', { date: new Date().toLocaleDateString('fr-FR') })}
            </Badge>
          </motion.div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.04, duration: 0.4, ease: 'easeOut' }}
                className="rounded-2xl p-5 md:p-6 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center flex-shrink-0 backdrop-blur-sm`}>
                    <section.icon className="w-4 h-4 text-white/80" />
                  </div>
                  <h2 className="text-lg font-semibold text-white/90 tracking-tight">{section.title}</h2>
                </div>
                
                <p className="text-gray-300/70 text-sm leading-relaxed font-light">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bouton retour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
            className="mt-8 text-center"
          >
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-cyan-300/70 hover:text-cyan-200 hover:bg-white/5 transition-all">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                {t('back_to_home')}
              </Button>
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center mt-10 pt-6 border-t border-white/[0.06] text-[11px] text-gray-500/70 font-light"
          >
            <p>{t('footer_text', { date: new Date().toLocaleDateString('fr-FR') })}</p>
            <p className="mt-1 flex items-center justify-center gap-1.5">
              <span>{t('made_with')}</span>
            </p>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}