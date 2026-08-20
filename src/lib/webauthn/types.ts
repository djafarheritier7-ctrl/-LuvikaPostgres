// src/lib/webauthn/types.ts
import { AuthenticationResponseJSON } from '@simplewebauthn/server';

/**
 * Type étendu pour verifyAuthenticationResponse
 * Contourne le problème de types de @simplewebauthn/server
 */
export interface VerifyAuthenticationParams {
  response: AuthenticationResponseJSON;
  expectedChallenge: string | ((challenge: string) => boolean | Promise<boolean>);
  expectedOrigin: string | string[];
  expectedRPID: string | string[];
  authenticator: {
    credentialID: string | Uint8Array;
    credentialPublicKey: string | Uint8Array;
    counter: number;
    transports?: string[];
  };
  requireUserVerification?: boolean;
  advancedFIDOConfig?: {
    supportedAlgorithmIDs?: number[];
  };
}