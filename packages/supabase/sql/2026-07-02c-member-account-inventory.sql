-- LigneZero — compte membre (site) : inventaire, matchs favoris, liens Discord/Twitch
-- À coller dans l'éditeur SQL du dashboard Supabase (projet hwhpxmrfwqgzhhrjfurd),
-- puis régénérer les types :
--   npx supabase gen types typescript --project-id hwhpxmrfwqgzhhrjfurd > packages/supabase/src/database.types.ts

-- ── 1. Inventaire membre ────────────────────────────────────────────────────
-- Table LECTURE SEULE côté client (site) : aucune policy d'écriture pour les
-- rôles anon/authenticated. Les objets sont distribués par un bot Twitch/Discord
-- externe qui écrit avec la clé service_role (laquelle contourne RLS) — le site
-- ne peut donc jamais se les auto-attribuer, même en cas de faille côté client.
create extension if not exists pgcrypto;

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('ticket', 'cartouche', 'special')),
  name text not null,
  description text,
  image text,
  /** Origine du drop (ex. 'twitch', 'discord', 'manuel') — traçabilité. */
  source text,
  obtained_at timestamptz not null default now()
);

create index if not exists inventory_items_owner_id_idx on inventory_items(owner_id);

alter table inventory_items enable row level security;

create policy "inventory_items read own" on inventory_items for select
  using (owner_id = auth.uid());

-- ── 2. Matchs favoris (auto-service, ne touche jamais profiles.role) ────────
create table if not exists favorite_matches (
  owner_id uuid not null references profiles(id) on delete cascade,
  match_id text not null references matches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_id, match_id)
);

alter table favorite_matches enable row level security;

create policy "favorite_matches read own" on favorite_matches for select
  using (owner_id = auth.uid());
create policy "favorite_matches write own" on favorite_matches for insert
  with check (owner_id = auth.uid());
create policy "favorite_matches delete own" on favorite_matches for delete
  using (owner_id = auth.uid());

-- ── 3. Liens Discord/Twitch (pour que le bot retrouve le bon membre) ────────
-- Table séparée de `profiles` exprès : l'auto-service ne doit jamais pouvoir
-- toucher `profiles.role`. Ici le membre ne peut modifier que sa propre ligne.
create table if not exists member_links (
  owner_id uuid primary key references profiles(id) on delete cascade,
  discord_handle text,
  twitch_handle text,
  updated_at timestamptz not null default now()
);

alter table member_links enable row level security;

create policy "member_links read own" on member_links for select
  using (owner_id = auth.uid());
create policy "member_links upsert own" on member_links for insert
  with check (owner_id = auth.uid());
create policy "member_links update own" on member_links for update
  using (owner_id = auth.uid());
