-- LigneZero — hub match (stats par match) + bibliothèque de strats
-- À coller dans l'éditeur SQL du dashboard Supabase (projet hwhpxmrfwqgzhhrjfurd),
-- puis régénérer les types :
--   npx supabase gen types typescript --project-id hwhpxmrfwqgzhhrjfurd > packages/supabase/src/database.types.ts

-- ── 1. Lien facultatif d'une revue vidéo vers un match précis ──────────────
alter table video_reviews add column if not exists match_id text references matches(id) on delete set null;

-- ── 2. Stats par match (une ligne par joueur par match) ────────────────────
create table if not exists match_player_stats (
  id uuid primary key default gen_random_uuid(),
  match_id text not null references matches(id) on delete cascade,
  player_id text not null references players(id) on delete cascade,
  stats jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create index if not exists match_player_stats_match_id_idx on match_player_stats(match_id);

alter table match_player_stats enable row level security;

create policy "match_player_stats read" on match_player_stats for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role <> 'member'));
create policy "match_player_stats write" on match_player_stats for insert
  with check (is_perf());
create policy "match_player_stats update" on match_player_stats for update
  using (is_perf());
create policy "match_player_stats delete" on match_player_stats for delete
  using (is_perf());

-- ── 3. Bibliothèque de strats / executes ───────────────────────────────────
create table if not exists strats (
  id text primary key,
  title text not null,
  game_id text references games(id) on delete set null,
  map text,
  description text not null default '',
  tags text[] not null default '{}',
  review_id text references video_reviews(id) on delete set null,
  timestamp_sec integer,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table strats enable row level security;

create policy "strats read" on strats for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role <> 'member'));
create policy "strats write" on strats for insert
  with check (is_perf());
create policy "strats update" on strats for update
  using (is_perf());
create policy "strats delete" on strats for delete
  using (is_perf());
