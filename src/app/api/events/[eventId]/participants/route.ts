import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  try {
    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { data: event, error: evError } = await supabase
      .from('events')
      .select('profile_id')
      .eq('id', eventId)
      .single();

    if (evError) {
      console.error('Erreur récupération event (GET participants):', evError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    if (!event || event.profile_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { data: participants, error } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur fetching participants:', error);
      return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json(participants || []);
  } catch (err: any) {
    console.error('Erreur API participants GET:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  try {
    const payload = await request.json();
    const { name, email } = payload;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du participant est requis' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { data: event, error: evError } = await supabase
      .from('events')
      .select('profile_id')
      .eq('id', eventId)
      .single();

    if (evError) {
      console.error('Erreur récupération event (POST participant):', evError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    if (!event || event.profile_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const participantToInsert = {
      event_id: eventId,
      name: name.trim(),
      email: email?.trim() || null,
      qr_token: uuidv4(),
      is_checked_in: false,
      checked_in_at: null,
    };

    const { data: insertedParticipant, error } = await supabase
      .from('event_participants')
      .insert(participantToInsert)
      .select()
      .single();

    if (error) {
      console.error('Erreur insertion participant:', error);
      return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }

    const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const qr_code_url = APP_URL ? `${APP_URL.replace(/\/$/, '')}/events/${eventId}?token=${encodeURIComponent(insertedParticipant.qr_token)}` : null;

    return NextResponse.json({ ...insertedParticipant, qr_code_url }, { status: 201 });
  } catch (err: any) {
    console.error('Erreur API participants POST:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  try {
    const payload = await request.json();
    const { participantId, name, email } = payload;

    if (!participantId || !name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'ID et nouveau nom requis' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { data: event, error: evError } = await supabase
      .from('events')
      .select('profile_id')
      .eq('id', eventId)
      .single();

    if (evError) {
      console.error('Erreur récupération event (PUT participant):', evError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    if (!event || event.profile_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('event_participants')
      .update({ name: name.trim(), email: email?.trim() || null })
      .eq('id', participantId)
      .eq('event_id', eventId);

    if (error) {
      console.error('Erreur update participant:', error);
      return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erreur API participants PUT:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  try {
    const payload = await request.json().catch(() => ({}));
    const { participantId } = payload;

    if (!participantId) {
      return NextResponse.json({ error: 'participantId requis' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { data: event, error: evError } = await supabase
      .from('events')
      .select('profile_id')
      .eq('id', eventId)
      .single();

    if (evError) {
      console.error('Erreur récupération event (DELETE participant):', evError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    if (!event || event.profile_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('id', participantId)
      .eq('event_id', eventId);

    if (error) {
      console.error('Erreur suppression participant:', error);
      return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erreur API participants DELETE:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}