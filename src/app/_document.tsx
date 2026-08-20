// src/app/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Favicon classique */}
        <link rel="icon" href="/icons/lo.png" sizes="32x32" type="image/png" />
        <link rel="shortcut icon" href="/icons/lo.png" />

        {/* Manifest PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/icons/lo-512.png" />

        {/* Meta theme color pour Chrome et Android */}
        <meta name="theme-color" content="#06b6d4" />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Nettoie les attributs parasites avant hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('[data-np-intersection-state]').forEach(el => {
                  el.removeAttribute('data-np-intersection-state');
                });
              });
            `,
          }}
        />
      </body>
    </Html>
  );
}
