import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, scans_count, badges')
    .order('scans_count', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leaderboard: data || [] });
}