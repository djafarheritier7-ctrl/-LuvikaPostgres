import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();

  try {
    // 🔐 1. Vérification authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('⚠️ Non authentifié - Cookie manquant ou invalide');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 🔐 2. VÉRIFICATION ADMIN VIA profiles
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single();

    if (profileError || !adminProfile) {
      console.warn('⚠️ Accès refusé: utilisateur non-admin', { 
        userId: user.id, 
        email: user.email,
        profileError: profileError?.message 
      });
      return NextResponse.json({ 
        error: 'Accès réservé aux administrateurs' 
      }, { status: 403 });
    }

    // ✅ 3. Récupération des profils
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        username,
        email,
        created_at,
        plan,
        role
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase profiles:', error);
      throw error;
    }

    // ✅ 4. Transformation
    const usersWithStatus = (profiles || []).map((profile: any) => ({
      ...profile,
      banned_until: null,
      isBanned: false,
    }));

    console.log(`✅ API /api/admin/users: ${usersWithStatus.length} utilisateurs retournés`);
    return NextResponse.json(usersWithStatus);
    
  } catch (error: any) {
    console.error('❌ Erreur critique /api/admin/users:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return NextResponse.json({ 
      error: 'Erreur serveur interne',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}