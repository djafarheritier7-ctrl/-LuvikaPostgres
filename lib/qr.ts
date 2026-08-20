// src/lib/qr.ts — version SSR-safe (sans canvas)
import QRCode from 'qrcode';

type QRType = "png" | "svg"

export async function generateQRBase64(text: string, options: {
  size?: number;
  color?: string;
  type?: QRType;
} = {}): Promise<string> {
  const { size = 300, color = '#2563eb', type = "png" } = options;

  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: color,
        light: '#ffffff',
      },
      type: 'image/png', // ✅ Compatibilité maximale
    });
  } catch (err) {
    console.error('❌ Échec génération QR:', err);
    // Fallback : QR minimal
    return await QRCode.toDataURL(text, { width: size, margin: 1 });
  }
}