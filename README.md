# ⚽ HMA Super Cup

A World Cup 2026–themed soccer tournament web app. Fans get live fixtures, results,
standings, a knockout bracket and the golden boot race; admins manage everything from a
protected control room. Live updates are powered by **Supabase** and the site deploys to
**Netlify**.

> **First time here? Read [`SETUP.md`](SETUP.md)** — it walks you through creating the free
> Supabase database, an admin login, and deploying to Netlify step by step.

## Features

**Fan view (public, no login):**
- 🏟️ Home hub with live matches, next fixtures and the current golden-boot leader
- 🗓️ Fixtures & results, filterable (All / Live / Upcoming / Results), grouped by stage
- 📊 Group standings, computed live (P / W / D / L / GF / GA / GD / Pts, top-2 highlighted)
- 🏆 Knockout bracket (round of 16 → final, plus third-place play-off)
- 👟 Golden Boot & 🎯 Top Assists leaderboards
- 👥 Teams & squads with per-player goal tallies
- 📋 Match score cards with goal timelines (scorer, assist, minute, pen/OG)

**Admin view (Supabase Auth login required):**
- 🛡️ Teams — full create / edit / delete
- 👤 Players — full create / edit / delete, filter by team
- ⚽ Matches — schedule group & knockout matches, set status/score/venue/kick-off
- 🥅 Goals — record individual scorers, assists, penalties and own goals per match
- 📊 Dashboard with tournament totals

Every admin change is saved to Supabase and pushed to all fans **in real time**.

## Tech stack

- **React 18** + **Vite** + **React Router**
- **Tailwind CSS** (custom World Cup 2026 theme)
- **Supabase** — Postgres, Auth, and Realtime
- **Netlify** — static hosting

## Quick start

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key (see SETUP.md)
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |

## Project structure

```
hma-super-cup/
├─ supabase/
│  ├─ schema.sql        # tables, RLS policies, realtime — run this first
│  └─ seed.sql          # optional sample teams/players/matches/goals
├─ src/
│  ├─ context/          # AuthContext (Supabase auth) + DataContext (live data)
│  ├─ lib/              # supabase client, CRUD helpers, stats/standings math
│  ├─ components/       # navbar, footer, match card, shared UI
│  └─ pages/
│     ├─ Home, Fixtures, Standings, Bracket, Stats, Teams, MatchDetail, Login
│     └─ admin/         # Dashboard, Teams, Players, Matches + GoalManager
├─ netlify.toml         # build config + SPA redirect
└─ SETUP.md             # full setup & deployment walkthrough
```

## Configuration

Two environment variables (see `.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The app runs without them (showing a friendly "configure Supabase" banner) so you can see the
UI before wiring up the database.

---

Built for the **HMA Super Cup** 🏆
