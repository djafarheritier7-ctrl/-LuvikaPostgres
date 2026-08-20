// src/app/auth/reset-password/page.tsx
import { redirect } from 'next/navigation';

export default function ResetPasswordRedirect({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tokenHash = searchParams.token_hash;
  const type = searchParams.type;
  const next = searchParams.next;

  // 🔹 Redirection immédiate vers /auth/update-password avec les params préservés
  // ⚠️ redirect() arrête l'exécution ici - tout code après est INACCESSIBLE
  const url = new URL(
    '/auth/update-password', 
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  );
  
  if (tokenHash) url.searchParams.set('token_hash', tokenHash as string);
  if (type) url.searchParams.set('type', type as string);
  if (next) url.searchParams.set('next', next as string);

  redirect(url.toString());
  
  // ❌ AUCUN CODE ICI - redirect() empêche toute exécution ultérieure
}