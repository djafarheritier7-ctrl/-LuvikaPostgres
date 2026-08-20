// src/app/api/review/check/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Use the incoming request cookie explicitly for server-side shim client
    const cookie = request.headers.get('cookie') ?? undefined;
    const supabase = createServerClient(cookie);

    const { data: review, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('profile_id', userId)
      .single();

    return NextResponse.json({ hasSubmitted: !!review });
  } catch (error) {
    return NextResponse.json({ hasSubmitted: false });
  }
}
