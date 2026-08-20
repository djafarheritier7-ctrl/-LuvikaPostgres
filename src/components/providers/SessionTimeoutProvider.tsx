// src/components/providers/SessionTimeoutProvider.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '../../lib/supabase/client';
import { LogOut, AlertTriangle } from 'lucide-react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 60 * 1000; // 1 minute avant expiration

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());
  const isSigningOutRef = useRef(false);
  const warningShownRef = useRef(false);

  const handleSignOut = useCallback(async () => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;
    
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth/sign-in?reason=timeout');
      toast('Session expirée', {
        description: 'Déconnecté pour inactivité. Veuillez vous reconnecter.',
        icon: <LogOut className="w-4 h-4 text-amber-400/70" />,
        duration: 5000,
      });
    } catch (error) {
      console.error('Erreur déconnexion timeout:', error);
      router.push('/auth/sign-in?reason=error');
    } finally {
      isSigningOutRef.current = false;
    }
  }, [router]);

  const resetTimers = useCallback(() => {
    // Nettoyer les timers existants
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    
    // Mettre à jour le timestamp d'activité
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    // Programmer l'avertissement
    warningRef.current = setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT - WARNING_TIME && !warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning('Session inactive', {
          description: 'Déconnexion automatique dans 60 secondes',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400/70" />,
          duration: Math.min(WARNING_TIME - 1000, 10000), // S'assurer que le toast dure moins que le délai restant
        });
      }
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Programmer la déconnexion
    timeoutRef.current = setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT) {
        handleSignOut();
      } else {
        // Si l'utilisateur a été actif entre-temps, reprogrammer
        resetTimers();
      }
    }, INACTIVITY_TIMEOUT);
  }, [handleSignOut]);

  useEffect(() => {
    // Événements à écouter pour détecter l'activité
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove', 'click'];
    
    // Initialiser les timers
    resetTimers();
    
    // Ajouter les écouteurs
    events.forEach(event => {
      window.addEventListener(event, resetTimers, { passive: true });
    });

    // Nettoyer
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimers);
      });
    };
  }, [resetTimers]);

  return <>{children}</>;
}