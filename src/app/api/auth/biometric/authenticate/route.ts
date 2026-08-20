import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase-shim';
import { cookies } from 'next/headers';
import { getRpId, getOrigin } from '@/src/lib/webauthn/utils';

type AuthenticatorTransport = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'usb';

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Récupération de la chaîne de cookies pour le client Supabase
    const cookieString = cookieStore.toString();
    const supabase = createServerClient(cookieString);

    const { data: { user } } = await supabase.auth.getUser();
    
    let allowCredentials: {
      id: string;
      type: 'public-key';
      transports?: AuthenticatorTransport[];
    }[] = [];

    if (user) {
      const { data } = await supabase
        .from('biometric_credentials')
        .select('credential_id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (data) {
        allowCredentials = data.map((cred: { credential_id: any; }) => ({
          id: cred.credential_id,
          type: 'public-key' as const,
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: getRpId(),
      allowCredentials,
      userVerification: 'preferred',
    });

    // Stocker le challenge (utilise toujours les cookies)
    cookieStore.set('webauthn_auth_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });

    return NextResponse.json({ options });
  } catch (error) {
    console.error('Auth init error:', error);
    return NextResponse.json({ error: 'Échec initialisation auth' }, { status: 500 });
  }
}