// src/hooks/useNFC.ts
import { useState, useEffect } from 'react';

type NFCMessage = {
  url: string;
};

export function useNFC() {
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifie le support NFC
    const supported = typeof window !== 'undefined' && 'NDEFReader' in window;
    setIsNFCSupported(supported);
  }, []);

  const startScan = async (onScan: (url: string) => void) => {
    if (!isNFCSupported) {
      setError('NFC non supporté sur cet appareil');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);

      // @ts-ignore
      const reader = new NDEFReader();
      await reader.scan();

      reader.addEventListener('reading', (event: any) => {
        const message = event.message.records[0];
        const url = new TextDecoder().decode(message.data);
        onScan(url);
        reader.stop(); // Arrête après 1 lecture
      });

      reader.addEventListener('error', (err: any) => {
        setError('Erreur NFC : ' + err.message);
        setIsScanning(false);
      });
    } catch (err: any) {
      setError(err.message || 'Impossible de démarrer le scan NFC');
      setIsScanning(false);
    }
  };

  return {
    isNFCSupported,
    isScanning,
    error,
    startScan,
  };
}