// src/contexts/AdminLayoutContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

type AdminLayoutContextType = {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export function AdminLayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <AdminLayoutContext.Provider value={{ isSidebarCollapsed, toggleSidebar }}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error('useAdminLayout doit être utilisé dans AdminLayoutProvider');
  }
  return context;
}