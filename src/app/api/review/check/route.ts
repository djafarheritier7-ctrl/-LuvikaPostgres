// src/app/api/review/check/route.ts
import { NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = createClientForPage();
    const { data: review } = await (await supabase)
      .from('reviews')
      .select('id')
      .eq('profile_id', userId)
      .single();

    return NextResponse.json({ hasSubmitted: !!review });
  } catch (error) {
    return NextResponse.json({ hasSubmitted: false });
  }
}