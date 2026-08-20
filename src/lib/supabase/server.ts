// src/lib/supabase/server.ts
import { createServerClient as createShimServerClient } from '@/src/lib/supabase-shim';
import { cookies } from 'next/headers';

// Utilisé côté server components / layouts.
// Récupère automatiquement la cookie entrante et la passe au shim.
export async function createClientForPage() {
  // cookies() peut renvoyer un CookieStore asynchrone dans certaines versions/contextes Next
  const cookieStore = await cookies();
  const cookieString =
    cookieStore && typeof (cookieStore as any).toString === 'function'
      ? (cookieStore as any).toString()
      : (cookieStore ? String(cookieStore) : '');
  return createShimServerClient(cookieString);
}

// Alias : pour les cas où on voudrait forcer une cookie spécifique,
// on accepte un param optionnel (fallback sur cookies() si non fourni).
export async function createClientForAction(cookieString?: string) {
  if (cookieString) return createShimServerClient(cookieString);
  const cookieStore = await cookies();
  const cs =
    cookieStore && typeof (cookieStore as any).toString === 'function'
      ? (cookieStore as any).toString()
      : (cookieStore ? String(cookieStore) : '');
  return createShimServerClient(cs);
}

// Helper pour récupérer l'utilisateur côté serveur (utilise la cookie entrante).
export const auth = {
  async getUser() {
    const supabase = await createClientForPage();
    return supabase.auth.getUser();
  },
};

// Expose également le createServerClient du shim pour usage direct dans des route handlers.
// (Les route handlers doivent idéalement appeler createServerClient(request.headers.get('cookie')).
export { createShimServerClient as createServerClient };
