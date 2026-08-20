// src/app/[locale]/public/contact/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ContactContent from '../../../../components/contact/ContactContent';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
  if (!supported.includes(locale as any)) notFound();

  const t = await getTranslations({ locale });
  const tFooter = await getTranslations({ locale, namespace: 'footer' });

  return (
    <>
      <ContactContent
        title={t('contact.title')}
        subtitle={t('contact.subtitle')}
        address={t('contact.address')}
        email={t('contact.email')}
        phone={t('contact.phone')}
        form_title={t('contact.form_title')}
        name={t('contact.name')}
        name_placeholder={t('contact.name_placeholder')}
        message={t('contact.message')}
        message_placeholder={t('contact.message_placeholder')}
        send={t('contact.send')}
      />
    </>
  );
}