// src/app/api/nfc/action/route.ts
import { NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClientForPage();
    const { data : { user }, error: authError } = await (await supabase).auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { cardId, matricule, action, reason } = await request.json();
    
    // 🔹 Vérification matricule OBLIGATOIRE pour actions sensibles
    const requiresMatricule = ['block', 'lost', 'reset'].includes(action);
    if (requiresMatricule && !matricule) {
      return NextResponse.json({ 
        error: 'Matricule requis pour cette action' 
      }, { status: 400 });
    }

    // 🔹 Récupérer la carte et vérifier propriété
    const { data: card, error: cardError } = await (await supabase)
      .from('nfc_cards')
      .select('id, matricule, user_id, status')
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 });
    }
    
    if (card.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // 🔹 Vérification matricule (comparaison sécurisée)
    if (requiresMatricule && card.matricule !== matricule.trim().toUpperCase()) {
      // 🔹 Journalisation des tentatives de falsification
      await (await supabase).from('nfc_card_actions').insert({
        card_id: card.id,
        user_id: user.id,
        action_type: 'report',
        matricule_verified: matricule,
        reason: 'Tentative de falsification de matricule',
      });
      
      return NextResponse.json({ 
        error: 'Matricule incorrect. Vérifiez le numéro sur votre carte physique.' 
      }, { status: 403 });
    }

    // 🔹 Exécuter l'action selon le type
    let updateData: any = {};
    let newQrUrl: string | null = null;

    switch (action) {
      case 'block':
        updateData.status = 'blocked';
        break;
      
      case 'lost':
        if (!reason) {
          return NextResponse.json({ error: 'Raison requise pour déclarer perdue' }, { status: 400 });
        }
        updateData.status = 'lost';
        break;
      
      case 'reset':
        // 🔹 Générer nouveau QR unique
        const newCardId = `nfc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        newQrUrl = `/scan/nfc/${newCardId}`;
        
        // 🔹 Créer nouvelle configuration de carte
        const { data: newConfig } = await (await supabase)
          .from('card_configs')
          .insert({
            profile_id: user.id,
            scan_type: 'nfc',
            custom_url: newQrUrl,
            enabled: true
          })
          .select()
          .single();
        
        updateData = {
          status: 'inactive',
          card_config_id: newConfig?.id || null
        };
        break;
      
      case 'report':
        // 🔹 Journaliser sans modifier la carte
        await (await supabase).from('nfc_card_actions').insert({
          card_id: card.id,
          user_id: user.id,
          action_type: 'report',
          matricule_verified: matricule || '',
          reason: reason || 'Signalement utilisateur',
        });
        return NextResponse.json({ success: true, message: 'Signalement enregistré' });
      
      case 'reactivate':
        if (card.status !== 'blocked' && card.status !== 'lost' && card.status !== 'inactive') {
          return NextResponse.json({ error: 'Carte non désactivée' }, { status: 400 });
        }
        updateData.status = 'active';
        break;
      
      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

    // 🔹 Mettre à jour la carte
    const { error: updateError } = await (await supabase)
      .from('nfc_cards')
      .update(updateData)
      .eq('id', cardId);

    if (updateError) throw updateError;

    // 🔹 Enregistrer l'action dans l'historique
    await (await supabase).from('nfc_card_actions').insert({
      card_id: card.id,
      user_id: user.id,
      action_type: action,
      matricule_verified: matricule || '',
      reason: reason || null,
      new_qr_url: newQrUrl || null,
    });

    return NextResponse.json({ 
      success: true, 
      message: getSuccessMessage(action),
      newQrUrl 
    });
  } catch (error: any) {
    console.error('NFC action error:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de l\'action' 
    }, { status: 500 });
  }
}

function getSuccessMessage(action: string): string {
  const messages: Record<string, string> = {
    'block': 'Carte bloquée définitivement',
    'lost': 'Carte déclarée perdue',
    'reset': 'Carte réinitialisée avec nouveau QR',
    'reactivate': 'Carte réactivée avec succès',
    'report': 'Signalement enregistré'
  };
  return messages[action] || 'Action effectuée';
}