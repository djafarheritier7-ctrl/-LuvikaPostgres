import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import crypto from 'crypto';

// Vérifier un token de réinitialisation (utilisé par verifyOtp)
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const { token_hash, type } = body;

  if (!token_hash || type !== 'recovery') {
    return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `SELECT id FROM password_resets WHERE token_hash = $1 AND used = false AND expires_at > now()`,
      [token_hash]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });
    }

    // Le token est valide
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur verify-otp:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Mettre à jour le mot de passe (utilisé par updateUser)
export async function PUT(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const { token_hash, password } = body;

  if (!token_hash || !password) {
    return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 });
  }

  try {
    // Récupérer le token et l'utilisateur
    const tokenResult = await pool.query(
      `SELECT user_id FROM password_resets WHERE token_hash = $1 AND used = false AND expires_at > now()`,
      [token_hash]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });
    }

    const userId = tokenResult.rows[0].user_id;

    // Mettre à jour le mot de passe
    await pool.query(
      `UPDATE profiles SET password_hash = crypt($1, gen_salt('bf')) WHERE id = $2`,
      [password, userId]
    );

    // Marquer le token comme utilisé
    await pool.query(`UPDATE password_resets SET used = true WHERE token_hash = $1`, [token_hash]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur reset-password:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}