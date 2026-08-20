// src/hooks/useSoundNotification.ts
import { useEffect, useRef } from 'react';

export const useSoundNotification = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Crée l'élément audio une seule fois
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.7;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      // Réinitialise et joue
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn('🔇 Son bloqué:', e));
    }
  };

  return { playSound };
};