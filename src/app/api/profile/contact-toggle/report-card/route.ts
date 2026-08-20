import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { user_id, reason, profile_id } = await req.json();
    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('nfc_cards')
      .update({ 
        status: 'lost',
        lost_reason: reason,
        lost_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('status', 'active');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Report card error:', err);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}