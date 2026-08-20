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

  const { email, password, full_name, username } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  try {
    // Vérifier l'unicité de l'email
    const existing = await pool.query('SELECT id FROM profiles WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 409 });
    }

    // Créer le profil avec mot de passe haché
    const result = await pool.query(
      `INSERT INTO profiles (id, email, password_hash, full_name, username, role, plan, onboarding_done)
       VALUES (gen_random_uuid(), $1, crypt($2, gen_salt('bf')), $3, $4, 'user', 'basic', false)
       RETURNING id, email, full_name, username, role, plan, onboarding_done`,
      [email.trim().toLowerCase(), password, full_name || null, username || null]
    );

    const user = result.rows[0];

    // Créer une session
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    await pool.query(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    // Définir le cookie de session
    const response = NextResponse.json({ user, session: { user } }, { status: 201 });
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 409 });
    }
    console.error('Erreur sign-up:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}