import { createClient } from '@/src/lib/supabase-shim';

// Le shim ne nécessite pas de variables d'environnement Supabase.
export const supabase = createClient();