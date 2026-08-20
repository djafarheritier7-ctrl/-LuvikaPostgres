import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '../src/lib/supabase-shim';

export async function getServerSession() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireAdmin() {
  const user = await getServerSession();
  if (!user) {
    redirect('/auth/sign-in');
  }
  if (user.user_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }
  return user;
}