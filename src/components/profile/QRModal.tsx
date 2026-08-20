// src/components/profile/QRModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Copy, QrCode, X, User } from 'lucide-react';
import QRCode from 'qrcode';

type QRModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string; // L'URL du profil principale, affichée/copiée
  username: string;
  shortUrl?: string;
  avatarUrl?: string | null;
  // 🔹 Nouvelle prop optionnelle pour l'URL du QR Code (sinon, on utilise profileUrl)
  qrCodeUrl?: string;
  // 🔹 Nouvelle prop optionnelle pour le QR Code d'un participant spécifique
  participantQrUrl?: string;
  participantName?: string; // Nom du participant si applicable
};

export default function QRModal({
  isOpen,
  onClose,
  profileUrl,
  username,
  shortUrl,
  avatarUrl,
  qrCodeUrl,
  participantQrUrl, // 👈 AJOUTÉ
  participantName,  // 👈 AJOUTÉ
}: QRModalProps) {

  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  // 🔹 Utiliser participantQrUrl si fourni, sinon qrCodeUrl, sinon profileUrl pour le QR
  const urlForQR = participantQrUrl || qrCodeUrl || profileUrl;
  const displayUrl = shortUrl || profileUrl;

  useEffect(() => {
    if (isOpen) {
      setQrDataUrl(null);
      setQrError(null);
      // 🔹 Utiliser urlForQR pour générer le QR Code
      QRCode.toDataURL(urlForQR, {
        width: 240,
        margin: 2,
        color: { dark: '#1e40af', light: '#ffffff' },
        type: 'image/png',
      })
        .then(setQrDataUrl)
        .catch(err => {
          console.error('❌ Échec génération QR:', err);
          setQrError('Impossible de générer le QR');
        });
    }
  }, [isOpen, urlForQR]); // <--- Dépend de urlForQR maintenant

  const copyLink = () => {
    // 🔹 Toujours copier l'URL affichée (displayUrl)
 navigator.clipboard.writeText(`${window.location.origin}${urlForQR}`);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};  

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-xl z-50"
        onClick={onClose}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute w-2 h-2 rounded-full bg-cyan-300/20"
              style={{
                left: `${10 + (i * 15) + Math.random() * 20}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ['-100px', '120vh'],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ rotateY: -30 }}
          animate={{ rotateY: 0 }}
          className="max-w-md w-full"
        >
          <div className="glass-border backdrop-blur-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/30 border border-cyan-400/30 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Bouton de fermeture corrigé - en haut à droite dans le coin */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 hover:scale-105 transition-all duration-200 z-10"
              aria-label="Fermer le modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 text-center">
              {/* 🔹 Affichage conditionnel de l'avatar ou d'un utilisateur générique */}
              {participantName ? (
                // Si c'est un participant spécifique, afficher un icône utilisateur générique
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500
                    flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-lg -z-10" />
                </div>
              ) : (
                // Sinon, afficher l'avatar du profil comme avant
                <div className="relative w-16 h-16 mx-auto mb-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`Photo de ${username}`}
                      className="w-full h-full object-cover rounded-2xl border border-white/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500
                      flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-lg -z-10" />
                </div>
              )}

              {/* 🔹 Titre conditionnel */}
              <h3 className="text-xl font-bold text-white mb-1">
                {participantName ? `QR Code pour ${participantName}` : 'QR Code de profil'}
              </h3>
              <p className="text-cyan-200 text-sm mb-4">
                {participantName
                  ? `Scan pour le check-in de "${participantName}" à l'événement.`
                  : `Scannez pour accéder à @${username}`
                }
              </p>

              <div className="flex justify-center mb-5">
                {qrError ? (
                  <div className="mx-auto w-48 h-48 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-center p-4">
                    <p className="text-red-300 text-xs text-center">❌ {qrError}</p>
                  </div>
                ) : qrDataUrl ? (
                  <motion.img
                    key={urlForQR} // <--- Clé basée sur l'URL du QR pour forcer le rafraichissement si elle change
                    src={qrDataUrl}
                    alt={`QR Code pour ${participantName || username}`}
                    className="w-48 h-48 rounded-2xl border-2 border-white/30 bg-white shadow-md"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-800/30 rounded-2xl animate-pulse flex items-center justify-center">
                    <span className="text-xs text-gray-400">Génération...</span>
                  </div>
                )}
              </div>

              <p className="text-gray-300 text-sm mb-5">
                ✅ Le QR redirige vers :<br />
                <span className="font-mono text-cyan-200 text-xs break-all">
                  {urlForQR} {/* <--- Afficher l'URL utilisée pour le QR */}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/10"
                  onClick={copyLink}
                >
                  <Copy className="mr-1.5 h-4 w-4" />
                  {copied ? '✅ Copié !' : '📋 Copier le lien'}
                </Button>
                <Button
                  onClick={() => window.open(displayUrl, '_blank')}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  🌐 Ouvrir le lien
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}