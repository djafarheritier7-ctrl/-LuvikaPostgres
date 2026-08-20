import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  const supabase = createServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  if (!resend) {
    console.error('❌ RESEND_API_KEY manquante dans .env.local');
    return NextResponse.json({ 
      error: 'Service email non configuré' 
    }, { status: 500 });
  }

  try {
    const { card_id, email, matricule, full_name } = await request.json();
    
    if (!email || !matricule || !full_name) {
      return NextResponse.json({ 
        error: 'Données incomplètes pour l\'envoi email' 
      }, { status: 400 });
    }

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'LUVIKA <noreply@luvika.me>',
      to: [email],
      subject: '🔐 Votre matricule de carte NFC LUVIKA',
      html: generateEmailTemplate(full_name, matricule, card_id),
    });

    if (emailError) {
      console.error('❌ Erreur Resend:', emailError);
      return NextResponse.json({ 
        error: `Échec envoi email: ${emailError.message}` 
      }, { status: 500 });
    }

    console.log(`✅ Email envoyé à ${email} | ID Resend: ${emailData?.id}`);

    const { data: nfcCard, error: cardError } = await supabase
      .from('nfc_cards')
      .select('order_id, user_id')
      .eq('id', card_id)
      .single();

    if (cardError || !nfcCard?.order_id) {
      console.warn('⚠️ Impossible de mettre à jour la commande:', cardError?.message || 'Order ID manquant');
    } else {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'shipped' })
        .eq('id', nfcCard.order_id);

      if (updateError) {
        console.error('❌ Erreur mise à jour commande:', updateError);
      } else {
        console.log(`✅ Commande ${nfcCard.order_id} mise à jour en 'shipped'`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Matricule envoyé par email avec succès',
      emailId: emailData?.id,
    });
  } catch (error: any) {
    console.error('❌ Erreur globale envoi matricule:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}

// 🔑 TEMPLATE EMAIL PROFESSIONNEL (responsive + branding LUVIKA)
function generateEmailTemplate(fullName: string, matricule: string, cardId: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre matricule NFC LUVIKA</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <!-- CONTENEUR PRINCIPAL -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); padding: 40px 30px; text-align: center;">
              <div style="background: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <span style="font-size: 32px; font-weight: bold; color: #06b6d4;">L</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">LUVIKA</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Révèle qui tu es</p>
            </td>
          </tr>
          
          <!-- CONTENU -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 15px;">Bonjour ${fullName},</h2>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 25px; font-size: 16px;">
                Félicitations ! Votre carte NFC LUVIKA a été créée avec succès. 
                Voici votre <strong>matricule unique</strong> pour l'activer :
              </p>
              
              <!-- MATRICULE EN ÉVIDENCE -->
              <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px dashed #f59e0b; border-radius: 16px; padding: 30px; text-align: center; margin: 25px 0; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);">
                <p style="color: #92400e; font-weight: bold; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">Votre matricule</p>
                <p style="color: #92400e; font-size: 42px; font-weight: 800; letter-spacing: 4px; margin: 0; font-family: monospace; word-break: break-all;">${matricule}</p>
              </div>
              
              <!-- INSTRUCTIONS -->
              <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 18px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                <p style="color: #1e40af; margin: 0; font-weight: 600; font-size: 15px; line-height: 1.5;">
                  🔑 Conservez ce matricule précieusement. Vous devrez le saisir dans votre dashboard LUVIKA pour activer votre carte NFC.
                </p>
              </div>
              
              <!-- BOUTON D'ACTIVATION -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://luvika.vercel.app/dashboard/nfc" 
                   style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; text-decoration: none; padding: 16px 40px; border-radius: 14px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); transition: all 0.3s ease;">
                  Activer ma carte NFC
                </a>
                <p style="color: #64748b; margin-top: 12px; font-size: 14px;">
                  Ou connectez-vous à votre dashboard LUVIKA et cliquez sur "Gérer mes cartes"
                </p>
              </div>
              
              <!-- SUPPORT -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 20px;">
                <p style="color: #475569; margin: 0 0 10px; font-size: 15px;">
                  <strong> Besoin d'aide ?</strong>
                </p>
                <p style="color: #64748b; margin: 0; line-height: 1.6; font-size: 14px;">
                  Notre équipe support est à votre disposition :<br>
                  <a href="mailto:support@luvika.me" style="color: #0ea5e9; text-decoration: underline;">support@luvika.me</a>
                  <br>
                  <span style="display: block; margin-top: 8px; color: #94a3b8; font-size: 13px;">
                    ID carte : ${cardId.substring(0, 8)}... • Matricule à usage unique
                  </span>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
                <a href="https://luvika.vercel.app" style="color: #64748b; text-decoration: none; font-size: 14px;">Site web</a>
                <a href="https://luvika.vercel.app/contact" style="color: #64748b; text-decoration: none; font-size: 14px;">Contact</a>
                <a href="https://luvika.vercel.app/legal" style="color: #64748b; text-decoration: none; font-size: 14px;">Mentions légales</a>
              </div>
              <p style="color: #64748b; margin: 10px 0 5px; font-size: 13px;">
                © ${new Date().getFullYear()} LUVIKA — Révèle qui tu es
              </p>
              <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                Kinshasa, République Démocratique du Congo
              </p>
              <p style="color: #94a3b8; margin: 10px 0 0; font-size: 11px;">
                Cet email a été envoyé automatiquement. Merci de ne pas répondre à cet email.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- DISCLAIMER -->
        <p style="color: #94a3b8; text-align: center; margin-top: 25px; font-size: 12px; max-width: 600px;">
          Si vous n'avez pas demandé cette carte NFC, veuillez contacter immédiatement notre support.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}