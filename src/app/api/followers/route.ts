import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profile_id = searchParams.get('profile_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!profile_id) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data : { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ followers: [], total: 0 });
  }

  const { data : { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.plan === 'basic') {
    return NextResponse.json({ followers: [], total: 0 });
  }

  // Récupérer tous les followers (pas de .range() dans le shim)
  const { data: allFollowers, error } = await supabase
    .from('follows')
    .select(`
      follower_id,
      created_at,
      follower:profiles!follower_id (full_name, username, avatar_url, plan)
    `)
    .eq('followed_id', profile_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = allFollowers?.length || 0;
  const start = (page - 1) * limit;
  const end = start + limit;
  const followers = allFollowers?.slice(start, end) || [];

  return NextResponse.json({ 
    followers, 
    total,
    page,
    limit
  });
}