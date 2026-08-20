import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();

  // 🔹 Auth admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { error } = await supabase
      .from('contact_requests')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;

    console.log(`✅ Contact request ${id} marquée lu par ${user.email}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('💥 Erreur contact-requests/read:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}