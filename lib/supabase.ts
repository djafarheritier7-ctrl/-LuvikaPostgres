// Client Supabase compatible avec le shim
// Ne nécessite plus les variables d’environnement Supabase.

import { createClient } from '../src/lib/supabase-shim';

// Création du client Supabase (shim)
// ⚠️ Ce client est un stub : les permissions seront gérées plus tard côté API.
export const supabase = createClient();