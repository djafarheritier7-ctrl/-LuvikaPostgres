import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { profile_id, name, email, phone, message } = await request.json();

  if (!profile_id || !name || !email || !message) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  const supabase = createServerClient();

  try {
    const { error } = await supabase
      .from('contact_requests')
      .insert({
        profile_id,
        name,
        email,
        phone: phone || null,
        message,
        is_read: false,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Contact request error:', err);
    return NextResponse.json({ error: err.message || 'Échec' }, { status: 500 });
  }
}