// src/lib/utils/nfc.ts
import { NFCCard } from '../../types/nfc';

export const normalizeNfcCard = (dbCard: any): NFCCard => ({
  ...dbCard,
  matricule: dbCard.matricule ?? null,
  lost_reason: dbCard.lost_reason ?? null,
  activated_at: dbCard.activated_at ?? null,
  scan_count: dbCard.scan_count ?? null,
  last_scan_at: dbCard.last_scan_at ?? null,
  order_id: dbCard.order_id ?? null,
  stats: null
});