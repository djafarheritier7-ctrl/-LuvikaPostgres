'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type BiometricStatus = 'unsupported' | 'checking' | 'available' | 'enabled' | 'error';

export function useBiometricAuth() {
  const [status, setStatus] = useState<BiometricStatus>('checking');
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      // Vérifier le support de base WebAuthn
      if (
        typeof PublicKeyCredential === 'undefined' ||
        typeof window === 'undefined' ||
        !window.PublicKeyCredential
      ) {
        setStatus('unsupported');
        setIsSupported(false);
        return;
      }

      // Vérifier si un authentificateur plateforme (biométrie intégrée) est disponible
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
        
        if (available) {
          // Déterminer le type d'appareil
          const platform = navigator.platform.toLowerCase();
          let device = 'Appareil compatible';
          
          if (/iphone|ipad|ipod/.test(platform)) device = 'Face ID / Touch ID';
          else if (/mac/.test(platform)) device = 'Face ID / Touch ID';
          else if (/android/.test(platform)) device = 'Empreinte digitale';
          
          setDeviceInfo(device);
          setStatus('available');
        } else {
          setStatus('unsupported');
        }
      } catch (err) {
        console.warn('Biometric check failed:', err);
        setStatus('unsupported');
      }

      // Vérifier si déjà enregistré
      try {
        const res = await fetch('/api/auth/biometric/status');
        if (res.ok) {
          const { enabled } = await res.json();
          if (enabled) {
            setIsEnabled(true);
            setStatus('enabled');
          }
        }
      } catch (err) {
        console.warn('Failed to check biometric status:', err);
      }
    };

    checkSupport();
  }, []);

  const setupBiometricAuth = async () => {
    if (status !== 'available') return;

    try {
      // 1. Obtenir les options d'enregistrement depuis le serveur
      const registerRes = await fetch('/api/auth/biometric/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!registerRes.ok) throw new Error('Échec de l\'initialisation');

      const { options } = await registerRes.json();

      // 2. Appeler l'API WebAuthn du navigateur
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          user: {
            ...options.user,
            id: Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0)),
          },
          excludeCredentials: options.excludeCredentials?.map((cred: { id: string; }) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          })),
        },
      }) as PublicKeyCredential;

      // 3. Préparer la réponse pour le serveur
      const response = credential.response as AuthenticatorAttestationResponse;
      const clientDataJSON = new Uint8Array(response.clientDataJSON);
      const attestationObject = new Uint8Array(response.attestationObject);

      // 4. Envoyer au serveur pour vérification et sauvegarde
      const verifyRes = await fetch('/api/auth/biometric/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            clientDataJSON: btoa(String.fromCharCode(...clientDataJSON)),
            attestationObject: btoa(String.fromCharCode(...attestationObject)),
          },
          type: credential.type,
          clientExtensionResults: credential.getClientExtensionResults(),
        }),
      });

      if (!verifyRes.ok) {
        const error = await verifyRes.json();
        throw new Error(error.message || 'Échec de l\'enregistrement');
      }

      setIsEnabled(true);
      setStatus('enabled');
      toast.success('✅ Biométrie activée avec succès !', {
        description: `Connectez-vous désormais avec ${deviceInfo || 'votre biométrie'}`,
      });
    } catch (error: any) {
      console.error('Biometric setup error:', error);
      
      // Gérer les erreurs utilisateur courantes
      if (error.name === 'AbortError') {
        toast.warning('Opération annulée', { description: 'Vous avez annulé l\'enregistrement biométrique' });
      } else if (error.name === 'NotAllowedError') {
        toast.error('Refusé', { description: 'Autorisation biométrique refusée dans les paramètres système' });
      } else {
        toast.error('❌ Échec de la configuration', { 
          description: error.message || 'Impossible d\'activer la biométrie sur cet appareil' 
        });
      }
      
      setStatus('available');
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      // 1. Obtenir les options d'authentification
      const authRes = await fetch('/api/auth/biometric/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!authRes.ok) throw new Error('Échec de l\'initialisation');

      const { options } = await authRes.json();

      // 2. Appeler WebAuthn pour l'authentification
      const assertion = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          allowCredentials: options.allowCredentials?.map((cred: { id: string; }) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          })),
        },
      }) as PublicKeyCredential;

      // 3. Préparer la réponse
      const response = assertion.response as AuthenticatorAssertionResponse;
      const clientDataJSON = new Uint8Array(response.clientDataJSON);
      const authenticatorData = new Uint8Array(response.authenticatorData);
      const signature = new Uint8Array(response.signature);

      // 4. Vérifier auprès du serveur
      const verifyRes = await fetch('/api/auth/biometric/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: assertion.id,
          rawId: Array.from(new Uint8Array(assertion.rawId)),
          response: {
            clientDataJSON: btoa(String.fromCharCode(...clientDataJSON)),
            authenticatorData: btoa(String.fromCharCode(...authenticatorData)),
            signature: btoa(String.fromCharCode(...signature)),
            userHandle: response.userHandle 
              ? btoa(String.fromCharCode(...new Uint8Array(response.userHandle)))
              : null,
          },
          type: assertion.type,
          clientExtensionResults: assertion.getClientExtensionResults(),
        }),
      });

      if (!verifyRes.ok) {
        const error = await verifyRes.json();
        throw new Error(error.message || 'Échec de l\'authentification');
      }

      toast.success('✅ Authentification réussie !', {
        description: 'Vous êtes connecté avec votre biométrie',
      });
      
            // Rafraîchir la session (le shim ne supporte pas refreshSession)
      const supabase = (await import('@/src/lib/supabase/client')).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      // Si besoin, vous pouvez vérifier session?.user ici
      
      return true;
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      
      if (error.name === 'AbortError') {
        toast.warning('Annulé', { description: 'Authentification biométrique annulée' });
      } else if (error.name === 'NotAllowedError') {
        toast.error('Refusé', { description: 'Veuillez autoriser l\'authentification biométrique' });
      } else {
        toast.error('❌ Échec de l\'authentification', {
          description: error.message || 'Impossible de vérifier votre identité biométrique'
        });
      }
      
      return false;
    }
  };

  const disableBiometricAuth = async () => {
    try {
      const res = await fetch('/api/auth/biometric/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Échec de la désactivation');

      setIsEnabled(false);
      setStatus('available');
      toast.success('✅ Biométrie désactivée', {
        description: 'Vous devrez utiliser votre mot de passe pour vous connecter',
      });
    } catch (error: any) {
      console.error('Disable biometric error:', error);
      toast.error('❌ Échec de la désactivation', {
        description: error.message || 'Impossible de désactiver la biométrie'
      });
    }
  };

  return {
    status,
    isSupported,
    isEnabled,
    deviceInfo,
    setupBiometricAuth,
    authenticateWithBiometric,
    disableBiometricAuth,
  };
}