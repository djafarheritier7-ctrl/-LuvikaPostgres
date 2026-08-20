import { createClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient();

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('events')
    .delete()
    .lt('ends_at', fourteenDaysAgo);

  if (error) {
    console.error('❌ Auto-delete failed:', error);
    return new NextResponse('Error', { status: 500 });
  }

  console.log('✅ Old events cleaned up');
  return new NextResponse('OK', { status: 200 });
}