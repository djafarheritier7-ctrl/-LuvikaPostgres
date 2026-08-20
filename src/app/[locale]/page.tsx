import { notFound, redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createServerClient } from '@/src/lib/supabase-shim';
import { HomePageContent } from '../../components/home/HomePageContent';

type SupportedLocale = 'ar' | 'en' | 'es' | 'fr' | 'kg' | 'ln' | 'nl' | 'pt' | 'sw';

const supported: readonly SupportedLocale[] = ['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const checkedLocale = locale as SupportedLocale;

  if (!supported.includes(checkedLocale)) {
    notFound(); // ← ou redirect('/fr') si tu préfères
  }

  setRequestLocale(checkedLocale);

  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || 'user';
    redirect(`/${checkedLocale}/${role === 'admin' ? 'admin' : 'dashboard'}`);
  }

  return <HomePageContent />;
}