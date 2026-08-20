// src/components/DetectBlockingExtensions.tsx
'use client';

import { useEffect, useState } from 'react';

export default function DetectBlockingExtensions() {
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    // ✅ Test asynchrone de canal de message
    const testChannel = () => {
      try {
        const channel = new MessageChannel();
        const promise = new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve('timeout');
          }, 100);
          channel.port1.onmessage = (e) => {
            clearTimeout(timeout);
            resolve(e.data);
          };
        });

        // Envoie un message
        channel.port2.postMessage('ping');
        channel.port2.start();

        promise.then((result) => {
          if (result === 'timeout') {
            console.warn('⚠️ Channel timeout — extension bloquante détectée');
            setIsBlocking(true);
          }
          channel.port1.close();
          channel.port2.close();
        });
      } catch (err) {
        console.warn('⚠️ MessageChannel failed — extension bloquante probable', err);
        setIsBlocking(true);
      }
    };

    // Test après 2s (laisse le temps au chargement)
    const timer = setTimeout(testChannel, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isBlocking) return null;

  // ✅ UI non intrusive — en haut à droite
  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-900/90 border border-yellow-500/40 text-yellow-100 px-4 py-2 rounded-lg max-w-xs shadow-lg">
      <div className="flex items-start gap-2">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-medium">Extensions détectées</p>
          <p className="text-sm mt-1">
            NordPass, uBlock ou Privacy Badger peuvent bloquer l’affichage.
            Essayez en navigation privée.
          </p>
        </div>
      </div>
    </div>
  );
}