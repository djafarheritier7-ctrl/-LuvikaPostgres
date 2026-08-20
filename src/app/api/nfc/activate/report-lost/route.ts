import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ReportSchema = z.object({
  card_id: z.string().min(1),
  reason: z.string().min(10, 'Le commentaire doit faire au moins 10 caractères'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ReportSchema.parse(body);

    const cardRes = await supabase
      .from('nfc_cards')
      .select('user_id, card_id')
      .eq('card_id', parsed.card_id)
      .single();

    if (cardRes.error || !cardRes.data) {
      return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 });
    }

    const card = cardRes.data;
    if (card.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const updateRes = await supabase
      .from('nfc_cards')
      .update({ 
        status: 'lost', 
        lost_reason: parsed.reason,
        lost_at: new Date().toISOString()
      })
      .eq('card_id', parsed.card_id);

    if (updateRes.error) throw updateRes.error;

    await supabase.from('admin_actions').insert({
      admin_id: null,
      action: 'report_nfc_lost',
      target_user_id: session.user.id,
      details: { card_id: parsed.card_id, reason: parsed.reason },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Carte déclarée perdue — un message d’alerte apparaît sur votre profil public.' 
    });

  } catch (err: any) {
    console.error('Erreur déclaration perte:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur inconnue' },
      { status: 400 }
    );
  }
}