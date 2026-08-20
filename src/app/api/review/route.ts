import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const supabase = createServerClient();

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, profile_id')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur récupération avis:', error);
      return NextResponse.json({ reviews: [] });
    }

    console.log('Reviews trouvés:', reviews?.length);

    return NextResponse.json({ reviews: reviews || [] });
  } catch (err) {
    console.error('Erreur API reviews:', err);
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        profile_id: user.id,
        rating,
        comment: comment?.trim() || null,
        platform: 'web',
      });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, message: 'Merci pour votre avis !' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}