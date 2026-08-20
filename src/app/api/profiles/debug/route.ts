// src/app/api/profiles/debug/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';

export async function GET() {
  const supabase = createServerClient();

  // Récupération des profils sans count exact
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, email, created_at, role, plan, onboarding_done')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ 
      error: 'Erreur base de données', 
      details: typeof error === 'string' ? error : (error as any)?.message || 'Erreur inconnue',
      code: (error as any)?.code
    }, { status: 500 });
  }

  const count = profiles?.length || 0;

  // Stub auth.admin.listUsers : renvoie une liste vide
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  const sampleEmails = Array.isArray(authUsers?.users) 
    ? authUsers.users.slice(0, 5).map((u: any) => u.email).filter(Boolean)
    : [];

  return NextResponse.json({
    diagnostics: {
      total_profiles: count,
      total_auth_users: authUsers?.users?.length || 0,
      database_connected: true,
      timestamp: new Date().toISOString()
    },
    profiles_table: {
      count: count,
      sample_data: profiles || [],
      usernames: profiles?.map((p: any) => p.username) || []
    },
    auth_users: {
      count: authUsers?.users?.length || 0,
      note: authError ? "Impossible d'accéder aux utilisateurs auth (permissions)" : "OK",
      sample_emails: sampleEmails
    },
    next_steps: count === 0 ? [
      "1. Créez un compte utilisateur via votre interface d'inscription",
      "2. Ou insérez des données de test via Supabase Dashboard",
      "3. SQL: INSERT INTO profiles (id, username, full_name, email) VALUES (gen_random_uuid(), 'testuser', 'Test User', 'test@example.com')"
    ] : []
  });
}