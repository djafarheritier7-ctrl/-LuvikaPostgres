import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
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

  const { data: activeDuplicate } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('profile_id', subscription.profile_id)
    .eq('plan', subscription.plan)
    .eq('status', 'active')
    .neq('id', id)
    .maybeSingle();

  if (activeDuplicate) {
    return NextResponse.json({ 
      error: `Un abonnement ${subscription.plan} actif existe déjà pour cet utilisateur.` 
    }, { status: 409 });
  }

  const { data: otherActiveSubs } = await supabase
    .from('subscriptions')
    .select('id, plan')
    .eq('profile_id', subscription.profile_id)
    .eq('status', 'active')
    .neq('id', id);

  if (otherActiveSubs && otherActiveSubs.length > 0) {
    const otherIds = otherActiveSubs.map((s: { id: any; }) => s.id);
    
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .in('id', otherIds);
  }

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Échec activation' }, { status: 500 });
  }

  await supabase
    .from('profiles')
    .update({ 
      plan: subscription.plan,
      updated_at: new Date().toISOString() 
    })
    .eq('id', subscription.profile_id);

  return NextResponse.json({ success: true });
}