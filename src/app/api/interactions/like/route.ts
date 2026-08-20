import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Récupération du cookie depuis les en-têtes de la requête
    const cookieString = req.headers.get('cookie') || '';
    const supabase = createServerClient(cookieString);

    const { profile_id } = await req.json();

    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id requis' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('likes_count')
      .eq('id', profile_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    const cookieName = `luvika_like_${profile_id}`;
    const hasLiked = req.cookies.get(cookieName)?.value === 'true';

    let newLikesCount: number;
    let newLiked: boolean;

    if (hasLiked) {
      newLikesCount = Math.max(0, (profile.likes_count || 0) - 1);
      newLiked = false;
    } else {
      newLikesCount = (profile.likes_count || 0) + 1;
      newLiked = true;
    }

    // Le shim ne fait pas de différence entre anon et service_role
    const { error } = await supabase
      .from('profiles')
      .update({ 
        likes_count: newLikesCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile_id);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Échec mise à jour' }, { status: 500 });
    }

    const response = NextResponse.json({
      liked: newLiked,
      likes_count: newLikesCount,
    });

    if (newLiked) {
      response.cookies.set(cookieName, 'true', {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    } else {
      response.cookies.delete(cookieName);
    }

    return response;
  } catch (err: any) {
    console.error('❌ API Like error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}