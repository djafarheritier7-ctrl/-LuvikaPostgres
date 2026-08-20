import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();

  const { data : { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('contact_requests')
    .select(`
      *,
      profiles!inner (full_name, username, email)
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}