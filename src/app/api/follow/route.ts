import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  const { data : { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  }

  const { action, targetId } = await request.json();

  if (!targetId || !['follow', 'unfollow'].includes(action)) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  try {
    if (action === 'follow') {
      await supabase
        .from('follows')
        .insert({ follower_id: session.user.id, followed_id: targetId });
    } else {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('followed_id', targetId);
    }

    // 🔁 Retourne les nouveaux compteurs
    const [followersData, followingData] = await Promise.all([
      supabase.from('follows').select('id').eq('followed_id', targetId),
      supabase.from('follows').select('id').eq('follower_id', session.user.id),
    ]);

    const followers = followersData.data?.length || 0;
    const following = followingData.data?.length || 0;

    return NextResponse.json({ success: true, followers, following });
  } catch (err) {
    console.error('Erreur follow:', err);
    return NextResponse.json({ error: 'Échec de l’action' }, { status: 500 });
  }
}