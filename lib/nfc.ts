// src/lib/nfc.ts
// Simulation NFC en développement

export async function simulateNFCTap(profileId: string, userId?: string) {
  // En prod : on lira la carte NFC → récupère `card_id`
  // Ici : on simule un scan avec des données factices

  const fakeCardId = 'NTAG215-SIM-DEV-' + profileId.slice(0, 8);

  // Log dans la console
  console.log('🔍 NFC scan simulé', {
    card_id: fakeCardId,
    profile_id: profileId,
    scanner_id: userId || 'anonymous',
    timestamp: new Date().toISOString(),
  });

  // À terme : appel à une API qui insert dans `scans`
  return {
    success: true,
    card_id: fakeCardId,
  };
}