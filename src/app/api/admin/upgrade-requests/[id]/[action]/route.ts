import { createClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; action: string }> }
) {
  // Le shim ne fait pas de différence entre anon et service_role
  const supabase = createClient();

  const { id, action } = await context.params;

  if (!['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  try {
    // Récupère la demande
    const { data: req, error: fetchError } = await supabase
      .from('upgrade_requests')
      .select('profile_id, target_plan, status')
      .eq('id', id)
      .single();

    if (fetchError || !req) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }

    if (req.status !== 'pending') {
      return NextResponse.json({ error: 'Cette demande a déjà été traitée' }, { status: 400 });
    }

    const { profile_id, target_plan } = req;

    // 🔹 VÉRIFICATION 1 : L'utilisateur a-t-il déjà ce plan ?
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', profile_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    // Si l'utilisateur a déjà le plan demandé → erreur
    if (profile.plan === target_plan) {
      await supabase
        .from('upgrade_requests')
        .update({ 
          status: 'rejected',
          processed_at: new Date().toISOString(),
          admin_notes: `Rejeté automatiquement : l'utilisateur a déjà le plan ${target_plan}`
        })
        .eq('id', id);

      return NextResponse.json({ 
        error: `L'utilisateur a déjà le plan ${target_plan}. Demande rejetée automatiquement.` 
      }, { status: 400 });
    }

    // 🔹 VÉRIFICATION 2 : Y a-t-il d'autres demandes en attente pour le même utilisateur et le même plan ?
    const { data: duplicateRequests } = await supabase
      .from('upgrade_requests')
      .select('id')
      .eq('profile_id', profile_id)
      .eq('target_plan', target_plan)
      .eq('status', 'pending')
      .neq('id', id);

    if (duplicateRequests && duplicateRequests.length > 0) {
      const duplicateIds = duplicateRequests.map((d: { id: any; }) => d.id);
      
      await supabase
        .from('upgrade_requests')
        .update({ 
          status: 'rejected',
          processed_at: new Date().toISOString(),
          admin_notes: `Rejeté automatiquement : demande en double (traitée via ${id})`
        })
        .in('id', duplicateIds);
    }

    // 🔹 VÉRIFICATION 3 : L'utilisateur a-t-il déjà un abonnement actif pour ce plan ?
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id, plan, status, expires_at')
      .eq('profile_id', profile_id)
      .eq('plan', target_plan)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSubscription) {
      const now = new Date();
      const expiresAt = existingSubscription.expires_at ? new Date(existingSubscription.expires_at) : null;
      
      if (!expiresAt || expiresAt > now) {
        await supabase
          .from('upgrade_requests')
          .update({ 
            status: 'rejected',
            processed_at: new Date().toISOString(),
            admin_notes: `Rejeté automatiquement : abonnement ${target_plan} déjà actif jusqu'au ${expiresAt ? expiresAt.toLocaleDateString('fr-FR') : 'à vie'}`
          })
          .eq('id', id);

        return NextResponse.json({ 
          error: `Un abonnement ${target_plan} est déjà actif pour cet utilisateur` 
        }, { status: 400 });
      }
    }

    if (action === 'rejected') {
      await supabase
        .from('upgrade_requests')
        .update({ 
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', id);

      return NextResponse.json({ success: true });
    }

    // Pour l'approbation, lire les données supplémentaires
    const body = await request.json().catch(() => ({}));
    const { expires_at, admin_notes } = body;

    await supabase
      .from('upgrade_requests')
      .update({ 
        status: 'approved',
        processed_at: new Date().toISOString(),
        admin_notes: admin_notes || null
      })
      .eq('id', id);

    // 🔹 Rejeter automatiquement toutes les autres demandes en attente du même utilisateur
    await supabase
      .from('upgrade_requests')
      .update({ 
        status: 'rejected',
        processed_at: new Date().toISOString(),
        admin_notes: 'Rejeté automatiquement : une autre demande a été approuvée'
      })
      .eq('profile_id', profile_id)
      .eq('status', 'pending')
      .neq('id', id);

    // 1. Annule tous les abonnements actifs existants
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', profile_id)
      .eq('status', 'active');

    // 2. Crée le nouvel abonnement
    const newSubscription: any = {
      profile_id,
      plan: target_plan,
      status: 'active',
      provider: 'manual',
      started_at: new Date().toISOString(),
    };

    if (expires_at && expires_at !== null) {
      const date = new Date(expires_at);
      if (!isNaN(date.getTime())) {
        newSubscription.expires_at = date.toISOString();
      }
    }

    await supabase
      .from('subscriptions')
      .insert(newSubscription);

    // 3. Met à jour le profil
    await supabase
      .from('profiles')
      .update({ 
        plan: target_plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile_id);

    // 4. Crée l'entreprise si nécessaire
    if (target_plan === 'entreprise') {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', profile_id)
        .maybeSingle();

      if (!company) {
        const slug = `entreprise-${profile_id.substring(0, 8)}`;
        await supabase
          .from('companies')
          .insert({
            owner_id: profile_id,
            name: 'Mon Entreprise',
            slug: slug,
            plan: 'entreprise'
          });
      }
    }

    return NextResponse.json({ 
      success: true,
      subscription: {
        plan: target_plan,
        expires_at: newSubscription.expires_at || null,
        is_lifetime: !newSubscription.expires_at
      }
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}