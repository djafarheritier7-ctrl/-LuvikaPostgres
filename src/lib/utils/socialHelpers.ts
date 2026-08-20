// src/lib/utils/socialHelpers.ts
export const cleanSocialHandle = (input: string, platformDomain: string): string => {
  return input.trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(new RegExp(`^${platformDomain.replace('.', '\\.')}/?`, 'i'), '')
    .replace(/^\/+|\/+$/g, '')
    .substring(0, 30)
    .replace(/\/.*/, '');
};

export const ensureAbsoluteUrl = (input: string, baseUrl: string): string => {
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const cleanPath = trimmed.replace(/^\/+/, '');
  return `${baseUrl}${cleanPath}`;
};