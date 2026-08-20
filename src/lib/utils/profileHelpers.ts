// src/lib/utils/profileHelpers.ts
export const isSectionEnabled = (section: string, configs?: any[]): boolean => {
  if (!Array.isArray(configs) || configs.length === 0) return false;
  return configs.some(cfg => cfg.scan_type === section && cfg.enabled);
};