import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userIdToBan } = await params;
  console.log("Tentative de bannir l'utilisateur:", userIdToBan);

  const supabase = createServerClient();

  // ✅ CORRECTION SÉCURISÉE
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const adminId = user.id;
  console.log("Admin demandant le bannissement:", adminId);

  if (userIdToBan === adminId) {
    console.log("Tentative d'auto-bannissement:", adminId);
    return NextResponse.json({ error: 'Auto-bannissement interdit' }, { status: 400 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
    return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
  }

  try {
    // 🔥 Bannir via API REST (inchangé car indépendant du shim)
    const banRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userIdToBan}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banned_until: 'infinity',
        }),
      }
    );

    if (!banRes.ok) {
      const errorText = await banRes.text();
      console.error('Erreur bannissement API REST:', errorText);
      return NextResponse.json({ error: 'Échec du bannissement via API REST' }, { status: banRes.status });
    }
    console.log("Utilisateur banni via API REST avec succès:", userIdToBan);

    // ✅ Désactiver dans profiles
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ verified: false })
      .eq('id', userIdToBan);

    if (profileUpdateError) {
      console.error('Erreur mise à jour profile:', profileUpdateError);
    } else {
      console.log("Profil mis à jour avec succès:", userIdToBan);
    }

    // 📜 Audit
    const { error: auditError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action: 'ban_user',
        target_user_id: userIdToBan,
        details: { reason: 'Bannissement manuel' },
      });

    if (auditError) {
      console.error('Erreur log audit dans admin_actions:', auditError);
    } else {
      console.log("Log d'audit inséré avec succès dans admin_actions");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Exception dans le processus de bannissement:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}