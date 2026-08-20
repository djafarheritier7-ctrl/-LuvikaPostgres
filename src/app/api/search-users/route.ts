import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  
  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  // Récupération du cookie depuis les en-têtes de la requête
  const cookieString = request.headers.get('cookie') || '';
  const supabase = createServerClient(cookieString);

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, plan, avatar_url')
    .ilike('username', `%${query}%`)
    .or(`full_name.ilike.%${query}%`)
    .eq('is_public', true)
    .limit(8);

  if (error) {
    console.error('Erreur recherche:', error);
    return NextResponse.json({ users: [] });
  }

  const users = data || [];

  const { data: { user } } = await supabase.auth.getUser();
  const followingIds: string[] = [];

  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('followed_id')
      .eq('follower_id', user.id);
    
    follows?.forEach((f: { followed_id: string; }) => followingIds.push(f.followed_id));
  }

  return NextResponse.json({ 
    users: users.map((u: { id: string; }) => ({ 
      ...u, 
      isFollowing: followingIds.includes(u.id),
    })) 
  });
}