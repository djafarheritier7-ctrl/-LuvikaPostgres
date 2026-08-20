import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, email, avatar_url, scans_count, plan, badges, created_at')
    .gte('scans_count', 10000)
    .order('scans_count', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data || [] });
}