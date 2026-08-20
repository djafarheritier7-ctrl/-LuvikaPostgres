import { createServerClient } from '@/src/lib/supabase-shim';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';
import { AdminHeader } from '@/src/components/admin/AdminHeader';
import { AdminSidebar } from '@/src/components/admin/AdminSidebar';
import { AdminLayoutProvider } from '@/src/contexts/AdminLayoutContext';
import { NetworkWatcher } from '@/src/components/system/NetworkWatcher';

export const metadata = {
  title: 'Admin Panel • LUVIKA',
  description: 'Espace administrateur - Gestion des utilisateurs, abonnements, commandes NFC et statistiques',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  return (
    <AdminLayoutProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" suppressHydrationWarning>
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 ml-16 lg:ml-56 pt-14 min-h-screen">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
        <Toaster position="top-right" richColors closeButton duration={5000} visibleToasts={3} />
        <NetworkWatcher />
      </div>
    </AdminLayoutProvider>
  );
}