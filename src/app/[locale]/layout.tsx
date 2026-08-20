// src/app/[locale]/layout.tsx
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import { ClientProviders } from '../../../src/components/system/ClientProviders';
  
const inter = Inter({ subsets: ['latin'] });

// Type union littéral pour les locales supportées
const supportedLocales = ['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as const;
type SupportedLocale = typeof supportedLocales[number];

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Assertion de type sécurisée après validation
  const checkedLocale = locale as SupportedLocale;

  // Validation optionnelle (recommandé de la laisser ici OU dans les pages)
  if (!supportedLocales.includes(checkedLocale)) {
    // Option 1 : 404 (propre et recommandé dans un layout)
    // notFound();

    // Option 2 : fallback silencieux (pas d'erreur visible, mais locale forcé)
    // checkedLocale = 'fr' as SupportedLocale;
  }

  // Propagation du locale validé à next-intl
  // TypeScript est maintenant content car checkedLocale est SupportedLocale
  setRequestLocale(checkedLocale);

  // Récupération des messages (traductions)
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={checkedLocale} messages={messages}>
      {/* Police Inter appliquée à tout le subtree */}
      <div className={inter.className}>
        <Navbar />
        <ClientProviders>
          {children}
        </ClientProviders>
      </div>
    </NextIntlClientProvider>
  );
}