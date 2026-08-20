import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'unread';
    
    let query = supabase
      .from('contact_requests')
      .select('id')
      .eq('profile_id', user.id);
    
    if (status === 'unread') {
      query = query.eq('is_read', false);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const count = data?.length || 0;
    
    return NextResponse.json(
      { count },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('❌ Error fetching messages count:', error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}

// POST endpoint to handle return action
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'return') {
      return NextResponse.json({ success: true, redirect: '/dashboard' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('❌ Error handling return action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}