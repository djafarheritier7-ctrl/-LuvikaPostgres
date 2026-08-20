// src/components/system/ClientProviders.tsx
'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { NetworkWatcher } from './NetworkWatcher';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Service Worker pour PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered:', registration.scope))
          .catch(error => console.log('SW registration failed:', error));
      });
    }
  }, []);

  if (!isClient) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="luvika-theme">
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="luvika-theme">
      {children}
      <Toaster 
        richColors 
        position="top-right" 
        toastOptions={{
          className: 'text-sm font-light',
        }}
      />
      <NetworkWatcher />
    </ThemeProvider>
  );
}