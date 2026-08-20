import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@/src/lib/supabase-shim';

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient();

  const code = searchParams.code as string;
  const next = (searchParams.next as string) || '/complete-profile';
  const plan = (searchParams.plan as string) || 'basic';

  if (code) {
    // 🔹 Le shim n'a pas d'échange de code réel ; on simule une connexion réussie.
    // La session sera gérée par le client via /api/auth/me (utilisateur démo).
    // await supabase.auth.exchangeCodeForSession(code);

    cookieStore.set('signup_plan', plan, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/',
    });

    redirect(next);
  }

  redirect('/auth/sign-in');
}