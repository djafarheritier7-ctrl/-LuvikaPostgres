import { createClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseAdmin = createClient();

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, email, avatar_url, scans_count, plan, badges, created_at')
      .gte('scans_count', 10000)
      .order('scans_count', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (err: any) {
    console.error('❌ Fatal:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}