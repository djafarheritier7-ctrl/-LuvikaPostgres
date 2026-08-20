// src/app/dashboard/entreprise/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { 
  LayoutDashboard, ChevronLeft, Menu, X,
  Settings, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCompanyModules, CompanyModule, getCompanyConfig } from '@/src/config/company-modules';
import Loading from '@/src/components/system/Loading';

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/sign-in'); return; }

      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!data) {
        router.push('/dashboard/entreprise/setup');
        return;
      }

      setCompany(data);
      setLoading(false);
    };

    fetchCompany();
  }, []);

  if (loading) return <Loading />;

  const companyConfig = getCompanyConfig(company.company_type);
  const modules = getCompanyModules(company.company_type, companyConfig.features);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const SidebarContent = () => (
    <div className="">
      {/* Logo & Info */}
      <div className="p-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${companyConfig.color} flex items-center justify-center`}>
            {companyConfig.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white/70 font-medium truncate">{company.name}</p>
            <p className="text-[11px] text-gray-400/60 font-light">{companyConfig.label}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Dashboard */}
        <button
          onClick={() => router.push('/dashboard/entreprise')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
            isActive('/dashboard/entreprise') && !pathname.includes('/settings') && !pathname.includes('/orders') && !pathname.includes('/cards') && !pathname.includes('/menu') && !pathname.includes('/rooms') && !pathname.includes('/appointments') && !pathname.includes('/patients')
              ? 'bg-white/[0.08] text-white/80'
              : 'text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          <span>Tableau de bord</span>
        </button>

        {/* Modules dynamiques */}
        {modules
          .filter(m => m.id !== 'settings')
          .map(module => (
            <button
              key={module.id}
              onClick={() => router.push(module.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                isActive(module.path)
                  ? 'bg-white/[0.08] text-white/80'
                  : 'text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              {module.icon}
              <span>{module.label}</span>
              {module.required && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
              )}
            </button>
          ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.04] space-y-1">
        <button
          onClick={() => router.push('/dashboard/entreprise/settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
            isActive('/dashboard/entreprise/settings')
              ? 'bg-white/[0.08] text-white/80'
              : 'text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04]'
          }`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>Paramètres</span>
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-400/60 hover:text-red-400/70 hover:bg-red-500/[0.04] transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Quitter</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0 }}
        className="hidden lg:block h-full bg-transparent backdrop-blur-xl border-r border-white/[0.04] overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-slate-900/95 backdrop-blur-xl border-r border-white/[0.04] z-50 lg:hidden"
            >
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="h-8 w-8 p-0 text-gray-400/60 hover:text-white/70 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/[0.04] flex items-center justify-between px-4 bg-slate-900/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden h-8 w-8 p-0 text-gray-400/60 hover:text-white/70 rounded-lg"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex h-8 w-8 p-0 text-gray-400/60 hover:text-white/70 rounded-lg"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400/60 font-light">
              {company.name}
            </div>
          </div>
        </header>

{/* Page Content */}
<main className="flex-1 overflow-y-auto w-full">
  <div className="w-full px-4 py-4 lg:px-8 lg:py-8">
    {children}
  </div>
</main>
      </div>
    </div>
  );
}