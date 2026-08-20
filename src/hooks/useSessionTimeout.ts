// src/hooks/useSessionTimeout.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export function useSessionTimeout() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let timeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);

      // Avertissement à 14 minutes
      warningTimeout = setTimeout(() => {
        if (confirm('⚠️ Session inactive. Voulez-vous rester connecté ?')) {
          resetTimer();
        } else {
          handleSignOut();
        }
      }, INACTIVITY_TIMEOUT - 60000);

      // Déconnexion à 15 minutes
      timeout = setTimeout(() => {
        handleSignOut();
      }, INACTIVITY_TIMEOUT);
    };

    const handleSignOut = async () => {
      await supabase.auth.signOut();
      // ✅ Utilise le routeur Next.js au lieu de window.location
      router.push('/auth/sign-in?reason=timeout');
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));

    resetTimer();

    return () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [router]);
}