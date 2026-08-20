import { redirect } from 'next/navigation';
import { createServerClient } from '@/src/lib/supabase-shim';
import { HomePageContent } from '../../../components/home/HomePageContent';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // 🔹 Validation locale
  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
  if (!supported.includes(locale as any)) {
    redirect('/fr');
  }

  // 🔹 Auth check
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data : profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || 'user';
    redirect(role === 'admin' ? '/admin' : `/${locale}/dashboard`);
  }

  return <HomePageContent />;
}