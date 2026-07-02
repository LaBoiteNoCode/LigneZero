import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type LigneZeroClient = SupabaseClient<Database>;

/**
 * Fabrique un client Supabase typé. Chaque app passe ses propres variables
 * d'env (le package reste agnostique du framework). La clé attendue est la
 * clé PUBLIQUE (anon / publishable) — jamais la service_role côté client.
 */
export function createSupabase(url: string, anonKey: string): LigneZeroClient {
  if (!url || !anonKey) {
    throw new Error(
      '[@lignezero/supabase] URL ou clé manquante. Vérifie VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
    );
  }
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}
