import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*, profiles!inner (id, full_name, username, email)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(subscriptions);
}

export async function POST(request: Request) {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { profile_id, plan, expires_at } = await request.json();

    if (!profile_id || !plan || !['basic', 'premium', 'entreprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('profile_id', profile_id)
      .eq('status', 'active')
      .maybeSingle();

    let newSubId = '';

    if (existingSub) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan,
          expires_at: expires_at || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSub.id)
        .select()
        .single();
      if (error) throw error;
      newSubId = data.id;
    } else {
      // 🔹 1. Vérifie s'il existe déjà une souscription active
      const { data: existingActive } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('profile_id', profile_id)
        .eq('status', 'active')
        .maybeSingle();

      // 🔹 2. Si oui → UPDATE
      if (existingActive) {
        const { data, error } = await supabase
          .from('subscriptions')
          .update({
            plan,
            expires_at: expires_at || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingActive.id)
          .select()
          .single();
        if (error) throw error;
        newSubId = data.id;
      } 
      // 🔹 3. Sinon → INSERT
      else {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            profile_id,
            plan,
            expires_at: expires_at || null,
            status: 'active',
            provider: 'manual',
            started_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        newSubId = data.id;
      }
    }

    return NextResponse.json({ success: true, subscription_id: newSubId });
  } catch (error: any) {
    console.error('Admin update subscription error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}