import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user || session.user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'processing',
      })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erreur annulation commande:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}