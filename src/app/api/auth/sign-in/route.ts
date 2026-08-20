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

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, full_name, username, role, plan, onboarding_done
       FROM profiles
       WHERE email = $1 AND crypt($2, password_hash) = password_hash`,
      [email.trim().toLowerCase(), password]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const user = result.rows[0];

    if (user.deactivated) {
      return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
    }

    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    const response = NextResponse.json({ user });
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Erreur sign-in:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}