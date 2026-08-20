import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase-shim';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    const supabaseAdmin = createClient();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
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
    const scheduledDeletion = new Date();
    scheduledDeletion.setDate(scheduledDeletion.getDate() + 7);

    for (const userId of userIds) {
      try {
        // ⚠️ TODO : auth.admin.getUserById() n'est pas dans le shim.
        // const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        // if (userError || !userData?.user) { ... }
        const userEmail = null; // placeholder

        const { data: existingWarning } = await supabaseAdmin
          .from('inactive_account_warnings')
          .select('id')
          .eq('user_id', userId)
          .eq('deleted', false)
          .single();

        if (existingWarning) {
          results.push({ userId, success: false, error: 'Avertissement déjà envoyé' });
          continue;
        }

        await supabaseAdmin
          .from('inactive_account_warnings')
          .insert({
            user_id: userId,
            scheduled_deletion: scheduledDeletion.toISOString(),
            email_sent: true,
          });

        // ⚠️ TODO : Envoi email Resend (à réactiver quand le backend auth/email sera prêt)
        /*
        if (userEmail && process.env.RESEND_API_KEY) { ... }
        */

        results.push({ userId, success: true, email: userEmail });
      } catch (error) {
        console.error(`Erreur pour l'utilisateur ${userId}:`, error);
        results.push({ userId, success: false, error: 'Erreur serveur' });
      }
    }

    return NextResponse.json({ results, scheduledDeletion });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}