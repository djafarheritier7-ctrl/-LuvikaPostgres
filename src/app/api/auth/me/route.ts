import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const result = await pool.query(
      `SELECT p.id, p.email, p.full_name, p.username, p.role, p.plan,
              p.onboarding_done, p.is_public, p.scans_count, p.likes_count,
              p.avatar_url, p.job_title, p.company, p.bio_short,
              p.phone, p.whatsapp, p.address
       FROM sessions s
       JOIN profiles p ON p.id = s.user_id
       WHERE s.token = $1 AND s.expires_at > now()`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error: any) {
    console.error('Erreur me:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}