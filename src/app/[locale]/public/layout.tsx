// src/app/[locale]/public/layout.tsx
import Link from "next/link";
import { Toaster } from "sonner";
//import Footer from "../../../components/layout/Footer"; // 👈 Import
import { getTranslations } from "next-intl/server"; // 👈 Pour les traductions
import Head from 'next/head';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 👇 Récupère les traductions du footer
  const t = await getTranslations("footer");

  return (
    <>
      <Head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-RYQBRH3CZC"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RYQBRH3CZC');
            `
          }}
        />
      </Head>
      <div className="min-h-screen flex flex-col">
        {/* Fond animé spécifique au profil */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-indigo-900/10"></div>
        </div>

        <main className="w-full flex-1">
          {children}
          <Toaster richColors position="top-right" />
        </main>

      </div>
    </>
  );
}
