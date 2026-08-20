import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { user_id, enabled } = await req.json();

    const supabase = createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== user_id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ accepts_contact_requests: enabled })
      .eq('id', user_id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Toggle contact requests error:', err);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}