# HMA Super Cup — Setup & Deployment Guide

This guide takes you from zero to a live, fan-facing tournament site with a working
admin panel. Two free services are used:

- **Supabase** — free Postgres database + auth + realtime (the live updates)
- **Netlify** — free static hosting for the site

Total time: ~15–20 minutes. No credit card required for either free tier.

---

## Part 1 — Create the Supabase project (the database)

1. Go to **https://supabase.com** and click **Start your project** → sign in with GitHub or email.
2. Click **New project**.
   - **Name:** `hma-super-cup` (anything you like)
   - **Database password:** choose a strong one and save it somewhere safe.
   - **Region:** pick the one closest to your users.
3. Click **Create new project** and wait ~2 minutes for it to provision.

### 1a. Load the database schema

1. In the Supabase dashboard, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this project, copy **all** of it,
   paste it into the editor, and click **Run**.
   - This creates the `teams`, `players`, `matches` and `goals` tables, sets up
     public-read / admin-write security, and enables realtime.
3. (Recommended) Load sample data so the site isn't empty: open a **New query**, paste the
   contents of [`supabase/seed.sql`](supabase/seed.sql), and click **Run**.
   - You can delete this later from the admin panel, or re-run `seed.sql` any time to reset.

### 1b. Create your admin login

1. Go to **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter an **email** and **password** for yourself (the admin).
3. Turn **Auto Confirm User** ON (so you can log in immediately without an email link).
4. Click **Create user**. This is the account you'll use at the site's **Admin Login**.

> Only users you create here can edit the tournament. Everyone else has read-only access.

### 1c. Grab your API keys

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy two values — you'll need them next:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long token under "Project API keys")

> The `anon` key is safe to expose in a frontend app — row-level security protects your data.
> Never put the `service_role` key in the frontend.

---

## Part 2 — Run it locally (optional but recommended)

1. Install dependencies (once):
   ```bash
   npm install
   ```
2. Create your environment file: copy `.env.example` to `.env` and fill in the two values from step 1c:
   ```
   VITE_SUPABASE_URL=https://abcd1234.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the printed URL (usually http://localhost:5173).
   - The "Supabase not configured" banner should be gone and the sample data should appear.
   - Click **Admin Login** and sign in with the account from step 1b.

---

## Part 3 — Deploy to Netlify (go live)

You can deploy in two ways. **Option A (Git)** is easiest to maintain.

### Option A — Deploy from GitHub (recommended)

1. Push this project to a GitHub repository.
2. Go to **https://netlify.com** → sign in → **Add new site** → **Import an existing project**.
3. Connect GitHub and pick your repo.
4. Netlify auto-detects the settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Before deploying, click **Add environment variables** (or **Site configuration → Environment variables** later) and add:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
6. Click **Deploy**. In ~1 minute you'll get a live URL like `https://hma-super-cup.netlify.app`.

> Whenever you push to your repo, Netlify rebuilds and redeploys automatically.

### Option B — Drag-and-drop (fastest one-off)

1. Build locally with your env vars in `.env`:
   ```bash
   npm run build
   ```
2. Go to **https://app.netlify.com/drop** and drag the generated **`dist`** folder onto the page.
3. Done — you get an instant live URL.
   - Note: with drag-and-drop you must rebuild and re-drag to update. Option A is better long-term.

> **Important:** the `netlify.toml` in this project already contains a redirect rule so that
> React Router links (e.g. `/standings`, `/admin`) work on refresh and direct navigation.

---

## Part 4 — Using the app

**Fans (no login):** Home, Fixtures & Results, Standings, Knockout Bracket, Golden Boot &
Assists, and Teams/Squads. Everything updates live as you make changes in the admin panel.

**Admin (after login):**
- **Teams** — add/edit/delete teams, set group, flag emoji, short code.
- **Players** — add/edit/delete players per team (name, position, jersey number).
- **Matches & Goals** — schedule matches (group or knockout), set kick-off, venue, status
  (`scheduled` / `live` / `finished`) and the scoreline; expand any match to record individual
  goal scorers, assists, penalties and own goals (these power the golden boot and score cards).

### Tips
- Set a match's status to **live** during play — fans see a pulsing LIVE badge, and the match
  appears in the "Live Matches" section on the home page in real time.
- **Standings** are computed automatically from finished group-stage matches.
- For knockout matches, use the **Round order** field to control top-to-bottom position in the bracket.
- The scoreline shown to fans comes from the match's **Home/Away score** fields. Recording
  individual goals is what feeds the golden boot — keep the final score in sync (this also
  handles own goals correctly).

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Supabase not configured" banner | `.env` missing or dev server not restarted after editing it. Restart `npm run dev`. On Netlify, add the two env vars and redeploy. |
| Can log in but edits fail | Make sure you ran `schema.sql` (it creates the write policies). |
| No live updates | Confirm the `alter publication ... add table` lines at the bottom of `schema.sql` ran without error. |
| Routes 404 on refresh in production | Ensure `netlify.toml` was deployed (contains the SPA redirect). |
| Can't log in | Recreate the user in Supabase → Authentication with **Auto Confirm User** ON. |
