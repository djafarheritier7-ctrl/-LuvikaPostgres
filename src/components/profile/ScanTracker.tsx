// src/components/profile/ScanTracker.tsx
'use client';

import { useEffect } from 'react';

export default function ScanTracker({ profileId }: { profileId: string }) {
  useEffect(() => {
    // 🔹 Vérifie le consentement
    if (typeof window !== 'undefined' && (window as any)._luvika_disable_analytics) {
      return; // ❌ Bloque si refusé
    }

    if (!profileId) return;
    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, scan_type: 'qr_profile' }),
    }).catch(console.warn);
  }, [profileId]);

  return null;
}