import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ hasLiked: false });
  }

  const { profile_id } = await req.json();

  const { data } = await supabase
    .from('profile_interactions')
    .select('id')
    .eq('profile_id', profile_id)
    .eq('visitor_id', session.user.id)
    .eq('type', 'like')
    .maybeSingle();

  return NextResponse.json({ hasLiked: !!data });
}