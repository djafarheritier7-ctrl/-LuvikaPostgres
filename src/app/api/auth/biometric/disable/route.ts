import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';

export async function POST() {
  try {
    const supabase = createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Désactiver toutes les clés (soft delete) ou les supprimer
    const { error } = await supabase
      .from('biometric_credentials')
      .update({ is_active: false })
      .eq('user_id', user.id);
      
    // Ou pour suppression définitive : .delete().eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disable error:', error);
    return NextResponse.json({ error: 'Échec désactivation' }, { status: 500 });
  }
}