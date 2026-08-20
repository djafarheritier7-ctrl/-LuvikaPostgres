import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { profile_id } = await request.json();

  if (!profile_id) {
    return NextResponse.json({ error: 'profile_id requis' }, { status: 400 });
  }

  // Récupération du cookie depuis les en-têtes de la requête
  const cookieString = request.headers.get('cookie') || '';
  const supabase = createServerClient(cookieString);

  const { data: profile } = await supabase
    .from('profiles')
    .select('badges')
    .eq('id', profile_id)
    .single();

  const currentBadges = profile?.badges || [];
  
  if (!currentBadges.includes('scan_10k_reward')) {
    const newBadges = [...currentBadges, 'scan_10k_reward'];
    
    const { error } = await supabase
      .from('profiles')
      .update({
        badges: newBadges,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: 'Récompense 10K scans activée' });
}