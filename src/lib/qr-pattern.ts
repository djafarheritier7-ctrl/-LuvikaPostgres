// src/lib/qr-pattern.ts

/**
 * Détermine la classe CSS pour chaque bloc du QR code stylisé.
 * @param index - Index du bloc (0 à 48 pour une grille 7x7)
 * @returns Classe Tailwind pour la couleur du bloc
 */
export const getQrBlockClass = (index: number): string => {
  const fixedBlack = [0, 1, 2, 6, 7, 8, 12, 13, 14, 30, 31, 32, 36, 37, 38, 42, 43, 44];
  if (fixedBlack.includes(index)) return 'bg-gray-900';
  const hash = (index * 2654435761) % 49;
  return hash > 35 ? 'bg-cyan-400/80' : 'bg-gray-200';
};