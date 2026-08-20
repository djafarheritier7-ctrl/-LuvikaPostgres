import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase-shim';

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { reason } = await request.json();

    const { error } = await supabase
      .from('profiles')
      .update({
        deactivated: true,
        deactivation_reason: reason || null,
        deactivated_at: new Date().toISOString(),
        is_public: false,
      })
      .eq('id', user.id);

    if (error) throw error;

    // ⚠️ La méthode auth.signOut() n'existe pas encore dans le shim.
    // À implémenter plus tard.
    // await supabase.auth.signOut();

    return NextResponse.json({ success: true, message: 'Compte désactivé' });
  } catch (error: any) {
    console.error('Deactivation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la désactivation' },
      { status: 500 }
    );
  }
}