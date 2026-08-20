import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createServerClient();

  const { data : { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { order_id } = await request.json();
    
    const { data : order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, product_type')
      .eq('id', order_id)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ 
        error: 'Commande invalide ou déjà traitée' 
      }, { status: 400 });
    }

    const card_id = `NFC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: newCard, error: insertError } = await supabase
      .from('nfc_cards')
      .insert({
        user_id: order.user_id,
        card_id,
        status: 'inactive',
        order_id: order.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await supabase.from('card_configs').insert({
      profile_id: order.user_id,
      scan_type: 'nfc',
      enabled: false,
      custom_url: `/scan/nfc/${newCard.id}`,
    });

    await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', order.id);

    return NextResponse.json({ 
      success: true, 
      card: { 
        ...newCard, 
        user_email: (await supabase
          .from('profiles')
          .select('email')
          .eq('id', order.user_id)
          .single()
        )?.data?.email 
      } 
    });
  } catch (error: any) {
    console.error('Erreur création carte:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}