// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';

// Liste des locales supportées
const locales = ['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Si locale invalide ou absente → on force 'fr' (ou 'en')
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'fr';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});