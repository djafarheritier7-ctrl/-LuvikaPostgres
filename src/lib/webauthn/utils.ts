// src/lib/webauthn/utils.ts

/**
 * Nettoye le RP ID pour correspondre exactement au domaine courant
 * Ex: "https://luvika.vercel.app"
 */
export function getRpId(): string {
  if (typeof window === 'undefined') {
    // Environnement serveur
    const raw = process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || 
                process.env.NEXT_PUBLIC_SITE_URL || 
                'localhost';
    
    return raw
      .replace(/^https?:\/\//, '')
      .replace(/:\d+$/, '')
      .replace(/\/+$/, '')
      .trim();
  }
  
  // Environnement client (fallback)
  return window.location.hostname;
}

/**
 * ✅ AJOUTÉ : Retourne l'origin complet (scheme + hostname + port)
 * Utilisé pour les assertions WebAuthn (doit correspondre EXACTEMENT à l'origin enregistré)
 */
export function getOrigin(): string {
  if (typeof window !== 'undefined') {
    // Client-side : utilise l'origin natif
    return window.location.origin;
  }
  
  // Server-side : utilise la variable d'environnement
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      // Parse proprement l'URL pour extraire l'origin
      const url = new URL(siteUrl);
      return url.origin;
    } catch {
      // Fallback robuste si URL invalide
      const match = siteUrl.match(/^(https?:\/\/[^\/:]+)(?::\d+)?/);
      return match ? match[1] : 'http://localhost:3000';
    }
  }
  
  // Fallback développement
  return process.env.NODE_ENV === 'production' 
    ? 'https://luvika.me' 
    : 'http://localhost:3000';
}

/**
 * Convertit un Buffer en base64url (requis par WebAuthn)
 */
// src/lib/webauthn/utils.ts (ajout)

export function bufferToBase64url(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function base64urlToBuffer(base64url: string): Buffer {
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  return Buffer.from(padded, 'base64');
}