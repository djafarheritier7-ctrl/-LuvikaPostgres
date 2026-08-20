// src/app/[locale]/(public)/pricing/page.tsx
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PricingPlans from '@/src/components/pricing/PricingPlans';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });
  return {
    title: t('title'),
    description: t('plans.gratuit.desc'),
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
  if (!supported.includes(locale as any)) notFound();

  const t = await getTranslations({ locale, namespace: 'pricing' });

  const plans = [
    //  GRATUIT
    {
      key: 'gratuit' as const,
      title: t('plans.gratuit.title'),
      desc: t('plans.gratuit.desc'),
      features: [
        t('plans.gratuit.features.nfc'),
        t('plans.gratuit.features.profile'),
        t('plans.gratuit.features.link'),
        t('plans.gratuit.features.nfc_management'),
        t('plans.gratuit.features.order_nfc'),
        t('plans.gratuit.features.qr'),
        t('plans.gratuit.features.support'),
      ],
      price: { annuel: 0 },
      periods: [{ label: t('free_lifetime'), value: 'lifetime', price: 0 }],
    },
    //  PROFESSIONNEL
    {
      key: 'professionnel' as const,
      title: t('plans.professionnel.title'),
      desc: t('plans.professionnel.desc'),
      features: [
        t('plans.professionnel.features.nfc'),
        t('plans.professionnel.features.profile'),
        t('plans.professionnel.features.photo'),
        t('plans.professionnel.features.social'),
        t('plans.professionnel.features.portfolio'),
        t('plans.professionnel.features.certificates'),
        t('plans.professionnel.features.subscribers'),
        t('plans.professionnel.features.events'),
        t('plans.professionnel.features.tracking'),
        t('plans.professionnel.features.stats'),
        t('plans.professionnel.features.advanced_management'),
        t('plans.professionnel.features.priority_support'),
      ],
      badge: t('plans.professionnel.popular'),
      highlight: true,
      price: { semestriel: 3, annuel: 5 },
      periods: [
        { label: '6 mois', value: 'semestriel', price: 3 },
        { label: '12 mois', value: 'annuel', price: 5, savings: 17 },
      ],
    },
    //  BUSINESS
    {
      key: 'business' as const,
      title: t('plans.business.title'),
      desc: t('plans.business.desc'),
      features: [
        t('plans.business.features.nfc'),
        t('plans.business.features.team'),
        t('plans.business.features.events'),
        t('plans.business.features.tracking'),
        t('plans.business.features.analytics'),
        t('plans.business.features.advanced_management'),
        t('plans.business.features.employees'),
        t('plans.business.features.dashboard'),
        t('plans.business.features.clients'),
        t('plans.business.features.assign_cards'),
        t('plans.business.features.export'),
        t('plans.business.features.support'),
      ],
      price: { bimestriel: 3.99, semestriel: 9.99, annuel: 15 },
      periods: [
        { label: '2 mois', value: 'bimestriel', price: 3.99 },
        { label: '6 mois', value: 'semestriel', price: 9.99 },
        { label: '12 mois', value: 'annuel', price: 15, savings: 38 },
      ],
    },
  ];

  return (
    <PricingPlans
      title={t('title')}
      plans={plans}
    />
  );
}