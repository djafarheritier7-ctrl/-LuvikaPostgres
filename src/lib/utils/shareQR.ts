// src/lib/utils/shareQR.ts
import { generateQRBase64 } from '../../../lib/qr';

// 🔹 Raccourcit UUID → 6 caractères (ex: dcfbb1)
const shortId = (id: string) => id.substring(0, 6).replace(/[+/]/g, 'x').toLowerCase();

// 🔹 Génère lien court + QR base64
export const getShareData = async (profileId: string, profileUrl: string) => {
  const id = shortId(profileId);
  const shortUrl = `https://luvika.me/u/${id}`;
  
  // Génère QR du lien court (taille réduite pour le bouton)
  const qrBase64 = await generateQRBase64(shortUrl, { size: 128, type: 'png' });
  
  return { shortUrl, qrBase64 };
};