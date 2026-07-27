-- =====================================================================
--  HMA Super Cup  —  Sample seed data (optional but recommended)
--  Run AFTER schema.sql. Safe to re-run: it clears the tables first.
-- =====================================================================

truncate table public.goals, public.matches, public.players, public.teams restart identity cascade;

-- ---------- Teams (Group A & Group B) ----------
insert into public.teams (name, short_name, group_label, flag_emoji) values
  ('Brazil',      'BRA', 'A', '🇧🇷'),
  ('Croatia',     'CRO', 'A', '🇭🇷'),
  ('Nigeria',     'NGA', 'A', '🇳🇬'),
  ('Japan',       'JPN', 'A', '🇯🇵'),
  ('Argentina',   'ARG', 'B', '🇦🇷'),
  ('France',      'FRA', 'B', '🇫🇷'),
  ('Morocco',     'MAR', 'B', '🇲🇦'),
  ('Netherlands', 'NED', 'B', '🇳🇱');

-- ---------- Players (a squad sample per team; some will score) ----------
insert into public.players (team_id, name, position, jersey_number)
select id, x.name, x.position, x.jersey from public.teams t
join (values
  ('BRA','Alisson','GK',1),('BRA','Marquinhos','DEF',4),('BRA','Casemiro','MID',5),('BRA','Vinicius Jr','FWD',7),('BRA','Rodrygo','FWD',10),
  ('CRO','Livakovic','GK',1),('CRO','Gvardiol','DEF',20),('CRO','Modric','MID',10),('CRO','Kramaric','FWD',9),
  ('NGA','Nwabali','GK',1),('NGA','Bassey','DEF',5),('NGA','Iwobi','MID',18),('NGA','Osimhen','FWD',9),
  ('JPN','Suzuki','GK',12),('JPN','Itakura','DEF',3),('JPN','Kubo','MID',20),('JPN','Mitoma','FWD',9),
  ('ARG','Martinez','GK',23),('ARG','Otamendi','DEF',19),('ARG','De Paul','MID',7),('ARG','Messi','FWD',10),('ARG','Alvarez','FWD',9),
  ('FRA','Maignan','GK',16),('FRA','Saliba','DEF',17),('FRA','Tchouameni','MID',8),('FRA','Mbappe','FWD',10),('FRA','Dembele','FWD',11),
  ('MAR','Bounou','GK',1),('MAR','Hakimi','DEF',2),('MAR','Amrabat','MID',4),('MAR','En-Nesyri','FWD',19),
  ('NED','Verbruggen','GK',1),('NED','Van Dijk','DEF',4),('NED','Gakpo','MID',11),('NED','Depay','FWD',10)
) as x(team, name, position, jersey) on t.short_name = x.team;

-- ---------- Matches ----------
-- Helper: we look teams up by short_name in each insert.

-- Group A, matchday 1 (finished)
insert into public.matches (stage, group_label, home_team_id, away_team_id, match_date, venue, status, home_score, away_score)
select 'group','A', h.id, a.id, timestamptz '2026-06-12 18:00+00', 'MetLife Stadium, New Jersey', 'finished', 2, 1
from public.teams h, public.teams a where h.short_name='BRA' and a.short_name='CRO';

insert into public.matches (stage, group_label, home_team_id, away_team_id, match_date, venue, status, home_score, away_score)
select 'group','A', h.id, a.id, timestamptz '2026-06-12 21:00+00', 'SoFi Stadium, Los Angeles', 'finished', 1, 1
from public.teams h, public.teams a where h.short_name='NGA' and a.short_name='JPN';

-- Group A, matchday 2 (one live, one scheduled)
insert into public.matches (stage, group_label, home_team_id, away_team_id, match_date, venue, status, home_score, away_score)
select 'group','A', h.id, a.id, timestamptz '2026-06-16 18:00+00', 'Estadio Azteca, Mexico City', 'live', 1, 0
from public.teams h, public.teams a where h.short_name='BRA' and a.short_name='NGA';

insert into public.matches (stage, group_label, home_team_id, away_team_id, match_date, venue, status)
select 'group','A', h.id, a.id, timestamptz '2026-06-16 21:00+00', 'BC Place, Vancouver', 'scheduled'
from public.teams h, public.teams a where h.short_name='CRO' and a.short_name='JPN';

-- Group B, matchday 1 (finished)
insert into public.matches (stage, group_label, home_team_id, away_team_id, match_date, venue, status, home_score, away_score)
select 'group','B', h.id, a.id, timestamptz '2026-06-13 18:00+00', 'AT&T Stadium, Dallas', 'finished', 3, 1
from public.teams h, public.teams a where h.short_name='ARG' and a.short_name='MAR';

insert into public.matches (stage, group_label, home_team_id, away_team_id, match_date, venue, status, home_score, away_score)
select 'group','B', h.id, a.id, timestamptz '2026-06-13 21:00+00', 'Hard Rock Stadium, Miami', 'finished', 2, 2
from public.teams h, public.teams a where h.short_name='FRA' and a.short_name='NED';

-- Group B, matchday 2 (scheduled)
insert into public.matches (stage, group_label, home_team_id, away_team_id, match_date, venue, status)
select 'group','B', h.id, a.id, timestamptz '2026-06-17 18:00+00', 'Lumen Field, Seattle', 'scheduled'
from public.teams h, public.teams a where h.short_name='ARG' and a.short_name='FRA';

insert into public.matches (stage, group_label, home_team_id, away_team_id, match_date, venue, status)
select 'group','B', h.id, a.id, timestamptz '2026-06-17 21:00+00', 'Arrowhead Stadium, Kansas City', 'scheduled'
from public.teams h, public.teams a where h.short_name='MAR' and a.short_name='NED';

-- Knockout placeholders (teams TBD -> left null, filled in by admin later)
insert into public.matches (stage, round_order, match_date, venue, status) values
  ('semi',        1, timestamptz '2026-07-14 20:00+00', 'MetLife Stadium, New Jersey', 'scheduled'),
  ('semi',        2, timestamptz '2026-07-15 20:00+00', 'AT&T Stadium, Dallas',        'scheduled'),
  ('third_place', 1, timestamptz '2026-07-18 20:00+00', 'Hard Rock Stadium, Miami',    'scheduled'),
  ('final',       1, timestamptz '2026-07-19 20:00+00', 'MetLife Stadium, New Jersey', 'scheduled');

-- One quarter-final already decided, feeding a semi (shows a live bracket)
insert into public.matches (stage, round_order, home_team_id, away_team_id, match_date, venue, status, home_score, away_score)
select 'quarter', 1, h.id, a.id, timestamptz '2026-07-10 20:00+00', 'SoFi Stadium, Los Angeles', 'finished', 2, 0
from public.teams h, public.teams a where h.short_name='BRA' and a.short_name='FRA';

-- ---------- Goals (drive score card + golden boot + assists) ----------
-- BRA 2-1 CRO
insert into public.goals (match_id, team_id, scorer_id, assist_id, minute, is_penalty)
select m.id, t.id, s.id, a.id, 23, false
from public.matches m
join public.teams t on t.short_name='BRA'
join public.players s on s.name='Vinicius Jr'
left join public.players a on a.name='Rodrygo'
where m.status='finished' and m.home_team_id=(select id from public.teams where short_name='BRA')
  and m.away_team_id=(select id from public.teams where short_name='CRO');

insert into public.goals (match_id, team_id, scorer_id, assist_id, minute, is_penalty)
select m.id, t.id, s.id, a.id, 67, false
from public.matches m
join public.teams t on t.short_name='BRA'
join public.players s on s.name='Rodrygo'
left join public.players a on a.name='Vinicius Jr'
where m.home_team_id=(select id from public.teams where short_name='BRA')
  and m.away_team_id=(select id from public.teams where short_name='CRO');

insert into public.goals (match_id, team_id, scorer_id, minute)
select m.id, t.id, s.id, 81
from public.matches m
join public.teams t on t.short_name='CRO'
join public.players s on s.name='Kramaric'
where m.home_team_id=(select id from public.teams where short_name='BRA')
  and m.away_team_id=(select id from public.teams where short_name='CRO');

-- ARG 3-1 MAR (Messi x2, Alvarez x1; En-Nesyri for MAR)
insert into public.goals (match_id, team_id, scorer_id, assist_id, minute, is_penalty)
select m.id, t.id, s.id, a.id, 12, false
from public.matches m
join public.teams t on t.short_name='ARG'
join public.players s on s.name='Messi'
left join public.players a on a.name='De Paul'
where m.home_team_id=(select id from public.teams where short_name='ARG')
  and m.away_team_id=(select id from public.teams where short_name='MAR');

insert into public.goals (match_id, team_id, scorer_id, minute, is_penalty)
select m.id, t.id, s.id, 44, true
from public.matches m
join public.teams t on t.short_name='ARG'
join public.players s on s.name='Messi'
where m.home_team_id=(select id from public.teams where short_name='ARG')
  and m.away_team_id=(select id from public.teams where short_name='MAR');

insert into public.goals (match_id, team_id, scorer_id, assist_id, minute)
select m.id, t.id, s.id, a.id, 70
from public.matches m
join public.teams t on t.short_name='ARG'
join public.players s on s.name='Alvarez'
left join public.players a on a.name='Messi'
where m.home_team_id=(select id from public.teams where short_name='ARG')
  and m.away_team_id=(select id from public.teams where short_name='MAR');

insert into public.goals (match_id, team_id, scorer_id, minute)
select m.id, t.id, s.id, 88
from public.matches m
join public.teams t on t.short_name='MAR'
join public.players s on s.name='En-Nesyri'
where m.home_team_id=(select id from public.teams where short_name='ARG')
  and m.away_team_id=(select id from public.teams where short_name='MAR');

-- FRA 2-2 NED (Mbappe x2; Gakpo, Depay)
insert into public.goals (match_id, team_id, scorer_id, assist_id, minute)
select m.id, t.id, s.id, a.id, 33
from public.matches m
join public.teams t on t.short_name='FRA'
join public.players s on s.name='Mbappe'
left join public.players a on a.name='Dembele'
where m.home_team_id=(select id from public.teams where short_name='FRA')
  and m.away_team_id=(select id from public.teams where short_name='NED');

insert into public.goals (match_id, team_id, scorer_id, minute, is_penalty)
select m.id, t.id, s.id, 59, true
from public.matches m
join public.teams t on t.short_name='FRA'
join public.players s on s.name='Mbappe'
where m.home_team_id=(select id from public.teams where short_name='FRA')
  and m.away_team_id=(select id from public.teams where short_name='NED');

insert into public.goals (match_id, team_id, scorer_id, minute)
select m.id, t.id, s.id, 41
from public.matches m
join public.teams t on t.short_name='NED'
join public.players s on s.name='Gakpo'
where m.home_team_id=(select id from public.teams where short_name='FRA')
  and m.away_team_id=(select id from public.teams where short_name='NED');

insert into public.goals (match_id, team_id, scorer_id, assist_id, minute)
select m.id, t.id, s.id, a.id, 78
from public.matches m
join public.teams t on t.short_name='NED'
join public.players s on s.name='Depay'
left join public.players a on a.name='Gakpo'
where m.home_team_id=(select id from public.teams where short_name='FRA')
  and m.away_team_id=(select id from public.teams where short_name='NED');

-- NGA 1-1 JPN
insert into public.goals (match_id, team_id, scorer_id, minute)
select m.id, t.id, s.id, 55
from public.matches m
join public.teams t on t.short_name='NGA'
join public.players s on s.name='Osimhen'
where m.home_team_id=(select id from public.teams where short_name='NGA')
  and m.away_team_id=(select id from public.teams where short_name='JPN');

insert into public.goals (match_id, team_id, scorer_id, minute)
select m.id, t.id, s.id, 72
from public.matches m
join public.teams t on t.short_name='JPN'
join public.players s on s.name='Mitoma'
where m.home_team_id=(select id from public.teams where short_name='NGA')
  and m.away_team_id=(select id from public.teams where short_name='JPN');

-- Live match BRA 1-0 NGA (in progress)
insert into public.goals (match_id, team_id, scorer_id, minute)
select m.id, t.id, s.id, 38
from public.matches m
join public.teams t on t.short_name='BRA'
join public.players s on s.name='Vinicius Jr'
where m.status='live' and m.home_team_id=(select id from public.teams where short_name='BRA')
  and m.away_team_id=(select id from public.teams where short_name='NGA');

-- Quarter-final BRA 2-0 FRA (Rodrygo, Vinicius Jr)
insert into public.goals (match_id, team_id, scorer_id, minute)
select m.id, t.id, s.id, 30
from public.matches m
join public.teams t on t.short_name='BRA'
join public.players s on s.name='Rodrygo'
where m.stage='quarter' and m.home_team_id=(select id from public.teams where short_name='BRA')
  and m.away_team_id=(select id from public.teams where short_name='FRA');

insert into public.goals (match_id, team_id, scorer_id, minute)
select m.id, t.id, s.id, 76
from public.matches m
join public.teams t on t.short_name='BRA'
join public.players s on s.name='Vinicius Jr'
where m.stage='quarter' and m.home_team_id=(select id from public.teams where short_name='BRA')
  and m.away_team_id=(select id from public.teams where short_name='FRA');
