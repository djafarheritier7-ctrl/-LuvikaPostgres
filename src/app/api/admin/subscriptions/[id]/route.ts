import { createServerClient } from '@/src/lib/supabase-shim';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { plan, status, expires_at } = body;

  const supabase = createServerClient();

  // Vérifier l'authentification et le rôle admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  // Récupérer l'abonnement existant
  const { data: currentSubscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !currentSubscription) {
    return NextResponse.json({ error: 'Souscription introuvable' }, { status: 404 });
  }

  // 🔹 VÉRIFICATION : Si le plan change, vérifier qu'il n'y a pas déjà un abonnement pour ce plan
  if (plan && plan !== currentSubscription.plan) {
    const { data: existingPlan } = await supabase
      .from('subscriptions')
      .select('id, plan, status')
      .eq('profile_id', currentSubscription.profile_id)
      .eq('plan', plan)
      .neq('id', id) // Exclure l'abonnement en cours d'édition
      .maybeSingle();

    if (existingPlan) {
      return NextResponse.json({ 
        error: `Cet utilisateur a déjà un abonnement ${plan} (ID: ${existingPlan.id}, statut: ${existingPlan.status}). Supprimez-le d'abord ou modifiez l'existant.` 
      }, { status: 409 }); // 409 Conflict
    }
  }

  // 🔹 VÉRIFICATION : Si on active cet abonnement, vérifier qu'il n'y a pas d'autre actif pour le même plan
  if (status === 'active') {
    const targetPlan = plan || currentSubscription.plan;
    
    const { data: activeDuplicate } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('profile_id', currentSubscription.profile_id)
      .eq('plan', targetPlan)
      .eq('status', 'active')
      .neq('id', id)
      .maybeSingle();

    if (activeDuplicate) {
      // Désactiver automatiquement l'autre abonnement actif
      await supabase
        .from('subscriptions')
        .update({ 
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', activeDuplicate.id);
    }

    // Vérifier aussi les autres plans actifs
    const { data: otherActiveSubs } = await supabase
      .from('subscriptions')
      .select('id, plan')
      .eq('profile_id', currentSubscription.profile_id)
      .eq('status', 'active')
      .neq('id', id);

    if (otherActiveSubs && otherActiveSubs.length > 0) {
      // Désactiver tous les autres abonnements actifs
      const otherIds = otherActiveSubs.map((s: { id: any; }) => s.id);
      
      await supabase
        .from('subscriptions')
        .update({ 
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .in('id', otherIds);
    }
  }

  // Construire l'objet de mise à jour
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (plan !== undefined) {
    if (!['basic', 'premium', 'entreprise'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }
    updateData.plan = plan;
  }

  if (status !== undefined) {
    if (!['active', 'canceled', 'expired', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    updateData.status = status;
  }

  // Gérer expires_at
  if (expires_at !== undefined) {
    if (expires_at === null || expires_at === '') {
      updateData.expires_at = null; // À vie
    } else {
      const date = new Date(expires_at);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Date d\'expiration invalide' }, { status: 400 });
      }
      updateData.expires_at = date.toISOString();
    }
  }

  // Mettre à jour l'abonnement
  const { data: updatedSubscription, error: updateError } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('id', id)
    .select('*, profiles!left(id, full_name, username, email)')
    .single();

  if (updateError) {
    console.error('Erreur mise à jour abonnement:', updateError);
    
    // Gérer l'erreur de contrainte unique
    if (updateError.code === '23505') {
      return NextResponse.json({ 
        error: 'Cet utilisateur a déjà un abonnement pour ce plan.' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Échec de la mise à jour' }, { status: 500 });
  }

  // Synchroniser le plan avec la table profiles
  const finalPlan = updateData.plan || currentSubscription.plan;
  const finalStatus = updateData.status || currentSubscription.status;

  if (finalStatus === 'active') {
    await supabase
      .from('profiles')
      .update({ 
        plan: finalPlan,
        updated_at: new Date().toISOString() 
      })
      .eq('id', currentSubscription.profile_id);
  } else if (updateData.status === 'canceled' || updateData.status === 'expired') {
    // Vérifier s'il reste un abonnement actif
    const { data: remainingActive } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('profile_id', currentSubscription.profile_id)
      .eq('status', 'active')
      .maybeSingle();

    if (!remainingActive) {
      // Remettre à basic si aucun abonnement actif
      await supabase
        .from('profiles')
        .update({ 
          plan: 'basic',
          updated_at: new Date().toISOString() 
        })
        .eq('id', currentSubscription.profile_id);
    } else {
      // Mettre à jour avec le plan de l'abonnement restant
      await supabase
        .from('profiles')
        .update({ 
          plan: remainingActive.plan,
          updated_at: new Date().toISOString() 
        })
        .eq('id', currentSubscription.profile_id);
    }
  }

  return NextResponse.json(updatedSubscription);
}