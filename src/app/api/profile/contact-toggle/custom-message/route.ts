import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { user_id, message } = await req.json();
    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id,
        message,
        type: 'custom',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Custom message error:', err);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}