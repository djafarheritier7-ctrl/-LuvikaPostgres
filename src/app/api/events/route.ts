import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Récupération du cookie depuis les en-têtes de la requête
    const cookieString = request.headers.get('cookie') || '';
    const supabase = createServerClient(cookieString);

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const profileId = searchParams.get('profile_id');
    const locale = searchParams.get('locale') || 'fr';

    const {
      data: { user }
    } = await supabase.auth.getUser();

    let query;
    if (user) {
      const queryProfileId = profileId || user.id;
      query = supabase
        .from('events')
        .select('*')
        .eq('profile_id', queryProfileId)
        .order('starts_at', { ascending: false });

      if (profileId && profileId !== user.id) {
        query = query.eq('is_public', true).eq('status', 'active');
      }
    } else {
      if (profileId) {
        query = supabase
          .from('events')
          .select('*')
          .eq('profile_id', profileId)
          .eq('is_public', true)
          .eq('status', 'active')
          .order('starts_at', { ascending: false });
      } else {
        query = supabase
          .from('events')
          .select('*')
          .eq('is_public', true)
          .eq('status', 'active')
          .order('starts_at', { ascending: false });
      }
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Erreur récupération événements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const eventsWithCount = await Promise.all(
      (events || []).map(async (event: any) => {
        const { data: checkedParticipants } = await supabase
          .from('event_participants')
          .select('id')
          .eq('event_id', event.id)
          .eq('is_checked_in', true);

        const attendee_count = checkedParticipants?.length || 0;

        return {
          ...event,
          name: event.title,
          attendee_count,
          qr_code_url: `/${locale}/events/${event.id}/check-in`,
        };
      })
    );

    return NextResponse.json({ events: eventsWithCount });
  } catch (err: any) {
    console.error('Erreur API events GET:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Récupération du cookie depuis les en-têtes de la requête
    const cookieString = req.headers.get('cookie') || '';
    const supabase = createServerClient(cookieString);

    const data = await req.json();
    const { title, description, location, starts_at, ends_at, is_public, max_participants } = data;

    if (!title || !starts_at) {
      return NextResponse.json({ error: 'Titre et date de début requis' }, { status: 400 });
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const defaultEndsAt = ends_at || new Date(new Date(starts_at).getTime() + 2 * 3600000).toISOString();

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        profile_id: user.id,
        title,
        description: description || null,
        location: location || null,
        starts_at,
        ends_at: ends_at || defaultEndsAt,
        is_public: is_public ?? true,
        max_participants: max_participants || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création événement:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (err: any) {
    console.error('Erreur API events:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}