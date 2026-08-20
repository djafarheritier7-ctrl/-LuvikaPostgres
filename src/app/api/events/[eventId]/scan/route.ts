import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(request: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  const body = await request.json();
  const { name, email, token } = body;

  if (!name && !token) return NextResponse.json({ error: 'Nom ou token requis' }, { status: 400 });

  const supabase = createServerClient();

  // Si token fourni -> vérifier et marquer le participant
  if (token) {
    // Vérifier le participant par token
    const { data: participant } = await supabase
      .from('event_participants')
      .select('id, name, is_checked_in')
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
    await supabase
      .from('event_participants')
      .update({ is_checked_in: true, checked_in_at: new Date().toISOString() })
      .eq('id', participant.id);

    // Audit
    await supabase.from('event_attendees').insert({
      event_id: eventId,
      profile_scanned_id: null,
      name: participant.name || name || 'Visiteur',
      email: email ?? null,
      scanned_at: new Date().toISOString(),
      is_anonymous: true
    });

    return NextResponse.json({ success: true, name: participant.name || name });
  }

  // Sans token : insertion directe dans event_attendees
  const { data: inserted, error } = await supabase
    .from('event_attendees')
    .insert({ event_id: eventId, profile_scanned_id: null, name: name ?? 'Visiteur', email: email ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  return NextResponse.json({ success: true, attendee: inserted });
}