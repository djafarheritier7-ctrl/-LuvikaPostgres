import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';
import { cookies } from 'next/headers';
import { getRpId, getOrigin } from '@/src/lib/webauthn/utils';

function toBase64Url(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const challenge = cookieStore.get('webauthn_challenge')?.value;
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge expiré ou manquant' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 🔥 Conversion FORCÉE de l'ID en base64url
    if (body.rawId && Array.isArray(body.rawId)) {
      const buffer = Buffer.from(body.rawId);
      body.id = toBase64Url(buffer);
    } else if (body.id) {
      let buffer: Buffer;
      try {
        buffer = Buffer.from(body.id, 'base64');
      } catch {
        buffer = Buffer.from(body.id, 'utf8');
      }
      body.id = toBase64Url(buffer);
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRpId(),
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error('Vérification échouée');
    }

    const { credential, aaguid } = verification.registrationInfo;
    const deviceType = aaguid ? 'cross-platform' : 'platform';
    const displayName = deviceType === 'platform' ? 'Appareil local (FaceID/TouchID)' : 'Clé de sécurité';

    const { error: insertError } = await supabase.from('biometric_credentials').insert({
      user_id: user.id,
      credential_id: credential.id,
      public_key: Buffer.from(credential.publicKey),
      sign_count: credential.counter,
      device_type: deviceType,
      display_name: displayName,
      is_active: true,
    });

    if (insertError) throw insertError;

    cookieStore.delete('webauthn_challenge');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Registration verify error:', error);
    return NextResponse.json({ error: error.message || 'Échec vérification' }, { status: 500 });
  }
}