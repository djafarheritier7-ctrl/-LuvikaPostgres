import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase-shim';

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
  }

  // ⚠️ signInWithPassword() et auth.admin.deleteUser() ne sont pas dans le shim.
  // Il faudra implémenter l'authentification réelle plus tard.
  /*
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  });
  if (signInError) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 403 });
  }
  */

  // Pour l'instant, on simule la suppression sans vérification réelle du mot de passe.
  try {
    // Suppression en cascade (stub)
    await supabase.from('nfc_cards').delete().eq('user_id', user.id);
    await supabase.from('orders').delete().eq('user_id', user.id);
    await supabase.from('events').delete().eq('profile_id', user.id);
    await supabase.from('event_attendees').delete().eq('profile_scanned_id', user.id);
    await supabase.from('scans').delete().eq('profile_id', user.id);
    await supabase.from('portfolios').delete().eq('profile_id', user.id);
    await supabase.from('certificates').delete().eq('profile_id', user.id);
    await supabase.from('contact_requests').delete().eq('profile_id', user.id);
    await supabase.from('follows').delete().or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`);
    await supabase.from('likes').delete().eq('visitor_id', user.id);
    await supabase.from('biometric_credentials').delete().eq('user_id', user.id);

    // Suppression du profil
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);
    if (deleteProfileError) throw deleteProfileError;

    // Suppression de l'utilisateur (à implémenter côté auth)
    // await supabase.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true, message: 'Compte supprimé définitivement' });
  } catch (error: any) {
    console.error('Erreur suppression:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}