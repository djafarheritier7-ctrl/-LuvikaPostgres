// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ClientProviders } from '@/src/components/system/ClientProviders';
import CookieBanner from '../components/layout/CookieBanner';
import InstallModal from '../components/layout/InstallModal';
import SessionGuard from '../components/SessionGuard';
import { SessionTimeoutProvider } from '../components/providers/SessionTimeoutProvider';
import { ReviewPrompt } from '../components/system/ReviewPrompt';
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';
import FluidBackground from '../components/effects/FluidBackground';
import { SafariDesktopAlert } from '../components/layout/SafariDesktopAlert';
import ExtensionCleaner from '../components/layout/ExtensionCleaner';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://luvika.vercel.app'),
  title: {
    default: 'LUVIKA — Révèle qui tu es',
    template: '%s | LUVIKA',
  },
  description: 'Carte de visite intelligente NFC, QR Code, abonnements et identité numérique africaine.',
  applicationName: 'LUVIKA',
  keywords: ['carte visite numérique', 'NFC', 'QR code', 'identité numérique', 'réseau professionnel', 'Afrique', 'LUVIKA'],
  authors: [{ name: 'LUVIKA Team' }],
  creator: 'LUVIKA',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    type: 'website',
    url: 'https://luvika.vercel.app',
    title: 'LUVIKA — Révèle qui tu es',
    description: 'Carte de visite intelligente NFC, QR Code et identité numérique africaine.',
    siteName: 'LUVIKA',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'LUVIKA' }],
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LUVIKA — Révèle qui tu es',
    description: 'Carte de visite intelligente NFC, QR Code et identité numérique africaine.',
    images: ['/og-image.png'],
    creator: '@luvika',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: { google: 'StrToXBAcUOqWud04cCkAjsXw8jWQEHe8BluylfOEAU' },
  alternates: {
    canonical: 'https://luvika.vercel.app',
    languages: { 'fr-FR': 'https://luvika.vercel.app/fr', 'en-US': 'https://luvika.vercel.app/en' },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#06b6d4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LUVIKA" />
        <link rel="apple-touch-icon" href="/icons/lo-192.png" />
        
        {/* ✅ Script anti-flash pour le thème */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('luvika-theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      
      <body className={`${inter.className} min-h-screen bg-transparent text-white relative overflow-x-hidden antialiased`} suppressHydrationWarning>
        <FluidBackground />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="luvika-theme">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ExtensionCleaner />
              <ClientProviders>
                <SessionTimeoutProvider>
                  <SessionGuard>
                    {children}
                    <ReviewPrompt />
                  </SessionGuard>
                  <CookieBanner />
                  <InstallModal />
                  <SafariDesktopAlert />
                </SessionTimeoutProvider>
              </ClientProviders>
          </NextIntlClientProvider>
        </ThemeProvider>

        {/* SERVICE WORKER */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            // Only register service worker in production to avoid dev-time blob/fallback issues
            if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
              window.addEventListener('load', async () => {
                try {
                  const res = await fetch('/sw.js', { cache: 'no-store' });
                  if (!res.ok) {
                    console.info('sw.js not found (status:', res.status, '), skipping service worker registration.');
                    return;
                  }

                  // Register the SW served from /sw.js (must be a standalone JS file in /public)
                  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                  console.log('✅ Service Worker enregistré:', registration.scope);

                  registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                      newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          console.log('🔄 Nouvelle version du SW disponible');
                          // Optionally notify the user — avoid blocking navigation automatically
                        }
                      });
                    }
                  });
                } catch (err) {
                  console.error('❌ Erreur lors de l’enregistrement du Service Worker:', err);
                  // Do not attempt blob fallback — browsers disallow blob: registration for SWs.
                }
              });
            } else {
              // In dev we explicitly skip SW registration to avoid intercepting local API responses
              console.debug('Service Worker registration skipped (not production or unsupported).');
            }
          `}
        </Script>

        {/* GOOGLE ANALYTICS */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-RYQBRH3CZC" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date());
            gtag('config', 'G-RYQBRH3CZC', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `}
        </Script>
      </body>
    </html>
  );
}
