import { createServerClient } from '@/src/lib/supabase-shim';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  const supabase = createServerClient();

  // Vérification auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Vérification admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const { userId, email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email et nom requis' }, { status: 400 });
    }

    if (!resend) {
      console.error('❌ RESEND_API_KEY manquante');
      return NextResponse.json({ 
        error: 'Service email non configuré' 
      }, { status: 500 });
    }

    const { error: emailError } = await resend.emails.send({
      from: 'LUVIKA <welcome@luvika.me>',
      to: [email],
      subject: '🎉 Bienvenue sur LUVIKA - Votre identité digitale vous attend !',
      html: generateWelcomeEmail(name),
    });

    if (emailError) {
      console.error('❌ Erreur Resend:', emailError);
      return NextResponse.json({ 
        error: `Échec envoi: ${emailError.message}` 
      }, { status: 500 });
    }

    console.log(`✅ Email bienvenue envoyé à ${email} (${name}) par admin ${user.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Email de bienvenue envoyé avec succès' 
    });
  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}

function generateWelcomeEmail(fullName: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#0ea5e9,#06b6d4);padding:30px;text-align:center;">
<h1 style="color:white;margin:0;font-size:24px;">LUVIKA</h1>
<p style="color:rgba(255,255,255,0.9);margin:5px 0 0;font-size:14px;">Révèle qui tu es</p>
</td></tr>
<tr><td style="padding:30px;">
<h2 style="color:#1e293b;margin:0 0 10px;">Bonjour ${fullName},</h2>
<p style="color:#475569;line-height:1.6;">Bienvenue sur LUVIKA ! Votre compte est prêt. Connectez-vous pour découvrir votre dashboard et créer votre identité digitale.</p>
<div style="text-align:center;margin:25px 0;">
<a href="https://luvika.vercel.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#06b6d4);color:white;text-decoration:none;padding:14px 35px;border-radius:12px;font-weight:bold;font-size:16px;">Accéder à mon dashboard</a>
</div>
<p style="color:#64748b;font-size:13px;">Besoin d'aide ? <a href="mailto:support@luvika.me" style="color:#0ea5e9;">support@luvika.me</a></p>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
<p style="color:#94a3b8;margin:0;font-size:12px;">© ${new Date().getFullYear()} LUVIKA — Kinshasa, RDC</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}