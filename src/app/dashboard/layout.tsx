import { redirect } from 'next/navigation';
import { createServerClient } from '@/src/lib/supabase-shim';

export const metadata = {
  title: 'Tableau de bord • LUVIKA',
  description: 'Gérez votre identité numérique, vos cartes NFC, événements et statistiques',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  return (
    <div className="relative min-h-screen bg-transparent text-white">
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );
}