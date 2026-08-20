import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  try {
    // Vérifier si l'utilisateur existe
    const userResult = await pool.query('SELECT id FROM profiles WHERE email = $1', [email.trim().toLowerCase()]);
    if (userResult.rows.length === 0) {
      // Pour éviter de révéler l'existence, on renvoie un succès
      return NextResponse.json({ success: true });
    }

    const user = userResult.rows[0];

    // Générer un token de réinitialisation
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // Ici, vous pouvez envoyer un email avec le lien contenant le token.
    // Exemple avec Resend si RESEND_API_KEY est défini :
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token_hash=${rawToken}&type=recovery`;
      await resend.emails.send({
        from: 'LUVIKA <noreply@luvika.me>',
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href="${resetUrl}">${resetUrl}</a></p>`,
      });
    } else {
      console.log(`📧 Token de réinitialisation pour ${email} : ${rawToken}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur forgot-password:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}