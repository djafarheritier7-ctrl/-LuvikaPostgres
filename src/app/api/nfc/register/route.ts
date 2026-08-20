import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  const { data : { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { user_id, username } = await req.json();

  if (user.id !== user_id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { error } = await supabase
    .from('nfc_cards')
    .insert({
      user_id,
      card_id: crypto.randomUUID(),
      status: 'active',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Erreur enregistrement NFC:', error);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}