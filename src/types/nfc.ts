// src/types/nfc.ts
export type NFCCard = {
  id: string;
  user_id: string;
  card_id: string;
  status: 'active' | 'lost' | 'blocked' | 'inactive';
  matricule: string | null; // ✅ string | null (pas undefined)
  lost_reason?: string | null;
  activated_at?: string | null;
  created_at: string;
  updated_at: string;
  scan_count?: number | null;
  last_scan_at?: string | null;
  order_id?: string | null;
  stats?: {
    scans: number;
    unique_visitors: number;
  } | null;
};