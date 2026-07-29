-- =====================================================================
--  HMA Super Cup  —  Database schema (World Cup 2026 themed tournament)
--  Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Tables ----------

-- Teams (grouped A..L like the World Cup group stage)
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  short_name  text,                       -- e.g. "BRA"
  group_label text,                        -- e.g. "A"
  flag_emoji  text,                        -- e.g. "🇧🇷"
  logo_url    text,
  created_at  timestamptz not null default now()
);

-- Players (belong to a team)
create table if not exists public.players (
  id             uuid primary key default gen_random_uuid(),
  team_id        uuid references public.teams(id) on delete cascade,
  name           text not null,
  position       text,                     -- GK / DEF / MID / FWD
  jersey_number  int,
  created_at     timestamptz not null default now()
);

-- Matches (both group-stage and knockout)
create table if not exists public.matches (
  id            uuid primary key default gen_random_uuid(),
  stage         text not null default 'group',   -- group | round16 | quarter | semi | third_place | final
  group_label   text,                            -- only for group-stage matches
  round_order   int  not null default 0,         -- ordering within a knockout round
  home_team_id  uuid references public.teams(id) on delete set null,
  away_team_id  uuid references public.teams(id) on delete set null,
  match_date    timestamptz,
  venue         text,
  status        text not null default 'scheduled', -- scheduled | live | finished
  home_score    int  not null default 0,
  away_score    int  not null default 0,
  created_at    timestamptz not null default now()
);

-- Goals (drive the score card, golden boot and assists leaderboard)
create table if not exists public.goals (
  id           uuid primary key default gen_random_uuid(),
  match_id     uuid references public.matches(id) on delete cascade,
  team_id      uuid references public.teams(id)   on delete set null,
  scorer_id    uuid references public.players(id) on delete set null,
  assist_id    uuid references public.players(id) on delete set null,
  minute       int,
  is_penalty   boolean not null default false,
  is_own_goal  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Cautions (yellow/red card events)
create table if not exists public.cautions (
  id           uuid primary key default gen_random_uuid(),
  match_id     uuid references public.matches(id) on delete cascade,
  team_id      uuid references public.teams(id)   on delete set null,
  player_id    uuid references public.players(id) on delete set null,
  card_type    text not null default 'yellow',
  minute       int,
  created_at   timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_players_team   on public.players(team_id);
create index if not exists idx_matches_stage  on public.matches(stage);
create index if not exists idx_goals_match    on public.goals(match_id);
create index if not exists idx_goals_scorer   on public.goals(scorer_id);
create index if not exists idx_cautions_match on public.cautions(match_id);

-- =====================================================================
--  Row Level Security
--  Everyone (anon) can READ. Only authenticated users (admins) can WRITE.
-- =====================================================================

alter table public.teams   enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.goals   enable row level security;
alter table public.cautions enable row level security;

-- Public read policies
create policy "public read teams"   on public.teams   for select using (true);
create policy "public read players" on public.players for select using (true);
create policy "public read matches" on public.matches for select using (true);
create policy "public read goals"   on public.goals   for select using (true);
create policy "public read cautions" on public.cautions for select using (true);

-- Authenticated write policies (insert / update / delete)
create policy "admin write teams"   on public.teams   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write players" on public.players for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write matches" on public.matches for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write goals"   on public.goals   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write cautions" on public.cautions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =====================================================================
--  Realtime — publish table changes so the UI updates live
-- =====================================================================
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.cautions;
