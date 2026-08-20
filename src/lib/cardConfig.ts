export const isSectionEnabled = (
  section: string,
  configs: { scan_type: string; enabled: boolean }[]
): boolean => {
  return configs.some(
    cfg => cfg.scan_type === section && cfg.enabled === true
  );
};
