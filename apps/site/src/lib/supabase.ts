import { createSupabase, createQueries } from '@lignezero/supabase';

/** Client Supabase (lecture publique) + requêtes typées, singletons du vitrine. */
export const supabase = createSupabase(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const db = createQueries(supabase);
