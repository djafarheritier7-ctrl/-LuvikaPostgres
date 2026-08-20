import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = createServerClient();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: warningsToDelete } = await supabase
      .from('inactive_account_warnings')
      .select('user_id')
      .eq('deleted', false)
      .lt('scheduled_deletion', sevenDaysAgo.toISOString());

    if (!warningsToDelete || warningsToDelete.length === 0) {
      return NextResponse.json({ message: 'Aucun compte à supprimer' });
    }

    const results = [];
    for (const warning of warningsToDelete) {
      try {
        await supabase.from('profiles').delete().eq('id', warning.user_id);
        await supabase.auth.admin.deleteUser(warning.user_id);
        await supabase
          .from('inactive_account_warnings')
          .update({ deleted: true, deleted_at: new Date().toISOString() })
          .eq('user_id', warning.user_id);

        results.push({ userId: warning.user_id, success: true });
      } catch (error) {
        console.error(`Erreur suppression ${warning.user_id}:`, error);
        results.push({ userId: warning.user_id, success: false });
      }
    }

    return NextResponse.json({ 
      message: `${results.length} compte(s) traité(s)`,
      results 
    });
  } catch (error) {
    console.error('Erreur cron:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}