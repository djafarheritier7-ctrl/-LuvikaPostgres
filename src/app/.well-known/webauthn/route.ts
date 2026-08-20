import { NextResponse } from 'next/server';
import { getRpId, getOrigin } from '@/src/lib/webauthn/utils'; // ✅ Import

export const dynamic = 'force-static';

export async function GET() {
  // ✅ Utilise les helpers
  const rpId = getRpId();
  const origin = getOrigin();

  const config = {
    rpId,
    origins: [origin],
    attestation: 'none' as const,
    authenticatorSelection: {
      authenticatorAttachment: 'platform' as const,
      userVerification: 'required' as const,
      requireResidentKey: true,
    },
    pubKeyCredParams: [
      { type: 'public-key' as const, alg: -7 },
      { type: 'public-key' as const, alg: -257 },
    ],
    timeout: 60000,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ WebAuthn Config:', { rpId, origin });
  }

  return NextResponse.json(config, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}