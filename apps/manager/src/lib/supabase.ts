import { createSupabase, createQueries } from '@lignezero/supabase';

/** Client Supabase + requêtes typées, singletons pour toute l'app manager. */
export const supabase = createSupabase(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const db = createQueries(supabase);
