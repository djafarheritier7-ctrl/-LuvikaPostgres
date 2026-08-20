// src/app/api/orders/[id]/cancel/route.ts
import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🆔 Order ID to cancel:', id);

  const supabase = createServerClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    // ✅ Correction : userError est une string, pas un objet
    console.warn('❌ Auth failed:', userError || 'No user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!order) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    if (order.user_id !== user.id) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    if (order.status !== 'pending') return NextResponse.json({ error: 'Statut incompatible' }, { status: 400 });

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) throw updateError;

    console.log('✅ Order cancelled successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('💥 Cancel API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}