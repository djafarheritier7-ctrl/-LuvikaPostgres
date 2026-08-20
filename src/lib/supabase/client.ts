import { createBrowserClient } from '@/src/lib/supabase-shim';

export function createClient() {
  return createBrowserClient();
}