import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const LostSchema = z.object({
  card_id: z.string().min(1),
  reason: z.string().min(5, 'Le commentaire est obligatoire (min. 5 caractères)'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = LostSchema.parse(body);

    const cardRes = await supabase
      .from('nfc_cards')
      .select('user_id, status')
      .eq('card_id', parsed.card_id)
      .single();

    if (cardRes.error || !cardRes.data) {
      return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 });
    }

    const card = cardRes.data;
    if (card.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    if (card.status === 'lost') {
      return NextResponse.json({ error: 'Déjà déclarée perdue' }, { status: 400 });
    }

    const updateRes = await supabase
      .from('nfc_cards')
      .update({ 
        status: 'lost', 
        lost_reason: parsed.reason 
      })
      .eq('card_id', parsed.card_id);

    if (updateRes.error) throw updateRes.error;

    await supabase.from('admin_actions').insert({
      admin_id: null,
      action: 'nfc_card_lost_report',
      target_user_id: session.user.id,
      details: { card_id: parsed.card_id, reason: parsed.reason },
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Erreur déclaration perte:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur inconnue' },
      { status: 400 }
    );
  }
}