import { createClient } from '@/src/lib/supabase-shim';

export function createAdminClient() {
  // Le shim ne prend pas d'arguments ; on ignore les variables d'environnement Supabase.
  return createClient();
}