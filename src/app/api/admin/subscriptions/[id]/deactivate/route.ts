import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !subscription) {
    return NextResponse.json({ error: 'Souscription introuvable' }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Erreur désactivation:', updateError);
    return NextResponse.json({ error: 'Échec de la désactivation' }, { status: 500 });
  }

  if (subscription.profile_id) {
    await supabase
      .from('profiles')
      .update({ 
        plan: 'basic',
        updated_at: new Date().toISOString() 
      })
      .eq('id', subscription.profile_id);
  }

  return NextResponse.json({ success: true });
}