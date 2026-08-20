// src/components/pricing/PricingPlans.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ShieldCheck, Crown, Building, CheckCircle, ChevronRight,
  TrendingUp, Infinity, Layers, Circle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// ============================================================
// 1. TYPES & DONNÉES
// ============================================================

type PlanKey = 'gratuit' | 'professionnel' | 'business';

type Plan = {
  key: PlanKey;
  title: string;
  desc: string;
  features: string[];
  highlight?: boolean;
  price: { annuel: number };
  periods: { label: string; value: string; price: number; savings?: number }[];
};

const PLAN_META: Record<PlanKey, {
  icon: React.ElementType;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  nfcLimit: string;
  nfcIcon: React.ElementType;
  ctaGradient: string;
  ribbonColor: string;
}> = {
  gratuit: {
    icon: ShieldCheck,
    bgGradient: 'from-white/[0.02] to-transparent',
    borderColor: 'border-white/[0.06]',
    accentColor: 'text-gray-400',
    nfcLimit: '1 carte NFC',
    nfcIcon: Circle,
    ctaGradient: 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]',
    ribbonColor: 'from-gray-500 to-gray-600',
  },
  professionnel: {
    icon: Crown,
    bgGradient: 'from-cyan-500/[0.04] to-blue-500/[0.02]',
    borderColor: 'border-cyan-500/20',
    accentColor: 'text-cyan-300',
    nfcLimit: '10 cartes NFC',
    nfcIcon: Layers,
    ctaGradient: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20',
    ribbonColor: 'from-amber-400 to-orange-500',
  },
  business: {
    icon: Building,
    bgGradient: 'from-purple-500/[0.04] to-indigo-500/[0.02]',
    borderColor: 'border-purple-500/20',
    accentColor: 'text-purple-300',
    nfcLimit: 'Cartes illimitées',
    nfcIcon: Infinity,
    ctaGradient: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 shadow-lg shadow-purple-500/20',
    ribbonColor: 'from-purple-400 to-indigo-500',
  },
};

// ============================================================
// 2. BADGE RUBAN (composant réutilisable)
// ============================================================

const CornerRibbon = ({ text, color }: { text: string; color: string }) => (
  <div className="absolute -top-px -right-px z-10 w-24 h-24 overflow-hidden rounded-tr-xl pointer-events-none">
    <div
      className={`absolute -top-1 -right-1 w-[140%] h-8 bg-gradient-to-r ${color} -rotate-45 translate-x-[16%] translate-y-[160%] flex items-center justify-center shadow-md`}
    >
      <span className="text-[10px] font-bold text-white tracking-wider uppercase drop-shadow-sm">
        {text}
      </span>
    </div>
  </div>
);

// ============================================================
// 3. BILLING TOGGLE
// ============================================================

const BillingToggle = ({ selectedPeriod, setSelectedPeriod, periods }: {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  periods: { label: string; value: string; price: number; savings?: number }[];
}) => (
  <div className="inline-flex bg-white/[0.03] rounded-md p-0.5 gap-0.5">
    {periods.map((period) => (
      <button
        key={period.value}
        onClick={() => setSelectedPeriod(period.value)}
        className={`relative px-2.5 py-1 text-[11px] font-medium rounded-sm transition-all duration-200 ${
          selectedPeriod === period.value
            ? 'bg-white/[0.08] text-white'
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        {period.label}
        {/* ✅ Correction : NE PAS afficher le % ici, il est déjà dans la carte */}
      </button>
    ))}
  </div>
);

// ============================================================
// 4. CARTE PLAN
// ============================================================

const PlanCard = ({ 
  plan, 
  meta, 
  idx, 
  selectedPeriod, 
  setSelectedPeriod, 
}: { 
  plan: Plan; 
  meta: typeof PLAN_META[PlanKey]; 
  idx: number;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  t: any;
}) => {
  const Icon = meta.icon;
  const NfcIcon = meta.nfcIcon;
  const isHighlighted = plan.key === 'professionnel';
  
  const currentPeriod = plan.periods.find(p => p.value === selectedPeriod) || plan.periods[0];
  const displayPrice = currentPeriod?.price ?? plan.price.annuel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={`relative rounded-xl p-5 bg-gradient-to-b ${meta.bgGradient} border ${meta.borderColor} transition-all duration-300 flex flex-col ${
        isHighlighted ? 'ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/5' : ''
      }`}
    >
      {/* Ruban */}
      {isHighlighted && <CornerRibbon text="Populaire" color={meta.ribbonColor} />}

      {/* Icône + Titre */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className={`w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center ${meta.accentColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-base font-semibold text-white/90">{plan.title}</h3>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400/80 mb-3 leading-relaxed">{plan.desc}</p>

      {/* Badge NFC */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] mb-3 text-[11px] ${meta.accentColor}`}>
        <NfcIcon className="w-3 h-3" />
        <span className="font-medium">{meta.nfcLimit}</span>
      </div>

      {/* Prix */}
      <div className="mb-3 text-center">
        <div className="flex items-baseline justify-center gap-0.5">
          <span className="text-sm text-gray-400 font-light">$</span>
          <span className="text-3xl font-bold text-white tracking-tight">
            {displayPrice}
          </span>
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5">
          {currentPeriod?.label}
        </div>
        {currentPeriod?.savings && currentPeriod.savings > 0 && (
          <div className="mt-1.5 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
            <TrendingUp className="w-2.5 h-2.5" /> -{currentPeriod.savings}%
          </div>
        )}
      </div>

      {/* Sélecteur de période */}
      {plan.periods.length > 1 && (
        <div className="mb-4 flex justify-center">
          <BillingToggle
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            periods={plan.periods}
          />
        </div>
      )}

      {/* Offre lancement Business */}
      {plan.key === 'business' && (
        <div className="mb-3 p-2 bg-amber-500/[0.06] border border-amber-500/10 rounded-lg text-center">
          <p className="text-[10px] text-amber-400/80 font-light">
            🎉 Offre lancement : 15 $/an
          </p>
        </div>
      )}

      {/* Features */}
      <ul className="space-y-1.5 mb-5 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400/70 shrink-0 mt-px" />
            <span className="text-gray-300/80 font-light">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={plan.key === 'business' ? '/contact' : '/auth/sign-up'} className="mt-auto">
        <Button
          className={`w-full h-10 rounded-lg font-medium text-xs transition-all duration-300 text-white ${meta.ctaGradient}`}
        >
          {plan.key === 'gratuit' 
            ? 'Commencer gratuitement'
            : plan.key === 'professionnel'
            ? 'Choisir Professionnel'
            : 'Contacter l\'équipe'
          }
          <ChevronRight className="w-3.5 h-3.5 ml-1.5 opacity-60" />
        </Button>
      </Link>

      <p className="text-[10px] text-gray-500/60 text-center mt-2.5 font-light">
        {plan.key === 'gratuit' ? 'Sans engagement' : 'Annulation à tout moment'}
      </p>
    </motion.div>
  );
};

// ============================================================
// 5. COMPOSANT PRINCIPAL
// ============================================================

export default function PricingPlans({
  title,
  plans,
}: {
  title?: string;
  plans: Plan[];
}) {
  const t = useTranslations('pricing');
  
  const [selectedPeriods, setSelectedPeriods] = useState<Record<PlanKey, string>>({
    gratuit: 'lifetime',
    professionnel: 'annuel',
    business: 'annuel',
  });

  return (
    <section className="py-8 px-4 max-w-5xl mx-auto">
      {/* En-tête */}
      <motion.div 
        initial={{ opacity: 0, y: -8 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-white/90 tracking-tight">
          {title || t('default_title')}
        </h1>
        <p className="text-sm text-gray-400/70 mt-2 max-w-md mx-auto font-light">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 max-w-4xl mx-auto">
        {plans.map((plan, idx) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            meta={PLAN_META[plan.key]}
            idx={idx}
            selectedPeriod={selectedPeriods[plan.key]}
            setSelectedPeriod={(period) => 
              setSelectedPeriods(prev => ({ ...prev, [plan.key]: period }))
            }
            t={t}
          />
        ))}
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-[11px] text-gray-500/50 font-light">
        Prix en USD · TVA applicable selon pays
      </p>
    </section>
  );
}