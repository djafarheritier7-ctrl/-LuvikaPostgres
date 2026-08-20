// src/lib/utils/badgeLevel.ts
export type BadgeLevel = 'bronze' | 'silver' | 'gold';

export interface BadgeInfo {
  level: BadgeLevel;
  label: string;
  color: string;
  nextThreshold: number;
  scansNeeded: number;
}

export const getBadgeInfo = (scans: number): BadgeInfo => {
  if (scans >= 500) {
    return {
      level: 'gold',
      label: 'Niveau Or',
      color: 'from-yellow-400 to-yellow-600',
      nextThreshold: Infinity,
      scansNeeded: 0,
    };
  }
  if (scans >= 100) {
    return {
      level: 'silver',
      label: 'Niveau Argent',
      color: 'from-gray-300 to-gray-500',
      nextThreshold: 500,
      scansNeeded: 500 - scans,
    };
  }
  return {
    level: 'bronze',
    label: 'Niveau Bronze',
    color: 'from-yellow-700 to-amber-900',
    nextThreshold: 100,
    scansNeeded: 100 - scans,
  };
};