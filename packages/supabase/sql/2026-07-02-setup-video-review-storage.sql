-- LigneZero — setup joueur + revue vidéo annotée + stockage images
-- À coller dans l'éditeur SQL du dashboard Supabase (projet hwhpxmrfwqgzhhrjfurd),
-- puis régénérer les types :
--   npx supabase gen types typescript --project-id hwhpxmrfwqgzhhrjfurd > packages/supabase/src/database.types.ts

-- ── 1. Setup joueur (souris/clavier/tapis/écran/etc., même forme que `stats`) ──
alter table players add column if not exists setup jsonb not null default '[]'::jsonb;

-- ── 2. Revue vidéo ──────────────────────────────────────────────────────
create table if not exists video_reviews (
  id text primary key,
  title text not null,
  video_url text not null,
  game_id text references games(id) on delete set null,
  session_id uuid references sessions(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create extension if not exists pgcrypto;

create table if not exists video_annotations (
  id uuid primary key default gen_random_uuid(),
  review_id text not null references video_reviews(id) on delete cascade,
  timestamp_sec integer not null,
  tag text not null,
  description text not null,
  player_id text references players(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists video_annotations_review_id_idx on video_annotations(review_id);
create index if not exists video_annotations_player_id_idx on video_annotations(player_id);

alter table video_reviews enable row level security;
alter table video_annotations enable row level security;

-- Lecture : tout compte staff actif (pas 'member' en attente), pareil que
-- feedback/objectives. Écriture : admin/manager/coach uniquement (is_perf()),
-- même fonction déjà utilisée pour Sessions/Feedback/Objectifs.
create policy "video_reviews read" on video_reviews for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role <> 'member'));
create policy "video_reviews write" on video_reviews for insert
  with check (is_perf());
create policy "video_reviews update" on video_reviews for update
  using (is_perf());
create policy "video_reviews delete" on video_reviews for delete
  using (is_perf());

create policy "video_annotations read" on video_annotations for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role <> 'member'));
create policy "video_annotations write" on video_annotations for insert
  with check (is_perf());
create policy "video_annotations update" on video_annotations for update
  using (is_perf());
create policy "video_annotations delete" on video_annotations for delete
  using (is_perf());

-- ── 3. Stockage images (bucket public en lecture, écriture staff connecté) ──
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media public read" on storage.objects for select
  using (bucket_id = 'media');
create policy "media authenticated write" on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media authenticated update" on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media authenticated delete" on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');
