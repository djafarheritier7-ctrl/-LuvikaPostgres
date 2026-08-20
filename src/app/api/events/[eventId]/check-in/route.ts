import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { token, name } = await request.json();

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token invalide ou manquant' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Vérifier l'événement
  const { data: event } = await supabase
    .from('events')
    .select('id, is_public, profile_id')
    .eq('id', eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
  }

  // Vérifier le token du participant
  const { data: participant } = await supabase
    .from('event_participants')
    .select('id, name, is_checked_in, checked_in_at')
    .eq('event_id', eventId)
    .eq('qr_token', token)
    .single();

  if (!participant) {
    return NextResponse.json({ error: 'QR code non reconnu' }, { status: 404 });
  }

  if (participant.is_checked_in) {
    return NextResponse.json({ error: 'Déjà scanné' }, { status: 409 });
  }

  // Marquer comme présent
  const { error: updateError } = await supabase
    .from('event_participants')
    .update({ is_checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', participant.id);

  if (updateError) {
    console.error('Erreur check-in:', updateError);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }

  // Insérer dans event_attendees pour audit
  await supabase.from('event_attendees').insert({
    event_id: eventId,
    profile_scanned_id: null,
    name: participant.name || name || 'Visiteur',
    email: null,
    scanned_at: new Date().toISOString(),
    is_anonymous: true
  });

  return NextResponse.json({ 
    success: true, 
    name: participant.name || name,
    checked_in_at: new Date().toISOString()
  });
}