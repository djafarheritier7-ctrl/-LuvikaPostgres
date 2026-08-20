import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase-shim';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(); // shim unique pour admin et anon

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // ⚠️ TODO : auth.admin.listUsers() et .in() ne sont pas dans le shim.
    // On renvoie pour l'instant une liste vide.
    return NextResponse.json({ users: [] });

    /* === Ancien code à réactiver une fois le backend prêt ===
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    ...
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, username, plan').in('id', userIds);
    ...
    return NextResponse.json({ users: combined });
    */
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}