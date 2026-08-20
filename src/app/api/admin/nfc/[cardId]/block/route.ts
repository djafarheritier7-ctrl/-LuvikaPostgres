import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;

  const supabase = createServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    if (!cardId) {
      return NextResponse.json({ error: 'ID carte manquant' }, { status: 400 });
    }

    const { data: card, error: cardError } = await supabase
      .from('nfc_cards')
      .select('id, status, user_id, matricule')
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('nfc_cards')
      .update({ 
        status: 'blocked', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', cardId);

    if (updateError) throw updateError;

    await supabase.from('nfc_card_actions').insert({
      card_id: cardId,
      user_id: user.id,
      action_type: 'block' as const,
      matricule_verified: card.matricule || `CARD-${cardId.substring(0, 8)}`,
      reason: 'Bloquage manuel par admin',
    });

    console.log(`✅ Carte ${cardId} bloquée par admin ${user.id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Carte bloquée avec succès' 
    });
  } catch (error: any) {
    console.error('❌ Erreur blocage carte:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}