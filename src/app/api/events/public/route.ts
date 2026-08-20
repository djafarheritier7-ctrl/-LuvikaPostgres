import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profile_id');
  if (!profileId) return NextResponse.json({ error: 'Missing profile_id' }, { status: 400 });

  const supabase = createServerClient();

  const now = new Date().toISOString();
  const { data: events, error } = await supabase
    .from('events')
    .select('id, title, starts_at, ends_at, location, is_public')
    .eq('profile_id', profileId)
    .eq('is_public', true)
    .eq('status', 'active')
    .gte('ends_at', now)
    .order('starts_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events });
}