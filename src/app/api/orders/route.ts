// src/app/api/orders/route.ts
import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Récupération du cookie depuis les en-têtes de la requête
  const cookieString = request.headers.get('cookie') || '';
  const supabase = createServerClient(cookieString);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      quantity = 1,
      shipping_address = null,
      product_type = 'nfc_premium',
    } = body;

    if (!quantity || quantity < 1 || !product_type) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        quantity,
        shipping_address,
        product_type,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Optionnel : Edge Function (stub : lèvera une erreur)
    try {
      await supabase.functions.invoke(); // ✅ Appel sans arguments (stub)
    } catch (emailErr) {
      console.warn('📧 Email non envoyé (Edge Function)', emailErr);
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erreur création commande:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}