import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
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

    const { userIds } = await request.json();
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Aucun utilisateur spécifié' }, { status: 400 });
    }

    const results = [];

    for (const userId of userIds) {
      try {
        await supabase
          .from('inactive_account_warnings')
          .update({ deleted: true, deleted_at: new Date().toISOString() })
          .eq('user_id', userId);

        await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        // ⚠️ TODO : auth.admin.deleteUser() n'est pas dans le shim.
        // const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

        await supabase.from('admin_actions').insert({
          admin_id: user.id,
          action: 'delete_inactive_account',
          target_user_id: userId,
          details: { reason: 'inactive_30_days', deleted_at: new Date().toISOString() },
        });

        results.push({ userId, success: true });
      } catch (error) {
        console.error(`Erreur suppression utilisateur ${userId}:`, error);
        results.push({ userId, success: false, error: 'Erreur serveur' });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}